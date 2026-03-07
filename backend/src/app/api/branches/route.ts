import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/branches ─────────────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        await connectDB();
        const filter = (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.FINANCE_MANAGER) ? {} : { _id: user.branchId };
        const branches = await Branch.find(filter).populate('managerId', 'name email');
        return successResponse(branches);
    } catch (err: unknown) {
        console.error('[Branches GET Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to fetch branches');
    }
}

// ─── POST /api/branches ────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN);
        if (roleErr) return roleErr;

        await connectDB();
        const body = await req.json();
        const { name, location, halls, managerId } = body;

        if (!name || !location) {
            return errorResponse('name and location are required', 400);
        }

        const branch = await Branch.create({ name, location, halls: halls || [], managerId });
        return successResponse(branch, 'Branch created successfully', 201);
    } catch (err: unknown) {
        console.error('[Branches POST Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to create branch');
    }
}
