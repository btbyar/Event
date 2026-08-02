import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import type { PhotoStorage } from "./photo-storage";

// Cloudflare R2 is S3-compatible, so the standard AWS SDK works against it
// unmodified — just pointed at R2's endpoint with "auto" region. This is the
// production storage backend: unlike local disk, objects survive redeploys
// and container restarts without needing a paid persistent-disk add-on.
function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function bucket() {
  return process.env.R2_BUCKET_NAME!;
}

export class R2PhotoStorage implements PhotoStorage {
  async save(key: string, data: Buffer): Promise<void> {
    await client().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: data }));
  }

  async read(key: string): Promise<Buffer> {
    const res = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    const bytes = await res.Body!.transformToByteArray();
    return Buffer.from(bytes);
  }

  async delete(key: string): Promise<void> {
    await client()
      .send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
      .catch(() => {});
  }

  async deleteAllForEvent(eventId: string): Promise<void> {
    const c = client();
    const prefix = `${eventId}/`;
    let continuationToken: string | undefined;

    do {
      const listed = await c.send(
        new ListObjectsV2Command({ Bucket: bucket(), Prefix: prefix, ContinuationToken: continuationToken }),
      );
      const keys = (listed.Contents ?? []).flatMap((obj) => (obj.Key ? [{ Key: obj.Key }] : []));
      if (keys.length > 0) {
        await c.send(new DeleteObjectsCommand({ Bucket: bucket(), Delete: { Objects: keys } }));
      }
      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
    } while (continuationToken);
  }
}
