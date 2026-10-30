import Link from "next/link";
import { db } from "@/server/db";
import { GiftGrid } from "./GiftGrid";
import { CartBar } from "./CartBar";
import { loadPublicGifts } from "./gifts";
import { pub } from "./styles";

const PREVIEW = 6;

// O site publico (src/app/[slug]/page.tsx) da o titulo e a ancora #presentes;
// esta secao entra dentro do container com as variaveis --w-* do tema.
export default async function GiftsSection({ weddingId, slug }: { weddingId: string; slug: string }) {
  const [gifts, total] = await Promise.all([
    loadPublicGifts(weddingId, PREVIEW),
    db.gift.count({ where: { weddingId, active: true } }),
  ]);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <p className={`${pub.muted} mx-auto max-w-xl`}>
          Escolha um presente, pague com Pix e o valor chega direto para o casal.
        </p>
      </div>
      {gifts.length === 0 ? (
        <p className={`${pub.muted} text-center`}>A lista de presentes ainda está sendo montada.</p>
      ) : (
        <>
          <GiftGrid slug={slug} gifts={gifts} />
          {total > PREVIEW && (
            <div className="mt-8 text-center">
              <Link href={`/${slug}/presentes`} className={pub.buttonGhost}>
                Ver todos os {total} presentes
              </Link>
            </div>
          )}
        </>
      )}
      <CartBar slug={slug} />
    </div>
  );
}
