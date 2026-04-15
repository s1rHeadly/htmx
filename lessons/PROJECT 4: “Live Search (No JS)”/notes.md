# Project 4: “Live Search (No JS)” — full tutorial

This lesson builds a **live search** box: results refresh as you type, using **HTMX** and a tiny **Node.js** server. You do not write `addEventListener`, `fetch`, or client-side rendering logic.

---

## What you will learn

- **`hx-get`** — issue a GET when HTMX decides it is time
- **`hx-trigger`** — which events fire the request (and **debouncing** with `delay`)
- **`hx-target` / `hx-swap`** — where the response HTML goes
- **`hx-indicator`** — show a loading state while a request runs
- **Server-driven UI** — the server returns **HTML fragments**, not JSON

---

## How to run the project

1. **Prerequisites:** [Node.js](https://nodejs.org/) installed (any recent LTS is fine). This project uses only built-in modules (`http`, `fs`, `path`).

2. **Start the server** from **this project folder** (the one that contains `server.js` and `index.html`):

   ```bash
   cd "/path/to/htmx/lessons/PROJECT 4: “Live Search (No JS)”"
   node server.js
   ```

3. **Open the app** in your browser:

   ```text
   http://127.0.0.1:3333/
   ```

   The server logs the same URL when it starts.

4. **Try it:** type in the search box (for example `ap`, `berry`, `no`). After a short pause while you type, the list under the box updates without a full page reload.

5. **Stop the server:** press `Ctrl+C` in the terminal.

---

## Project layout

```text
PROJECT 4: “Live Search (No JS)”/
├── index.html          # Page + HTMX attributes on the input
├── server.js           # HTTP server: static files + /search
├── notes.md            # This tutorial
└── css/
    └── styles.css      # Layout, result card, loading indicator
```

---

## Big picture: what happens when you type

1. You type in the `<input>`. On `keyup` (and when the value **changed**), HTMX waits **300 ms** (`delay:300ms`) so it does not spam the server on every keystroke.

2. HTMX sends a request like:

   ```http
   GET /search?query=berry
   ```

   The query parameter name is `query` because the input has `name="query"`.

3. **`server.js`** runs `searchFragment(...)`: it trims the string, filters a static list of fruit names, and returns a **string of HTML** (a fragment).

4. HTMX receives that HTML and puts it **inside** `#results` (`hx-swap="innerHTML"`), replacing whatever was there before.

5. While the request is in flight, HTMX adds the class **`htmx-request`** to the element referenced by **`hx-indicator`** (`#loading`). Your CSS shows “Loading…” only during that time.

No JSON parsing, no template engine on the client — just HTML over the wire.

---

## Frontend walkthrough (`index.html`)

The page loads:

- **`./css/styles.css`** for styling
- **HTMX** from a CDN: `https://unpkg.com/htmx.org@1.9.12`

The search input is wired like this (conceptually):

| Attribute | Role |
|-----------|------|
| `hx-get="/search"` | GET the search endpoint |
| `hx-trigger="keyup changed delay:300ms"` | Fire on keyup when the value changed; **wait 300 ms** after the last event before sending |
| `hx-target="#results"` | Put the response into the element with `id="results"` |
| `hx-swap="innerHTML"` | Replace the **inside** of `#results`, not the outer div |
| `hx-indicator="#loading"` | While loading, HTMX toggles `htmx-request` on `#loading` |
| `name="query"` | HTMX includes the field as `?query=...` in the URL |

The **`#loading`** div is hidden by default (`.loading { display: none }`) and shown when it has **`.htmx-request`** (see `css/styles.css`).

---

## Backend walkthrough (`server.js`)

The server is a single **`http.createServer`** handler.

### Route: `GET /search`

- Reads **`query`** from the URL (`URLSearchParams`).
- Returns **`Content-Type: text/html; charset=utf-8`**.
- Body is whatever **`searchFragment(query)`** returns:
  - **Empty / whitespace-only query:** a friendly “Type to start searching…” message.
  - **Matches:** a **`.result-card`** with a heading and a `<ul>` of `<li>` items.
  - **No matches:** “No results found.”

### Data

Matches are computed from a constant array **`FRUITS`** (apples, berries, etc.). In a real app this would be a database or search service; here it keeps the lesson focused on HTMX.

### Escaping user input (`escapeHtml`)

Anything taken from the request that is echoed back inside HTML goes through **`escapeHtml`**. That prevents **cross-site scripting (XSS)** if someone types characters like `<` or `&` in the search box. The displayed query in the “Results for …” heading is escaped; list items are escaped too.

### Static files

For other **`GET`** requests, the server maps the URL path to a file under the project directory:

- `/` → `index.html`
- `/css/styles.css` → the stylesheet, and other static assets.

**`resolveStaticPath`** resolves the path and checks that the file is **inside** the project root (so `..` in the path cannot escape upward). Unknown files get **404**; bad paths get **403**.

Non-GET methods get **405**.

---

## Styling notes (`css/styles.css`)

- **`.app`** — centered card, shadow, padding.
- **`#results`** — spacing above the result area.
- **`.result-card`** — light background, border, hover lift.
- **`.loading` / `.loading.htmx-request`** — loading line only visible during HTMX requests.
- **`.empty`** — muted text for empty and no-results states.

---

## Mental model: “No JS”

You still load the **HTMX library** (JavaScript). The point of **“No JS”** in the title is: **you do not write custom JavaScript** to glue the search box to the server or to update the DOM. Declarative attributes handle the lifecycle; the server owns the markup of the results.

---

## Quick reference: request/response examples

After debounce, typing **`ber`** might produce:

```http
GET /search?query=ber
```

Response body (simplified):

```html
<div class="result-card">
  <strong>Results for &quot;ber&quot;</strong>
  <ul>
    <li>Blueberry</li>
    <li>Raspberry</li>
    <li>Strawberry</li>
  </ul>
</div>
```

HTMX inserts that HTML into **`#results`**.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Blank page or 404 for CSS | Server must be running; open via **`http://127.0.0.1:3333/`** so `/css/styles.css` is served by `server.js`, not `file://`. |
| Nothing happens when typing | Confirm HTMX script loads (network tab), and console for errors. |
| “Connection refused” | Run **`node server.js`** from the correct folder; default port is **3333**. |
| Results never update | Ensure **`hx-target`** matches **`id="results"`** and the server returns HTML (not an error page). |

---

## Further reading

- [HTMX: `hx-trigger`](https://htmx.org/attributes/hx-trigger/) — modifiers like `delay`
- [HTMX: `hx-indicator`](https://htmx.org/attributes/hx-indicator/) — loading states
