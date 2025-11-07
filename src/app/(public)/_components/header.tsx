import { headers } from "next/headers";
import { useIsMobile } from "@/hooks/use-mobile";
import { auth } from "@/lib/auth";
import { HeaderButton } from "./header-buttons";
import { Navbar } from "./navbar";

export const Header = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const isAuthenticated = Boolean(session);

    return (
        <div className="bg-background">
            <header className="flex justify-between items-center p-2 max-w-7xl mx-auto">
                <h1>CancerAI</h1>
                <div className="flex items-center">
                    <Navbar isAuthenticated={isAuthenticated} />
                    {!session && <HeaderButton />}
                </div>
            </header>
        </div>
    );
};
