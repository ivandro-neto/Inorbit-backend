import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../../usecases/get-week-pending-goals';

export const getPendingGoalsRoute : FastifyPluginAsyncZod = async (app) => {

  app.get("/get-pending-goals",
    async () => {
    const { pendingGoals } = await getWeekPendingGoals();
    return pendingGoals;
  });
  
}