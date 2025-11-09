import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Report, Upload } from "@/db/schema";
import { auth } from "@/lib/auth";
import { PageView } from "./_components/page-view";

type DbUpload = Upload & {
    reportId: string | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }
    const { reportId } = await params;

    try {
        const reportResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/reports/${reportId}`,
            {
                cache: "no-store", // ensure fresh data
                headers: {
                    // Forward incoming headers (cookies, auth, etc.)
                    ...Object.fromEntries(await headers()),
                },
            },
        );

        if (!reportResponse.ok) {
            throw new Error("Failed to fetch upload data");
        }

        const reportData: { data: Report } = await reportResponse.json();

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/uploads/${reportData.data.uploadId}`,
            {
                cache: "no-store", // ensure fresh data
                headers: await headers()
            },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch upload data");
        }

        const data: DbUpload = await response.json();


        return {
            description: `Files uploaded for ${data.title || "your upload"}`,
            openGraph: {
                description: `Files uploaded for ${data.title || "your upload"}`,
                title: data.title || "Upload Details",
                type: "website",
            },
            title: `${data.title || "Upload Details"} - CancerAI`,
        };
    } catch (err) {
        console.error(err);
        return {
            description: "View your uploaded files",
            title: "Upload Details",
        };
    }
}

interface Props {
    params: Promise<{ reportId: string }>;
}

export default async function Page({ params }: Props) {
    const { reportId } = await params;

    const header_data = await headers();
    const session = await auth.api.getSession({
        headers: header_data,
    });

    if (!session) {
        redirect("/login");
    }
    return <PageView reportId={reportId} />;
}
