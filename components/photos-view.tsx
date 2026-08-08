"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { PhotoMatch } from "@/components/photo-match";
import { PhotoGallery } from "@/components/photo-gallery";

type Tab = "mine" | "all";

export function PhotosView({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("mine");

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-neutral-800/60">
        <button
          onClick={() => setTab("mine")}
          aria-pressed={tab === "mine"}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
            tab === "mine"
              ? "bg-white text-violet-600 shadow-sm dark:bg-neutral-900 dark:text-violet-400"
              : "text-gray-500 dark:text-neutral-400"
          }`}
        >
          {t.photoGallery.tabMine}
        </button>
        <button
          onClick={() => setTab("all")}
          aria-pressed={tab === "all"}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
            tab === "all"
              ? "bg-white text-violet-600 shadow-sm dark:bg-neutral-900 dark:text-violet-400"
              : "text-gray-500 dark:text-neutral-400"
          }`}
        >
          {t.photoGallery.tabAll}
        </button>
      </div>

      {tab === "mine" ? <PhotoMatch eventId={eventId} /> : <PhotoGallery eventId={eventId} />}
    </div>
  );
}
