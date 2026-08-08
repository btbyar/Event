"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark, Camera, Download, Images, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { Dictionary, PhotoErrorCode } from "@/lib/i18n/dictionaries";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, PHOTO_TOKEN_TTL_SECONDS } from "@/lib/photos/limits";

type CaptureMethod = "camera" | "gallery";

type Match = { photoId: string; thumbnailUrl: string };

type Phase =
  | "intro"
  | "camera"
  | "analyzing"
  | "no-face"
  | "no-matches"
  | "matches"
  | "camera-denied"
  | "camera-unavailable"
  | "error";

type StoredMatch = { token: string; matches: Match[]; expiresAt: number };

function storageKey(eventId: string) {
  return `photo-match:${eventId}`;
}

// Persisted in localStorage (not sessionStorage) so a guest who matched once
// can come back to their gallery from the same device long after the event —
// days, weeks, whenever the token below is still valid — without a new
// selfie. Nothing server-side tracks this; it's purely a client-side "hey,
// you already did this" shortcut built on the same signed token.
function loadStoredMatch(eventId: string): StoredMatch | null {
  try {
    const raw = localStorage.getItem(storageKey(eventId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMatch;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

class ApiError extends Error {
  code?: PhotoErrorCode;
  constructor(message: string, code?: PhotoErrorCode) {
    super(message);
    this.code = code;
  }
}

async function postMatch(eventId: string, embedding: number[], t: Dictionary) {
  let res: Response;
  try {
    res = await fetch(`/api/events/${eventId}/photos/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embedding }),
    });
  } catch {
    throw new ApiError(t.photoErrors.networkError, "networkError");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? t.photoErrors.unknownError, data?.code);
  return data as { matches: Match[]; token: string | null };
}

export function PhotoMatch({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lazily seeded from localStorage (not an Effect) so a returning guest who
  // already matched within the token's lifetime skips straight to their
  // gallery instead of a flash of the intro screen.
  const [phase, setPhase] = useState<Phase>(() => (loadStoredMatch(eventId) ? "matches" : "intro"));
  const [matches, setMatches] = useState<Match[]>(() => loadStoredMatch(eventId)?.matches ?? []);
  const [token, setToken] = useState<string | null>(() => loadStoredMatch(eventId)?.token ?? null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);
  // Remembers which entry point produced the current error/no-face state, so
  // "Try again" retries the same method instead of always reopening the camera.
  const [lastMethod, setLastMethod] = useState<CaptureMethod>("camera");

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function handleEnableCamera() {
    setErrorMessage(null);
    setPickerError(null);
    setLastMethod("camera");
    const preload = import("@/lib/face/client-engine").then((m) => m.preloadFaceModels());

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setPhase("camera");
      // Video element mounts on the next render; attach once it exists.
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPhase("camera-denied");
      } else {
        setPhase("camera-unavailable");
      }
    }

    await preload.catch(() => {
      /* surfaced later if capture fails */
    });
  }

  function handleChooseFromGallery() {
    setErrorMessage(null);
    setPickerError(null);
    // Fire-and-forget: detectSelfieDescriptor() awaits the same memoized
    // init internally, so this just gives the ~7MB model/wasm load a head
    // start while the OS file picker is open.
    import("@/lib/face/client-engine")
      .then((m) => m.preloadFaceModels())
      .catch(() => {});
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      setPickerError(t.photoErrors.invalidFileType);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setPickerError(t.photoErrors.fileTooLarge);
      return;
    }

    setPickerError(null);
    setLastMethod("gallery");
    setPhase("analyzing");

    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("image-decode-failed"));
        image.src = objectUrl;
      });

      const { detectSelfieDescriptor } = await import("@/lib/face/client-engine");
      const descriptor = await detectSelfieDescriptor(image);
      await finishWithDescriptor(descriptor);
    } catch {
      setErrorMessage(t.photoErrors.unknownError);
      setPhase("error");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setPhase("analyzing");
    try {
      const { detectSelfieDescriptor } = await import("@/lib/face/client-engine");
      const descriptor = await detectSelfieDescriptor(canvas);
      await finishWithDescriptor(descriptor);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? t.photoErrors[err.code ?? "unknownError"] : t.photoErrors.unknownError);
      setPhase("error");
    }
  }

  /** Shared tail end of both the camera and gallery flows: match the
   * detected descriptor against the event's photos and land on the right
   * result phase. */
  async function finishWithDescriptor(descriptor: number[] | null) {
    if (!descriptor) {
      setPhase("no-face");
      return;
    }

    stopCamera();
    try {
      const data = await postMatch(eventId, descriptor, t);
      if (data.matches.length === 0) {
        setPhase("no-matches");
        return;
      }

      setMatches(data.matches);
      setToken(data.token);
      setPhase("matches");
      if (data.token) {
        const stored: StoredMatch = {
          token: data.token,
          matches: data.matches,
          // Mirrors the server's JWT expiry (lib/photos/limits.ts) minus a
          // small safety margin so the client never treats a token as valid
          // for longer than the server will actually accept it.
          expiresAt: Date.now() + (PHOTO_TOKEN_TTL_SECONDS - 60) * 1000,
        };
        localStorage.setItem(storageKey(eventId), JSON.stringify(stored));
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? t.photoErrors[err.code ?? "unknownError"] : t.photoErrors.unknownError);
      setPhase("error");
    }
  }

  function handleRetake() {
    setErrorMessage(null);
    if (lastMethod === "gallery") {
      handleChooseFromGallery();
    } else {
      handleEnableCamera();
    }
  }

  function handleStartOver() {
    localStorage.removeItem(storageKey(eventId));
    setMatches([]);
    setToken(null);
    setErrorMessage(null);
    setPickerError(null);
    setPhase("intro");
  }

  async function handleDownloadAll() {
    if (!token) return;
    setDownloadingAll(true);
    try {
      window.location.href = `/api/events/${eventId}/photos/download?token=${encodeURIComponent(token)}`;
    } finally {
      setTimeout(() => setDownloadingAll(false), 1500);
    }
  }

  const statusMessage =
    phase === "analyzing"
      ? t.photoFlow.analyzing
      : phase === "matches"
        ? t.photoFlow.matchesTitle(matches.length)
        : "";

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {phase === "intro" && (
        <div className="animate-fade-in rounded-3xl bg-white/90 p-6 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <div className="animate-pop-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/25">
            <Camera className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
          <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-violet-500 uppercase dark:text-violet-400">
            {t.photoFlow.introEyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl text-gray-900 dark:text-neutral-50">
            {t.photoFlow.introTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">{t.photoFlow.introBody}</p>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {t.photoFlow.privacyNote}
          </p>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
            <Bookmark className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {t.photoFlow.comeBackNote}
          </p>
          {pickerError && (
            <p
              role="alert"
              className="animate-shake mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
            >
              {pickerError}
            </p>
          )}
          <button
            onClick={handleEnableCamera}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-violet-600/25 active:opacity-90 dark:shadow-none"
          >
            <Camera className="h-4 w-4" strokeWidth={2} />
            {t.photoFlow.enableCamera}
          </button>
          <button
            onClick={handleChooseFromGallery}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 py-3.5 text-base font-medium text-violet-600 active:bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:active:bg-violet-950/30"
          >
            <Images className="h-4 w-4" strokeWidth={2} />
            {t.photoFlow.chooseFromGallery}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>
      )}

      {phase === "camera" && (
        <div className="animate-fade-in space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-black shadow-xl shadow-black/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[80%] w-[80%] rounded-full border-4 border-white/70" />
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-neutral-400">
            {t.photoFlow.positionFace}
          </p>
          <button
            onClick={handleCapture}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-violet-600/25 active:opacity-90 dark:shadow-none"
          >
            <Camera className="h-4 w-4" strokeWidth={2} />
            {t.photoFlow.capture}
          </button>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="animate-fade-in rounded-3xl bg-white/90 p-10 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <Spinner className="mx-auto h-8 w-8 text-violet-500 dark:text-violet-400" />
          <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{t.photoFlow.analyzing}</p>
        </div>
      )}

      {(phase === "no-face" || phase === "camera-denied" || phase === "camera-unavailable" || phase === "error") && (
        <div className="animate-shake rounded-3xl bg-white/90 p-6 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50">
            {phase === "no-face"
              ? t.photoFlow.noFaceTitle
              : phase === "camera-denied"
                ? t.photoFlow.cameraDeniedTitle
                : phase === "camera-unavailable"
                  ? t.photoFlow.cameraUnavailableTitle
                  : t.common.somethingWentWrong}
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-neutral-400">
            {phase === "no-face"
              ? t.photoFlow.noFaceBody
              : phase === "camera-denied"
                ? t.photoFlow.cameraDeniedBody
                : phase === "camera-unavailable"
                  ? t.photoFlow.cameraUnavailableBody
                  : errorMessage}
          </p>
          <button
            onClick={handleRetake}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-violet-600/25 active:opacity-90 dark:shadow-none"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
            {t.photoFlow.tryAgain}
          </button>
        </div>
      )}

      {phase === "no-matches" && (
        <div className="animate-fade-in rounded-3xl bg-white/90 p-6 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-none dark:ring-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50">
            {t.photoFlow.noMatchesTitle}
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-neutral-400">
            {t.photoFlow.noMatchesBody}
          </p>
          <button
            onClick={handleStartOver}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-violet-600/25 active:opacity-90 dark:shadow-none"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
            {t.photoFlow.startOver}
          </button>
        </div>
      )}

      {phase === "matches" && (
        <div className="animate-slide-up space-y-4">
          <p className="px-1 text-center text-sm font-medium text-gray-700 dark:text-neutral-200">
            {t.photoFlow.matchesTitle(matches.length)}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {matches.map((m, i) => (
              <button
                key={m.photoId}
                onClick={() => setLightboxIndex(i)}
                style={{ animationDelay: `${i * 30}ms` }}
                className="animate-pop-in aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm active:scale-[0.97] dark:bg-neutral-800"
              >
                <img src={m.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-base font-medium text-white shadow-lg shadow-violet-600/25 active:opacity-90 disabled:opacity-60 dark:shadow-none"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            {downloadingAll ? t.photoFlow.downloadingAll : t.photoFlow.downloadAll}
          </button>
          <button
            onClick={handleStartOver}
            className="w-full rounded-xl py-2.5 text-center text-sm font-medium text-violet-600 active:bg-violet-50 dark:text-violet-400 dark:active:bg-violet-950/30"
          >
            {t.photoFlow.startOver}
          </button>
        </div>
      )}

      {lightboxIndex !== null &&
        createPortal(
          <Lightbox
            matches={matches}
            index={lightboxIndex}
            eventId={eventId}
            token={token}
            t={t}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />,
          document.body,
        )}
    </>
  );
}

function Lightbox({
  matches,
  index,
  eventId,
  token,
  t,
  onClose,
  onNavigate,
}: {
  matches: Match[];
  index: number;
  eventId: string;
  token: string | null;
  t: Dictionary;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const match = matches[index];
  const downloadUrl = `/api/events/${eventId}/photos/${match.photoId}/file?variant=original&download=1&token=${encodeURIComponent(token ?? "")}`;
  const viewUrl = `/api/events/${eventId}/photos/${match.photoId}/file?variant=original&token=${encodeURIComponent(token ?? "")}`;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-white/70">{index + 1} / {matches.length}</span>
        <button onClick={onClose} className="rounded-full p-1.5 text-white active:bg-white/10">
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <img src={viewUrl} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          onClick={() => onNavigate((index - 1 + matches.length) % matches.length)}
          disabled={matches.length < 2}
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
          onClick={() => onNavigate((index + 1) % matches.length)}
          disabled={matches.length < 2}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-30"
        >
          ›
        </button>
      </div>
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
