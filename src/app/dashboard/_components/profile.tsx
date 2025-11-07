"use client";
import { ChevronUpIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export default function Profile() {
    const { data } = authClient.useSession();
    const router = useRouter();
    const name = data?.user?.name || "";
    const initials = name
        ? name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
        : "CN";

    const handleSignOut = async () => {
        await authClient.signOut(
            {},
            {
                onSuccess: () => router.push("/login"),
            },
        );
    };
    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                        <div className="flex items-center space-x-2">
                            <Avatar>
                                <AvatarImage src={data?.user.image || ""} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <p>{name}</p>
                        </div>
                        <ChevronUpIcon className="ml-auto" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[250px]" side="top">
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOutIcon />
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}
