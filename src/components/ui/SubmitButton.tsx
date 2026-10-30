"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./index";

export function SubmitButton({
  children,
  pendingText = "Salvando...",
  variant,
  className,
  disabled,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} variant={variant} className={className}>
      {pending ? pendingText : children}
    </Button>
  );
}
