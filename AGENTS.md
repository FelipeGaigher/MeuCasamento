# AGENTS.md: MeuCasamento

Plataforma de casamento: o casal conta a historia, escolhe o estilo e sai com convite, site, confirmacao de presenca e lista de presentes ligados. Plano de produto: documento "Plano de acao: plataforma de casamento" (Claude Docs). Decisoes em `docs/decisoes.md`.

## Stack
Next.js 16 (App Router, server actions) + React 19 + Tailwind 4 + Prisma 6 (Postgres) + Zod. Auth propria com JWT (jose) em cookie httpOnly. Integracoes: Asaas (pagamento e split), Evolution (WhatsApp para o casal), Brevo (e-mail).

## Regras
- O casamento (`Wedding`) e o tenant. Toda tabela de negocio tem `weddingId`; excecoes ficam na allowlist de `tests/tenancy.test.ts`.
- No painel, o casamento vem sempre de `requireWedding()`. Nunca use um `weddingId` vindo de formulario ou URL. Rota publica resolve o casamento pelo slug e confere que todo id recebido pertence a ele.
- Data, horario e local so existem na tabela `Event`. Convite, site e lembretes leem de la; nunca escreva data ou local em texto fixo.
- Texto do convite e do site e texto de verdade. A arte (ornamentos, papel, fitas) nunca carrega texto.
- Valores sempre em centavos. Taxa e split so por `computeSplit` (`src/lib/split.ts`).
- Nunca guardar segredo, chave de API ou dado de cartao em tabela, log ou arquivo. A chave da subconta Asaas do casal e descartada; guardamos so `walletId`.
- `Notification` nunca guarda telefone, e-mail ou texto da mensagem. Logs so com ids.
- Dado pessoal real nunca entra no repositorio, nos testes nem no seed.
- Fonte do sistema: Poppins, peso maximo 600. Texto do painel usa papel, nunca tamanho: `t-page`, `t-section`, `t-item`, `t-action`, `t-body`, `t-label`, `t-meta`, `t-group`, `t-chip`, `t-value`, `t-result` (definidos em `src/app/globals.css`, escala da Nautica). Formulario usa `FORM_GRID` e `Field`.
- Cantos: cartao `rounded-2xl` com `shadow-card`, controle `rounded-lg`, item interno `rounded-xl`, chip `rounded-full`. Conteudo do painel ocupa a largura toda (sem `mx-auto`).
- Texto editavel do site e do convite leva `cmsAttrs(...)` (`data-cms-path`). O mesmo caminho serve a previa do painel (`/previa/*`, campo com `data-cms-field`) e a edicao direto na pagina (tecla E). Caminho novo entra em `src/lib/cms.ts` (`maxLengthFor`) e em `saveInlineCopy`.
- Todo texto de interface em portugues do Brasil, com acentos.

## Git
Mesmo fluxo da Flovi e do nautical-platform.
- `main` e producao. `develop` integra. Ninguem commita direto em nenhuma das duas.
- Trabalho nasce em `feat/<escopo>`, `fix/<escopo>` ou `chore/<escopo>`, saindo de `develop`.
- Prefixos por area: `feat/convite-*`, `feat/site-*`, `feat/presentes-*`, `feat/convidados-*`, `feat/pagamento-*`, `feat/painel-*`, `feat/infra-*`.
- Branch fecha em ate 2 dias.

## Comandos
- `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`
- Schema: altere `prisma/schema.prisma` e gere migracao com `npx prisma migrate dev --name <nome>`; producao roda `prisma migrate deploy` (Dockerfile). `npm run db:seed` so no banco local.
