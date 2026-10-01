import { handleGalleryRequest } from "./routes/gallery.js";
import { handleMediaRequest } from "./routes/media.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/media/")) {
      if (method !== "GET" && method !== "HEAD") {
        return json({ error: "Method not allowed" }, 405, { allow: "GET, HEAD" });
      }
      try {
        if (url.pathname === "/api/gallery") {
          return await handleGalleryRequest(request, env);
        }
        if (url.pathname.startsWith("/media/")) {
          return await handleMediaRequest(request, env);
        }
        return json({ error: "Not found" }, 404);
      } catch (error) {
        console.error("Worker request failed", error);
        return json({ error: "The request could not be completed" }, 500);
      }
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    // Return the site's custom not-found page for browser navigation requests.
    const accept = request.headers.get("accept") || "";
    if (accept.includes("text/html")) {
      const notFound = await env.ASSETS.fetch(new Request(new URL("/404.html", url), request));
      if (notFound.ok) return new Response(notFound.body, {
        status: 404,
        headers: notFound.headers,
      });
    }
    return response;
  },
};
