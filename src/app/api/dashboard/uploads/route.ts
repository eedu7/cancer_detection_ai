import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { generateSlug } from "random-word-slugs";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
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
    const data = await db.query.uploads.findMany({
        orderBy: [desc(uploads.createdAt)],
        where: eq(uploads.userId, session.user.id),
    });

    return NextResponse.json(data);
}

export async function POST() {
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
    const title = generateSlug(3, {
        format: "title",
    });

    const data = await db
        .insert(uploads)
        .values({
            title: title,
            userId: session.user.id,
        })
        .returning();

    return NextResponse.json(
        {
            data: data[0],
            message: `${title} created successfully`,
        },
        {
            status: 201,
        },
    );
}
