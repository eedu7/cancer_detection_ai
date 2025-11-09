import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata = {
    description: "AI-powered tools for cancer analysis and clinical research",
    title: "CancerAI",
};

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const isAuthenticated = Boolean(session?.session);

    return (
        <div
            className={cn(
                "h-full w-full flex items-center justify-center bg-linear-to-b from-white to-slate-100 p-6",
                inter.className,
            )}
        >
            <article
                className="
                    max-w-2xl p-10 rounded-2xl shadow-xs bg-white/80 backdrop-blur 
                    text-center space-y-6 border border-slate-200 animate-fadeIn
                "
            >
                <h1 className="text-5xl font-semibold text-slate-800 leading-tight">
                    Welcome to <span className="text-blue-600">CancerAI</span>
                </h1>

                <p className="text-slate-600 text-lg leading-relaxed">
                    CancerAI provides intelligent tools designed to support
                    researchers, clinicians, and healthcare innovators. With
                    advanced data insights and AI-powered predictive assistance,
                    our mission is to strengthen medical decision-making and
                    improve patient outcomes.
                </p>

                <p className="text-slate-600 leading-relaxed">
                    Through a calming, intuitive interface backed by reliable
                    machine learning, CancerAI brings clarity and confidence to
                    complex medical analysis — helping you focus on what matters
                    most.
                </p>

                {isAuthenticated && (
                    <Link
                        className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        href="/dashboard"
                    >
                        Go to Dashboard
                    </Link>
                )}
            </article>
        </div>
    );
}
