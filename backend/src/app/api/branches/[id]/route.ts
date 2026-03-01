import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── PUT /api/branches/:id ─────────────────────────────────
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN);
        if (roleErr) return roleErr;

        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const branch = await Branch.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!branch) {
            return errorResponse('Branch not found', 404);
        }

        return successResponse(branch, 'Branch updated successfully');
    } catch (err: unknown) {
        console.error('[Branches PUT Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to update branch');
    }
}

// ─── DELETE /api/branches/:id ───────────────────────────────
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN);
        if (roleErr) return roleErr;

        await connectDB();
        const { id } = await params;

        const branch = await Branch.findByIdAndDelete(id);
        if (!branch) {
            return errorResponse('Branch not found', 404);
        }

        return successResponse(null, 'Branch deleted successfully');
    } catch (err: unknown) {
        console.error('[Branches DELETE Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to delete branch');
    }
}
