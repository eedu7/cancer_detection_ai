import { useMutation, useQuery } from "@tanstack/react-query";
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

export const useCreateUpload = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await fetch(
                `${BASE_API_URL}/api/dashboard/uploads`,
                {
                    method: "POST",
                },
            );
            if (response.status === 201) {
                return await response.json();
            }
            return null;
        },
        mutationKey: ["create-uploads"],
    });
};
