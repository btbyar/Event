import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
import { DETECTION_MAX_DIMENSION } from "@/lib/photos/limits";

// Server-side face detection, deliberately avoiding `@tensorflow/tfjs-node`
// (a native addon requiring build tooling) in favor of the pure-JS/WASM
// backend — the same one documented by face-api.js for platforms where
// tfjs-node's binaries aren't an option. `createRequire` is used because
// `@vladmandic/face-api`'s node-wasm bundle is a plain CommonJS file with no
// package.json "exports" map entry, so a deep subpath needs classic resolution.
const require = createRequire(import.meta.url);
const tf = require("@tensorflow/tfjs") as typeof import("@tensorflow/tfjs");
const wasm = require("@tensorflow/tfjs-backend-wasm") as typeof import("@tensorflow/tfjs-backend-wasm");
const faceapi = require("@vladmandic/face-api/dist/face-api.node-wasm.js");

export type DetectedFace = {
  embedding: number[];
  box: { x: number; y: number; width: number; height: number };
};

let readyPromise: Promise<void> | undefined;

function initialize(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      wasm.setWasmPaths(
        path.join(process.cwd(), "node_modules/@tensorflow/tfjs-backend-wasm/dist") + "/",
      );
      await tf.setBackend("wasm");
      await tf.ready();

      const modelPath = path.join(process.cwd(), "public/models");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
      ]);
    })();
  }
  return readyPromise;
}

/**
 * Decodes an uploaded photo and returns every detected face's bounding box
 * and 128-d recognition embedding. Downscales before detection to bound
 * per-photo compute cost, and always disposes its tensor — important
 * discipline in a long-running Node process working through large batches.
 */
export async function detectFacesInImageBuffer(buffer: Buffer): Promise<DetectedFace[]> {
  await initialize();

  const { data, info } = await sharp(buffer)
    .rotate() // apply EXIF orientation before we lose the tag by going to raw
    .resize(DETECTION_MAX_DIMENSION, DETECTION_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .removeAlpha()
    .toColorspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });

  const tensor = tf.tensor3d(new Uint8Array(data), [info.height, info.width, info.channels], "int32");
  try {
    const results = await faceapi
      .detectAllFaces(tensor, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    return results.map(
      (r: { descriptor: Float32Array; detection: { box: { x: number; y: number; width: number; height: number } } }) => ({
        embedding: Array.from(r.descriptor),
        box: {
          x: Math.round(r.detection.box.x),
          y: Math.round(r.detection.box.y),
          width: Math.round(r.detection.box.width),
          height: Math.round(r.detection.box.height),
        },
      }),
    );
  } finally {
    tensor.dispose();
  }
}
