"use client";

import {
  AlertCircleIcon,
  ImageIcon,
  Loader2Icon,
  SparkleIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUploadFiles } from "@/app/dashboard/hooks/use-uploads";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function FileUpload({ uploadId }: { uploadId: string }) {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB default
  const maxFiles = 6;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxFiles,
    maxSize,
    multiple: true,
  });

  const { mutate, isPending } = useUploadFiles();
  const router = useRouter();
  const handleUpload = async () => {
    if (files.length === 0) {
      return null;
    }

    try {
      const formData = new FormData();

      formData.append("uploadId", uploadId);

      files.forEach((fileWithPreview) => {
        if (fileWithPreview.file instanceof File) {
          formData.append("files", fileWithPreview.file);
        }
      });
      // TODO: Redirect to Reports
      mutate(formData, {
        onSuccess: () => {
          router.refresh();
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        className="relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed border-black p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          {...getInputProps()}
          aria-label="Upload image file"
          className="sr-only"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({files.length})
              </h3>
              <div className="space-x-2">
                <Button
                  disabled={files.length >= maxFiles}
                  onClick={openFileDialog}
                  variant="outline"
                >
                  <UploadIcon
                    aria-hidden="true"
                    className="-ms-0.5 size-3.5 opacity-60"
                  />
                  Add more
                </Button>
                <Button
                  disabled={isPending}
                  onClick={handleUpload}
                  variant="outline"
                >
                  {isPending ? (
                    <>
                      <Loader2Icon
                        aria-hidden="true"
                        className="-ms-0.5 size-3.5 animate-spin"
                      />
                      Generating report...
                    </>
                  ) : (
                    <>
                      <SparkleIcon
                        aria-hidden="true"
                        className="-ms-0.5 size-3.5"
                      />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {files.map((file) => (
                <div
                  className="relative aspect-square rounded-md bg-accent"
                  key={file.id}
                >
                  <img
                    alt={file.file.name}
                    className="size-full rounded-[inherit] object-cover"
                    src={file.preview}
                  />
                  <Button
                    aria-label="Remove image"
                    className="absolute -top-2 -right-2 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
                    onClick={() => removeFile(file.id)}
                    size="icon"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center space-y-4 w-md">
            <div
              aria-hidden="true"
              className="mb-2 flex space-y-4 size-15 shrink-0 items-center justify-center rounded-full border bg-background"
            >
              <ImageIcon className="size-8 opacity-60" />
            </div>
            <p className="mb-1.5 text- font-medium">
              Drop your images here
            </p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
            </p>
            <Button
              className="mt-4"
              onClick={openFileDialog}
              variant="outline"
            >
              <UploadIcon
                aria-hidden="true"
                className="-ms-1 opacity-60"
              />
              Select images
            </Button>
          </div>
        )}
      </div>
      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
      ;
      <p
        aria-live="polite"
        className="mt-2 text-center text-xs text-muted-foreground"
        role="region"
      >
        Multiple image uploader w/ image grid ∙{" "}
        <a
          className="underline hover:text-foreground"
          href="https://github.com/cosscom/coss/blob/main/apps/origin/docs/use-file-upload.md"
        >
          API
        </a>
      </p>
      ;
    </div>
  );
}
