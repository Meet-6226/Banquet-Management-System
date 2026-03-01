import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import InventoryItem from '@/models/InventoryItem';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── PUT /api/inventory/:id ─────────────────────────────────
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.INVENTORY_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const item = await InventoryItem.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!item) return errorResponse('Inventory item not found', 404);

        return successResponse(item, 'Inventory item updated');
    } catch (err: unknown) {
        console.error('[Inventory PUT Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to update inventory item');
    }
}
