import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

import { LoginPage } from "../_components/login-page";

export const metadata = {
    description:
        "Log in to your account to access your dashboard, manage your data, and continue where you left off.",
    title: "Sign In | CancerAI",
};

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/dashboard");
    }

    return <LoginPage />;
}
