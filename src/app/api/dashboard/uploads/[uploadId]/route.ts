// @ts-nocheck

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reports, uploads } from "@/db/schema";
import { auth } from "@/lib/auth";
import { minioClient } from "@/lib/minio-client";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

type Params = Promise<{ uploadId: string }>;

export async function GET(request: Request, context: { params: Params }) {
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

    const { uploadId } = await context.params;
    const data = await db.query.uploads.findFirst({
        orderBy: [desc(uploads.createdAt)],
        where: and(
            eq(uploads.userId, session.user.id),
            eq(uploads.id, uploadId),
        ),
    });
    if (!data)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const presignedUrls = await Promise.all(
        (data.filePaths || []).map(async (filePath) => {
            try {
                const url = await minioClient.presignedGetObject(
                    BUCKET_NAME,
                    filePath,
                    24 * 60 * 60, // URL valid for 24 hours
                );
                return url;
            } catch (err) {
                console.error(
                    "Error generating presigned URL for",
                    filePath,
                    err,
                );
                return null;
            }
        }),
    );

    const report = await db.query.reports.findFirst({
        where: and(
            eq(reports.uploadId, uploadId),
            eq(reports.userId, session.user.id),
        ),
    });

    // Replace filePaths with presigned URLs
    const responseData = {
        ...data,
        filePaths: presignedUrls.filter(Boolean), // remove any nulls
        reportId: report?.id,
    };

    return NextResponse.json(responseData);
}
