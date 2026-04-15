# HTMX in one place

This is the single notes file for this folder. It combines the earlier markdown guide and the plain-text `notes.js` draft (same ideas, one narrative) so nothing contradicts itself while you learn.

**Quick reference:** [cheatsheet.md](./cheatsheet.md) (same `notes/` folder)—attributes, triggers, and copy-paste snippets while you code.

**If you are new here:** read top to bottom once, then skim the [Worked example: live search](#worked-example-live-search-no-extra-javascript) section with the lesson files open.

---

## What HTMX is (junior-friendly)

HTMX is a small library that adds **behavior to HTML with attributes**. Instead of writing JavaScript that calls `fetch`, parses data, and updates the DOM, you declare **what URL to call**, **where to put the response**, and **when**—right on the element.

**Traditional approach:**

```javascript
fetch("/api/data")
  .then((res) => res.text())
  .then((html) => {
    document.querySelector("#box").innerHTML = html;
  });
```

**HTMX approach:**

```html
<button hx-get="/api/data" hx-target="#box" hx-swap="innerHTML">
  Load data
</button>

<div id="box"></div>
```

Same outcome: the user clicks, the browser gets HTML from the server, and a part of the page updates. HTMX wires that up for you.

---

## The mental model (remember this)

Think of HTMX as a pipeline:

1. **Something happens** on an element (click, keyup, page load, etc.).
2. The browser sends an **HTTP request** (`GET`, `POST`, …) to a URL.
3. The **server responds with HTML** (usually a *fragment*, not a full page).
4. HTMX **inserts that HTML** into the page at the target you chose.

So: **HTML triggers requests → server returns HTML → HTMX swaps it into the DOM.**

You do *not* have to use JSON for this flow (you can, with extensions or `hx-swap` strategies, but the default happy path is HTML in, HTML out). You do *not* need React, Vue, or another SPA framework for this pattern.

This style is often called **server-driven UI**: the server decides what the next piece of UI looks like; the client mostly displays it.

---

## How it works (without magic)

- You include the HTMX script (e.g. from a CDN or your bundle).
- HTMX finds elements with `hx-*` attributes and attaches the right listeners.
- When a trigger fires, it performs the request (similar to `fetch` / `XMLHttpRequest`).
- When the response arrives, it parses the HTML and applies the swap (`innerHTML`, `outerHTML`, etc.) to the target element.

Your job as a junior developer is mostly: **good URLs**, **good HTML responses**, and **clear targets**.

---

## The four attributes to learn first

### 1. `hx-get` / `hx-post` (and friends)

These define **which HTTP method** and **which URL** to call.

```html
<button hx-get="/hello">Click me</button>
```

`hx-post`, `hx-put`, `hx-patch`, `hx-delete` work the same idea for other verbs.

### 2. `hx-target`

**Where** the response should go—a CSS selector (often an `id`).

```html
<div id="result"></div>

<button hx-get="/hello" hx-target="#result">Load</button>
```

### 3. `hx-swap`

**How** the response is inserted relative to the target.

| Value       | Typical meaning                          |
| ----------- | ---------------------------------------- |
| `innerHTML` | Default—replace the *inside* of the target |
| `outerHTML` | Replace the target element itself |
| `beforeend` | Insert just before the end of the target (good for appending list items) |

```html
<div id="result"></div>

<button hx-get="/hello" hx-target="#result" hx-swap="innerHTML">Load</button>
```

### 4. `hx-trigger`

**When** the request runs. Default for many elements is a sensible one (e.g. `click` on a button). For inputs you often want debounced key events:

```html
<input
  hx-get="/search"
  hx-trigger="keyup changed delay:500ms"
  hx-target="#results"
/>
```

`delay:500ms` means “wait until typing pauses” so you do not DDoS your own search endpoint on every keypress.

---

## What the server should return

For the usual HTMX flow, endpoints return **HTML snippets**, not JSON.

Example response body:

```html
<p>Hello from the server!</p>
```

Your page already has a container; HTMX drops this fragment in.

### Tiny practice pattern

**HTML:**

```html
<button hx-get="/hello" hx-target="#box" hx-swap="innerHTML">Say Hello</button>

<div id="box">Waiting...</div>
```

**Server:** respond with HTML for `/hello`, e.g. `<p>Hello from the server!</p>`.

---

## Server-driven UI vs “traditional” frontend

| Typical SPA / heavy JS approach | HTMX-style server-driven UI |
| ------------------------------- | --------------------------- |
| Client requests JSON | Client requests HTML fragments |
| Client renders templates / components | Server renders templates |
| Client owns a lot of UI state | Server can own more of “what to show next” |
| More JavaScript on the page   | Less custom JS for the same interactions |

Neither is “always right”—but HTMX is a strong fit when you already render pages on the server (PHP, Node templates, CMS, etc.) and want **partial updates** without building a full client app.

---

## Worked example: live search (no extra JavaScript)

The lesson **PROJECT 4: “Live Search (No JS)”** is a concrete usage sample in this repo.

**Frontend** (`lessons/PROJECT 4: “Live Search (No JS)”/index.html`): an `<input>` uses `hx-get`, `hx-trigger`, `hx-target`, `hx-swap`, and `hx-indicator` so typing triggers `/search` and fills `#results`.

**Backend** (`lessons/PROJECT 4: “Live Search (No JS)”/server.js`): the `/search` handler reads the query string, filters a list, and returns a **small HTML string** (a “card” with a `<ul>`). That is the whole idea—**the server builds the HTML for the results list**; the browser does not loop in JavaScript to render it.

Things to notice as a learner:

- `name="query"` pairs with `GET` so the value is sent as `?query=...` (standard forms behavior HTMX reuses).
- `hx-indicator="#loading"` ties into a loading UI without you writing show/hide logic by hand.
- The server uses `escapeHtml` when echoing user input back into HTML—when you build real endpoints, **always** escape or sanitize so you do not introduce XSS.

Run that lesson with `node server.js` from its folder and watch the network tab: each debounced keyup is one request returning HTML.

---

## Real-world-style uses (where teams actually reach for HTMX)

- **Live search and filters** – Results lists, faceted navigation, “typeahead” panels (like the lesson above).
- **Inline editing** – Click “Edit”, swap a row for a form; submit returns the read-only row HTML.
- **Pagination “load more”** – Next page returns rows; `hx-swap="beforeend"` appends to a list.
- **Modals / drawers** – Load HTML for a panel into a container; close by swapping back empty content or a fragment from the server.
- **CMS and form posts** – Submit a form; server returns a thank-you block or validation errors as HTML (next section).

---

## CMS example: Squiz Matrix + HTMX

If you work in Squiz Matrix (or similar), you can post to an asset URL and replace part of the page with the asset’s HTML response—no full reload.

```html
<form method="post" hx-post="./?a=29704" hx-push-url="false">
  %globals_asset_contents_raw:29704%
</form>
```

| Piece                   | Meaning |
| ----------------------- | ------- |
| `hx-post="./?a=29704"` | HTMX sends a `POST` to that Squiz asset URL |
| Server response         | HTML (e.g. thank-you or next step) |
| HTMX | Swaps that HTML into the form’s default target behavior (or adjust with `hx-target` / `hx-swap` as needed) |
| `hx-push-url="false"`  | Avoid changing the browser URL for this submission |

Pattern: **your CMS keeps authoring content; HTMX keeps the UX feeling like a modern app.**

---

## Mental model check: “who owns the next state?”

- **Traditional client-heavy flow:** the browser might keep a lot of client state (“what message comes next?”).
- **HTMX-friendly flow:** each interaction can ask the server, “what should this part of the page look like *now*?” The server answers with HTML.

So the cycle is:

1. User acts (click, type, …)  
2. Request goes out  
3. Server decides the next representation  
4. HTMX injects it  

No hand-written `fetch` + `innerHTML` for that path—**the attributes are the script**.

---

## When HTMX is a great fit / when to pause

**Great fit:**

- You already like server templates and want **sprinkles** of interactivity.
- Your team wants **less custom JavaScript** and **fewer client build steps** for medium-dynamic pages.
- SEO and first paint still matter; you are not trying to build a highly offline, app-like SPA.

**Pause and evaluate:**

- Very complex client-only state (rich canvas, multiplayer games, huge client caches) may still want a dedicated frontend framework.
- If every interaction returned a **full** HTML document instead of **fragments**, you might feel sluggish—design endpoints for **partial** updates.

---

## Quick reference

- **Include:** `<script src="https://unpkg.com/htmx.org@1.9.12"></script>` (or pin a version you trust).
- **Defaults:** many elements default to sensible triggers; override with `hx-trigger` when needed.
- **Responses:** prefer **HTML fragments** for `hx-swap` into a container.
- **Security:** treat HTMX requests like normal form posts—validate on the server, escape output in HTML, use HTTPS in production.

For hands-on practice, work through the lessons in `lessons/` starting with simple `hx-get` swaps, then open **PROJECT 4** for a realistic search UX.
