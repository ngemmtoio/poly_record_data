import { createPolymarketWS } from "../api/wsClient.ts";
import { buildSlug } from "../functions/get15mUnix.ts";
import { getClobTokenIds } from "../api/getClobTokenIds.ts";
import type { MarketMessage } from "./types.ts";

type StrategyHandler = (
    messages: MarketMessage[],
    slug: string,
    clobIds: string[]
) => void;

export async function createMarketManager(
    token: string,
    strategies: StrategyHandler[] = []
) {
    let currentSlug = buildSlug(token);
    console.log("🚀 Initial market:", currentSlug);

    let currentClobIds = await getClobTokenIds(currentSlug);
    let ws: ReturnType<typeof createPolymarketWS> | null = null;

    function dispatch(msg: MarketMessage) {
        for (const strategy of strategies) {
            strategy([msg], currentSlug, currentClobIds);
        }
    }

    function createWS() {
        return createPolymarketWS({
            channelType: "market",
            url: "wss://ws-subscriptions-clob.polymarket.com",
            data: currentClobIds,
            auth: {
                apiKey: process.env.KEY!,
                secret: process.env.SECRET!,
                passphrase: process.env.PASSPHRASE!,
            },
            verbose: true,
            messageCallback: (msg: MarketMessage) => {
                if (!currentClobIds.includes(msg.asset_id)) return;
                dispatch(msg);
            },
        });
    }

    ws = createWS();

    async function updateMarket() {
        const newSlug = buildSlug(token);

        if (newSlug === currentSlug) return;

        console.log("🔄 Switching market:", newSlug);
        if (newSlug === currentSlug) {
            console.log("⏸ Same slug, skip");
            return;
        }

        const newClobIds = await getClobTokenIds(newSlug);

        currentSlug = newSlug;
        currentClobIds = newClobIds;

        ws?.close();
        ws = createWS();
    }

    function start() {
        setInterval(() => {
            updateMarket().catch(console.error);
        }, 5000);
    }

    return { start };
}