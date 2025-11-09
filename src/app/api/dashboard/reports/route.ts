import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reports, uploads } from "@/db/schema";
import { auth } from "@/lib/auth"; // ✅ better-auth

export async function GET(req: Request) {
    try {
        // ✅ Authenticate using better-auth
        const session = await auth.api.getSession({ request: req });

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        // ✅ Fetch reports only for this user, with their related uploads
        const userReports = await db
            .select({
                report: reports,
                upload: {
                    createdAt: uploads.createdAt,
                    filePaths: uploads.filePaths,
                    id: uploads.id,
                    metadata: uploads.metadata,
                    title: uploads.title,
                },
            })
            .from(reports)
            .leftJoin(uploads, eq(reports.uploadId, uploads.id))
            .where(eq(reports.userId, userId));

        // ✅ Flatten output
        const formatted = userReports.map((r) => ({
            ...r.report,
            upload: r.upload,
        }));

        return NextResponse.json(
            { data: formatted, success: true },
            { status: 200 },
        );
    } catch (error: any) {
        console.error("GET /api/reports error:", error);
        return NextResponse.json(
            { message: "Failed to fetch reports", success: false },
            { status: 500 },
        );
    }
}
