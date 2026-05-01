import type { MarketMessage } from "../servises/types.ts";
import { outcomeService } from "../servises/outcomeService.ts";
import pool from "../db.ts";

export function recordPg(token: string) {
    const sessionIdMap: Record<string, number> = {};
    const messageBuffer: Record<string, MarketMessage> = {};

    function ensureSession(slug: string, cb: (id: number) => void) {
        if (sessionIdMap[slug]) {
            cb(sessionIdMap[slug]);
            return;
        }

        pool.query("SELECT id FROM sessions WHERE slug = $1", [slug])
            .then(res => {
                if (res.rows.length > 0) {
                    sessionIdMap[slug] = res.rows[0].id;
                    cb(sessionIdMap[slug]);
                } else {
                    pool.query(
                        "INSERT INTO sessions (token, slug) VALUES ($1, $2) RETURNING id",
                        [token, slug]
                    ).then(res => {
                        sessionIdMap[slug] = res.rows[0].id;
                        cb(sessionIdMap[slug]);
                    }).catch(console.error);
                }
            })
            .catch(console.error);
    }

    outcomeService(token, (slug, result) => {
        pool.query("UPDATE sessions SET outcome = $1 WHERE slug = $2", [result, slug])
            .then(() => console.log(`🏁 [PG] Outcome for ${slug}: ${result}`))
            .catch(console.error);
    });

    return function strategy(messages: MarketMessage[], slug: string, clobIds: string[]) {
        if (clobIds.length < 2) return;

        for (const msg of messages) {
            messageBuffer[msg.asset_id] = msg;
        }

        const upMsg = messageBuffer[clobIds[0]];
        const downMsg = messageBuffer[clobIds[1]];
        if (!upMsg || !downMsg) return;

        const bestBidUp = upMsg.bids?.[upMsg.bids.length - 1];
        const bestAskUp = upMsg.asks?.[upMsg.asks.length - 1];
        const bestBidDown = downMsg.bids?.[downMsg.bids.length - 1];
        const bestAskDown = downMsg.asks?.[downMsg.asks.length - 1];

        ensureSession(slug, (sessionId) => {
            pool.query(
                `INSERT INTO orderbook_snapshots 
                 (session_id, best_bid_up, best_bid_up_size, best_bid_down, best_bid_down_size,
                  best_ask_up, best_ask_up_size, best_ask_down, best_ask_down_size, ws_time)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
                [
                    sessionId,
                    bestBidUp?.price ?? null,
                    bestBidUp?.size ?? null,
                    bestBidDown?.price ?? null,
                    bestBidDown?.size ?? null,
                    bestAskUp?.price ?? null,
                    bestAskUp?.size ?? null,
                    bestAskDown?.price ?? null,
                    bestAskDown?.size ?? null,
                    messages[0]?.timestamp ?? null,
                ]
            ).catch(console.error);
        });
    };
}