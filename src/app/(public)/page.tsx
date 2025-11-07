import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata = {
    description: "AI-powered tools for cancer analysis and clinical research",
    title: "CancerAI",
};

export default function Home() {
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
            </article>
        </div>
    );
}
