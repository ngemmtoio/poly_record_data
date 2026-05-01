export function get15mUnix(date = new Date(), offset: number = 0) {
    const seconds = Math.floor(date.getTime() / 1000);
    return Math.floor(seconds / (15 * 60)) * (15 * 60) + offset * 15 * 60;
}

export function buildSlug(token: string = "btc", offset: number = 0) {
    return `${token}-updown-15m-${get15mUnix(new Date(), offset)}`;
}