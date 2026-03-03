export type MarketMessage = {
    market: string;
    asset_id: string;
    asks: { price: string | number; size: string | number }[];
    bids: { price: string | number; size: string | number }[];
    timestamp: number;
};