import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FileUpload from "@/components/origin-ui/file-upload";
import type { Upload } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ShowFiles } from "./_components/show-files";

interface Props {
    params: Promise<{ uploadId: string }>;
}

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
    const { uploadId } = await params;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/uploads/${uploadId}`,
            {
                cache: "no-store", // ensure fresh data
                headers: {
                    // Forward incoming headers (cookies, auth, etc.)
                    ...Object.fromEntries(await headers()),
                },
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

export default async function Page({ params }: Props) {
    const { uploadId } = await params;

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/uploads/${uploadId}`,
        {
            headers: await headers(),
        },
    );

    const data = (await response.json()) as DbUpload;
    const hasFiles = Array.isArray(data.filePaths) && data.filePaths.length > 0;

    return (
        <div className="h-full">
            <div className="max-w-5xl mx-auto h-full">
                {hasFiles ? (
                    <ShowFiles
                        filePaths={data.filePaths!}
                        id={data.id}
                        reportId={data.reportId!}
                        title={data.title}
                    />
                ) : (
                    <div className="flex h-full justify-center items-center ">
                        <FileUpload uploadId={uploadId} />
                    </div>
                )}
            </div>
        </div>
    );
}
