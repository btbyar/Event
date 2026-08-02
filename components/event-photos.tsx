"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { card, btnSecondary, badge } from "@/lib/ui";
import { useI18n } from "@/components/i18n-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { PhotoErrorCode } from "@/lib/i18n/dictionaries";
import { MAX_FILES_PER_REQUEST } from "@/lib/photos/limits";

type Photo = {
  id: string;
  originalName: string;
  width: number;
  height: number;
  processedAt: string | null;
  faceCount: number;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function EventPhotos({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const { data, mutate } = useSWR<{ photos: Photo[] }>(
    `/api/events/${eventId}/photos`,
    fetcher,
    {
      refreshInterval: (latest) =>
        latest?.photos.some((p) => !p.processedAt) ? 3000 : 0,
    },
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [reprocessing, setReprocessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const photos = data?.photos ?? [];
  const hasPending = photos.some((p) => !p.processedAt);

  function errorMessage(code: PhotoErrorCode | undefined): string {
    return code && t.photoErrors[code] ? t.photoErrors[code] : t.photoErrors.unknownError;
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    const batches = chunk(files, MAX_FILES_PER_REQUEST);
    setUploadProgress({ done: 0, total: files.length });

    try {
      let done = 0;
      for (const batch of batches) {
        const formData = new FormData();
        for (const file of batch) formData.append("files", file);
        const res = await fetch(`/api/events/${eventId}/photos`, {
          method: "POST",
          body: formData,
        });
        const responseData = await res.json().catch(() => null);
        if (!res.ok) throw new Error(errorMessage(responseData?.code));
        done += batch.length;
        setUploadProgress({ done, total: files.length });
        await mutate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.photoErrors.unknownError);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleDelete(photoId: string) {
    setConfirmDeleteId(null);
    await fetch(`/api/events/${eventId}/photos/${photoId}`, { method: "DELETE" });
    await mutate();
  }

  async function handleDeleteAll() {
    setConfirmDeleteAll(false);
    await fetch(`/api/events/${eventId}/photos/delete-all`, { method: "POST" });
    await mutate();
  }

  async function handleReprocess() {
    setReprocessing(true);
    try {
      await fetch(`/api/events/${eventId}/photos/reprocess`, { method: "POST" });
      await mutate();
    } finally {
      setReprocessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-gray-900 dark:text-gray-100">
          {t.photosAdmin.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.photosAdmin.subtitle}</p>
      </div>

      <div className={`${card} p-5`}>
        <label
          htmlFor="photo-upload"
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center transition dark:border-white/10 dark:bg-white/[0.02] ${
            uploading
              ? "pointer-events-none opacity-60"
              : "cursor-pointer hover:border-violet-300 hover:bg-violet-50/40 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/5"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" strokeWidth={1.5} />
          ) : (
            <UploadCloud className="h-8 w-8 text-violet-500" strokeWidth={1.5} />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {uploadProgress
              ? t.photosAdmin.uploading(uploadProgress.done, uploadProgress.total)
              : t.photosAdmin.uploadZoneText}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {t.photosAdmin.uploadZoneHint}
          </span>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={handleFiles}
            className="hidden"
          />
        </label>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 flex-none" strokeWidth={2} />
            {error}
          </p>
        )}
      </div>

      <div className={`${card} p-5`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t.photosAdmin.photosCount(photos.length)}
          </h2>
          <div className="flex gap-2">
            {hasPending && (
              <button onClick={handleReprocess} disabled={reprocessing} className={btnSecondary}>
                <RefreshCw
                  className={`h-4 w-4 ${reprocessing ? "animate-spin" : ""}`}
                  strokeWidth={2}
                />
                {reprocessing ? t.photosAdmin.reprocessing : t.photosAdmin.reprocessPending}
              </button>
            )}
            {photos.length > 0 && (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                {t.photosAdmin.deleteAllPhotos}
              </button>
            )}
          </div>
        </div>

        {photos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-white/10 dark:text-gray-500">
            {t.photosAdmin.noPhotosYet}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5"
              >
                <img
                  src={`/api/events/${eventId}/photos/${photo.id}/file?variant=thumb`}
                  alt={photo.originalName}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/70 to-transparent p-2">
                  {photo.processedAt ? (
                    <span className={badge("violet")}>
                      <Users className="mr-1 h-3 w-3" strokeWidth={2} />
                      {t.photosAdmin.faceCount(photo.faceCount)}
                    </span>
                  ) : (
                    <span className={badge("amber")}>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" strokeWidth={2} />
                      {t.photosAdmin.processingBadge}
                    </span>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(photo.id)}
                    className="rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100 dark:bg-neutral-900/90"
                    aria-label={t.photosAdmin.deletePhoto}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={t.photosAdmin.deletePhoto}
        body={t.photosAdmin.deletePhotoConfirmBody}
        confirmLabel={t.photosAdmin.confirmDelete}
        cancelLabel={t.photosAdmin.cancel}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <ConfirmDialog
        open={confirmDeleteAll}
        title={t.photosAdmin.deleteAllConfirmTitle}
        body={t.photosAdmin.deleteAllConfirmBody}
        confirmLabel={t.photosAdmin.confirmDelete}
        cancelLabel={t.photosAdmin.cancel}
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
}
