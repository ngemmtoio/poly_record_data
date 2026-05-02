import { getPrevious5mUnix } from "../functions/getPrevious5mUnix.ts";
import { getOutcomeMarket } from "../api/getOutcomeMarket.ts";

const INTERVAL_SEC = 5 * 60;
const INITIAL_DELAY_MS = 60_000;
const RETRY_INTERVAL_MS = 30_000;

function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function pollUntilResolved(
    slug: string,
    onResult: (slug: string, result: "Up" | "Down") => void
): Promise<void> {
    while (true) {
        try {
            const { outcomePrices, closed } = await getOutcomeMarket(slug);

            const numeric = outcomePrices.map(Number);
            const hasOne = numeric.includes(1);
            const hasZero = numeric.includes(0);
            const isResolved = closed && hasOne && hasZero;

            if (isResolved) {
                const winnerIndex = numeric.findIndex(p => p === 1);
                const result: "Up" | "Down" =
                    winnerIndex === 0 ? "Up" : "Down";
                console.log(`Result ${slug}: ${result}`);
                onResult(slug, result);
                return;
            } else {
                console.log(
                    `[${slug}] not resolved (closed=${closed}, prices=${JSON.stringify(outcomePrices)})`
                );
            }
        } catch (e) {
            console.log(
                `[${slug}] not available`,
                e instanceof Error ? e.message : e
            );
        }

        await sleep(RETRY_INTERVAL_MS);
    }
}

export async function outcomeService(
    token: string,
    onResult: (slug: string, result: "Up" | "Down") => void
): Promise<void> {
    let bucketToCheck = getPrevious5mUnix();

    while (true) {
        const closeTimeMs = (bucketToCheck + INTERVAL_SEC) * 1000;
        const firstCheckAt = closeTimeMs + INITIAL_DELAY_MS;
        const waitUntilFirstCheck = firstCheckAt - Date.now();

        if (waitUntilFirstCheck > 0) {
            await sleep(waitUntilFirstCheck);
        }

        const slug = `${token}-updown-5m-${bucketToCheck}`;
        console.log("Check", slug);

        // Запускаем проверку в фоне и сразу идём к следующему bucket
        pollUntilResolved(slug, onResult).catch(e => {
            console.error(`[${slug}] poll task crashed`, e);
        });

        bucketToCheck += INTERVAL_SEC;
    }
}