import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";

type Params = Promise<{ uploadId: string }>;

export async function GET(request: Request, context: { params: Params }) {
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

    const { uploadId } = await context.params;
    console.log("UploadId", uploadId);

    const data = await db.query.reports.findFirst({
        where: and(
            eq(reports.uploadId, uploadId),
            // eq(reports.userId, session.user.id),
        ),
    });

    console.table(data);

    return NextResponse.json({
        data,
    });
}
