import dayjs from "dayjs";
import { GoalsCreatedUpToWeek } from "./get-week-pending-goals";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

type GoalsPerDay = Record<
  string,
  {
    id: string;
    title: string;
    createdAt: string;
  }[]
>;

export const getWeekSummary = async () => {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();
  const goalsCreatedUpToWeek = GoalsCreatedUpToWeek(lastDayOfWeek);
  const goalsCompletedInWeek = GoalsCompletedInWeek({
    firstDayOfWeek,
    lastDayOfWeek,
  });
  const goalsCompletedByWeekDay = db.$with("goals_completed_by_week_day").as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql/*sql*/ `
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', ${goalsCompletedInWeek.id},
          'title', ${goalsCompletedInWeek.title},
          'completedAt', ${goalsCompletedInWeek.completedAt}
        )
      )
    `.as("completions"),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate)),
  );

  const result = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql/*sql*/ `
          (SELECT COUNT(*) FROM ${goalsCompletedInWeek})
        `.mapWith(Number),
      total: sql/*sql*/ `
          (SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})
        `.mapWith(Number),
      goalsPerDay: sql/*sql*/ <GoalsPerDay>`
          JSON_OBJECT_AGG(
            ${goalsCompletedByWeekDay.completedAtDate},
            ${goalsCompletedByWeekDay.completions}
          )
        `.as("goalsPerDay"),
    })
    .from(goalsCompletedByWeekDay);

  return { summary: result[0] };
};

export function GoalsCompletedInWeek({
  firstDayOfWeek,
  lastDayOfWeek,
}: {
  firstDayOfWeek: Date;
  lastDayOfWeek: Date;
}) {
  return db.$with("goals_completed_in_week").as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql/*sql */ `
        DATE(${goalCompletions.createdAt})
        `.as("completedAtDate"),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalID))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
        ),
      )
      .orderBy(desc(goalCompletions.createdAt)),
  );
}

