/**
 * Calculates the total hours between two time strings in HH:mm format.
 * Supports overnight shifts.
 */
export function calculateShiftHours(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let startTotalMinutes = startH * 60 + startM;
    let endTotalMinutes = endH * 60 + endM;

    if (endTotalMinutes < startTotalMinutes) {
        // Overnight shift
        endTotalMinutes += 24 * 60;
    }

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return durationMinutes / 60;
}

/**
 * Formats a number of hours into a readable string.
 * Example: 8.5 -> "8.5 hrs", 8 -> "8 hrs"
 */
export function formatHours(hours: number): string {
    const rounded = Math.round(hours * 100) / 100;
    return `${rounded} hrs`;
}
