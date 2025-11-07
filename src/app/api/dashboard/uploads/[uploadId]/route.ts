import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { auth } from "@/lib/auth";

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

    return NextResponse.json(data);
}
