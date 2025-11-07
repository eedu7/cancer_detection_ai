import type React from "react";
import {
    SidebarInset, SidebarProvider
} from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { CustomSideBarTrigger } from "./_components/custom-sidebar-trigger";

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main>
                    <CustomSideBarTrigger />

                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
