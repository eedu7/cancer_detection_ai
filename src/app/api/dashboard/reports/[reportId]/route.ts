// @ts-nocheck

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { minioClient } from "@/lib/minio-client";

type Params = Promise<{ reportId: string }>;
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

export async function GET(request: Request, context: { params: Params }) {
    // TODO: Make it authenticated
    // const session = await auth.api.getSession({
    //     headers: await headers(),
    // });

    // if (!session)
    //     return NextResponse.json(
    //         {
    //             error: "Unauthorized",
    //         },
    //         {
    //             status: 401,
    //         },
    //     );

    const { reportId } = await context.params;

    const data = await db.query.reports.findFirst({
        where: and(
            eq(reports.id, reportId),
            // eq(reports.userId, session.user.id),
        ),
    });

    if (!data) {
        return NextResponse.json(
            { error: "Report not found" },
            { status: 404 },
        );
    }

    // Update uploadedImage to presigned URL
    const updatedDetails = await Promise.all(
        (data.details || []).map(async (detail) => {
            if (!detail.uploadedImage) return detail;

            const presignedUrl = await minioClient.presignedGetObject(
                BUCKET_NAME,
                detail.uploadedImage,
                24 * 60 * 60, // URL valid for 24 hours
            );

            return {
                ...detail,
                uploadedImage: presignedUrl,
            };
        }),
    );

    const updatedData = {
        ...data,
        details: updatedDetails,
    };

    return NextResponse.json({
        data: updatedData,
    });
}
