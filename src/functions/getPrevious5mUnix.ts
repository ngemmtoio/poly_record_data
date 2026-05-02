const FIVE_MIN_SECONDS = 5 * 60;

export function getPrevious5mUnix(date = new Date()) {
    const seconds = Math.floor(date.getTime() / 1000);
    const currentBucket =
        Math.floor(seconds / FIVE_MIN_SECONDS) * FIVE_MIN_SECONDS;
    return currentBucket - FIVE_MIN_SECONDS;
}

export function buildPreviousSlug(token: string = "btc") {
    return `${token}-updown-5m-${getPrevious5mUnix()}`;
}