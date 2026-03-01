import { NextResponse } from 'next/server';

interface SuccessPayload<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

interface ErrorPayload {
    success: false;
    error: string;
    details?: unknown;
}

export function successResponse<T>(
    data: T,
    message?: string,
    status = 200
): NextResponse<SuccessPayload<T>> {
    const body: SuccessPayload<T> = { success: true, data };
    if (message) body.message = message;
    return NextResponse.json(body, { status });
}

export function errorResponse(
    error: string,
    status = 500,
    details?: unknown
): NextResponse<ErrorPayload> {
    const body: ErrorPayload = { success: false, error };
    if (details !== undefined) body.details = details;
    return NextResponse.json(body, { status });
}
