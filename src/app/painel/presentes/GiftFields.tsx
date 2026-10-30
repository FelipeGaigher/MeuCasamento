import type { Gift } from "@prisma/client";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui";

const priceText = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

export function GiftFields({ gift }: { gift?: Gift }) {
  return (
    <>
      <Field label="Nome do presente" wide>
        <Input name="title" required defaultValue={gift?.title} placeholder="Ex.: Jantar romântico" />
      </Field>
      <Field label="Valor (R$)">
        <Input name="price" required inputMode="decimal" defaultValue={gift ? priceText(gift.priceCents) : ""} placeholder="250,00" />
      </Field>
      <Field label="Tipo" hint="Cota: o convidado paga e o valor vai para vocês. Produto: pode ter link da loja.">
        <Select name="kind" defaultValue={gift?.kind ?? "COTA"}>
          <option value="COTA">Cota em dinheiro</option>
          <option value="PRODUTO">Produto</option>
        </Select>
      </Field>
      <Field label="Descrição" wide>
        <Textarea name="description" rows={2} defaultValue={gift?.description ?? ""} />
      </Field>
      <Field label="Foto (link da imagem)">
        <Input name="imageUrl" type="url" defaultValue={gift?.imageUrl ?? ""} placeholder="https://" />
      </Field>
      <Field label="Link da loja (opcional)">
        <Input name="storeUrl" type="url" defaultValue={gift?.storeUrl ?? ""} placeholder="https://" />
      </Field>
      <Field label="Quantidade" hint="Deixe vazio para sem limite">
        <Input name="quantity" type="number" min={1} max={999} defaultValue={gift?.quantity ?? ""} />
      </Field>
      <Field label="Ordem na lista">
        <Input name="order" type="number" min={0} defaultValue={gift?.order ?? 0} />
      </Field>
      <div className="sm:col-span-2">
        <Checkbox name="active" label="Aparece no site" defaultChecked={gift?.active ?? true} />
      </div>
    </>
  );
}
