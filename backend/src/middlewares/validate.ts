import { errorResponse } from '@/utils/apiResponse';
import { NextResponse } from 'next/server';

/**
 * Validate that all required fields are present in the request body.
 * Returns null if valid, or an error response with details.
 */
export function validateRequiredFields(
    body: Record<string, unknown>,
    requiredFields: string[]
): NextResponse | null {
    const missing = requiredFields.filter(
        (field) => body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missing.length > 0) {
        return errorResponse(
            `Missing required fields: ${missing.join(', ')}`,
            400,
            { missingFields: missing }
        );
    }

    return null;
}

/**
 * Safely parse the JSON body of a request.
 */
export async function parseBody(req: Request): Promise<Record<string, unknown> | NextResponse> {
    try {
        const body = await req.json();
        return body;
    } catch {
        return errorResponse('Invalid JSON body', 400);
    }
}
