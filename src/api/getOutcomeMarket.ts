export type OutcomeResponse = {
    outcomePrices: string[];
    closed: boolean;
};

export async function getOutcomeMarket(slug: string): Promise<OutcomeResponse> {
    const res = await fetch(
        `https://gamma-api.polymarket.com/markets/slug/${slug}`
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch market: ${slug}`);
    }

    const market = await res.json();

    return {
        outcomePrices: JSON.parse(market.outcomePrices),
        closed: market.closed === true,
    };
}