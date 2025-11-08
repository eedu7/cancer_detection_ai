import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Upload } from "@/db/schema";

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_BASE_API_URL not set");
}

export const useGetUploads = () => {
    return useQuery<Upload[]>({
        queryFn: async () => {
            const response = await fetch(
                `${BASE_API_URL}/api/dashboard/uploads`,
            );
            if (response.status === 200) {
                return (await response.json()) as Upload[];
            }
            throw new Error("No uploads found");
        },
        queryKey: ["uploads"],
    });
};

export const useGetUploadById = (uploadId: string) => {
    return useQuery<Upload | null>({
        enabled: !!uploadId,
        queryFn: async () => {
            const response = await fetch(
                `${BASE_API_URL}/api/dashboard/uploads/${uploadId}`,
            );
            if (response.status === 200) {
                return (await response.json()) as Upload;
            }
            if (response.status === 401) {
                throw new Error("Unauthorized");
            }
            return null;
        },
        queryKey: ["upload", uploadId],
    });
};

export const useCreateUpload = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await fetch(
                `${BASE_API_URL}/api/dashboard/uploads`,
                {
                    method: "POST",
                },
            );
            if (response.status === 201) {
                queryClient.invalidateQueries({
                    queryKey: ["uploads"],
                });
                return await response.json();
            }
            return null;
        },
        mutationKey: ["create-uploads"],
    });
};

export const useUploadFiles = () => {
    return useMutation({
        mutationFn: async (data: FormData) => {
            const response = await fetch("/api/dashboard/upload-files", {
                body: data,
                method: "POST",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }
            return await response.json();
        },
        mutationKey: ["uploadFiles"],
    });
};
// TODO: Resume from here
