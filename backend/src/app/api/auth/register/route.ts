import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { ALL_ROLES } from '@/config/constants';

export async function POST(req: Request): Promise<NextResponse> {
    try {
        await connectDB();

        const body = await req.json();
        const { name, email, password, role, branchId } = body;

        // ─── Validate required fields ────────────────────────────
        if (!name || !email || !password || !role) {
            return errorResponse('name, email, password, and role are required', 400);
        }

        if (!ALL_ROLES.includes(role)) {
            return errorResponse(`Invalid role. Allowed: ${ALL_ROLES.join(', ')}`, 400);
        }

        // ─── Check duplicate email ───────────────────────────────
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return errorResponse('A user with this email already exists', 409);
        }

        // ─── Create user ─────────────────────────────────────────
        const user = await User.create({
            name,
            email,
            password,
            role,
            branchId: branchId || null,
        });

        // ─── Generate token ──────────────────────────────────────
        const token = generateToken({
            userId: String(user._id),
            email: user.email,
            role: user.role,
            branchId: user.branchId?.toString(),
        });

        return successResponse(
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    branchId: user.branchId,
                },
                token,
            },
            'User registered successfully',
            201
        );
    } catch (err: unknown) {
        console.error('[Register Error]', err);
        const message = err instanceof Error ? err.message : 'Registration failed';
        return errorResponse(message, 500);
    }
}
