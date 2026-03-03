import type { MarketMessage } from "../servises/types.ts";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { outcomeService } from "../servises/outcomeService.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface OrderbookSnapshot {
    best_bid_up: string;
    best_bid_up_size: string;
    best_bid_down: string;
    best_bid_down_size: string;
    best_ask_up: string;
    best_ask_up_size: string;
    best_ask_down: string;
    best_ask_down_size: string;
    time: string;
}

interface SessionRecord {
    market: string;
    outcome: "Up" | "Down" | null;
    orderbook: OrderbookSnapshot[];
}

export function record(strategyId: string, token: string) {
    const sessions: SessionRecord[] = [];
    const sessionMap: Record<string, SessionRecord> = {};
    const messageBuffer: Record<string, MarketMessage> = {};
    const dataDir = join(__dirname, "..", "data");
    const filePath = join(dataDir, `${strategyId}.json`);

    mkdirSync(dataDir, { recursive: true });

    function save() {
        writeFileSync(filePath, JSON.stringify(sessions, null, 2));
    }

    outcomeService(token, (slug, result) => {
        const session = sessionMap[slug];
        if (!session) return;
        session.outcome = result;
        save();
        console.log(`🏁 Outcome for ${slug}: ${result}`);
    });

    return function strategy(messages: MarketMessage[], slug: string, clobIds: string[]) {
        if (clobIds.length < 2) return;

        if (!sessionMap[slug]) {
            const session: SessionRecord = {
                market: slug,
                outcome: null,
                orderbook: [],
            };
            sessionMap[slug] = session;
            sessions.push(session);
        }

        for (const msg of messages) {
            messageBuffer[msg.asset_id] = msg;
        }

        const upMsg = messageBuffer[clobIds[0]];
        const downMsg = messageBuffer[clobIds[1]];
        if (!upMsg || !downMsg) return;

        const session = sessionMap[slug];

        const bestBidUp = upMsg.bids?.[upMsg.bids.length - 1];
        const bestAskUp = upMsg.asks?.[upMsg.asks.length - 1];
        const bestBidDown = downMsg.bids?.[downMsg.bids.length - 1];
        const bestAskDown = downMsg.asks?.[downMsg.asks.length - 1];

        const snapshot: OrderbookSnapshot = {
            best_ask_up: bestAskUp?.price ?? "",
            best_ask_up_size: bestAskUp?.size ?? "",
            best_ask_down: bestAskDown?.price ?? "",
            best_ask_down_size: bestAskDown?.size ?? "",
            best_bid_up: bestBidUp?.price ?? "",
            best_bid_up_size: bestBidUp?.size ?? "",
            best_bid_down: bestBidDown?.price ?? "",
            best_bid_down_size: bestBidDown?.size ?? "",
            time: upMsg.timestamp ?? "",
        };

        session.orderbook.push(snapshot);
        save();
    };
}