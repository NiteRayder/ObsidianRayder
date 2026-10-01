import { readGalleryManifest } from "./gallery.js";

const ALLOWED_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export async function handleMediaRequest(request, env) {
  const url = new URL(request.url);
  const encodedKey = url.pathname.slice("/media/".length);
  if (!encodedKey || encodedKey.length > 800 || encodedKey.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }

  let key;
  try {
    key = encodedKey.split("/").map((part) => decodeURIComponent(part)).join("/");
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (!key || key.startsWith("/") || key.split("/").some((part) => part === "." || part === "..")) {
    return new Response("Not found", { status: 404 });
  }

  const manifest = await readGalleryManifest(env.GALLERY_BUCKET);
  if (!manifest.items.some((item) => item.key === key)) {
    return new Response("Not found", {
      status: 404,
      headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
    });
  }

  const object = await env.GALLERY_BUCKET.get(key);
  if (!object) {
    return new Response("Not found", {
      status: 404,
      headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
    });
  }

  const type = object.httpMetadata?.contentType || "application/octet-stream";
  if (!ALLOWED_TYPES.has(type.toLowerCase())) {
    return new Response("Unsupported media type", { status: 415 });
  }

  const headers = new Headers({
    "content-type": type,
    "x-content-type-options": "nosniff",
    "cache-control": "public, max-age=3600, s-maxage=86400",
  });
  if (object.httpEtag) headers.set("etag", object.httpEtag);
  if (request.method === "HEAD") return new Response(null, { headers });
  return new Response(object.body, { headers });
}
