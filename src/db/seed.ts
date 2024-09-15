import { client, db } from "./index";
import { goalCompletions, goals } from "./schema";
import dayjs from "dayjs";

async function seed() {
  await db.delete(goalCompletions);
  await db.delete(goals);

  const result = await db
    .insert(goals)
    .values([
        {title : "Acordar cedo", desiredWeeklyFrequency: 6},
        {title : "Fazer networking", desiredWeeklyFrequency: 3},
        {title : "Participar de reuniões", desiredWeeklyFrequency: 5},
        {title : "Exercitar", desiredWeeklyFrequency: 4},
        {title : "Estudar finanças", desiredWeeklyFrequency: 2},
        {title : "Ler relatórios", desiredWeeklyFrequency: 6},
        {title : "Planejar a semana", desiredWeeklyFrequency: 1},
        {title : "Meditar", desiredWeeklyFrequency: 4},
        {title : "Delegar tarefas", desiredWeeklyFrequency: 5},
        {title : "Revisar metas", desiredWeeklyFrequency: 2}
    ])
    .returning();

  const startOfWeek = dayjs().startOf("week");
    
  await db.insert(goalCompletions).values([
    { goalID: result[0].id, createdAt: startOfWeek.toDate() },
    { goalID: result[1].id, createdAt: startOfWeek.add(-2, "day").toDate() },
  ]);
}

seed().finally(() => client.end());
