export function get5mUnix(date = new Date(), offset: number = 0) {
    const seconds = Math.floor(date.getTime() / 1000);
    return Math.floor(seconds / (5 * 60)) * (5 * 60) + offset * 5 * 60;
}

export function buildSlug(token: string = "btc", offset: number = 0) {
    return `${token}-updown-5m-${get5mUnix(new Date(), offset)}`;
}