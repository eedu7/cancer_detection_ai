"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Report } from "@/db/schema";

interface Props {
    reportId: string;
}

export const PageView = ({ reportId }: Props) => {
    const { data } = useQuery({
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/reports/${reportId}`,
                {
                    cache: "no-store",
                },
            );

            if (!response.ok) {
                throw new Error("Error");
            }
            const data = await response.json();
            return data.data as Report;
        },
        queryKey: ["report", reportId],
        refetchInterval: (data: any) =>
            data?.status === "processing" ? 2000 : false,
    });

    const retryMutation = useMutation({
        mutationFn: async () => {
            await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/upload-files/retry`,
                {
                    body: JSON.stringify({ reportId }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                },
            );
        },
        mutationKey: ["retry-upload-files", reportId],
        onSuccess: () => {
            window.location.reload()
        },
    });

    if (data?.status === "failed") {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-4">
                <p className="text-red-600 text-2xl font-bold">
                    Processing Failed
                </p>
                <p className="text-gray-500 max-w-xs mb-4">
                    Something went wrong while processing your files.
                </p>
                <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    disabled={retryMutation.isPending}
                    onClick={() => retryMutation.mutate()}
                >
                    {retryMutation.isPending ? "Retrying..." : "Retry"}
                </Button>
                {retryMutation.error && (
                    <p className="text-sm text-red-600 mt-2">
                        {(retryMutation.error as Error).message}
                    </p>
                )}
            </div>
        );
    }

    if (!data || data.details?.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-4">
                {/* Animated loader */}
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>

                {/* Message */}
                <p className="text-xl font-bold font-mono border-b-2 shadow-md">
                    Processing...
                </p>

                {/* Additional info */}
                <p className="text-gray-500 max-w-xs">
                    Your request is being processed. This may take a few moments
                    depending on the data size. Please wait or check back
                    shortly.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8">
            {/* Report Summary */}
            {data.summary && (
                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <MarkdownRenderer text={data.summary} />
                </div>
            )}

            {/* Individual Details */}
            <AnimatePresence>
                {data &&
                    data.details &&
                    data.details.map((detail, index) => (
                        <div
                            className="grid grid-cols-4 border-2 shadow rounded-sm p-2"
                            key={`${index + 400} container`}
                        >
                            {index % 2 === 0 && (
                                <img
                                    alt={`Detail ${index + 500} + "even"`}
                                    className="w-96 object-cover h-96 rounded-md"
                                    src={detail.uploadedImage}
                                />
                            )}
                            <div className="col-span-3 overflow-hidden">
                                <ScrollArea className="overflow-auto h-96">
                                    <div className="p-4 col-span-3">
                                        <MarkdownRenderer
                                            text={detail.result}
                                        />
                                    </div>
                                    <ScrollBar orientation="vertical" />
                                </ScrollArea>
                            </div>
                            {index % 2 !== 0 && (
                                <img
                                    alt={`Detail ${index + 600} + "odd"`}
                                    className="w-96 object-cover h-96 rounded-md"
                                    src={detail.uploadedImage}
                                />
                            )}
                        </div>
                    ))}
            </AnimatePresence>

            {data?.status !== "done" && data?.details?.length !== 6 && (
                <div className="grid grid-cols-6 gap-4">
                    {/* Left Image Skeleton */}
                    <div className="col-span-2">
                        <div className="w-full h-96 bg-gray-200 animate-pulse rounded-md" />
                    </div>

                    {/* Markdown Skeleton */}
                    <div className="col-span-4">
                        <ScrollArea className="overflow-auto h-96">
                            <div className="p-4 space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                                <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-6 bg-gray-200 rounded w-5/6 animate-pulse" />
                                <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
                                <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                            </div>
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    );
};
