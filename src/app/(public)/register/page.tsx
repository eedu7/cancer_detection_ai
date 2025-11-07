import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

import { RegisterPage } from "../_components/register-page";

export const metadata = {
    description:
        "Sign up for a new account to access your personalized dashboard and start using CancerAI's features.",
    title: "Create an Account | CancerAI",
};

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/dashboard");
    }

    return <RegisterPage />;
}
