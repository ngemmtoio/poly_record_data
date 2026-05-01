export function getSecondsUntilNextSlug(): number {
    const now = Math.floor(Date.now() / 1000);
    const currentBucket = Math.floor(now / 900) * 900;
    const nextBucket = currentBucket + 900;
    return nextBucket - now;
}