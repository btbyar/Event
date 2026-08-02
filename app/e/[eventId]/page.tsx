import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GuestLookup } from "@/components/guest-lookup";
import { GuestShell } from "@/components/guest-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/server";

export default async function GuestEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { t } = await getDictionary();
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, startsAt: true, location: true },
  });
  if (!event) notFound();

  return (
    <GuestShell>
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10">
        <LanguageSwitcher />
      </div>
      <header className="shrink-0 px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-6 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-violet-500 uppercase dark:text-violet-400">
          {t.guestFlow.invitedTo}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-balance text-gray-900 dark:text-neutral-50">
          {event.name}
        </h1>
        {event.location && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-neutral-400">{event.location}</p>
        )}
      </header>

      <main className="flex flex-1 flex-col justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md">
          <GuestLookup eventId={event.id} />
        </div>
      </main>
    </GuestShell>
  );
}
