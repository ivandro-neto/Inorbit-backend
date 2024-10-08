import fastify from "fastify";
import { env } from "../env";
import { getPendingGoalsRoute } from "./routes/get-pending-goals";
import { createCompletionsRoute } from "./routes/create-completions";
import { createGoalsRoute } from "./routes/create-goals";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { getWeekSummaryRoute } from "./routes/get-week-summary";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: ["https://inorbit-eta.vercel.app", "https://inorbit-q425oflwo-ivandro-netos-projects.vercel.app", "https://inorbit-git-main-ivandro-netos-projects.vercel.app"],
});
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(getPendingGoalsRoute);
app.register(createCompletionsRoute);
app.register(createGoalsRoute);
app.register(getWeekSummaryRoute);

const Run = async () => {
  try {
    const host = "0.0.0.0";
    const listening = await app.listen({
      port: Number(env.PORT) || 3333,
      host: host,
    });
    if (listening)
      return console.log(`Server running at http://${host}:${env.PORT}`);
  } catch (error) {
    return console.error(error);
  }
};

Run();
