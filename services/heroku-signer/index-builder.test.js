import assert from "node:assert/strict";
import test from "node:test";
import { buildLibraryIndex } from "./index-builder.js";

test("builds an NDJSON index from media objects and ignores other files", async () => {
  let uploadedBody = "";
  const fakeS3Client = {
    async send(command) {
      if (command.constructor.name === "ListObjectsV2Command") {
        return {
          Contents: [
            {
              Key: "Artist/Album/01 First Song.mp3",
              Size: 123,
              LastModified: new Date("2026-06-19T12:00:00Z")
            },
            { Key: "Artist/Album/cover.jpg", Size: 456 }
          ],
          IsTruncated: false
        };
      }

      for await (const chunk of command.input.Body) {
        uploadedBody += chunk.toString();
      }
      assert.equal(command.input.Bucket, "audio-bucket");
      assert.equal(command.input.Key, "indexes/audio.ndjson");
      return { ETag: '"index-version"' };
    }
  };

  const result = await buildLibraryIndex({
    s3Client: fakeS3Client,
    scope: {
      name: "audio",
      bucket: "audio-bucket",
      prefix: "",
      indexKey: "indexes/audio.ndjson"
    }
  });

  assert.equal(result.records, 1);
  assert.equal(result.etag, '"index-version"');
  assert.deepEqual(JSON.parse(uploadedBody.trim()), {
    objectKey: "Artist/Album/01 First Song.mp3",
    artist: "Artist",
    album: "Album",
    title: "First Song",
    type: "audio",
    size: 123,
    modified: "2026-06-19T12:00:00.000Z"
  });
});
