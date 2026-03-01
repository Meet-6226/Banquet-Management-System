import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { checkBookingConflict } from '@/utils/bookingConflict';

// ─── PUT /api/bookings/:id ──────────────────────────────────
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const { id } = await params;
        const body = await req.json();

        // If changing date/time/hall, check for conflicts
        if (body.eventDate || body.startTime || body.endTime || body.hallId) {
            const existing = await Booking.findById(id);
            if (!existing) return errorResponse('Booking not found', 404);

            const hasConflict = await checkBookingConflict(
                body.branchId || existing.branchId.toString(),
                body.hallId || existing.hallId.toString(),
                body.eventDate ? new Date(body.eventDate) : existing.eventDate,
                body.startTime || existing.startTime,
                body.endTime || existing.endTime,
                id
            );

            if (hasConflict) {
                return errorResponse('Booking conflict: This hall is already booked for the selected date and time.', 409);
            }
        }

        const booking = await Booking.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!booking) {
            return errorResponse('Booking not found', 404);
        }

        return successResponse(booking, 'Booking updated successfully');
    } catch (err: unknown) {
        console.error('[Bookings PUT Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to update booking');
    }
}

// ─── DELETE /api/bookings/:id ───────────────────────────────
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const { id } = await params;

        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return errorResponse('Booking not found', 404);
        }

        return successResponse(null, 'Booking deleted successfully');
    } catch (err: unknown) {
        console.error('[Bookings DELETE Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to delete booking');
    }
}
