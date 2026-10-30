// Dados de demonstracao (nomes ficticios). So para o banco local:
//   npm run db:seed
// Recria o casamento demo a cada execucao.
import { PrismaClient, type Gift } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createWedding } from "../src/server/wedding";
import { computeSplit } from "../src/lib/split";

const db = new PrismaClient();
const EMAIL = "demo@meucasamento.app";
const SLUG = "ana-e-pedro";

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Seed bloqueado em producao.");

  const old = await db.user.findUnique({ where: { email: EMAIL } });
  if (old) {
    await db.wedding.deleteMany({ where: { members: { some: { userId: old.id } } } });
    await db.user.delete({ where: { id: old.id } });
  }
  await db.wedding.deleteMany({ where: { slug: SLUG } });

  const user = await db.user.create({
    data: { email: EMAIL, name: "Ana Demo", passwordHash: await bcrypt.hash("demo12345", 10) },
  });
  const wedding = await db.$transaction((tx) =>
    createWedding(tx, {
      userId: user.id,
      coupleNames: "Ana & Pedro",
      slug: SLUG,
      date: new Date("2027-03-20T16:30:00-03:00"),
      venueName: "Igreja Nossa Senhora da Penha",
      address: "Rua das Flores, 100, Vila Velha, ES",
      collectionKey: "cereja",
    }),
  );
  const w = wedding.id;

  await db.wedding.update({ where: { id: w }, data: { status: "PUBLISHED" } });
  await db.event.create({
    data: {
      weddingId: w,
      kind: "RECEPCAO",
      title: "Recepção",
      startsAt: new Date("2027-03-20T19:00:00-03:00"),
      venueName: "Espaço Jardim do Mar",
      address: "Avenida Beira-Mar, 2000, Vila Velha, ES",
      dressCode: "Esporte fino",
      order: 1,
    },
  });
  await db.siteSettings.update({
    where: { weddingId: w },
    data: { story: "A gente se conheceu numa aula de dança em 2019. Desde então, cada passo foi juntos." },
  });
  await db.payoutAccount.update({ where: { weddingId: w }, data: { status: "ATIVA", walletId: "demo-wallet" } });

  const guests: [string, string | null, number, "CONFIRMADO" | "RECUSADO" | null, number, number][] = [
    ["Mariana Costa", "Família da noiva", 1, "CONFIRMADO", 2, 0],
    ["Rafael Souza", "Família da noiva", 2, "CONFIRMADO", 2, 1],
    ["Helena Martins", "Família do noivo", 0, "CONFIRMADO", 1, 0],
    ["João Pereira", "Família do noivo", 3, "CONFIRMADO", 2, 2],
    ["Beatriz Lima", "Amigos", 1, "RECUSADO", 0, 0],
    ["Lucas Almeida", "Amigos", 1, null, 0, 0],
    ["Camila Rocha", "Amigos", 0, null, 0, 0],
    ["Thiago Ribeiro", "Trabalho", 1, "CONFIRMADO", 1, 0],
    ["Fernanda Gomes", "Trabalho", 0, null, 0, 0],
    ["Gabriela Nunes", "Amigos", 1, "RECUSADO", 0, 0],
    ["Eduardo Barros", "Família do noivo", 2, null, 0, 0],
    ["Larissa Teixeira", "Família da noiva", 0, "CONFIRMADO", 1, 0],
  ];
  for (const [name, group, maxCompanions, status, adults, children] of guests) {
    const g = await db.guest.create({ data: { weddingId: w, name, group, maxCompanions } });
    if (status) {
      await db.rsvp.create({
        data: { weddingId: w, guestId: g.id, status, adults, children, respondedAt: new Date() },
      });
    }
  }

  const giftData: [string, number, "COTA" | "PRODUTO", number | null, string | null][] = [
    ["Jantar romântico", 35000, "COTA", null, null],
    ["Lua de mel: passeio de barco", 50000, "COTA", 4, null],
    ["Cafeteira", 40000, "PRODUTO", 1, "https://www.example.com/cafeteira"],
    ["Jogo de panelas", 60000, "PRODUTO", 1, null],
    ["Roupa de cama", 30000, "COTA", 2, null],
    ["Cota da lua de mel", 20000, "COTA", null, null],
    ["Taças de vinho", 18000, "PRODUTO", 2, null],
    ["Planta para a varanda", 12000, "COTA", null, null],
  ];
  const gifts: Gift[] = [];
  for (const [i, [title, priceCents, kind, quantity, storeUrl]] of giftData.entries()) {
    gifts.push(await db.gift.create({ data: { weddingId: w, title, priceCents, kind, quantity, storeUrl, order: i } }));
  }

  const cfg = { feeBps: 350, minFeeCents: 300 };
  const orders: [string, number[], "PAGO" | "PENDENTE", string | null][] = [
    ["Mariana Costa", [0], "PAGO", "Que essa noite seja inesquecível! Amamos vocês."],
    ["Rafael Souza", [1, 7], "PAGO", "Aproveitem cada minuto da viagem."],
    ["Helena Martins", [5], "PAGO", null],
    ["Thiago Ribeiro", [2], "PENDENTE", null],
  ];
  for (const [n, [buyerName, idx, status, message]] of orders.entries()) {
    const items = idx.map((i) => gifts[i]);
    const split = computeSplit(items.reduce((s, g) => s + g.priceCents, 0), cfg);
    await db.order.create({
      data: {
        weddingId: w,
        number: n + 1,
        buyerName,
        buyerEmail: `${buyerName.split(" ")[0].toLowerCase()}@example.com`,
        message,
        ...split,
        status,
        paidAt: status === "PAGO" ? new Date() : null,
        items: { create: items.map((g) => ({ weddingId: w, giftId: g.id, title: g.title, unitCents: g.priceCents })) },
      },
    });
  }

  console.log(`Demo pronto: /${SLUG} · login ${EMAIL} / demo12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
