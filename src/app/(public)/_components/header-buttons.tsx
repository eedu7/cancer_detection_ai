"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const HeaderButton = ({ className, display = false }: { className?: string, display?: boolean }) => {
    const isMobile = useIsMobile();
    if (isMobile && !display) return null;

    return (
        <div className={cn("space-x-2", className)}>
            <Button asChild variant="outline">
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
                <Link href="/register">Get Started</Link>
            </Button>
        </div>
    );
};
