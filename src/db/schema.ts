export * from "./auth-schema";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const uploads = pgTable("uploads", {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    filePaths: jsonb("file_paths").$type<string[]>(),
    id: uuid("id").defaultRandom().primaryKey(),
    metadata: jsonb("metadata").$type<{
        totalSize?: number;
        fileCount?: number;
        fileTypes?: string[];
    }>(),
    title: text("title").notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, {
            onDelete: "cascade",
        }),
});

export const reports = pgTable("reports", {
    createdAt: timestamp("created_at").defaultNow().notNull(),

    /** Example:
     * [
     *   {
     *     uploadedImage: "user/12/abc.png",
     *     analyzedImage: null,
     *     result: "A dog sitting on a sofa"
     *   }
     * ]
     */
    details:
        jsonb("details").$type<
            {
                uploadedImage: string;
                analyzedImage?: string | null;
                result: string;
            }[]
        >(),
    id: uuid("id").defaultRandom().primaryKey(),

    status: text("status").default("pending").notNull(),

    summary: text("summary"), // combined summary of all images
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),

    uploadId: uuid("upload_id")
        .notNull()
        .references(() => uploads.id, { onDelete: "cascade" })
        .unique(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});
export type Upload = InferSelectModel<typeof uploads>;
export type NewUpload = InferInsertModel<typeof uploads>;

export type Report = InferSelectModel<typeof reports>;
export type NewReport = InferInsertModel<typeof reports>;
