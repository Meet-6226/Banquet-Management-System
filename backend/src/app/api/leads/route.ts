import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import '@/models/User';
import '@/models/Branch';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { getBranchFilter } from '@/middlewares/branchFilter';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/leads ─────────────────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.SALES_EXECUTIVE, USER_ROLES.EVENT_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const filter = getBranchFilter(user);
        const leads = await Lead.find(filter)
            .populate('assignedTo', 'name email')
            .populate('branchId', 'name')
            .sort({ createdAt: -1 });

        return successResponse(leads);
    } catch (err: unknown) {
        console.error('[Leads GET Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to fetch leads');
    }
}

// ─── POST /api/leads ────────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.SALES_EXECUTIVE);
        if (roleErr) return roleErr;

        await connectDB();
        const body = await req.json();
        const { name, contact, eventDate, guestCount, budget, branchId, assignedTo } = body;

        if (!name || !contact || !eventDate || !guestCount || !budget || !branchId || !assignedTo) {
            return errorResponse('All lead fields are required', 400);
        }

        const lead = await Lead.create({
            name, contact, eventDate, guestCount, budget,
            branchId, assignedTo,
            status: 'New',
        });

        return successResponse(lead, 'Lead created successfully', 201);
    } catch (err: unknown) {
        console.error('[Leads POST Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to create lead');
    }
}
