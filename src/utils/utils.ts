export function isGameComplete(statusCode: string) {
    const COMPLETED_STATUSES = [6, 7];
    return COMPLETED_STATUSES.includes(parseInt(statusCode));
}
export function isGameRecordable(statusCode: string) {
    const RECORDABLE_STATUSES = [3, 4, 5, 6, 7];
    return RECORDABLE_STATUSES.includes(parseInt(statusCode));
}