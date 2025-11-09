"use client";

import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetUploads } from "../hooks/use-uploads";

export const DashboardPage = () => {
    const { data } = useGetUploads();

    

    return (
        <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-light text-gray-900 mb-8">
                    Your Reports
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.map((item) => (
                        <Link
                            href={`/dashboard/upload/${item.id}`}
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
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

const DashboardItem = ({ title, createdAt, updatedAt }: DashboardItemProps) => {
    return (
        <Card className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="relative pb-3">
                <CardTitle className="text-lg font-medium text-gray-900 line-clamp-2">
                    {title}
                </CardTitle>
            </CardHeader>

            <CardFooter className="relative pt-0 pb-5">
                <div className="flex items-center gap-6 text-xs text-gray-500 w-full">
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
