export async function getOutcomeMarket(slug: string): Promise<string[]> {
    const res = await fetch(
        `https://gamma-api.polymarket.com/markets/slug/${slug}`
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch market: ${slug}`);
    }

    const market = await res.json();
    return JSON.parse(market.outcomePrices);
}