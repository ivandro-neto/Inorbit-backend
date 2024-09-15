import {z} from 'zod'
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createGoalCompletions } from '../../usecases/create-completions';

export const createCompletionsRoute : FastifyPluginAsyncZod = async (app) =>{
  app.post("/completions",{
    schema:{
      body: z.object({
        goalId: z.string()      
      })
    }
  }, async (req) => {
    const { goalId } = req.body;
    await createGoalCompletions({ goalId });
  });
}