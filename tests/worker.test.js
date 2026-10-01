import { describe, expect, it, vi } from "vitest";
import worker from "../src/index.js";

function makeEnv() {
  const manifest = JSON.stringify({ version: 1, items: [{ key: "artwork/sample.webp", title: "Sample", category: "Illustration", alt: "Sample art" }] });
  return {
    ASSETS: { fetch: vi.fn(async (request) => {
      const url = new URL(request.url);
      if (url.pathname === "/missing") return new Response("Not found", { status: 404 });
      if (url.pathname === "/404.html") return new Response("Custom not found", { status: 200 });
      return new Response("Static asset", { status: 200 });
    }) },
    GALLERY_BUCKET: { get: vi.fn(async (key) => {
      if (key === "manifest.json") return { size: manifest.length, text: async () => manifest };
      if (key === "artwork/sample.webp") return { body: new Blob(["test"]).stream(), httpMetadata: { contentType: "image/webp" }, httpEtag: '"sample"' };
      return null;
    }) },
  };
}

describe("ObsidianRayder Worker", () => {
  it("serves static assets through the asset binding", async () => {
    const response = await worker.fetch(new Request("https://example.test/"), makeEnv());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Static asset");
  });
  it("returns gallery metadata without exposing R2 object keys", async () => {
    const response = await worker.fetch(new Request("https://example.test/api/gallery"), makeEnv());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [{ title: "Sample", category: "Illustration", alt: "Sample art", description: "", url: "/media/artwork/sample.webp" }] });
  });
  it("serves an allowlisted image from R2", async () => {
    const response = await worker.fetch(new Request("https://example.test/media/artwork/sample.webp"), makeEnv());
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
  it("does not serve images absent from the manifest", async () => {
    const response = await worker.fetch(new Request("https://example.test/media/private.webp"), makeEnv());
    expect(response.status).toBe(404);
  });
  it("rejects unsupported methods for API routes", async () => {
    const response = await worker.fetch(new Request("https://example.test/api/gallery", { method: "POST" }), makeEnv());
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
  });
  it("returns the custom 404 page for missing browser routes", async () => {
    const response = await worker.fetch(new Request("https://example.test/missing", { headers: { accept: "text/html" } }), makeEnv());
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Custom not found");
  });
});
