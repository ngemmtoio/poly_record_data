const FIFTEEN_MIN_SECONDS = 15 * 60;

export function getPrevious15mUnix(date = new Date()) {
    const seconds = Math.floor(date.getTime() / 1000);
    const currentBucket =
        Math.floor(seconds / FIFTEEN_MIN_SECONDS) * FIFTEEN_MIN_SECONDS;
    return currentBucket - FIFTEEN_MIN_SECONDS;
}

export function buildPreviousSlug(token: string = "btc") {
    return `${token}-updown-15m-${getPrevious15mUnix()}`;
}