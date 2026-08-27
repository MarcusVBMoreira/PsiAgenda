export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="animate-scale-in w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-6 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">
          PsiAgenda
        </h1>
        {children}
      </div>
    </div>
  );
}
