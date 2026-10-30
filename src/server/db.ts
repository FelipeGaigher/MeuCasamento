import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { parseEnv } from "@neon/env";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import neonConfig from "../../neon";

// Prisma sobre node-postgres, como o Neon recomenda na Vercel (Fluid compute):
// um pool por instancia, entregue a attachDatabasePool para as conexoes ociosas
// fecharem antes da funcao ser suspensa. Fora da Vercel o attach nao faz nada.
function createClient() {
  const { postgres } = parseEnv(neonConfig, ["DATABASE_URL"]);
  const pool = new Pool({ connectionString: postgres.databaseUrl });
  attachDatabasePool(pool);
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
