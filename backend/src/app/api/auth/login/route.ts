import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function POST(req: Request): Promise<NextResponse> {
    try {
        await connectDB();

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return errorResponse('Email and password are required', 400);
        }

        // ─── Find user and include password field ────────────────
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return errorResponse('Invalid email or password', 401);
        }

        if (!user.isActive) {
            return errorResponse('Account is deactivated. Contact admin.', 403);
        }

        // ─── Compare password ────────────────────────────────────
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse('Invalid email or password', 401);
        }

        // ─── Generate token ──────────────────────────────────────
        const token = generateToken({
            userId: String(user._id),
            email: user.email,
            role: user.role,
            branchId: user.branchId?.toString(),
        });

        return successResponse({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branchId: user.branchId,
            },
            token,
        }, 'Login successful');
    } catch (err: unknown) {
        console.error('[Login Error]', err);
        const message = err instanceof Error ? err.message : 'Login failed';
        return errorResponse(message, 500);
    }
}
