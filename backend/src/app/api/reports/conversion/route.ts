import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/reports/conversion ────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.SALES_EXECUTIVE);
        if (roleErr) return roleErr;

        await connectDB();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const dateFilter: Record<string, unknown> = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const matchStage: Record<string, unknown> = {};
        if (Object.keys(dateFilter).length > 0) {
            matchStage.createdAt = dateFilter;
        }

        // Lead status breakdown
        const statusBreakdown = await Lead.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Total leads & conversion rate
        const totalLeads = statusBreakdown.reduce((sum, s) => sum + s.count, 0);
        const wonLeads = statusBreakdown.find((s) => s._id === 'Won')?.count || 0;
        const lostLeads = statusBreakdown.find((s) => s._id === 'Lost')?.count || 0;
        const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : '0.00';

        // Conversion by assigned user
        const byAssignee = await Lead.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$assignedTo',
                    total: { $sum: 1 },
                    won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
                    lost: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    assigneeName: { $ifNull: ['$user.name', 'Unknown'] },
                    total: 1,
                    won: 1,
                    lost: 1,
                    conversionRate: {
                        $cond: [
                            { $gt: ['$total', 0] },
                            { $multiply: [{ $divide: ['$won', '$total'] }, 100] },
                            0,
                        ],
                    },
                },
            },
        ]);

        // Monthly trend
        const monthlyTrend = await Lead.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    total: { $sum: 1 },
                    won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        return successResponse({
            summary: {
                totalLeads,
                wonLeads,
                lostLeads,
                conversionRate: `${conversionRate}%`,
            },
            statusBreakdown,
            byAssignee,
            monthlyTrend,
        });
    } catch (err: unknown) {
        console.error('[Conversion Report Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to generate conversion report');
    }
}
