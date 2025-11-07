"use client";

import { MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { HeaderButton } from "./header-buttons";

interface NavItem {
    label: string;
    href: string;
}

const navItems: NavItem[] = [
    { href: "#about", label: "About" },
    { href: "#features", label: "Features" },
    { href: "#technology", label: "Technology" },
    { href: "#contact", label: "Contact" },
];

export const Navbar = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileNavbar isAuthenticated={isAuthenticated} />;
    }

    return (
        <NavigationMenu>
            <NavigationMenuList className="flex-wrap">
                {navItems.map(({ href, label }) => (
                    <NavigationMenuItem key={href}>
                        <NavigationMenuLink
                            asChild
                            className={navigationMenuTriggerStyle()}
                        >
                            <a href={href}>{label}</a>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
};

export function MobileNavbar({
    isAuthenticated,
}: {
    isAuthenticated: boolean;
}) {
    const [open, onOpenChange] = useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut(
            {},
            {
                onSuccess: () => {
                    onOpenChange(false);
                    router.push("/login");
                },
            },
        );
    };

    return (
        <Sheet onOpenChange={onOpenChange} open={open}>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <MenuIcon />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Navigate</SheetTitle>
                </SheetHeader>
                <div className="p-4 flex flex-col space-y-4">
                    {navItems.map(({ href, label }) => (
                        <Button asChild key={href} variant="outline">
                            <a href={href}>
                                <p className="text-left w-full">{label}</p>
                            </a>
                        </Button>
                    ))}
                </div>
                <SheetFooter>
                    {isAuthenticated ? (
                        <Button onClick={handleSignOut}>Sign out</Button>
                    ) : (
                        <HeaderButton
                            className="flex flex-col space-y-2"
                            display
                        />
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
