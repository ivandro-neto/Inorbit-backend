import {z} from 'zod'
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createGoal } from '../../usecases/create-goal';

export const createGoalsRoute : FastifyPluginAsyncZod = async (app) =>{
  app.post("/goals",{
    schema:{
      body:z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7)
      }),
    }
  }, async (req) => {
    const {title, desiredWeeklyFrequency} = req.body;
    await createGoal({
      title: title,
      desiredWeeklyFrequency: desiredWeeklyFrequency,
    });
  });
}