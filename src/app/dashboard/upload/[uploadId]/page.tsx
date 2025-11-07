import FileUpload from "@/components/origin-ui/file-upload";

interface Props {
    params: Promise<{ uploadId: string }>;
}

export default async function Page({ params }: Props) {
    const { uploadId } = await params;
    return (
        <div className="h-full  flex justify-center items-center ">
            <div className="max-w-4xl mx-auto">
                <FileUpload />
            </div>
        </div>
    );
}
