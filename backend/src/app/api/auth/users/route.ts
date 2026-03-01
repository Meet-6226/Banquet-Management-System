import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate, isAuthError } from "@/middlewares/auth";

export async function GET(req: Request) {
    try {
        const auth = await authenticate(req);
        if (isAuthError(auth)) {
            return auth;
        }
        // Only allow ADMIN to list all users
        if (auth.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
        }

        await connectDB();
        const users = await User.find().select("-password").populate("branchId", "name location").sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: users });
    } catch (err) {
        console.error("[GET /api/auth/users]", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
