export function getSecondsUntilNextSlug(): number {
    const now = Math.floor(Date.now() / 1000);
    const currentBucket = Math.floor(now / 300) * 300;
    const nextBucket = currentBucket + 300;
    return nextBucket - now;
}