interface Props {
    params: Promise<{ uploadId: string }>;
}

export default async function Page({ params }: Props) {
    const { uploadId } = await params;
    return (
        <div className="h-full flex justify-center items-center border border-rose-500">
            <div className="px-8 py-12">UploadId: {uploadId}</div>
        </div>
    );
}
