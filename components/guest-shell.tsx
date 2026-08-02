export function GuestShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-neutral-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-700/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-800/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-800/15"
      />
      <div className="relative z-10 flex min-h-dvh flex-1 flex-col">{children}</div>
    </div>
  );
}
