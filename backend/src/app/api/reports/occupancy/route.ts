import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Branch from '@/models/Branch';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/reports/occupancy ─────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const dateFilter: Record<string, unknown> = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const matchStage: Record<string, unknown> = {
            status: { $ne: 'Cancelled' },
        };
        if (Object.keys(dateFilter).length > 0) {
            matchStage.eventDate = dateFilter;
        }

        // Bookings per branch
        const occupancyByBranch = await Booking.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$branchId',
                    totalBookings: { $sum: 1 },
                    confirmedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] },
                    },
                    tentativeBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Tentative'] }, 1, 0] },
                    },
                },
            },
        ]);

        // Populate branch names
        const branches = await Branch.find().select('name halls');
        const branchMap = new Map(
            branches.map((b) => [b._id.toString(), { name: b.name, hallCount: b.halls.length }])
        );

        const occupancy = occupancyByBranch.map((item) => ({
            branchId: item._id,
            branchName: branchMap.get(item._id.toString())?.name || 'Unknown',
            hallCount: branchMap.get(item._id.toString())?.hallCount || 0,
            totalBookings: item.totalBookings,
            confirmedBookings: item.confirmedBookings,
            tentativeBookings: item.tentativeBookings,
        }));

        // Bookings per hall (daily breakdown)
        const dailyOccupancy = await Booking.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$eventDate' } },
                        hallId: '$hallId',
                    },
                    bookingCount: { $sum: 1 },
                },
            },
            { $sort: { '_id.date': 1 } },
        ]);

        return successResponse({ byBranch: occupancy, daily: dailyOccupancy });
    } catch (err: unknown) {
        console.error('[Occupancy Report Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to generate occupancy report');
    }
}
