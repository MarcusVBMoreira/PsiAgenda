import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/ui/LogoutButton";
import DashboardNav from "@/components/layout/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link
            href="/dashboard"
            className="shrink-0 text-lg font-semibold text-slate-900 transition-opacity hover:opacity-80 dark:text-slate-50"
          >
            PsiAgenda
          </Link>
          <DashboardNav />
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
          <span className="hidden max-w-[10rem] truncate sm:inline">{user.fullName}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
