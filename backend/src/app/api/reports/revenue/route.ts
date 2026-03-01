import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/reports/revenue ───────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.FINANCE_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build date filter
        const dateFilter: Record<string, unknown> = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const matchStage: Record<string, unknown> = {};
        if (Object.keys(dateFilter).length > 0) {
            matchStage.createdAt = dateFilter;
        }

        // Revenue aggregation
        const revenueData = await Invoice.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalTax: { $sum: '$taxAmount' },
                    totalPaid: { $sum: '$advancePaid' },
                    totalOutstanding: { $sum: '$balanceDue' },
                    invoiceCount: { $sum: 1 },
                    paidCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] },
                    },
                    partialCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Partial'] }, 1, 0] },
                    },
                    unpaidCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, 1, 0] },
                    },
                },
            },
        ]);

        // Monthly breakdown
        const monthlyRevenue = await Invoice.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        return successResponse({
            summary: revenueData[0] || {
                totalRevenue: 0, totalTax: 0, totalPaid: 0,
                totalOutstanding: 0, invoiceCount: 0,
                paidCount: 0, partialCount: 0, unpaidCount: 0,
            },
            monthly: monthlyRevenue,
        });
    } catch (err: unknown) {
        console.error('[Revenue Report Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to generate revenue report');
    }
}
