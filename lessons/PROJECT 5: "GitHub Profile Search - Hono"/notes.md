# Project 5: “GitHub Profile Search - Hono” — full tutorial

This lesson builds a **live GitHub user search**: as you type a username (or partial handle), results refresh using **HTMX** and a small **[Hono](https://hono.dev/)** server. The browser never talks to GitHub directly; your server fetches the [GitHub REST API](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-users), then returns **HTML fragments**—same server-driven UI idea as Project 4, with a real HTTP API behind it.

---

## What you will learn

- **`hx-get` / `hx-trigger` / `hx-target` / `hx-swap` / `hx-indicator`** — same live-search wiring as Project 4 (debounced `keyup`)
- **Hono routing** — `GET /` for the page, `GET /search` for the HTMX fragment
- **Calling an external HTTPS API from the server** — `fetch` to `api.github.com`, not from the browser
- **Rate limits** — the public Search API is unauthenticated; stay within [GitHub’s limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) (debouncing helps)
- **HTML escaping** — anything echoed from the request or API into your markup must be escaped to avoid XSS

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (for built-in `fetch` and a smooth Hono experience)
- A terminal and a browser

---

## How to run the project

From **this project folder** (the one that contains `package.json`, `src/server.ts` or `src/server.js`, and `public/index.html`—adjust names to match what you create):

1. **Install dependencies**

   ```bash
   npm install hono @hono/node-server
   ```

   If you use TypeScript, add dev tooling you prefer (`tsx`, `typescript`, etc.). A minimal JavaScript setup can run the entry file directly (`node src/server.js`) or via an npm script (as in this project’s `package.json`).

2. **Start the server**

   ```bash
   npm start
   ```

   This runs `npm run start`, which in this project executes `node src/server.js` from the `start` script in `package.json`. You can still run `node src/server.js` yourself if you prefer.

   Or with `tsx`:

   ```bash
   npx tsx src/server.ts
   ```

3. **Open the app**

   ```text
   http://127.0.0.1:3333/
   ```

4. **Try it:** type a few letters of a GitHub username. After the debounce delay, the result list under the input should update without a full page reload.

5. **Stop the server:** `Ctrl+C` in the terminal.

---

## Suggested project layout

```text
PROJECT 5: “GitHub Profile Search - Hono”/
├── package.json
├── src/
│   └── server.js          # or server.ts — Hono app + GitHub proxy
├── public/
│   ├── index.html         # Page + HTMX on the input
│   └── css/
│       └── styles.css     # Optional: layout + .htmx-request loading state
├── .gitignore
└── notes.md               # This tutorial
```

Hono can serve static files from `public/` or you can read `index.html` from disk—pick one approach and stay consistent.

---

## Big picture: what happens when you type

1. You type in an `<input>`. HTMX listens for **`keyup`**, but only fires a request when the value **changed**, and after a **debounce** (for example `delay:300ms`), so you do not hit GitHub on every keystroke.

2. HTMX requests your server:

   ```http
   GET /search?query=octo
   ```

   The parameter name matches the input’s `name` (for example `name="query"`).

3. **Hono** handles `/search`:

   - Validates and trims `query` (reject empty, cap length, allow only safe characters if you want).
   - Calls GitHub’s **search users** endpoint with **`fetch`**, over **HTTPS**.
   - Maps JSON results into an **HTML string** (fragment): avatars, login names, profile links.

4. HTMX inserts that HTML into **`#results`** with **`hx-swap="innerHTML"`**.

5. **`hx-indicator`** points at a “Loading…” element; while the request runs, HTMX adds **`htmx-request`** to that element so your CSS can show a spinner or text.

The browser never receives raw GitHub JSON for you to parse by hand—only HTML.

---

## Frontend walkthrough (`public/index.html`)

Load **HTMX** (CDN or local) and your stylesheet. The search input is conceptually wired like this:

| Attribute | Role |
|-----------|------|
| `hx-get="/search"` | GET your fragment route |
| `hx-trigger="keyup changed delay:300ms"` | Debounced live search |
| `hx-target="#results"` | Replace content inside the results region |
| `hx-swap="innerHTML"` | Swap only the inner HTML of the target |
| `hx-indicator="#loading"` | Toggle loading UI via `.htmx-request` |
| `name="query"` | Becomes `?query=...` on the request URL |

Example skeleton (adjust paths and polish as you like):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GitHub profile search</title>
  <link rel="stylesheet" href="/css/styles.css" />
  <script src="https://unpkg.com/htmx.org@1.9.12"></script>
</head>
<body>
  <main class="app">
    <h1>GitHub profile search</h1>
    <label>
      Search users
      <input
        type="search"
        name="query"
        autocomplete="off"
        placeholder="Type a username…"
        hx-get="/search"
        hx-trigger="keyup changed delay:300ms"
        hx-target="#results"
        hx-swap="innerHTML"
        hx-indicator="#loading"
      />
    </label>
    <p id="loading" class="loading" aria-live="polite">Searching…</p>
    <div id="results"></div>
  </main>
</body>
</html>
```

**Attributes on the search input (and what they connect to):**

This project has **two** HTTP requests worth keeping straight: (1) the **browser → Hono** request that HTMX builds from your attributes, and (2) the **Hono → GitHub** request your route builds with `fetch` in code. The table below sticks to **(1)** so you always know “which attribute affects which part of the URL.” The GitHub URL is **not** controlled by any `hx-*` attribute—for that second request, see **Parts of the GitHub URL (server `fetch`)** in the backend section.

**The URL HTMX sends to Hono — one example**

Imagine the page is open at `http://127.0.0.1:3333/` and you’ve typed `octo`. After the debounce, HTMX performs something equivalent to:

```text
GET http://127.0.0.1:3333/search?query=octo
```

Think of that address in pieces (junior-friendly names):

| Piece of the URL | Example from above | Set by which attribute? (or not) |
|------------------|-------------------|----------------------------------|
| **Scheme** | `http://` | **No attribute.** HTMX uses the **same scheme** as the page you’re on (here, `http:`). In production you’d often use `https:`. |
| **Host and port** | `127.0.0.1:3333` | **No attribute.** Same **origin** as the page: whatever host/port served `index.html` (your Hono `serve` port, e.g. `3333`). |
| **Path** | `/search` | **`hx-get="/search"`** — this is the only attribute that sets the **path** Hono will route (must match `app.get("/search", …)`). |
| **Query string** | `?query=octo` | **`name="query"`** on the input sets the **parameter name** (`query`). The **value** (`octo`) is whatever is in the box when the request fires. HTMX adds `?name=value` for GET. |
| **HTTP method** | `GET` | **`hx-get`** means “use GET.” (Not a separate word in the URL, but it’s how the request is made.) |

Nothing in the URL names `#results` or `#loading`: **`hx-target`**, **`hx-swap`**, and **`hx-indicator`** only affect **what happens in the browser after** Hono responds (where to paste HTML, loading CSS). They do **not** change the request URL.

| Attribute | Value (in this skeleton) | What it does / where the value comes from |
|-----------|--------------------------|-------------------------------------------|
| `type` | `search` | Plain HTML: browser search styling and behavior (clear button, etc.). **Does not appear in the request URL.** |
| `name` | `query` | Plain HTML: the form control’s **parameter name**. For this `hx-get` request, HTMX appends a **query string** to the URL: `?query=<what you typed>`. In the table above, that’s the **`?query=…`** piece—**not** the path `/search`. Hono reads the value with `c.req.query("query")`. The string **`query`** in code must match **`name="query"`** in HTML. |
| `autocomplete` | `off` | Plain HTML: hints the browser not to clutter the UI with its own suggestions. **Not sent in the URL.** |
| `placeholder` | `Type a username…` | Plain HTML: grey hint text in the field. **Never sent to the server** and **not** in the URL. |
| `hx-get` | `/search` | HTMX: the **path** of the request (after host/port). Must match your Hono route exactly, e.g. `app.get("/search", …)` (no `/search/` unless you define it). This is only **where** the request goes; the search text is **not** the path—it’s the **`query=`** part from **`name`**. |
| `hx-trigger` | `keyup changed delay:300ms` | HTMX: **when** to send the request. **Does not add anything to the URL**; it only controls timing. Hono never sees `hx-trigger`. |
| `hx-target` | `#results` | HTMX: where to put the **response HTML** in the page. **Not part of the request URL.** Hono returns a fragment; the browser uses this selector to find the insertion point. |
| `hx-swap` | `innerHTML` | HTMX: **how** to merge the response into the target (here, replace **inside** `#results`). **Not part of the request URL.** |
| `hx-indicator` | `#loading` | HTMX: which element gets **`htmx-request`** while waiting. **Not part of the request URL**; purely client-side UI. |

##### `hx-get` and Hono: `GET /search`

`hx-get="/search"` means HTMX sends a normal browser **`GET`** whose **path** is **`/search`**. On the server, Hono handles that path with a matching **`GET`** handler. The **`?query=…`** part of the **same** URL comes from **`name="query"`**—the name in the markup must match what you read in the handler:

```javascript
app.get("/search", async (c) => {
  const raw = c.req.query("query") ?? "";
  const query = raw.trim();
  if (!query) {
    return c.html('<p class="empty">Type to search GitHub users.</p>');
  }
  // …validate, fetch GitHub, build HTML…
});
```

So: **`hx-get`** picks the **route**; **`name`** picks the **query parameter name** (`c.req.query("query")`); the **parameter value** is whatever is currently in the input when the request fires. If `query` is empty after trim, this handler still returns **HTML** (the “Type to search…” paragraph). HTMX then inserts that fragment into **`#results`** because of **`hx-target`** and **`hx-swap`**, same as for a successful result list.

**Loading state:** hide `.loading` by default; show it when it has **`.htmx-request`** (same pattern as Project 4).

---

## Backend walkthrough (Hono)

### Responsibilities

1. **`GET /`** — serve the HTML page (static file or inline).
2. **`GET /search`** — read `query`, call GitHub, return **`text/html`** fragment.
3. **Static assets** — CSS under `/css/...` if you use separate files.

### GitHub request (server-side)

Use the documented search endpoint over HTTPS, for example:

```http
GET https://api.github.com/search/users?q=octocat+in:login&per_page=10
```

### Parts of the GitHub URL (server `fetch`)

After Hono receives `GET /search?query=…` from the browser, **your handler** (not HTMX) calls **`fetch(url)`** with a **different** URL aimed at GitHub. None of the pieces below come from `hx-get` or `name` directly—they come from **strings and values you assemble in `server.js`** (including the `query` value you read off the incoming request).

| Piece of the URL | In the example above | What to tell a junior |
|------------------|----------------------|------------------------|
| **Scheme** | `https://` | Must be **HTTPS** for `api.github.com`. Your code should hardcode `https://` (never `http://` for this API). |
| **Host** | `api.github.com` | GitHub’s API server name—fixed in your template string. |
| **Path** | `/search/users` | The REST **resource** for “search users”—fixed in your string; not the same as **your** app’s path `/search`. |
| **Query string** | `q=octocat+in:login&per_page=10` | **`q`** is required by GitHub: you build it from the user’s `query` (e.g. `` `${query} in:login` ``) and **`encodeURIComponent`** so spaces and special characters are safe. **`per_page=10`** limits how many hits you ask for—your choice in code. |

So: **browser URL** = HTMX + attributes (`hx-get`, `name`). **GitHub URL** = your server code + the `query` parameter you already parsed from the browser request.

Send headers:

- **`Accept: application/vnd.github+json`**
- **`User-Agent: your-app-name`** (GitHub asks for a UA string)

Parse the JSON, then build HTML. On API errors (403, 422, network), return a **safe** HTML message (“GitHub rate limit—try again later” / “Invalid query”) rather than throwing an unhandled stack trace at the client.

### Example Hono sketch (JavaScript)

This is a structural example—adapt file paths, port, and error handling to your project.

```javascript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

app.get("/search", async (c) => {
  const raw = c.req.query("query") ?? "";
  const query = raw.trim();
  if (!query) {
    return c.html('<p class="empty">Type to search GitHub users.</p>');
  }
  if (query.length > 256) {
    return c.html('<p class="empty">Query is too long.</p>');
  }

  const url =
    "https://api.github.com/search/users?q=" +
    encodeURIComponent(`${query} in:login`) +
    "&per_page=10";

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "htmx-github-search-tutorial",
  };

  let res;
  try {
    res = await fetch(url, { headers });
  } catch {
    return c.html('<p class="empty">Network error talking to GitHub.</p>');
  }

  if (!res.ok) {
    return c.html(
      '<p class="empty">GitHub returned an error. Try again in a moment (rate limits).</p>'
    );
  }

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0) {
    return c.html(
      `<p class="empty">No users found for ${escapeHtml(query)}.</p>`
    );
  }

  const cards = items
    .map((u) => {
      const login = escapeHtml(u.login);
      const avatar = escapeHtml(u.avatar_url);
      const profile = escapeHtml(u.html_url);
      return `<li class="user-card">
        <img src="${avatar}" alt="" width="40" height="40" loading="lazy" />
        <div>
          <strong>${login}</strong>
          <a href="${profile}" target="_blank" rel="noopener noreferrer">Profile</a>
        </div>
      </li>`;
    })
    .join("");

  return c.html(
    `<div class="result-card">
      <strong>Results for ${escapeHtml(query)}</strong>
      <ul class="user-list">${cards}</ul>
    </div>`
  );
});

// After API routes: serve `public/index.html`, `public/css/…`, etc. (`root` is relative to `process.cwd()`).
app.use("/*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: 3333 });
console.log("Listening on http://127.0.0.1:3333/");
```

**Security notes:**

- **Rule (validate external input):** trim length, reject absurd input, and **escape** anything you interpolate into HTML (`escapeHtml` on login strings used as text; URLs from GitHub should still be treated as strings—escape attributes and prefer `https:` links only if you add stricter validation).
- **Rule (HTTPS to third parties):** only use `https://api.github.com`, not `http://`.

---

## Styling notes (optional `public/css/styles.css`)

Reuse the Project 4 ideas:

- **`.app`** — centered column, card, readable max-width.
- **`.result-card` / `.user-list` / `.user-card`** — simple flex rows for avatar + text.
- **`.loading`** hidden by default; **`.loading.htmx-request`** visible—matches **`hx-indicator`**.

---

## Mental model: HTMX + Hono

- **HTMX** owns *when* to request and *where* to put HTML.
- **Hono** owns *routing*, *calling GitHub*, and *shaping HTML*.
- **GitHub** owns the source of truth for user data; your app is a thin, HTML-first adapter.

---

## Quick reference: sample request/response

Browser to your app:

```http
GET /search?query=deno
```

Your app to GitHub (conceptually):

```http
GET https://api.github.com/search/users?q=deno+in:login&per_page=10
```

Fragment returned to HTMX (structure only):

```html
<div class="result-card">
  <strong>Results for deno</strong>
  <ul class="user-list">… cards …</ul>
</div>
```

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| 403 from GitHub or errors often | **Rate limits** on unauthenticated search; wait, rely on debouncing, or search less aggressively. |
| CORS errors in the browser | HTMX should call **your** `/search`, not `api.github.com` directly. Fix `hx-get` target. |
| “Searching…” never stops | Open devtools **Network**; look for 500s. Check server logs and `fetch` error branches. |
| HTML shows raw `&lt;` | You double-escaped; escape once at output boundaries. |
| Static CSS 404 | Confirm `serveStatic` root and file paths; use full URL `http://127.0.0.1:3333/` not `file://`. |

---

## Further reading

- [Hono — Getting started](https://hono.dev/docs/getting-started/nodejs)
- [GitHub REST: Search users](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-users)
- [HTMX: `hx-trigger`](https://htmx.org/attributes/hx-trigger/)
- [HTMX: `hx-indicator`](https://htmx.org/attributes/hx-indicator/)
