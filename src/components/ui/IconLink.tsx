import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export default function IconLink({
  href,
  icon: Icon,
  label,
  variant = "neutral",
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  variant?: "neutral" | "primary";
}) {
  const variantClasses =
    variant === "primary"
      ? "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200";

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 ${variantClasses}`}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </Link>
  );
}
