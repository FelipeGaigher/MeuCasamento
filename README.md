# Meu Casamento

Convite, site, confirmacao de presenca e lista de presentes do casamento, num lugar so.

## Rodar local
```bash
cp .env.example .env          # preencha AUTH_SECRET e GUEST_LINK_SECRET
docker compose up -d db       # ou um Postgres seu
npm install
npx prisma migrate deploy
npm run db:seed               # casamento de demonstracao
npm run dev
```
Login de demonstracao: `demo@meucasamento.app` / `demo12345`.

Sem `ASAAS_API_KEY`, o checkout roda em modo demonstracao: o pedido mostra um botao "Simular pagamento".

Regras do projeto em `AGENTS.md`; decisoes em `docs/decisoes.md`.
