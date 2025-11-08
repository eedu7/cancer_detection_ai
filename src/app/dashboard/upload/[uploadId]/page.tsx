import type { Metadata } from "next";
import { headers } from "next/headers";
import FileUpload from "@/components/origin-ui/file-upload";
import type { Upload } from "@/db/schema";
import { ShowFiles } from "./_components/show-files";

interface Props {
    params: Promise<{ uploadId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

        const data: Upload = await response.json();

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

    const data = (await response.json()) as Upload;
    const hasFiles = Array.isArray(data.filePaths) && data.filePaths.length > 0;

    return (
        <div className="h-full  flex justify-center items-center ">
            <div className="max-w-5xl mx-auto">
                {hasFiles ? (
                    <ShowFiles
                        filePaths={data.filePaths!}
                        id={data.id}
                        title={data.title}
                    />
                ) : (
                    <FileUpload uploadId={uploadId} />
                )}
            </div>
        </div>
    );
}
