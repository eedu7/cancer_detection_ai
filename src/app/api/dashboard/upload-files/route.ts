// @ts-nocheck

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, uploads } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import { minioClient } from "@/lib/minio-client";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "uploads-bucket";
const BUCKET_REGION = process.env.MINIO_REGION || "us-east-1";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session)
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        const userId = session.user.id;

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const uploadId = formData.get("uploadId") as string;

        if (!files || files.length === 0) {
            return NextResponse.json(
                {
                    error: "No files provided",
                },
                {
                    status: 400,
                },
            );
        }

        if (!uploadId) {
            return NextResponse.json(
                {
                    error: "Upload Id is required",
                },
                {
                    status: 400,
                },
            );
        }

        const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
        if (!bucketExists) {
            await minioClient.makeBucket(BUCKET_NAME, BUCKET_REGION);
            console.log(`Bucket ${BUCKET_NAME} created in ${BUCKET_REGION}`);
        }

        const uploadedFiles: string[] = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const objectName = `${userId}/${uploadId}/${timestamp}-${sanitizedFileName}`;
            // Set metadata
            const metaData = {
                "Content-Type": file.type || "application/octet-stream",
                "X-Amz-Meta-Original-Name": file.name,
                "X-Amz-Meta-Upload-Date": new Date().toISOString(),
                "X-Amz-Meta-User-Id": userId,
            };
            // Upload to MinIO
            await minioClient.putObject(
                BUCKET_NAME,
                objectName,
                buffer,
                buffer.length,
                metaData,
            );

            uploadedFiles.push(objectName);
            console.log(`File uploaded: ${objectName}`);
        }

        await db
            .update(uploads)
            .set({
                filePaths: uploadedFiles,
            })
            .where(and(eq(uploads.id, uploadId), eq(uploads.userId, userId)))
            .returning();

        await inngest.send({
            data: {
                filePath: uploadedFiles,
                uploadId,
                userId,
            },
            name: "analyze-images-ollama",
        });

        const newReport = await db
            .insert(reports)
            .values({
                status: "processing",
                uploadId,
                userId,
            })
            .onConflictDoUpdate({
                set: {
                    status: "processing",
                },
                target: reports.uploadId,
            })
            .returning();

        const reportId = newReport[0].id;

        return NextResponse.json(
            {
                reportId,
                success: true,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                details:
                    error instanceof Error ? error.message : "Unknown error",
                error: "Failed to upload files",
            },
            { status: 500 },
        );
    }
}
