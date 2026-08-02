import { GuestShell } from "@/components/guest-shell";

export default function GuestEventLoading() {
  return (
    <GuestShell>
      <header className="shrink-0 px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-6 text-center">
        <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
        <div className="mx-auto mt-3 h-8 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
      </header>

      <main className="flex flex-1 flex-col justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md animate-pulse rounded-3xl bg-white/90 p-5 shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <div className="h-12 rounded-2xl bg-gray-100 dark:bg-neutral-800" />
          <div className="mt-3 h-12 rounded-2xl bg-gray-100 dark:bg-neutral-800" />
        </div>
      </main>
    </GuestShell>
  );
}
