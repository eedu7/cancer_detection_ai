import { LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AddNewUploadButton } from "./add-new-upload";
import Profile from "./profile";
import { UploadLists } from "./uploads-lists";

export const AppSidebar = async () => {
    return (
        <Sidebar>

            {/* Sidebar header */}
            <SidebarHeader>
                <SidebarMenu>

                    {/* Collapse the sidebar */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="flex justify-start"
                        >
                            <SidebarTrigger />
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Add new upload */}
                    <AddNewUploadButton />

                    {/* Go to Dashboard  */}
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/dashboard">
                                <LayoutDashboardIcon />
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                </SidebarMenu>
            </SidebarHeader>

            {/* Sidebar Content */}
            <SidebarContent>
                <UploadLists />
            </SidebarContent>

            {/* Sidebar Header */}
            <SidebarFooter>
                <SidebarMenu>

                    {/* Profile */}
                    <Profile />

                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};
