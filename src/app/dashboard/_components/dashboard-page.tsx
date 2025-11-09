"use client";

import { formatDistanceToNow } from "date-fns";
import {
    CalendarIcon,
    CheckCircle,
    ClockIcon,
    Hourglass,
    Loader,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from "../hooks/use-reports";

export const DashboardPage = () => {
    const { data, isLoading } = useReports();

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center text-gray-500">
                Loading reports...
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-light text-gray-900 mb-8">
                    Your Reports
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.map((item: any) => (
                        <Link
                            href={`/dashboard/report/${item.id}`}
                            key={item.id}
                        >
                            <DashboardItem {...item} />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface DashboardItemProps {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    upload: {
        title: string;
    };
}

const statusConfig: Record<
    string,
    {
        icon: any;
        color: string;
        cardColor: string;
        animated?: boolean;
    }
> = {
    completed: {
        cardColor: "bg-green-50",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
    },
    failed: {
        cardColor: "bg-red-50",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: XCircle,
    },
    pending: {
        cardColor: "bg-yellow-50",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: Hourglass,
    },
    processing: {
        animated: true,
        cardColor: "bg-blue-50",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: Loader,
    },
};

const DashboardItem = ({
    status,
    createdAt,
    updatedAt,
    upload,
}: DashboardItemProps) => {
    const cfg = statusConfig[status] || statusConfig["pending"];
    const Icon = cfg.icon;

    return (
        <Card
            className={`
                group relative overflow-hidden border-0 
                shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                ${cfg.cardColor}
            `}
        >
            <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900 line-clamp-2">
                        {upload?.title}
                    </CardTitle>

                    <Badge
                        className={`
                            capitalize border flex items-center gap-1
                            px-2 py-1 text-xs font-medium
                            transition-all duration-300
                            ${cfg.color}
                            ${cfg.animated ? "animate-pulse" : ""}
                        `}
                    >
                        <Icon
                            className={`w-3.5 h-3.5 ${cfg.animated ? "animate-spin" : ""
                                }`}
                        />
                        {status}
                    </Badge>
                </div>
            </CardHeader>

            <CardFooter className="relative pt-0 pb-5">
                <div className="flex items-center gap-6 text-xs text-gray-600 w-full">
                    <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>
                            {formatDistanceToNow(new Date(createdAt), {
                                addSuffix: true,
                            })}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>
                            {formatDistanceToNow(new Date(updatedAt), {
                                addSuffix: true,
                            })}
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};
