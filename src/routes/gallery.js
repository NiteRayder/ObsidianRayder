const MANIFEST_KEY = "manifest.json";
const MAX_MANIFEST_BYTES = 1_000_000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=300",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function readGalleryManifest(bucket) {
  if (!bucket) throw new Error("The R2 gallery bucket is not configured.");
  const object = await bucket.get(MANIFEST_KEY);
  if (!object) return { version: 1, items: [] };

  const size = Number(object.size || 0);
  if (size > MAX_MANIFEST_BYTES) throw new Error("Gallery manifest exceeds the size limit.");

  const manifest = JSON.parse(await object.text());
  if (!manifest || !Array.isArray(manifest.items)) {
    throw new Error("Gallery manifest must contain an items array.");
  }

  const items = manifest.items.filter((item) =>
    item &&
    typeof item.key === "string" &&
    /^[a-zA-Z0-9/_ .-]+$/.test(item.key) &&
    !item.key.startsWith("/") &&
    !item.key.split("/").some((part) => part === "." || part === "..") &&
    typeof item.title === "string" &&
    typeof item.category === "string"
  ).map((item) => ({
    key: item.key,
    title: item.title.slice(0, 160),
    category: item.category.slice(0, 80),
    alt: typeof item.alt === "string" ? item.alt.slice(0, 300) : item.title.slice(0, 160),
    description: typeof item.description === "string" ? item.description.slice(0, 500) : "",
  }));

  return { version: 1, items };
}

export async function handleGalleryRequest(_request, env) {
  const manifest = await readGalleryManifest(env.GALLERY_BUCKET);
  const items = manifest.items.map(({ key, ...item }) => ({
    ...item,
    url: "/media/" + key.split("/").map(encodeURIComponent).join("/"),
  }));
  return json({ items });
}
