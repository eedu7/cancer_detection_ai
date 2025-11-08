import { eq } from "drizzle-orm";
import ollama from "ollama";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { minioClient } from "@/lib/minio-client";

const BUCKET = process.env.MINIO_BUCKET_NAME!;

export const analyzeImages = inngest.createFunction(
    {
        id: "Analyze Images (Ollama)",
    },
    { event: "analyze-images-ollama" },
    async ({ event, step }) => {
        const { uploadId, userId, filePath } = event.data;

        // Make report as processing
        await step.run("set-processing", async () => {
            await db
                .insert(reports)
                .values({
                    status: "processing",
                    uploadId,
                    userId,
                })
                .onConflictDoUpdate({
                    set: {
                        status: "processing",
                    },
                    target: reports.uploadId,
                });
        });

        // Download all Images
        const images = await step.run("download-images", async () => {
            return Promise.all(
                filePath.map(async (path: string) => {
                    const stream = await minioClient.getObject(BUCKET, path);
                    const chunks: Buffer[] = [];
                    for await (const chunk of stream) chunks.push(chunk);
                    const base64 = Buffer.concat(chunks).toString("base64");

                    return { base64, path };
                }),
            );
        });
        // Analyzing images with Ollama
        const analyzed = await step.run("ollama-vision", async () => {
            const results = [];

            for (const img of images) {
                const response = await ollama.chat({
                    messages: [
                        {
                            content: "Explain what is in this image in detail.",
                            images: [img.base64],
                            role: "user",
                        },
                    ],
                    model: "qwen3-vl:2b",
                });
                results.push({
                    analyzeImages: null,
                    result: response["message"]["content"] ?? "No results",
                    uploadedImage: img.path,
                });
            }

            return results;
        });

        // Create summary
        const summary = analyzed
            .map((a, index) => `Image ${index + 1}: ${a.result}`)
            .join("\n\n");

        // Save final report

        await step.run("save-report", async () => {
            await db
                .update(reports)
                .set({
                    details: analyzed,
                    status: "done",
                    summary,
                })
                .where(eq(reports.uploadId, uploadId));
        });

        return {
            status: "ok",
        };
    },
);
