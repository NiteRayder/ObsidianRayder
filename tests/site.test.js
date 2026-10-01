import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

const pages = [
  "public/index.html", "public/pages/about.html", "public/pages/art.html",
  "public/pages/writing.html", "public/pages/content.html",
  "public/pages/development.html", "public/pages/contact.html", "public/404.html",
];

describe("static site structure", () => {
  it("has each expected page and shared stylesheet/script references", async () => {
    for (const path of pages) {
      const html = await readFile(new URL("../" + path, import.meta.url), "utf8");
      expect(html, path).toContain("<!doctype html>");
      if (path !== "public/404.html") {
        expect(html, path).toContain("assets/css/site.css");
        expect(html, path).toContain("assets/js/site.js");
      }
    }
  });
  it("uses current studio branding", async () => {
    const html = await readFile(new URL("../public/pages/development.html", import.meta.url), "utf8");
    expect(html).toContain("Horizon Forge Studios");
    expect(html).toContain("Silverline Network");
    expect(html).not.toContain("NyxNexus");
  });
  it("has a mailto form with required contact fields", async () => {
    const html = await readFile(new URL("../public/pages/contact.html", import.meta.url), "utf8");
    expect(html).toContain("data-mailto-form");
    expect(html).toContain('name="email"');
    expect(html).toContain('name="message"');
  });
  it("has the R2 gallery interface", async () => {
    const html = await readFile(new URL("../public/pages/art.html", import.meta.url), "utf8");
    expect(html).toContain("data-gallery-grid");
    expect(html).toContain("data-lightbox");
  });
});
