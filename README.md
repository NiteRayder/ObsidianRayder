# ObsidianRayder

ObsidianRayder is the creator portfolio and creative hub for **NiteRayder**, bringing together artwork, writing, creator content, and software projects.

## Stack

- HTML5, CSS, and vanilla JavaScript
- Cloudflare Workers for request handling
- Workers Static Assets for website files
- Cloudflare R2 for gallery images and metadata
- Wrangler for local development and deployment
- Vitest for automated tests

## Local development

Requirements: Node.js 20 or newer and npm.

```sh
npm install
npm test
npm run dev
```

The local Worker uses the R2 binding declared in `wrangler.toml`. Create the configured bucket in the Cloudflare account used for development, or use Wrangler's local R2 simulation where supported.

## Cloudflare setup

1. Create and secure the new Cloudflare account.
2. Create an R2 bucket named `obsidianrayder-gallery`, or update `bucket_name` in `wrangler.toml`.
3. Keep the bucket private. The Worker reads it through the `GALLERY_BUCKET` binding.
4. Wrangler configures the `ASSETS` binding for the `public/` directory.
5. Choose and configure the production hostname after the new account is ready.
6. Run tests and preview the app before deploying.

**This branch has not been deployed.** Do not run `npm run deploy` until the new account, R2 bucket, and hostname are ready and deployment is explicitly approved.

## R2 gallery manifest

Upload a `manifest.json` object at the root of the R2 bucket. Example:

```json
{
  "version": 1,
  "items": [
    {
      "key": "artwork/example.webp",
      "title": "Example artwork",
      "category": "Illustration",
      "alt": "Description of the artwork",
      "description": "Optional context for the image."
    }
  ]
}
```

Upload each image to the exact key referenced in the manifest. Supported content types are AVIF, JPEG, PNG, GIF, and WebP. Only objects referenced by the manifest are served by the media route.

The browser calls `GET /api/gallery`; image URLs use `GET /media/{key}`. R2 credentials are never exposed to the browser, and the Worker does not provide public uploads.

## Contact form

The contact form uses a mailto fallback. Before publishing, replace `REPLACE_WITH_YOUR_EMAIL@example.com` in `public/assets/js/site.js` with the contact address you want to publish. Until configured, the form displays a notice and points visitors to Discord. Mailto opens the visitor's email application; it does not confirm delivery.

## Site sections

- Home
- About
- Art
- Writing
- Content
- Development
- Contact

The development page uses Horizon Forge Studios and Silverline Network branding. Until individual repository URLs are verified, project cards link to the NiteRayder GitHub profile.

## Tests

```sh
npm test
```

The tests cover Worker routing, gallery metadata, allowlisted R2 media, unsupported methods, not-found behavior, and key page structure.

## Structure

```
.
├── src/
│   ├── index.js
│   └── routes/
│       ├── gallery.js
│       └── media.js
├── public/
│   ├── index.html
│   ├── 404.html
│   ├── assets/
│   │   ├── css/site.css
│   │   └── js/site.js
│   └── pages/
├── tests/
├── package.json
└── wrangler.toml
```

Once the production hostname is selected, add/update the sitemap and robots.txt with absolute production URLs.

© NiteRayder
