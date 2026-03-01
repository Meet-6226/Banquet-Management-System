import { type JWTPayload } from '@/lib/auth';
import { USER_ROLES } from '@/config/constants';

/**
 * Build a branch filter for database queries.
 * ADMIN sees all branches; other users are scoped to their own branch.
 */
export function getBranchFilter(user: JWTPayload): Record<string, string> | Record<string, never> {
    if (user.role === USER_ROLES.ADMIN) {
        return {}; // no filter — admin sees everything
    }

    if (!user.branchId) {
        return {}; // no branch assigned — return empty (queries will return nothing)
    }

    return { branchId: user.branchId };
}
