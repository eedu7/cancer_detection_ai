import type React from "react";
import { Header } from "./_components/header";

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="w-screen h-screen flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
        </div>
    );
}
