import Booking from '@/models/Booking';

/**
 * Check if there is an overlapping booking for the given hall on the given date/time.
 * Returns the conflicting booking if found, or null.
 */
export async function checkBookingConflict(
    branchId: string,
    hallId: string,
    eventDate: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
): Promise<boolean> {
    const query: Record<string, unknown> = {
        branchId,
        hallId,
        eventDate,
        status: { $ne: 'Cancelled' },
        $or: [
            // Overlap: existing start is between new start and end
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const conflict = await Booking.findOne(query);
    return !!conflict;
}
