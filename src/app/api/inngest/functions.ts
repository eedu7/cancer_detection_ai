import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { minioClient } from "@/lib/minio-client";

const BUCKET = process.env.MINIO_BUCKET_NAME!;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const SITE_URL = "http://your-site.com"; // Replace with your site URL
const SITE_NAME = "Cancer AI System"; // Replace with your site name

export const analyzeImages = inngest.createFunction(
    { id: "Analyze Images (OpenRouter)" },
    { event: "analyze-images-ollama" },
    async ({ event, step }) => {
        const { uploadId, userId, filePath } = event.data;

        try {
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

            // STEP 2 — PROCESS EACH IMAGE SEQUENTIALLY
            for (let i = 0; i < filePath.length; i++) {
                const path = filePath[i];
                console.log(`\n\n=======================`);
                console.log(`📸 IMAGE ${i + 1}/${filePath.length}: ${path}`);
                console.log(`=======================\n`);

                // DOWNLOAD IMAGE
                const { base64 } = await step.run(
                    `download-image-${i + 1}`,
                    async () => {
                        console.log(`⬇️ Downloading image ${i + 1}: ${path}`);
                        const stream = await minioClient.getObject(
                            BUCKET,
                            path,
                        );
                        const chunks: Buffer[] = [];
                        for await (const chunk of stream) chunks.push(chunk);
                        const b64 = Buffer.concat(chunks).toString("base64");
                        console.log(
                            `✅ Downloaded image ${i + 1}, size: ${b64.length} base64 chars`,
                        );
                        return { base64: b64 };
                    },
                );

                // CONVERT BASE64 TO DATA URL
                const base64DataUrl = `data:image/jpeg;base64,${base64}`;

                // ANALYZE IMAGE USING OPENROUTER
                const analysis = await step.run(
                    `analyze-image-${i + 1}`,
                    async () => {
                        console.log(
                            `🤖 Sending image ${i + 1} to OpenRouter for analysis...`,
                        );

                        try {
                            const response = await fetch(
                                "https://openrouter.ai/api/v1/chat/completions",
                                {
                                    body: JSON.stringify({
                                        messages: [
                                            {
                                                content: [
                                                    {
                                                        text: "Explain what is in the image. Return proper markdown.",
                                                        type: "text",
                                                    },
                                                    {
                                                        image_url: {
                                                            url: base64DataUrl,
                                                        },
                                                        type: "image_url",
                                                    },
                                                ],
                                                role: "user",
                                            },
                                        ],
                                        model: "meta-llama/llama-4-maverick:free",
                                    }),
                                    headers: {
                                        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                                        "Content-Type": "application/json",
                                        "HTTP-Referer": SITE_URL,
                                        "X-Title": SITE_NAME,
                                    },
                                    method: "POST",
                                },
                            );

                            const json = await response.json();
                            const text =
                                json?.choices?.[0]?.message?.content ??
                                "No results";

                            console.log(
                                `✅ OpenRouter response for image ${i + 1}`,
                            );
                            console.log(text.substring(0, 300) + " ...");

                            return text;
                        } catch (error) {
                            console.error("❌ OpenRouter Error:", error);
                            throw error;
                        }
                    },
                );

                // SAVE RESULT LOCALLY
                results.push({
                    result: analysis,
                    uploadedImage: path,
                });

                // UPDATE DATABASE FOR THIS IMAGE
                await step.run(`update-db-image-${i + 1}`, async () => {
                    console.log(
                        `📝 Updating DB with results for image ${i + 1}...`,
                    );
                    await db
                        .update(reports)
                        .set({ details: results, status: "processing" })
                        .where(eq(reports.uploadId, uploadId));
                    console.log(`✅ DB updated for image ${i + 1}`);
                });
            }

            // FINAL SUMMARY
            await step.run("final-summary", async () => {
                const summary = results
                    .map((r, i) => `Image ${i + 1}:\n${r.result}`)
                    .join("\n\n");

                await db
                    .update(reports)
                    .set({ status: "done", summary })
                    .where(eq(reports.uploadId, uploadId));

                console.log("✅ Report marked as 'done'.");
            });

            console.log(`✅ Finished processing all ${results.length} images.`);

            return {
                imagesProcessed: results.length,
                status: "ok",
                uploadId,
            };
        } catch (error) {
            console.error("❌ ERROR OCCURRED:", error);

            // MARK REPORT AS FAILED
            await step.run("mark-report-failed", async () => {
                await db
                    .update(reports)
                    .set({ status: "failed" })
                    .where(eq(reports.uploadId, uploadId));
                console.log("🚨 Report marked as FAILED.");
            });

            return {
                error: String(error),
                status: "failed",
                uploadId,
            };
        }
    },
);
