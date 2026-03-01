import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Booking from '@/models/Booking';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/invoices ──────────────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.FINANCE_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const invoices = await Invoice.find()
            .populate({
                path: 'bookingId',
                populate: [
                    { path: 'customerId', select: 'name email' },
                    { path: 'branchId', select: 'name' },
                ],
            })
            .sort({ createdAt: -1 });

        return successResponse(invoices);
    } catch (err: unknown) {
        console.error('[Invoices GET Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to fetch invoices');
    }
}

// ─── POST /api/invoices ─────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.FINANCE_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const body = await req.json();
        const { bookingId, totalAmount, taxAmount, advancePaid } = body;

        if (!bookingId || totalAmount === undefined) {
            return errorResponse('bookingId and totalAmount are required', 400);
        }

        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) return errorResponse('Booking not found', 404);

        // balanceDue and paymentStatus are auto-calculated by pre-save hook
        const invoice = await Invoice.create({
            bookingId,
            totalAmount,
            taxAmount: taxAmount || 0,
            advancePaid: advancePaid || 0,
        });

        return successResponse(invoice, 'Invoice created successfully', 201);
    } catch (err: unknown) {
        console.error('[Invoices POST Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to create invoice');
    }
}
