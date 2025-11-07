export * from "./auth-schema";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const uploads = pgTable("uploads", {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
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

// TODO: Add status, title, summary, detials
export const reports = pgTable("reports", {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    updatedAt: timestamp("updated_at"),
    uploadId: uuid("upload_id")
        .notNull()
        .references(() => uploads.id, {
            onDelete: "cascade",
        }),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, {
            onDelete: "cascade",
        }),
});

export type Upload = InferSelectModel<typeof uploads>;
export type NewUpload = InferInsertModel<typeof uploads>;

export type Report = InferSelectModel<typeof reports>;
export type NewReport = InferInsertModel<typeof reports>;
