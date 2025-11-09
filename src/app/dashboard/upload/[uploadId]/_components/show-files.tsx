"use client";

interface Props {
    id: string;
    title: string;
    filePaths: string[];
    reportId: string;
}

export const ShowFiles = ({ id, title, filePaths, reportId }: Props) => {
    const limitedFiles = filePaths.slice(0, 6);

    return (
        <div className="py-6 px-2">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <a
                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
                    href={`/dashboard/report/${reportId}`}
                >
                    View Report
                </a>
            </div>

            {/* Masonry Columns */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                {limitedFiles.map((filePath) => (
                    <div
                        className="break-inside-avoid bg-white rounded-lg shadow-sm overflow-hidden border"
                        key={filePath}
                    >
                        <a
                            href={filePath}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <img
                                alt="File"
                                className="w-full h-auto object-cover rounded-lg hover:opacity-90 transition"
                                src={filePath}
                            />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};
