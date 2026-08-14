# Silvies Valley Ranch Showdown — Trip Site

Static website for the **Silvies Valley Ranch Showdown** golf trip
(Sept 10–13, 2026 · Seneca, Oregon). Plain HTML/CSS — no build step, no framework.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Landing page — hero, stats, roster, golf snapshot, links to Agenda & Financials |
| `agenda.html` | Full four-day itinerary, golf sessions, optional adventures, Cowboy Dinner |
| `financials.html` | Lodging reimbursement ledger — per-person balances, totals, Venmo button + QR |
| `assets/` | `style.css`, embedded fonts (`fonts/`), and images (`img/`) |

## Preview locally
Just open `index.html` in a browser, or run a tiny local server:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Edit with Claude Code
From this folder:
```bash
claude
```
Then ask for changes (e.g. "mark Reed McNeil as paid in full", "add a hotel map to the agenda").

## Publish + auto-update (GitHub → Netlify)
One-time setup:
1. Create an empty GitHub repo (e.g. `silvies-showdown`).
2. Push this folder:
   ```bash
   git remote add origin https://github.com/<you>/silvies-showdown.git
   git branch -M main
   git push -u origin main
   ```
3. In Netlify: **Add new site → Import an existing project → GitHub →** pick the repo.
   Build command: *(leave blank)*  ·  Publish directory: `.`
4. Deploy. Netlify gives you a URL (rename under **Site settings → Change site name**).

After that, **every `git push` auto-deploys** the live site in ~30 seconds:
```bash
git add -A && git commit -m "Update balances" && git push
```

## Updating the financials
Payments are edited in `financials.html`:
- The **"Who Owes What"** table (each guy's Paid / Remaining / status chip).
- The summary tiles: **Reimbursed to James** and **Still Owed to James**.
- The progress bar `width:` percentage.

Lodging total is fixed at **$5,805.93** (8 guests, ≈ $725.74 each). Only the
reimbursement figures change as people pay James.

## Notes
- Golf & activity pricing is intentionally marked *Pending confirmation* until verified with Silvies.
- The official Silvies Valley Ranch logo (`assets/img/logo.png`) is used unaltered alongside the Showdown crest.
