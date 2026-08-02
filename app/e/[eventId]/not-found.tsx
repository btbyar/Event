import { GuestShell } from "@/components/guest-shell";
import { getDictionary } from "@/lib/i18n/server";

export default async function GuestEventNotFound() {
  const { t } = await getDictionary();

  return (
    <GuestShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
            <svg
              className="h-7 w-7 text-gray-400 dark:text-neutral-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M9.17 9.17a4 4 0 1 1 5.66 5.66M12 3a9 9 0 1 0 9 9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M3 3l18 18" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-neutral-50">
            {t.notFoundPage.title}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-neutral-400">
            {t.notFoundPage.message}
          </p>
        </div>
      </div>
    </GuestShell>
  );
}
