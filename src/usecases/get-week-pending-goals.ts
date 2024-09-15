import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { count } from "drizzle-orm";


export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalsCreatedUpToWeek = GoalsCreatedUpToWeek(lastDayOfWeek);

  const goalCompletionCounts = GoalCompletionCounts({
    firstDayOfWeek,
    lastDayOfWeek,
  });

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount: sql`
      COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number)
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id));

  return {
    pendingGoals,
  };
}

export function GoalsCreatedUpToWeek(lastDayOfWeek: Date) {
  return db.$with("golas_created_up_to_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek)),
  );
}

export function GoalCompletionCounts({
  firstDayOfWeek,
  lastDayOfWeek,
  goalId,
}: {
  firstDayOfWeek: Date;
  lastDayOfWeek: Date;
  goalId?: string;
}) {
  return goalId? db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalCompletions.goalID,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalID, goalId) ,
        ),
      )
      .groupBy(goalCompletions.goalID),
  ): db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalCompletions.goalID,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
        ),
      )
      .groupBy(goalCompletions.goalID),
  )
}
