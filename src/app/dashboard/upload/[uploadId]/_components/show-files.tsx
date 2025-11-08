"use client";

interface Props {
    id: string;
    title: string;
    filePaths: string[];
}

export const ShowFiles = ({ id, title, filePaths }: Props) => {
    // Limit to maximum 6 files
    const limitedFiles = filePaths.slice(0, 6);

    return (
        <div className="py-6">
            <h1 className="text-2xl font-semibold mb-6">{title}</h1>

            {/* Masonry container using CSS columns */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                {limitedFiles.map((filePath) => (
                    <div
                        className="break-inside-avoid p-2 mb-4 rounded-lg overflow-hidden shadow-sm bg-white"
                        key={filePath}
                    >
                        <a
                            href={filePath}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <img
                                alt="File"
                                className="w-full h-auto object-cover rounded-lg"
                                src={filePath}
                            />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};
