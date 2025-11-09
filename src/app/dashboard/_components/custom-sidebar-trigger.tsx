"use client";

import { PanelLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useGetUploadById } from "../hooks/use-uploads";

export const CustomSideBarTrigger = () => {
    const { toggleSidebar, state } = useSidebar();
    const pathName = usePathname();

    const segments = pathName.split("/").filter(Boolean);
    const uploadId = segments[segments.length - 1];

    return (
        <div className="bg-background p-2 h-14 flex space-x-2 items-center">
            {state === "collapsed" && (
                <Button onClick={toggleSidebar} size="icon" variant="ghost">
                    <PanelLeftIcon />
                </Button>
            )}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathName.includes("/dashboard/upload") && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbEllipsis />
                            </BreadcrumbItem>
                            <UploadBreadcrumb uploadId={uploadId} />
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

interface Props {
    uploadId: string;
}

const UploadBreadcrumb = ({ uploadId }: Props) => {
    const { data } = useGetUploadById(uploadId);
    return (
        <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>{data?.title || uploadId}</BreadcrumbPage>
            </BreadcrumbItem>
        </>
    );
};
