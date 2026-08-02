export const card =
  "rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900";

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder:text-gray-500";

export const labelClass =
  "block text-xs font-medium text-gray-600 dark:text-gray-400";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:pointer-events-none disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700";

export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10";

export const badge = (tone: "gray" | "green" | "amber" | "red" | "violet") => {
  const tones: Record<typeof tone, string> = {
    gray: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
    green: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  };
  return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`;
};
