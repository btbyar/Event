"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Download, Loader2, Plus, X } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type GalleryPhoto = { photoId: string; thumbnailUrl: string; token: string };

export function PhotoGallery({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const loadedOnce = useRef(false);

  const loadPage = useCallback(
    async (afterCursor: string | null) => {
      const url = new URL(`/api/events/${eventId}/photos/browse`, window.location.origin);
      if (afterCursor) url.searchParams.set("cursor", afterCursor);
      const res = await fetch(url);
      const data = (await res.json().catch(() => null)) as {
        photos: { photoId: string; thumbnailUrl: string }[];
        token: string | null;
        nextCursor: string | null;
      } | null;
      if (!data) return;
      const withToken = data.photos.map((p) => ({ ...p, token: data.token ?? "" }));
      setPhotos((prev) => [...prev, ...withToken]);
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    },
    [eventId],
  );

  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    loadPage(null).finally(() => setInitialLoading(false));
  }, [loadPage]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      await loadPage(cursor);
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleSelect(photoId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }

  async function handleDownloadSelected() {
    if (selected.size === 0) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/photos/select-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: Array.from(selected) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.token) return;
      window.location.href = `/api/events/${eventId}/photos/download?token=${encodeURIComponent(data.token)}`;
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  }

  if (initialLoading) {
    return (
      <div className="animate-fade-in rounded-3xl bg-white/90 p-10 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{t.photoGallery.loading}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="animate-fade-in rounded-3xl bg-white/90 p-6 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
        <p className="text-sm text-gray-500 dark:text-neutral-400">{t.photoGallery.noPhotosYet}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 pb-20">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => {
          const isSelected = selected.has(p.photoId);
          return (
            <div
              key={p.photoId}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm dark:bg-neutral-800"
            >
              <button onClick={() => setLightboxIndex(i)} className="h-full w-full">
                <img src={p.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              </button>
              <button
                onClick={() => toggleSelect(p.photoId)}
                aria-pressed={isSelected}
                className={`absolute right-1.5 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full shadow transition ${
                  isSelected
                    ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white"
                    : "bg-black/40 text-white backdrop-blur-sm active:bg-black/60"
                }`}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mx-auto flex items-center gap-2 rounded-full border border-violet-200 px-5 py-2.5 text-sm font-medium text-violet-600 disabled:opacity-60 dark:border-violet-500/30 dark:text-violet-400"
        >
          {loadingMore && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          {t.photoGallery.loadMore}
        </button>
      )}

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full max-w-md">
            <button
              onClick={handleDownloadSelected}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-medium text-white shadow-xl shadow-violet-600/30 active:opacity-90 disabled:opacity-60"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              {downloading
                ? t.photoGallery.downloadingSelected
                : t.photoGallery.downloadSelected(selected.size)}
            </button>
          </div>
        </div>
      )}

      {lightboxIndex !== null &&
        createPortal(
          <GalleryLightbox
            photos={photos}
            index={lightboxIndex}
            eventId={eventId}
            t={t}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />,
          document.body,
        )}
    </div>
  );
}

function GalleryLightbox({
  photos,
  index,
  eventId,
  t,
  onClose,
  onNavigate,
}: {
  photos: GalleryPhoto[];
  index: number;
  eventId: string;
  t: Dictionary;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const photo = photos[index];
  const downloadUrl = `/api/events/${eventId}/photos/${photo.photoId}/file?variant=original&download=1&token=${encodeURIComponent(photo.token)}`;
  const viewUrl = `/api/events/${eventId}/photos/${photo.photoId}/file?variant=original&token=${encodeURIComponent(photo.token)}`;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-white/70">
          {index + 1} / {photos.length}
        </span>
        <button onClick={onClose} className="rounded-full p-1.5 text-white active:bg-white/10">
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <img src={viewUrl} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
          disabled={photos.length < 2}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-30"
        >
          ‹
        </button>
        <a
          href={downloadUrl}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          {t.photoFlow.downloadPhoto}
        </a>
        <button
          onClick={() => onNavigate((index + 1) % photos.length)}
          disabled={photos.length < 2}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
}
