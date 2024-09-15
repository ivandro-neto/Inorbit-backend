import dayjs from "dayjs";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { GoalCompletionCounts } from "./get-week-pending-goals";
import { eq, sql } from "drizzle-orm";

interface ICreateGoalCompletionRequest {
  goalId: string;
}

export async function createGoalCompletions({
  goalId,
}: ICreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalsCompletionsCounts = GoalCompletionCounts({
    firstDayOfWeek,
    lastDayOfWeek,
    goalId,
  });

  const result = await db
    .with(goalsCompletionsCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
    COALESCE(${goalsCompletionsCounts.completionCount}, 0)
    `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalsCompletionsCounts, eq(goalsCompletionsCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1);

  const { completionCount, desiredWeeklyFrequency } = result[0];

  
  if (completionCount >= desiredWeeklyFrequency)
    throw new Error("This task already was completed on this week!");

  const insertResult = await db
    .insert(goalCompletions)
    .values({
      goalID: goalId,
    })
    .returning();

  return insertResult[0];
}
