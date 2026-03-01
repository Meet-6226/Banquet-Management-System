import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import InventoryItem from '@/models/InventoryItem';
import { authenticate, isAuthError } from '@/middlewares/auth';
import { authorize } from '@/middlewares/rbac';
import { getBranchFilter } from '@/middlewares/branchFilter';
import { USER_ROLES } from '@/config/constants';
import { successResponse, errorResponse } from '@/utils/apiResponse';

// ─── GET /api/inventory ─────────────────────────────────────
export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.BRANCH_MANAGER, USER_ROLES.INVENTORY_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const filter = getBranchFilter(user);
        const items = await InventoryItem.find(filter)
            .populate('branchId', 'name')
            .populate('supplierId', 'name contact')
            .sort({ name: 1 });

        // Flag items below threshold
        const data = items.map((item) => ({
            ...item.toObject(),
            belowThreshold: item.quantity <= item.threshold,
        }));

        return successResponse(data);
    } catch (err: unknown) {
        console.error('[Inventory GET Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to fetch inventory');
    }
}

// ─── POST /api/inventory ────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await authenticate(req);
        if (isAuthError(user)) return user;

        const roleErr = authorize(user, USER_ROLES.ADMIN, USER_ROLES.INVENTORY_MANAGER);
        if (roleErr) return roleErr;

        await connectDB();
        const body = await req.json();
        const { branchId, name, quantity, unit, threshold, supplierId } = body;

        if (!branchId || !name || quantity === undefined || !unit) {
            return errorResponse('branchId, name, quantity, and unit are required', 400);
        }

        const item = await InventoryItem.create({
            branchId, name, quantity, unit,
            threshold: threshold || 0,
            supplierId: supplierId || null,
        });

        return successResponse(item, 'Inventory item created', 201);
    } catch (err: unknown) {
        console.error('[Inventory POST Error]', err);
        return errorResponse(err instanceof Error ? err.message : 'Failed to create inventory item');
    }
}
