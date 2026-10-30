import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { getSession } from "./session";

// Painel: devolve o usuario logado e o casamento dele. Toda consulta do painel
// filtra por wedding.id; nunca use um weddingId vindo do formulario.
export async function requireWedding() {
  const session = await getSession();
  if (!session) redirect("/entrar");
  const member = await db.weddingMember.findFirst({
    where: { userId: session.sub },
    include: { wedding: true, user: true },
    orderBy: { id: "asc" },
  });
  if (!member) redirect("/criar");
  return { user: member.user, wedding: member.wedding, role: member.role };
}
