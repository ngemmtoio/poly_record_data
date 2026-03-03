export function get15mUnix(date = new Date()) {
    const seconds = Math.floor(date.getTime() / 1000);
    return Math.floor(seconds / (15 * 60)) * (15 * 60);
}

export function buildSlug(token: string = "btc") {
    return `${token}-updown-15m-${get15mUnix()}`;
}
