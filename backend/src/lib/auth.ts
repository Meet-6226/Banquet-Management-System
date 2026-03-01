import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

// ─── Password Helpers ────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
}

// ─── JWT Helpers ─────────────────────────────────────────────

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Please define the JWT_SECRET environment variable in .env.local');
    }
    return secret;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    branchId?: string;
}

export function generateToken(payload: JWTPayload): string {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const options: SignOptions = { expiresIn: expiresIn as unknown as number };
    return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
}
