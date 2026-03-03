import { buildPreviousSlug } from "../functions/getPrevious15mUnix.ts";
import { getOutcomeMarket } from "../api/getOutcomeMarket.ts";

const POLL_INTERVAL = 60_000;

function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export async function outcomeService(
    token: string,
    onResult: (slug: string, result: "Up" | "Down") => void
): Promise<void> {
    let lastProcessedSlug: string | null = null;

    while (true) {
        const slug = buildPreviousSlug(token);

        if (slug === lastProcessedSlug) {
            await sleep(POLL_INTERVAL);
            continue;
        }

        console.log("Check", slug);

        try {
            const outcomePrices = await getOutcomeMarket(slug);
            const numeric = outcomePrices.map(Number);

            const isResolved =
                numeric.includes(1) && numeric.includes(0);

            if (isResolved) {

                const winnerIndex = numeric.findIndex(p => p === 1);
                const result: "Up" | "Down" =
                    winnerIndex === 0 ? "Up" : "Down";

                console.log("Result", result);

                lastProcessedSlug = slug;

                // ✅ передаем И slug И результат
                onResult(slug, result);

            } else {
                console.log("No solution");
            }

        } catch {
            console.log("Not available");
        }

        await sleep(POLL_INTERVAL);
    }
}