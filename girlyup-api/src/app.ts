import Fastify from "fastify";
import cors from "@fastify/cors";
import { jwtPlugin } from "./plugins/jwt.plugin.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";

export async function buildApp() {
  const fastify = Fastify({ logger: true });
  await fastify.register(helmet, { contentSecurityPolicy: false });
  await fastify.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      error: "Trop de tentatives, réessaie dans 1 minute",
    }),
  });
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // await fastify.register(cors, {
  // origin: process.env.NODE_ENV === 'production'
  // ? ['https://girlyup.app', 'https://www.girlyup.app']
  // : true,
  // credentials: true,
  // })

  await fastify.register(jwtPlugin);
  await fastify.register(authRoutes, { prefix: "/api/v1" });

  fastify.get("/health", async () => ({ status: "ok", timestamp: new Date() }));

  return fastify;
}
