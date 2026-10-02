# PNYX waitlist site

Static, no build step: `index.html`, `styles.css`, `main.js`, plus the embeddable
countdown `widget.html`. Hosted as a Render static site (`render.yaml`).

## Files

| File | What it is |
|---|---|
| `launch.js` | The launch moment (2 Nov 2026, 00:00 CET). Change the date here only. |
| `flip.js` | Animated countdown digits, shared by the site and the widget. |
| `main.js` | Hero crest, countdown, Values-grid demo, grid list, signup form. `WAITLIST_ENDPOINT` at the top. |
| `widget.html` | Embeddable countdown card — embed instructions are in its header comment. |
| `assets/animals/` | Downscaled copies of `pnyx-native/assets/images/animals`. |

Grid names, colours and animals in `main.js` are copied from
`pnyx-native/src/lib/grids.ts` — update both if those change.

## Where signups go

The form POSTs `{ email, source }` to `pnyx-backend`'s `POST /waitlist`, which
stores it in the Supabase `waitlist` table (migration `0016_waitlist.sql`). The
table has RLS on and no policies, so only the backend can touch it. To see the
list: Supabase dashboard → Table Editor → `waitlist` → Export to CSV.

The backend only accepts browser calls from origins in its `ALLOWED_ORIGINS`
env var. The site's address (and any custom domain) must be listed there, or
every signup fails with a CORS error.

## Run locally

```bash
python -m http.server 5180   # then open http://localhost:5180
```

Serve it over http — opened as a `file://` page, the crest art won't render
(CSS masks need a same-origin image). Locally, signups hit the production API
and are refused by CORS unless `http://localhost:5180` is in `ALLOWED_ORIGINS`;
set `WAITLIST_ENDPOINT = ""` in `main.js` to keep them in the browser instead.
