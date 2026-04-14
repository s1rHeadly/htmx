# HTMX notes

Companion documentation for `notes.js` — a short guide to what HTMX is, core attributes, and how it fits Squiz Matrix workflows.

---

## What HTMX actually is (simple idea)

HTMX lets you **add dynamic behavior to HTML using attributes** instead of writing JavaScript.

### Traditional approach

```javascript
fetch("/api/data")
  .then(res => res.text())
  .then(html => document.querySelector("#box").innerHTML = html);
```

### HTMX approach

```html
<button hx-get="/api/data" hx-target="#box" hx-swap="innerHTML">
  Load data
</button>

<div id="box"></div>
```

That’s it.

---

## Core mental model

**HTMX** = *HTML triggers requests → server returns HTML → HTMX swaps it into the page*

- No JSON required (unless you want it).
- No SPA framework needed.

---

## The four most important HTMX attributes

### 1. `hx-get` / `hx-post`

Makes a request.

```html
<button hx-get="/hello">Click me</button>
```

### 2. `hx-target`

Where the response goes.

```html
<div id="result"></div>

<button hx-get="/hello" hx-target="#result">
  Load
</button>
```

### 3. `hx-swap`

How content is inserted.

Common values:

| Value       | Role (typical)                          |
| ----------- | --------------------------------------- |
| `innerHTML` | Default — replace inside the target     |
| `outerHTML` | Replace the target element itself       |
| `beforeend` | Insert before the end of the target     |

Example:

```html
<div id="result"></div>

<button
  hx-get="/hello"
  hx-target="#result"
  hx-swap="innerHTML">
  Load
</button>
```

### 4. `hx-trigger`

When the request fires.

```html
<input
  hx-get="/search"
  hx-trigger="keyup changed delay:500ms"
  hx-target="#results">
```

---

## Squiz Matrix + HTMX example

```html
<form
  method="post"
  hx-post="./?a=29704"
  hx-push-url="false"
>
  %globals_asset_contents_raw:29704%
</form>
```

What this means:

| Piece                  | Meaning                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `hx-post="./?a=29704"` | HTMX sends a POST to the Squiz asset URL                                |
| Server response        | HTML (e.g. thank-you page asset)                                        |
| HTMX behavior          | Replaces the form content with that HTML — **no full page reload**      |

---

## Important concept: server-driven UI

| Traditional JS             | HTMX                               |
| -------------------------- | ---------------------------------- |
| You control DOM updates    | Server returns HTML fragments      |
| You parse JSON             | HTMX inserts them into the DOM     |
| You manually render UI     | —                                  |

This pattern is **server-driven UI** (not client-driven UI).

---

## Tiny practice example

### HTML

```html
<button
  hx-get="/hello"
  hx-target="#box"
  hx-swap="innerHTML">
  Say Hello
</button>

<div id="box">Waiting...</div>
```

### Server response (important)

Your endpoint should return **HTML**, for example:

```html
<p>Hello from the server 👋</p>
```

Not JSON.

---

## Why HTMX fits CMS-driven work

For Matrix, forms, and dynamic UI, HTMX helps you:

- Avoid writing lots of event listeners
- Avoid `fetch` boilerplate
- Avoid painful client/server state syncing
- Work naturally with server templates (e.g. Squiz)

It’s a strong fit for **CMS-driven sites**.

---

## Mental model check (echo / fragment flow)

When you click:

`BUTTON → GET message.html → HTML returned → injected into #output`

No JS. No fetch. No render logic.

### The key idea

- **Traditional:** “The browser remembers which message is next.”
- **HTMX:** “The server decides what the next message is on every request.”

So the cycle is:

1. Click
2. Request
3. Server responds
4. Server decides the next state
