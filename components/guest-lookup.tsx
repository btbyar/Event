"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import type { ApiErrorCode, Dictionary } from "@/lib/i18n/dictionaries";

type Match = { id: string; fullName: string; phoneHint: string | null };

type ResultData = {
  guest: {
    fullName: string;
    status: string;
    checkedInAt: string | null;
    tableLabel: string | null;
    seatNumber: number | null;
    alreadyCheckedIn: boolean;
  };
  event: {
    name: string;
    description: string | null;
    location: string | null;
    startsAt: string;
  };
};

class ApiError extends Error {
  code?: ApiErrorCode;
  constructor(message: string, code?: ApiErrorCode) {
    super(message);
    this.code = code;
  }
}

async function postJson(url: string, body: unknown, t: Dictionary) {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(t.apiErrors.networkError, "networkError");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? t.apiErrors.unknownError, data?.code);
  return data;
}

function errorMessage(err: unknown, t: Dictionary): string {
  if (err instanceof ApiError) return err.code ? t.apiErrors[err.code] : err.message;
  return t.apiErrors.unknownError;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function GuestLookup({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);

  function flashError(message: string) {
    setError(message);
    setErrorKey((k) => k + 1);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await postJson("/api/guests/lookup", { eventId, query }, t);

      if (data.matches.length === 0) {
        flashError(t.guestFlow.noMatchFound);
        setMatches(null);
      } else if (data.matches.length === 1) {
        await checkIn(data.matches[0].id);
      } else {
        setMatches(data.matches);
      }
    } catch (err) {
      flashError(errorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }

  async function checkIn(guestId: string) {
    setError(null);
    setCheckingIn(true);
    try {
      const data = await postJson("/api/guests/checkin", { guestId }, t);
      setResult(data);
      setMatches(null);
    } catch (err) {
      flashError(errorMessage(err, t));
    } finally {
      setCheckingIn(false);
    }
  }

  const statusMessage = result
    ? t.guestFlow.checkedInStatus(
        result.guest.tableLabel ?? t.guestsPage.unassigned,
        result.guest.seatNumber != null ? String(result.guest.seatNumber) : t.guestsPage.unassigned,
      )
    : checkingIn
      ? t.guestFlow.checkingIn
      : matches
        ? t.guestFlow.matchedCount(matches.length)
        : error
          ? error
          : "";

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
      {result ? (
        <ResultCard data={result} t={t} locale={locale} eventId={eventId} />
      ) : checkingIn ? (
        <div className="animate-fade-in rounded-3xl bg-white/90 p-10 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <Spinner className="mx-auto h-8 w-8 text-violet-500 dark:text-violet-400" />
          <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">
            {t.guestFlow.checkingIn}
          </p>
        </div>
      ) : matches ? (
        <div key="matches" className="animate-slide-up space-y-3">
          <p className="px-1 text-sm text-gray-600 dark:text-neutral-300">
            {t.guestFlow.tapYourName}
          </p>
          <div className="space-y-2">
            {matches.map((m, i) => (
              <button
                key={m.id}
                onClick={() => checkIn(m.id)}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-slide-up flex w-full items-center gap-3 rounded-2xl bg-white/90 p-3.5 text-left shadow-md shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl active:scale-[0.98] active:bg-gray-50 dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10 dark:active:bg-neutral-800"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white">
                  {initials(m.fullName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium text-gray-900 dark:text-neutral-50">
                    {m.fullName}
                  </span>
                  {m.phoneHint && (
                    <span className="text-xs text-gray-400 dark:text-neutral-500">
                      {t.guestFlow.endsIn(m.phoneHint.replace(/[•]/g, ""))}
                    </span>
                  )}
                </span>
                <ChevronIcon className="h-5 w-5 shrink-0 text-gray-300 dark:text-neutral-600" />
              </button>
            ))}
          </div>
          {error && <ErrorBanner key={errorKey} message={error} />}
          <button
            onClick={() => setMatches(null)}
            className="w-full rounded-xl py-3 text-center text-sm font-medium text-violet-600 active:bg-violet-50 dark:text-violet-400 dark:active:bg-violet-950/30"
          >
            {t.guestFlow.notYouSearchAgain}
          </button>
        </div>
      ) : (
        <div
          key="search"
          className="animate-fade-in rounded-3xl bg-white/90 p-5 shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10"
        >
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label htmlFor="guest-query" className="sr-only">
                {t.guestFlow.searchLabel}
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-300 dark:text-neutral-600" />
                <input
                  id="guest-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.guestFlow.searchPlaceholder}
                  required
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  inputMode="text"
                  enterKeyHint="search"
                  className="w-full rounded-2xl border border-gray-200 py-3.5 pr-11 pl-11 text-base text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-600 dark:focus:border-violet-400 dark:focus:ring-violet-400/20"
                />
                {query && (
                  <button
                    type="button"
                    aria-label={t.guestFlow.clearSearch}
                    onClick={() => setQuery("")}
                    className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 active:bg-gray-100 dark:text-neutral-500 dark:active:bg-neutral-800"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {error && <ErrorBanner key={errorKey} message={error} />}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-violet-600/25 active:opacity-90 disabled:opacity-60 dark:shadow-none"
            >
              {loading && <Spinner className="h-4 w-4" />}
              {loading ? t.guestFlow.searching : t.guestFlow.findSeat}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="animate-shake rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
    >
      {message}
    </p>
  );
}

function ResultCard({
  data,
  t,
  locale,
  eventId,
}: {
  data: ResultData;
  t: Dictionary;
  locale: "en" | "mn";
  eventId: string;
}) {
  const { guest, event } = data;
  const isLate = guest.status === "LATE";

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(isLate ? [40, 60, 40] : 40);
    }
  }, [isLate]);

  return (
    <div className="animate-slide-up space-y-4 rounded-3xl bg-white/90 p-6 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
      <div
        className={`animate-pop-in mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          isLate
            ? "bg-amber-100 shadow-lg shadow-amber-500/20 dark:bg-amber-900/40 dark:shadow-none"
            : "bg-green-100 shadow-lg shadow-green-500/20 dark:bg-green-900/40 dark:shadow-none"
        }`}
      >
        <CheckIcon
          className={`h-8 w-8 ${isLate ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}
        />
      </div>

      <div>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {guest.alreadyCheckedIn ? t.guestFlow.welcomeBack : t.guestFlow.welcome}
        </p>
        <h2 className="truncate font-display text-3xl text-gray-900 dark:text-neutral-50">
          {guest.fullName}!
        </h2>
        <p
          className={`mt-1 text-xs font-medium ${isLate ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}
        >
          {guest.alreadyCheckedIn
            ? t.guestFlow.alreadyCheckedInSub
            : isLate
              ? t.guestFlow.lateSub
              : t.guestFlow.onTimeSub}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-2xl bg-linear-to-br from-violet-50 to-indigo-50 p-4 dark:from-neutral-800 dark:to-neutral-800">
          <p className="flex items-center justify-center gap-1 text-xs text-violet-500 uppercase dark:text-violet-400">
            <TableIcon className="h-3.5 w-3.5" />
            {t.guestFlow.table}
          </p>
          <p className="truncate text-2xl font-semibold text-gray-900 dark:text-neutral-50">
            {guest.tableLabel ?? t.guestFlow.unassignedShort}
          </p>
        </div>
        <div className="min-w-0 rounded-2xl bg-linear-to-br from-violet-50 to-indigo-50 p-4 dark:from-neutral-800 dark:to-neutral-800">
          <p className="flex items-center justify-center gap-1 text-xs text-violet-500 uppercase dark:text-violet-400">
            <SeatIcon className="h-3.5 w-3.5" />
            {t.guestFlow.seat}
          </p>
          <p className="truncate text-2xl font-semibold text-gray-900 dark:text-neutral-50">
            {guest.seatNumber ?? t.guestFlow.unassignedShort}
          </p>
        </div>
      </div>

      <div className="space-y-1 border-t border-gray-100 pt-4 text-left text-sm text-gray-600 dark:border-neutral-800 dark:text-neutral-300">
        <p className="truncate font-medium text-gray-900 dark:text-neutral-50">{event.name}</p>
        <p className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4 shrink-0 text-gray-400 dark:text-neutral-500" />
          {new Date(event.startsAt).toLocaleString(locale === "mn" ? "mn-MN" : "en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        {event.location && (
          <p className="flex items-center gap-1.5">
            <PinIcon className="h-4 w-4 shrink-0 text-gray-400 dark:text-neutral-500" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
        {event.description && (
          <p className="pt-1 text-gray-500 dark:text-neutral-400">{event.description}</p>
        )}
      </div>

      <Link
        href={`/e/${eventId}/photos`}
        className="block w-full rounded-2xl border border-violet-200 py-3 text-center text-sm font-medium text-violet-600 active:bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:active:bg-violet-950/30"
      >
        {t.guestFlow.viewMyPhotos}
      </Link>
    </div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TableIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="7" rx="8" ry="3" />
      <path d="M4 7v6c0 1.66 3.58 3 8 3s8-1.34 8-3V7" strokeLinecap="round" />
      <path d="M4 13v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" strokeLinecap="round" />
    </svg>
  );
}

function SeatIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 15v3M18 15v3" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
