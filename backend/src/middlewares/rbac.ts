import { type JWTPayload } from '@/lib/auth';
import { errorResponse } from '@/utils/apiResponse';
import { type UserRole } from '@/config/constants';
import { NextResponse } from 'next/server';

/**
 * Check if the authenticated user's role is among the allowed roles.
 * Returns null if authorised, or an error response if not.
 */
export function authorize(
    user: JWTPayload,
    ...allowedRoles: UserRole[]
): NextResponse | null {
    if (!allowedRoles.includes(user.role as UserRole)) {
        return errorResponse(
            `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
            403
        );
    }
    return null;
}
