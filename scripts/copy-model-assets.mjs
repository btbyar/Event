// Copies face-api.js model weights and tfjs WASM binaries from node_modules into
// public/, so they're served as plain static files (no CDN, no bundler import).
// Runs automatically via `postinstall` so these stay in sync with installed package
// versions without committing large binaries whose version could drift.
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const MODEL_FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model.bin",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model.bin",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model.bin",
];

const WASM_FILES = [
  "tfjs-backend-wasm.wasm",
  "tfjs-backend-wasm-simd.wasm",
  "tfjs-backend-wasm-threaded-simd.wasm",
];

async function copyAll(srcDir, destDir, files) {
  if (!existsSync(srcDir)) {
    console.warn(`[copy-model-assets] missing source dir, skipping: ${srcDir}`);
    return;
  }
  await mkdir(destDir, { recursive: true });
  for (const file of files) {
    await copyFile(path.join(srcDir, file), path.join(destDir, file));
  }
}

await copyAll(
  path.join(root, "node_modules/@vladmandic/face-api/model"),
  path.join(root, "public/models"),
  MODEL_FILES,
);

await copyAll(
  path.join(root, "node_modules/@tensorflow/tfjs-backend-wasm/dist"),
  path.join(root, "public/tfjs-wasm"),
  WASM_FILES,
);

console.log("[copy-model-assets] done");
