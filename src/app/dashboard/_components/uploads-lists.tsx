"use client";
import Link from "next/link";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useGetUploads } from "../hooks/use-uploads";

export const UploadLists = () => {
    const { data } = useGetUploads();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Reports</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {data
                        ? data.map(({ id, title }) => (
                            <SidebarMenuItem key={id}>
                                <SidebarMenuButton>
                                    <Link href={`/dashboard/upload/${id}`}>
                                        {title}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))
                        : ""}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};
