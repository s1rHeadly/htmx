# HTMX cheatsheet

Quick copy-paste patterns while you build. Official docs: [htmx.org](https://htmx.org) and [attribute reference](https://htmx.org/reference/).

---

## Setup

```html
<script src="https://unpkg.com/htmx.org@1.9.12"></script>
```

Pin a version in production; upgrade deliberately.

---

## Request verbs & URL

| Attribute | Meaning |
| ------------ | ------- |
| `hx-get`     | `GET`   |
| `hx-post`    | `POST`  |
| `hx-put`     | `PUT`   |
| `hx-patch`   | `PATCH` |
| `hx-delete`  | `DELETE`|

```html
<button hx-get="/fragments/user-card">Load</button>
<form hx-post="/comments" hx-target="#list" hx-swap="beforeend">...</form>
```

---

## Where the response goes

| Attribute   | Meaning |
| ----------- | ------- |
| `hx-target` | CSS selector for the swap target (default: `this` element). |

```html
<div id="out"></div>
<button hx-get="/partial" hx-target="#out">Go</button>
```

---

## How the response is inserted

| `hx-swap` | Effect |
| ----------- | ------ |
| `innerHTML` | **Default.** Replace children of target. |
| `outerHTML` | Replace the target element itself. |
| `beforebegin` | Insert before target as sibling. |
| `afterbegin`  | Insert as first child. |
| `beforeend`   | Insert as last child (append). |
| `afterend`    | Insert after target as sibling. |
| `delete`      | Delete target (no insert). |
| `none`        | Do not swap (use with events/OOB). |

**Timing / UX modifiers** (append to value, e.g. `innerHTML swap:1s`):

- `swap:300ms` — delay before swap
- `settle:100ms` — settle timing (CSS transitions)
- `scroll:top` / `scroll:bottom` — scroll target or window
- `show:top` — scroll swapped content into view

```html
<button hx-get="/row" hx-target="#tbody" hx-swap="beforeend">Add row</button>
```

---

## When the request fires

| `hx-trigger` (examples) | When |
| ----------------------- | ---- |
| `click` | Default on many interactive elements. |
| `submit` | Default on `form`. |
| `keyup` | Every keyup (often too chatty). |
| `keyup changed delay:300ms` | Debounced; only if value changed. |
| `load` | Once when element is loaded. |
| `revealed` | When scrolled into view (infinite scroll). |
| `every30s` | Polling. |
| `click from:#btn` | Listen on another element. |

```html
<input
  name="q"
  hx-get="/search"
  hx-trigger="keyup changed delay:300ms"
  hx-target="#results"
/>
```

**Modifiers:** `once`, `changed`, `delay:500ms`, `throttle:1s`, `from:body`, `consume`, etc.

---

## Parameters & form data

- **`name` on inputs** — included automatically for the owning `form` or the element itself.
- **`hx-include`** — extra selectors whose values are merged into the request.

```html
<input id="q" name="q" hx-get="/search" hx-include="#filters" hx-target="#out" />
<div id="filters">
  <select name="sort">...</select>
</div>
```

- **`hx-vals`** — static or JS expression for extra parameters (use carefully; avoid untrusted expressions).

```html
<button hx-get="/go" hx-vals='{"source":"cheatsheet"}'>Go</button>
```

- **`hx-params`** — `all`, `none`, or whitelist (`"q,sort"`).

---

## Boost links & forms (full page → partial feel)

```html
<body hx-boost="true">
```

Intercepts same-origin GET/POST navigations; swaps `body` inner HTML. Adjust with `hx-boost="false"` on specific links/forms.

---

## Loading state

```html
<button hx-get="/slow" hx-indicator="#spinner">Save</button>
<div id="spinner" class="htmx-indicator">Loading…</div>
```

HTMX adds class `htmx-request` to the **requesting element** and to **`hx-indicator`** targets while in flight. Style `.htmx-indicator` hidden by default, show when ancestor has `.htmx-request` if you prefer.

---

## Out-of-band swaps (`hx-swap-oob`)

Response can update **multiple** regions:

```html
<!-- fragment returned by server -->
<div id="main" hx-swap-oob="true">...</div>
<div id="cart-count" hx-swap-oob="true">3</div>
```

Use when one response must refresh several unrelated nodes.

---

## Picking part of the response

- **`hx-select`** — take only matching elements from the response (CSS selector).

```html
<button hx-get="/full-page" hx-select="#snippet" hx-target="#here" hx-swap="innerHTML">
  Load snippet only
</button>
```

---

## URL & history

| Attribute | Meaning |
| ---------------- | ------- |
| `hx-push-url`    | `true` — push current URL to history; or a URL string. |
| `hx-replace-url` | Replace current history entry. |
| `hx-disable`     | Disable HTMX processing on this element. |

```html
<a hx-get="/page/2" hx-target="#content" hx-push-url="true">Page 2</a>
```

---

## Headers & CSRF

```html
<form
  hx-post="/api/item"
  hx-headers='{"X-CSRF-Token":"abc"}'
>
```

Prefer meta tag + small script, or server-rendered token in `hx-headers`. **Never** hardcode real secrets in static HTML.

---

## Confirm & disable during request

```html
<button hx-delete="/item/1" hx-confirm="Delete this item?">Delete</button>
<button hx-post="/go" hx-disabled-elt="this">Submit once</button>
```

---

## Sync parallel requests

```html
<button hx-post="/a" hx-sync="#form:abort">...</button>
```

`hx-sync` avoids race conditions (e.g. `this:replace`, `:abort`, `:queue`).

---

## Useful response headers (server → HTMX)

| Header | Effect |
| ------ | ------ |
| `HX-Redirect` | Browser navigates to URL. |
| `HX-Refresh` | `true` — full page refresh. |
| `HX-Trigger` | JSON map of client events to fire after swap. |
| `HX-Location` | Client-side redirect with HTMX. |
| `HX-Push-Url` | Push URL after swap. |

---

## Snippets that cover80% of work

**Debounced search**

```html
<input
  type="search"
  name="query"
  hx-get="/search"
  hx-trigger="input changed delay:300ms"
  hx-target="#results"
  hx-indicator="#results-spinner"
/>
```

**Form → replace panel**

```html
<form hx-post="/contact" hx-target="#panel" hx-swap="innerHTML">
  <!-- fields -->
  <button type="submit">Send</button>
</form>
<div id="panel"></div>
```

**Click to load more (append)**

```html
<button
  hx-get="/items?page=2"
  hx-target="#list"
  hx-swap="beforeend"
  hx-select="#list > *"
>
  More
</button>
```

*(Adjust `hx-get` URL via server-rendered next-page link or `hx-vals`.)*

**Infinite scroll (outline)**

```html
<div
  hx-get="/items?page=2"
  hx-trigger="revealed"
  hx-swap="outerHTML"
></div>
```

---

## Debugging

- `htmx.logAll()` in console (development only).
- DevTools **Network**: requests are normal XHR/fetch; check **Response** is HTML you expect.
- Add `hx-ext="debug"` with debug extension in dev if you use extensions.

---

## Gotchas (fast)

1. **Return HTML fragments** from HTMX endpoints unless you use `hx-select` / full-page patterns.
2. **Escape user input** in HTML you generate server-side (XSS).
3. **Validate on the server** — HTMX is not a security boundary.
4. **IDs must be unique** if you rely on `hx-target` / OOB swaps.
5. **403 / redirects** — handle auth the same as non-HTMX routes; consider `HX-Redirect` for login.
