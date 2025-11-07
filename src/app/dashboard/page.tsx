import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardPage } from "./_components/dashboard-page";

export const metadata = {
    title: "Dashboard | CancerAI",
};
export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return <DashboardPage />;
}
