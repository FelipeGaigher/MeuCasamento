"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, CalendarHeart, Gift, LayoutDashboard, Mail, Palette, Receipt, Users, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string | null; items: NavItem[] };

// Menu do painel em grupos, na ordem em que o casal monta o casamento.
export const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [{ href: "/painel", label: "Visão geral", icon: LayoutDashboard }] },
  {
    label: "Casamento",
    items: [
      { href: "/painel/evento", label: "Evento", icon: CalendarHeart },
      { href: "/painel/convidados", label: "Convidados", icon: Users },
    ],
  },
  {
    label: "Convite e site",
    items: [
      { href: "/painel/convite", label: "Convite", icon: Mail },
      { href: "/painel/site", label: "Site e tema", icon: Palette },
    ],
  },
  {
    label: "Presentes",
    items: [
      { href: "/painel/presentes", label: "Lista", icon: Gift },
      { href: "/painel/pedidos", label: "Pedidos", icon: Receipt },
      { href: "/painel/recebimento", label: "Recebimento", icon: Wallet },
    ],
  },
  { label: "Conta", items: [{ href: "/painel/notificacoes", label: "Notificações", icon: Bell }] },
];

const isActive = (href: string, path: string) => (href === "/painel" ? path === href : path.startsWith(href));

export function PanelNav() {
  const path = usePathname();
  return (
    <nav aria-label="Painel" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:pb-4">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="flex shrink-0 gap-1 lg:mt-3 lg:flex-col lg:gap-0.5 lg:first:mt-2">
          {group.label && <p className="t-group hidden px-3 pb-1 lg:block">{group.label}</p>}
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, path);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "t-action flex min-h-10 shrink-0 items-center gap-3 rounded-xl border-l-[3px] px-3 transition-colors",
                  active ? "border-brand bg-canvas text-ink" : "border-transparent text-muted hover:bg-canvas/70 hover:text-ink",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
