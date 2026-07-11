import { S3Client } from "@aws-sdk/client-s3";
import { buildLibraryIndexes, normalizeScanPrefix } from "../index-builder.js";

const buckets = String(process.env.S4_BUCKET || "").split(";").map((value) => value.trim()).filter(Boolean);
const audioBucket = buckets[0] || "";
const videoBucket = String(process.env.S4_VIDEO_BUCKET || buckets[1] || "").trim();
const region = process.env.S4_REGION || "eu-central-1";
const endpoint = process.env.S4_ENDPOINT || "https://s3.g.s4.mega.io";

if (!audioBucket || !process.env.S4_ACCESS_KEY_ID || !process.env.S4_SECRET_ACCESS_KEY) {
  throw new Error("S4_BUCKET, S4_ACCESS_KEY_ID, and S4_SECRET_ACCESS_KEY are required.");
}

const s3Client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S4_ACCESS_KEY_ID,
    secretAccessKey: process.env.S4_SECRET_ACCESS_KEY
  }
});

const scopes = [
  {
    name: "audio",
    bucket: audioBucket,
    prefix: normalizeScanPrefix(process.env.S4_INDEX_AUDIO_PREFIX ?? "audio/"),
    indexKey: process.env.S4_AUDIO_INDEX_KEY || "indexes/audio.ndjson"
  },
  {
    name: "video",
    bucket: videoBucket || audioBucket,
    prefix: normalizeScanPrefix(
      process.env.S4_INDEX_VIDEO_PREFIX ?? (videoBucket ? "" : "video/")
    ),
    indexKey: process.env.S4_VIDEO_INDEX_KEY || "indexes/video.ndjson"
  }
];

const results = await buildLibraryIndexes({ s3Client, scopes });
for (const result of results) {
  console.log(
    `Built ${result.name} index with ${result.records} records at s4://${result.bucket}/${result.indexKey} (${result.etag || "no ETag"}).`
  );
}
