"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, CalendarHeart, Gift, LayoutDashboard, Mail, Palette, Receipt, Users, Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const NAV = [
  { href: "/painel", label: "Visao geral", icon: LayoutDashboard },
  { href: "/painel/evento", label: "Evento", icon: CalendarHeart },
  { href: "/painel/convite", label: "Convite", icon: Mail },
  { href: "/painel/site", label: "Site e tema", icon: Palette },
  { href: "/painel/convidados", label: "Convidados", icon: Users },
  { href: "/painel/presentes", label: "Presentes", icon: Gift },
  { href: "/painel/pedidos", label: "Pedidos", icon: Receipt },
  { href: "/painel/recebimento", label: "Recebimento", icon: Wallet },
  { href: "/painel/notificacoes", label: "Notificacoes", icon: Bell },
];

export function PanelNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/painel" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "t-label flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 transition",
              active ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
