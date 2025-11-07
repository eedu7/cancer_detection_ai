"use client";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useCreateUpload } from "../hooks/use-uploads";

export const AddNewUploadButton = () => {
    const { mutate } = useCreateUpload();
    const router = useRouter();
    const handleClick = () => {
        mutate(undefined, {
            onSuccess: (res) => {
                const id = res?.data?.id;
                router.push(`/dashboard/upload/${id}`);
            },
        });
    };
    return (
        <SidebarMenuItem>
            <SidebarMenuButton onClick={handleClick}>
                <PlusIcon />
                <span>Add New</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};
