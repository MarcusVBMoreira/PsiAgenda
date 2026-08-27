import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-slate-800 text-white hover:bg-slate-700 shadow-sm hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow dark:bg-red-600 dark:hover:bg-red-500",
};

export default function Button({
  isLoading,
  children,
  disabled,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {isLoading ? "Aguarde..." : children}
    </button>
  );
}
