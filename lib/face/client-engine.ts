// Browser-only face detection for the guest selfie flow. Deliberately imported
// dynamically (only when a guest opens the photo-matching route) — the models
// and WASM runtime add real weight that the check-in flow shouldn't pay for.
//
// Uses face-api.js's "nobundle" build paired with an explicit `@tensorflow/tfjs`
// + `@tensorflow/tfjs-backend-wasm` import (the documented pairing for that
// build) so bundlers dedupe a single shared tfjs-core instance instead of two
// independent copies with separate backend registries.
import * as tf from "@tensorflow/tfjs";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm-nobundle.js";

let readyPromise: Promise<void> | undefined;

function initialize(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      setWasmPaths("/tfjs-wasm/");
      await tf.setBackend("wasm");
      await tf.ready();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
    })();
  }
  return readyPromise;
}

/** Loads the models (idempotent) so the caller can show progress before capture. */
export async function preloadFaceModels(): Promise<void> {
  await initialize();
}

/**
 * Detects the single most prominent face in a captured selfie frame or a
 * user-picked photo, and returns its 128-d descriptor, or null if no face was
 * found. Never touches the network beyond the one-time model/wasm load — the
 * image itself (live camera frame or gallery photo) never leaves the device.
 */
export async function detectSelfieDescriptor(
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
): Promise<number[] | null> {
  await initialize();
  const result = await faceapi
    .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!result) return null;
  return Array.from(result.descriptor as Float32Array);
}
