import { and, eq } from "drizzle-orm";
import ollama from "ollama";
import { summaryGenerate } from "@/constants/prompts";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { minioClient } from "@/lib/minio-client";

const BUCKET = process.env.MINIO_BUCKET_NAME!;

export const analyzeImages = inngest.createFunction(
    { id: "Analyze Images (Ollama)" },
    { event: "analyze-images-ollama" },
    async ({ event, step }) => {
        const { uploadId, userId, filePath } = event.data;

        console.log("🔥 Event Received:", {
            fileCount: filePath.length,
            uploadId,
            userId,
        });

        // STEP 1 — Mark report as processing
        await step.run("mark-report-processing", async () => {
            console.log("✅ Marking report as processing...");

            await db
                .update(reports)
                .set({ details: [], status: "processing" })
                .where(
                    and(
                        eq(reports.uploadId, uploadId),
                        eq(reports.userId, userId),
                    ),
                );

            console.log("✅ Report status updated to 'processing'");
        });

        const results: any[] = [];

        // ✅ PROCESS EACH IMAGE SEQUENTIALLY
        for (let i = 0; i < filePath.length; i++) {
            const path = filePath[i];
            console.log(`\n\n=======================`);
            console.log(`📸 IMAGE ${i + 1}/${filePath.length}: ${path}`);
            console.log(`=======================\n`);

            // STEP 2 — DOWNLOAD
            const { base64 } = await step.run(
                `download-image-${i + 1}`,
                async () => {
                    console.log(`⬇️ Downloading image ${i + 1}: ${path}`);

                    const stream = await minioClient.getObject(BUCKET, path);
                    const chunks: Buffer[] = [];

                    for await (const chunk of stream) chunks.push(chunk);

                    const b64 = Buffer.concat(chunks).toString("base64");

                    console.log(
                        `✅ Downloaded image ${i + 1}, size: ${b64.length} base64 chars`,
                    );

                    return { base64: b64 };
                },
            );

            // STEP 3 — ANALYZE IMAGE
            const analysis = await step.run(
                `analyze-image-${i + 1}`,
                async () => {
                    console.log(
                        `🤖 Sending image ${i + 1} to Ollama for analysis...`,
                    );

                    try {
                        const response = await ollama.chat({
                            messages: [
                                {
                                    content:
                                        "Explain what is in the image. Return a propoer markdown",
                                    images: [base64],
                                    role: "user",
                                },
                            ],
                            model: "qwen3-vl:2b",
                        });
                        const text =
                            response["message"]["content"]?.substring(0, 300) ??
                            "No results";

                        console.log(
                            `✅ Ollama response received for image ${i + 1}:`,
                        );
                        console.log(text + " ...");

                        return response["message"]["content"] ?? "No results";
                    } catch (error: any) {
                        console.log("error");
                        throw new Error(error);
                    }
                },
            );

            // Save result locally
            results.push({
                result: analysis,
                uploadedImage: path,
            });

            // STEP 4 — UPDATE DATABASE FOR THIS IMAGE
            await step.run(`update-db-image-${i + 1}`, async () => {
                console.log(
                    `📝 Updating DB with results for image ${i + 1}...`,
                );

                await db
                    .update(reports)
                    .set({
                        details: results,
                        status: "processing",
                    })
                    .where(eq(reports.uploadId, uploadId));

                console.log(`✅ DB updated for image ${i + 1}`);
                console.log(
                    `✅ Total results stored so far: ${results.length}`,
                );
            });
        }

        // ✅ FINAL SUMMARY
        await step.run("generate-final-summary", async () => {
            console.log("\n🧠 Generating final summary for all images...");

            const combined = results
                .map((r, i) => `Image ${i + 1}:\n${r.result}`)
                .join("\n\n");

            const summaryResponse = await ollama.chat({
                messages: [
                    {
                        content: summaryGenerate(combined),
                        role: "user",
                    },
                ],
                model: "qwen3-vl:2b",
            });

            const summary = summaryResponse.message.content ?? combined;

            console.log("✅ Final summary generated (first 300 chars):");
            console.log(summary.substring(0, 300) + " ...");

            console.log("📝 Writing summary + status=done to DB...");

            await db
                .update(reports)
                .set({
                    status: "done",
                    summary,
                })
                .where(eq(reports.uploadId, uploadId));

            console.log("✅ Report marked as 'done'.");
        });

        console.log(`✅ Finished processing all ${results.length} images.`);

        return {
            imagesProcessed: results.length,
            status: "ok",
            uploadId,
        };
    },
);
