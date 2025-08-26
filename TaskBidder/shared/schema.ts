import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  phone: varchar("phone"),
  location: text("location"),
  isWorker: boolean("is_worker").default(false),
  workerRating: decimal("worker_rating", { precision: 3, scale: 2 }),
  completedTasks: varchar("completed_tasks").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskStatusEnum = pgEnum('task_status', ['open', 'assigned', 'in_progress', 'completed', 'cancelled']);
export const taskCategoryEnum = pgEnum('task_category', ['grocery_shopping', 'document_pickup', 'queue_standing', 'delivery', 'cleaning', 'other']);
export const bidStatusEnum = pgEnum('bid_status', ['pending', 'accepted', 'rejected', 'withdrawn']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'held', 'released', 'refunded']);
export const offerTypeEnum = pgEnum('offer_type', ['attraction', 'upsell', 'downsell', 'continuity']);
export const notificationTypeEnum = pgEnum('notification_type', ['task_update', 'new_bid', 'bid_accepted', 'payment', 'achievement', 'promotion']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);
export const achievementTypeEnum = pgEnum('achievement_type', ['task_completion', 'rating', 'streak', 'referral', 'milestone']);

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  workerId: varchar("worker_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: taskCategoryEnum("category").notNull(),
  location: text("location").notNull(),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }).notNull(),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  urgency: varchar("urgency").notNull(), // 'asap', 'today', 'tomorrow', '3_days', 'week', 'flexible'
  status: taskStatusEnum("status").default('open'),
  photos: text("photos").array(),
  completionPhotos: text("completion_photos").array(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  workerId: varchar("worker_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  estimatedDuration: varchar("estimated_duration"), // in minutes
  status: bidStatusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  workerId: varchar("worker_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: paymentStatusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Business Features Tables

// Offers System (Attraction, Upsell, Downsell, Continuity)
export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: offerTypeEnum("type").notNull(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true),
  conditions: jsonb("conditions"), // e.g., {"minTaskCount": 3, "category": "grocery_shopping"}
  benefits: jsonb("benefits"), // e.g., {"discount": 20, "freeTaskCount": 1}
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  usageLimit: varchar("usage_limit"), // global usage limit
  usageCount: varchar("usage_count").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Offer Usage Tracking
export const userOffers = pgTable("user_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  usageCount: varchar("usage_count").default("0"),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Smart Matching & Analytics
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  preferredCategories: text("preferred_categories").array(),
  maxDistance: decimal("max_distance", { precision: 5, scale: 2 }),
  minBudget: decimal("min_budget", { precision: 10, scale: 2 }),
  maxBudget: decimal("max_budget", { precision: 10, scale: 2 }),
  availableHours: jsonb("available_hours"), // {"monday": ["09:00", "17:00"], ...}
  skills: text("skills").array(),
  equipment: text("equipment").array(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Location & Distance Intelligence
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  taskId: varchar("task_id").references(() => tasks.id),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trust & Safety Features
export const verifications = pgTable("verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'identity', 'background_check', 'skill_test'
  status: verificationStatusEnum("status").default('pending'),
  documents: text("documents").array(), // URLs to uploaded documents
  verifiedBy: varchar("verified_by").references(() => users.id),
  notes: text("notes"),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Photo Verification for Tasks
export const taskVerifications = pgTable("task_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'before', 'progress', 'completion'
  photos: text("photos").array().notNull(),
  description: text("description"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications System
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional context data
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gamification: Achievements System
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  type: achievementTypeEnum("type").notNull(),
  requirements: jsonb("requirements"), // {"tasksCompleted": 10, "rating": 4.5}
  rewards: jsonb("rewards"), // {"points": 100, "badge": "expert"}
  icon: varchar("icon"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: jsonb("progress"), // Current progress towards achievement
});

// Gamification: Points & Levels
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalPoints: varchar("total_points").default("0"),
  level: varchar("level").default("1"),
  tasksPosted: varchar("tasks_posted").default("0"),
  tasksCompleted: varchar("tasks_completed").default("0"),
  totalEarnings: decimal("total_earnings", { precision: 15, scale: 2 }).default("0"),
  totalSpent: decimal("total_spent", { precision: 15, scale: 2 }).default("0"),
  currentStreak: varchar("current_streak").default("0"),
  longestStreak: varchar("longest_streak").default("0"),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("5"),
  responseTime: varchar("response_time").default("0"), // Average response time in minutes
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).default("100"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business Intelligence & Analytics
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  metric: varchar("metric").notNull(), // 'daily_tasks', 'revenue', 'new_users', etc.
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  metadata: jsonb("metadata"), // Additional context like category, location
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews & Ratings (Detailed)
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  title: varchar("title"),
  comment: text("comment"),
  pros: text("pros").array(),
  cons: text("cons").array(),
  categories: jsonb("categories"), // {"communication": 5, "quality": 4, "timeliness": 5}
  isPublic: boolean("is_public").default(true),
  helpful: varchar("helpful").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referral System
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  refereeId: varchar("referee_id").references(() => users.id),
  referralCode: varchar("referral_code").notNull().unique(),
  email: varchar("email"), // If referee hasn't signed up yet
  status: varchar("status").default('pending'), // 'pending', 'completed', 'rewarded'
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  rewardedAt: timestamp("rewarded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Promotional Campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'seasonal', 'category_boost', 'new_user', etc.
  description: text("description"),
  targetAudience: jsonb("target_audience"), // {"isNewUser": true, "categories": ["grocery"]}
  incentive: jsonb("incentive"), // {"discountPercent": 20, "bonusPoints": 100}
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  conversions: varchar("conversions").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Campaign Participation
export const userCampaigns = pgTable("user_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  participatedAt: timestamp("participated_at").defaultNow(),
  rewardClaimed: boolean("reward_claimed").default(false),
  rewardClaimedAt: timestamp("reward_claimed_at"),
});

// Dynamic Pricing
export const pricingRules = pgTable("pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  conditions: jsonb("conditions"), // {"timeOfDay": "peak", "demand": "high", "category": "grocery"}
  adjustmentType: varchar("adjustment_type").notNull(), // 'percentage', 'fixed', 'multiplier'
  adjustmentValue: decimal("adjustment_value", { precision: 5, scale: 2 }).notNull(),
  priority: varchar("priority").default("1"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communication Templates
export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // 'bid_acceptance', 'task_reminder', 'completion'
  subject: varchar("subject"),
  template: text("template").notNull(), // With placeholders like {{customerName}}
  isDefault: boolean("is_default").default(false),
  usageCount: varchar("usage_count").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  customerTasks: many(tasks, { relationName: "customerTasks" }),
  workerTasks: many(tasks, { relationName: "workerTasks" }),
  bids: many(bids),
  customerPayments: many(payments, { relationName: "customerPayments" }),
  workerPayments: many(payments, { relationName: "workerPayments" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  customer: one(users, {
    fields: [tasks.customerId],
    references: [users.id],
    relationName: "customerTasks",
  }),
  worker: one(users, {
    fields: [tasks.workerId],
    references: [users.id],
    relationName: "workerTasks",
  }),
  bids: many(bids),
  payments: many(payments),
  messages: many(messages),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  task: one(tasks, {
    fields: [bids.taskId],
    references: [tasks.id],
  }),
  worker: one(users, {
    fields: [bids.workerId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  task: one(tasks, {
    fields: [payments.taskId],
    references: [tasks.id],
  }),
  customer: one(users, {
    fields: [payments.customerId],
    references: [users.id],
    relationName: "customerPayments",
  }),
  worker: one(users, {
    fields: [payments.workerId],
    references: [users.id],
    relationName: "workerPayments",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  task: one(tasks, {
    fields: [messages.taskId],
    references: [tasks.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  workerId: true,
  finalPrice: true,
  completionPhotos: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskWithRelations = Task & {
  customer: User;
  worker?: User;
  bids: (Bid & { worker: User })[];
};
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Bid = typeof bids.$inferSelect;
export type BidWithWorker = Bid & { worker: User };
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Payment = typeof payments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
