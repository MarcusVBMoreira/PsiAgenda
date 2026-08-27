import PatientForm from "@/components/pacientes/PatientForm";
import BackLink from "@/components/ui/BackLink";

export default function NovoPacientePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 animate-fade-in-up">
        <BackLink href="/pacientes" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Novo paciente</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Preencha os dados abaixo para adicionar um novo paciente ao seu consultorio.
          </p>
        </div>
      </div>
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <PatientForm />
      </div>
    </div>
  );
}
