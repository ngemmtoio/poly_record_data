import { createPolymarketWS } from "../api/wsClient.ts";
import { buildSlug } from "../functions/get15mUnix.ts";
import { getClobTokenIds } from "../api/getClobTokenIds.ts";
import type { MarketMessage } from "./types.ts";
import {getSecondsUntilNextSlug} from "../functions/getSecondsUntilNextSlug.ts";

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
    let nextClobIds: string[] | null = null;
    let nextSlug: string | null = null;
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
            verbose: true,
            messageCallback: (msg: MarketMessage) => {
                if (!currentClobIds.includes(msg.asset_id)) return;
                dispatch(msg);
            },
        });
    }

    ws = createWS();

    async function prefetchNext() {
        const upcoming = buildSlug(token, 1);
        if (upcoming === currentSlug || upcoming === nextSlug) return;

        try {
            nextClobIds = await getClobTokenIds(upcoming);
            nextSlug = upcoming;
            console.log(`📦 [${token}] Prefetched next: ${upcoming}`);
        } catch (e) {
            console.error(`⚠️ [${token}] Prefetch failed for ${upcoming}`, e);
            nextClobIds = null;
            nextSlug = null;
        }
    }

    function switchMarket() {
        const newSlug = buildSlug(token);
        if (newSlug === currentSlug) return;

        if (nextSlug === newSlug && nextClobIds) {
            console.log(`⚡ [${token}] Instant switch: ${newSlug}`);
            currentSlug = newSlug;
            currentClobIds = nextClobIds;
            nextSlug = null;
            nextClobIds = null;
            ws?.close();
            ws = createWS();
        } else {
            console.log(`🔄 [${token}] Fallback fetch: ${newSlug}`);
            getClobTokenIds(newSlug).then(ids => {
                currentSlug = newSlug;
                currentClobIds = ids;
                ws?.close();
                ws = createWS();
            }).catch(console.error);
        }
    }

    function start() {
        setInterval(() => {
            const secondsLeft = getSecondsUntilNextSlug();

            if (secondsLeft <= 60 && !nextClobIds) {
                prefetchNext().catch(console.error);
            }

            switchMarket();
        }, 2000);
    }

    return { start };
}