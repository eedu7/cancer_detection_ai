// @ts-nocheck

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, uploads } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    console.log("Hello-world");
    try {
        // 1. Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }
        const userId = session.user.id;

        // 2. Parse request body
        const body = await request.json();
        const { reportId } = body;

        if (!reportId) {
            return NextResponse.json(
                { error: "reportId is required" },
                { status: 400 },
            );
        }

        // 3. Fetch report from database
        const report = await db
            .select()
            .from(reports)
            .where(and(eq(reports.id, reportId), eq(reports.userId, userId)))
            .limit(1);

        if (!report || report.length === 0) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 },
            );
        }

        const uploadId = report[0].uploadId;

        // 4. Fetch associated upload
        const upload = await db
            .select()
            .from(uploads)
            .where(and(eq(uploads.id, uploadId), eq(uploads.userId, userId)))
            .limit(1);

        if (!upload || upload.length === 0) {
            return NextResponse.json(
                { error: "Associated upload not found" },
                { status: 404 },
            );
        }

        const uploadFiles = upload[0].filePaths;

        if (!uploadFiles || uploadFiles.length === 0) {
            return NextResponse.json(
                { error: "No files found for this upload" },
                { status: 400 },
            );
        }

        // 5. Send Inngest event to retry analysis
        try {
            await inngest.send({
                data: {
                    filePath: uploadFiles,
                    uploadId,
                    userId,
                },
                name: "analyze-images-ollama",
            });

            const delay = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;

            // Wait for the delay
            await new Promise((resolve) => setTimeout(resolve, delay));

            return NextResponse.json(
                { message: "Retry event sent successfully", success: true },
                { status: 200 },
            );
        } catch (inngestError) {
            console.error("Inngest send failed:", inngestError);
            return NextResponse.json(
                {
                    details:
                        inngestError instanceof Error
                            ? inngestError.message
                            : String(inngestError),
                    error: "Failed to resend event",
                },
                { status: 500 },
            );
        }
    } catch (error) {
        console.error("Retry upload error:", error);
        return NextResponse.json(
            {
                details:
                    error instanceof Error ? error.message : "Unknown error",
                error: "Failed to retry upload",
            },
            { status: 500 },
        );
    }
}
