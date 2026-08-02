"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarCheck2, Lock, Mail } from "lucide-react";
import { inputClass, labelClass, btnPrimary } from "@/lib/ui";
import { useI18n } from "@/components/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t.login.invalidCredentials);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 dark:bg-neutral-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-700/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-800/15"
      />

      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-5 rounded-2xl border border-gray-200/80 bg-white/90 p-7 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-600/30">
            <CalendarCheck2 className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <h1 className="mt-3 font-display text-2xl font-medium text-gray-900 dark:text-gray-100">
            {t.login.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.login.subtitle}</p>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 flex-none" strokeWidth={2} />
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className={labelClass}>
            {t.login.email}
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              strokeWidth={2}
            />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className={labelClass}>
            {t.login.password}
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              strokeWidth={2}
            />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full ${btnPrimary}`}>
          {loading ? t.login.signingIn : t.login.signIn}
        </button>
      </form>
    </div>
  );
}
