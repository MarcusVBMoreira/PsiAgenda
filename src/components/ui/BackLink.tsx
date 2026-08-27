import Link from "next/link";

export default function BackLink({ href, label = "Voltar" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1 text-sm font-medium text-slate-500 transition-all duration-150 hover:-translate-x-0.5 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
