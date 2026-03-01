import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Booking from '@/models/Booking';
import '@/models/Vendor';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { deductInventory } from '@/utils/inventoryCalculator';

// ─── GET /api/events ────────────────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.EVENT_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const events = await Event.find()
            .populate('bookingId')
            .populate('vendors', 'name serviceType contact')
            .sort({ createdAt: -1 });

        return successResponse(events);
    } catch (err: unknown) {
        console.error('[Events GET Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to fetch events');
    }
}

// ─── POST /api/events ───────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.EVENT_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const body = await req.json();
        const { bookingId, menuItems, vendors, guestCount, extraCharges } = body;

        if (!bookingId || !guestCount) {
            return errorResponse('bookingId and guestCount are required', 400);
        }

        // Verify booking exists and get branch for inventory
        const booking = await Booking.findById(bookingId);
        if (!booking) return errorResponse('Booking not found', 404);

        // Create the event
        const event = await Event.create({
            bookingId,
            menuItems: menuItems || [],
            vendors: vendors || [],
            guestCount,
            extraCharges: extraCharges || 0,
        });

        // ─── Auto-deduct inventory when booking is confirmed ────
        if (booking.status === 'Confirmed' && menuItems && menuItems.length > 0) {
            try {
                const result = await deductInventory(
                    booking.branchId.toString(),
                    menuItems,
                    guestCount
                );
                return successResponse(
                    { event, inventoryDeductions: result.deducted },
                    'Event created and inventory deducted',
                    201
                );
            } catch (invErr: unknown) {
                // Event created but inventory deduction failed — return warning
                return successResponse(
                    { event, inventoryWarning: invErr instanceof Error ? invErr.message : 'Inventory deduction failed' },
                    'Event created but inventory deduction failed',
                    201
                );
            }
        }

        return successResponse(event, 'Event created successfully', 201);
    } catch (err: unknown) {
        console.error('[Events POST Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to create event');
    }
}
