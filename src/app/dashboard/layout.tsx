import type React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { CustomSideBarTrigger } from "./_components/custom-sidebar-trigger";

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="h-screen flex flex-col">
                    <CustomSideBarTrigger />
                    <div className="flex-1">{children}</div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
