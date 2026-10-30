# Decisoes

## 2026-10-30: texto fora da arte
O convite de referencia foi feito com imagens geradas por IA no Canva. O texto vinha dentro da imagem: a IA cortou e reescreveu paragrafos, o link da lista sumia no computador, a pagina se chamava "Continue rolando" na previa do WhatsApp e o local do convite nao batia com o da lista. Decisao: a arte nunca carrega texto. Ornamentos sao SVG/CSS por colecao; textos sao campos editaveis; data, horario e local vem da tabela `Event`.

## 2026-10-30: dinheiro do presente via split
A cobranca sai da conta Asaas da plataforma com split de valor fixo para a subconta do casal (`walletId`). O Asaas calcula o split sobre o liquido, entao a plataforma absorve a tarifa dele: margem = taxa - tarifa. Taxa de partida 3,5% com minimo de R$ 3 (`PLATFORM_FEE_BPS`, `PLATFORM_MIN_FEE_CENTS`), para o valor do casal nunca passar do liquido. Fase 1 so com Pix; cartao entra na Fase 2, tokenizado e com tarifa paga pelo convidado.

## 2026-10-30: base a partir dos projetos existentes
Padroes reaproveitados: adaptador Asaas e webhook idempotente (Checkout, Margot), Evolution e Brevo (Margot, Flovi), link de convidado assinado por HMAC e regra de tenant com teste (nautical-platform), conteudo + estilo intercambiavel (carrossel da Flovi). Nenhum repositorio foi copiado inteiro.

## Pendente
- RLS no Postgres (hoje o isolamento e na aplicacao, coberto por teste de schema).
- Geracao de arte por IA e importacao de presente por link (Fase 2).
- Ofertas de afiliados na lista de presentes (Fase 2).
