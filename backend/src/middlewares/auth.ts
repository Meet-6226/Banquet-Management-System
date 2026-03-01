import { verifyToken, type JWTPayload } from '@/lib/auth';
import { errorResponse } from '@/utils/apiResponse';
import { NextResponse } from 'next/server';

/**
 * Extract and verify JWT from the Authorization header.
 * Returns the decoded payload or an error response.
 */
export async function authenticate(
    req: Request
): Promise<JWTPayload | NextResponse> {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse('Authentication required. Provide a Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        return decoded;
    } catch {
        return errorResponse('Invalid or expired token', 401);
    }
}

/**
 * Helper to check if the authenticate result is an error response.
 */
export function isAuthError(
    result: JWTPayload | NextResponse
): result is NextResponse {
    return result instanceof NextResponse;
}
