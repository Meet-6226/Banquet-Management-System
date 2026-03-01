import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Vendor from '@/models/Vendor';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── PUT /api/vendors/:id ───────────────────────────────────
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

        const vendor = await Vendor.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!vendor) return errorResponse('Vendor not found', 404);

        return successResponse(vendor, 'Vendor updated successfully');
    } catch (err: unknown) {
        console.error('[Vendors PUT Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to update vendor');
    }
}
