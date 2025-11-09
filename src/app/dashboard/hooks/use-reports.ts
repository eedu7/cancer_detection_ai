import { useQuery } from "@tanstack/react-query";

export function useReports() {
    return useQuery({
        queryFn: async () => {
            const res = await fetch("/api/dashboard/reports");
            if (!res.ok) throw new Error("Failed to fetch reports");
            const data = await res.json();
            return data.data; // array of reports
        },
        queryKey: ["reports"],
    });
}
