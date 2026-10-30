import { RsvpFinder } from "./RsvpFinder";
import { pub } from "./styles";

// O site publico (src/app/[slug]/page.tsx) da o titulo e a ancora #confirmar;
// esta secao entra dentro do container com as variaveis --w-* do tema.
export default async function RsvpSection({ weddingId, slug }: { weddingId: string; slug: string }) {
  void weddingId;
  return (
    <div className="mx-auto max-w-xl">
      <div className={`${pub.paper} p-6 sm:p-10`}>
        <div className="mb-6 text-center">
          <p className={pub.muted}>Sua resposta nos ajuda a preparar tudo com carinho.</p>
        </div>
        <RsvpFinder slug={slug} />
      </div>
    </div>
  );
}
