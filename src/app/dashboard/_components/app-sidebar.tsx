import {
    Sidebar,
    SidebarContent,
    SidebarFooter, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger
} from "@/components/ui/sidebar";
import { AddNewUploadButton } from "./add-new-upload";
import Profile from "./profile";
import { UploadLists } from "./uploads-lists";

export const AppSidebar = async () => {
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="flex justify-start"
                        >
                            <SidebarTrigger />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <AddNewUploadButton />
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <UploadLists />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <Profile />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};
