import Link from "next/link";

export type ProfileTab = "dados-gerais" | "historico-medico" | "sessoes" | "documentos";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "dados-gerais", label: "Dados gerais" },
  { key: "historico-medico", label: "Historico medico" },
  { key: "sessoes", label: "Linha do tempo de sessoes" },
  { key: "documentos", label: "Documentos" },
];

export default function ProfileTabs({ patientId, active }: { patientId: string; active: ProfileTab }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/pacientes/${patientId}/visualizar?tab=${tab.key}`}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
            active === tab.key
              ? "border-slate-800 text-slate-900 dark:border-slate-100 dark:text-slate-50"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
