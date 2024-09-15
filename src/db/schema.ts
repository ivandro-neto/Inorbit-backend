import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const goals = pgTable("goals", {
  id: text('id').primaryKey().$defaultFn(()=> createId()),
  title: text('title').notNull(),
  desiredWeeklyFrequency: integer('desired_weekly_frequency').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const goalCompletions = pgTable("goal_completions", {
  id: text('id').primaryKey().$defaultFn(()=> createId()),
  goalID: text('goal_id').notNull().references(()=> goals.id),
  createdAt: timestamp('created_at', {withTimezone : true}).notNull().defaultNow()
});
