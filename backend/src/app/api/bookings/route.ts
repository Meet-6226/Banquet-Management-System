import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import '@/models/User';
import '@/models/Branch';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { getBranchFilter } from '@/middlewares/branchFilter';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { checkBookingConflict } from '@/utils/bookingConflict';

// ─── GET /api/bookings ──────────────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.SALES_EXECUTIVE, USER_ROLES.EVENT_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const filter = getBranchFilter(user);
        const bookings = await Booking.find(filter)
            .populate('customerId', 'name email')
            .populate('branchId', 'name')
            .sort({ eventDate: -1 });

        return successResponse(bookings);
    } catch (err: unknown) {
        console.error('[Bookings GET Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to fetch bookings');
    }
}

// ─── POST /api/bookings ─────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.SALES_EXECUTIVE);
        if (roleErr) return roleErr;

        await connectDB();
        const body = await req.json();
        const { branchId, hallId, eventDate, startTime, endTime, customerId, customerName, guestCount, totalAmount, advancePayment } = body;

        if (!branchId || !hallId || !eventDate || !startTime || !endTime || !guestCount || totalAmount === undefined) {
            return errorResponse('All booking fields are required', 400);
        }

        // Branch Managers can only book for their assigned branch
        if (user.role === USER_ROLES.BRANCH_MANAGER && user.branchId && user.branchId !== branchId) {
            return errorResponse('Unauthorized to create booking for this branch', 403);
        }

        // Resolve customer: use customerId if provided, otherwise find/create by customerName
        let resolvedCustomerId = customerId;
        if (!resolvedCustomerId && customerName) {
            const User = (await import('@/models/User')).default;
            let customer = await User.findOne({ name: customerName.trim(), role: 'CUSTOMER' });
            if (!customer) {
                const bcrypt = await import('bcryptjs');
                customer = await User.create({
                    name: customerName.trim(),
                    email: `${customerName.trim().toLowerCase().replace(/\s+/g, '.')}@customer.local`,
                    password: await bcrypt.hash('password123', 10),
                    role: 'CUSTOMER',
                });
            }
            resolvedCustomerId = customer._id;
        }

        if (!resolvedCustomerId) {
            return errorResponse('Customer name or ID is required', 400);
        }

        // ─── Conflict Prevention ─────────────────────────────────
        const hasConflict = await checkBookingConflict(
            branchId, hallId, new Date(eventDate), startTime, endTime
        );

        if (hasConflict) {
            return errorResponse(
                'Booking conflict: This hall is already booked for the selected date and time.',
                409
            );
        }

        const booking = await Booking.create({
            branchId, hallId, eventDate, startTime, endTime,
            customerId: resolvedCustomerId, guestCount, totalAmount,
            advancePayment: advancePayment || 0,
        });

        return successResponse(booking, 'Booking created successfully', 201);
    } catch (err: unknown) {
        console.error('[Bookings POST Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to create booking');
    }
}
