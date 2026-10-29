# RAYDER Creator Hub

RAYDER is the creator hub for **NiteRayder**, bringing together artwork, writing, creator content, and software projects.

## Current status

The public RAYDER hub and Inner Circle preview are in progress. The Inner Circle is a visual preview only; account authentication, PayPal subscriptions, webhook verification, and protected media delivery are not implemented. Do not publish member-only media until these are live and tested.

## Stack

- HTML5, CSS, and vanilla JavaScript
- Static files that can be hosted by any ordinary static-site host
- A local JSON manifest for the artwork gallery
- Vitest for automated tests

This repository has no Cloudflare Workers, Wrangler configuration, or R2 dependency.

## Local development

Requirements: Node.js 20 or newer and npm. Install dependencies and run the test suite:

```sh
npm install
npm test
```

To preview the static site locally, run this from the repository root:

```sh
python -m http.server 8000 --directory public
```

Then open `http://localhost:8000`. Any static web server can serve the `public/` directory; no build or hosting-provider runtime is required.

## Artwork gallery

Place image files inside `public/gallery/` and add their metadata to `public/gallery/manifest.json`. Example:

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

For that example, place the image at `public/gallery/artwork/example.webp`. Supported image formats depend on the browser; WebP, PNG, JPEG, and AVIF are recommended. The gallery reads the public manifest and loads images as ordinary static files. Do not put private/member-only media in this folder.

## Contact form

The contact form uses a mailto fallback. Before publishing, replace `REPLACE_WITH_YOUR_EMAIL@example.com` in `public/assets/js/site.js` with the contact address you want to publish. Until configured, the form displays a notice and points visitors to Discord. Mailto opens the visitor's email application; it does not confirm delivery.

## Site sections

- Rayder HQ: public creator hub and launch overview
- The Rayder File: creator profile and project overview
- Transmissions: free public updates and devlogs
- Signals: social and channel directory
- Join the Raid: proposed Super Rayder and VIR membership tiers (not active)
- Intel: FAQ and launch disclosures
- Comms: contact form using a mailto fallback
- Inner Circle: members-area preview only; server-side authentication and payment verification are not implemented yet
- Existing supporting pages: About, Art, Writing, Content, Development, and Contact

The development page uses Horizon Forge Studios and Silverline Network branding. RAYDER is the public-facing creator hub brand. Until individual repository URLs are verified, project cards link to the NiteRayder GitHub profile.

## Tests

```sh
npm test
```

The tests cover page structure and the Inner Circle preview's launch limitations.

## Structure

```
.
├── public/
│   ├── index.html
│   ├── inner-circle.html
│   ├── 404.html
│   ├── gallery/manifest.json
│   ├── assets/
│   │   ├── css/site.css
│   │   └── js/site.js
│   └── pages/
├── tests/
├── package.json
└── README.md
```

Once the production hostname is selected, add/update the sitemap and robots.txt with absolute production URLs.

© NiteRayder
