import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Vendor from '@/models/Vendor';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { getBranchFilter } from '@/middlewares/branchFilter';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/vendors ───────────────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.EVENT_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const filter = getBranchFilter(user);
        const vendors = await Vendor.find(filter)
            .populate('branchId', 'name')
            .sort({ name: 1 });

        return successResponse(vendors);
    } catch (err: unknown) {
        console.error('[Vendors GET Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to fetch vendors');
    }
}

// ─── POST /api/vendors ──────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.EVENT_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const body = await req.json();
        const { name, serviceType, contact, rating, branchId } = body;

        if (!name || !serviceType || !contact || !branchId) {
            return errorResponse('name, serviceType, contact, and branchId are required', 400);
        }

        const vendor = await Vendor.create({
            name, serviceType, contact,
            rating: rating || 0,
            branchId,
        });

        return successResponse(vendor, 'Vendor created successfully', 201);
    } catch (err: unknown) {
        console.error('[Vendors POST Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to create vendor');
    }
}
