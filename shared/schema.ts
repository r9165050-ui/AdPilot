import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  objective: text("objective").notNull(),
  platforms: text("platforms").array().notNull(),
  status: text("status").notNull().default("draft"), // draft, active, paused, completed
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }).notNull(),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  duration: integer("duration").notNull(), // days
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  targetAudience: jsonb("target_audience").notNull(),
  adCreative: jsonb("ad_creative"),
  metrics: jsonb("metrics").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adTemplates = pgTable("ad_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  platform: text("platform").notNull(), // facebook, instagram, both
  thumbnail: text("thumbnail"),
  content: jsonb("content").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaignMetrics = pgTable("campaign_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  date: timestamp("date").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0"),
  cpc: decimal("cpc", { precision: 10, scale: 2 }).default("0"),
  conversions: integer("conversions").default(0),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull().default("pending"), // pending, succeeded, failed, canceled
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  stripeClientSecret: text("stripe_client_secret"),
  paymentMethod: text("payment_method"), // card type, last4, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  userId: true,
  spent: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdTemplateSchema = createInsertSchema(adTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignMetricsSchema = createInsertSchema(campaignMetrics).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertAdTemplate = z.infer<typeof insertAdTemplateSchema>;
export type AdTemplate = typeof adTemplates.$inferSelect;
export type InsertCampaignMetrics = z.infer<typeof insertCampaignMetricsSchema>;
export type CampaignMetrics = typeof campaignMetrics.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
