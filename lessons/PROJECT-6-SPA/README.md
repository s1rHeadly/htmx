# Books App (SPA lesson — Hono + HTMX)

## Project status (final progress)

| Area | State |
| ---- | ----- |
| **Goal** | HTMX “server sends HTML fragments” pattern: list loads into `#output` without client JSON handling. |
| **Done** | Hono server on port 3000; static `public/`; seed data in `data/bookdata.js`; `GET /books` returns a book list fragment via `renderBookList()`; **Load Books** button wired with `hx-get` / target / swap; **Add Book** form posts with `hx-post`; `POST /books` parses form data, appends a new book, and returns an updated list fragment. |
| **Not done yet** | Durable persistence (data currently lives in memory while the server is running), plus stronger input validation and error states. |
| **Stack** | Node ESM, Hono, `@hono/node-server`, HTMX from CDN. |

*Use this README as the lesson handoff: it matches the code in this folder at the time of the progress branch.*

---

Small practice app from an HTMX learning track: a **Node** server serves a static page and HTML fragment endpoints for listing and adding books. The page includes **HTMX**, a **Load Books** control that requests `GET /books`, and an **Add Book** form that submits to `POST /books`. Responses are swapped into `#output`.

Vanilla JavaScript is powerful but can be tricky in HTMX apps when script load order and browser/global scope are not understood. This README calls out those pitfalls explicitly so junior developers can debug faster.

## What it does (so far)

1. **Home page** — Visiting `http://localhost:3000` serves `public/index.html` (“Books App”) with styling from `public/css/styles.css`.
2. **Book data** — Seed titles and authors live in `data/bookdata.js` as a default-exported array (`id`, `title`, `author`). The server imports it as `BOOKS_DATA` (ten sample books).
3. **`GET /books`** — Returns an **HTML** fragment: a `<ul class="book-list">` of `<li class="book-item">` rows (title, author, `data-id` on each item). The markup is produced by **`renderBookList(books)`** in `src/utils/helpers.js`; the route in `src/server.js` does `c.html(renderBookList(BOOKS_DATA))`. This is a **fragment endpoint**, **not** a full page: it is **not** meant to be visited directly as another “screen”; it is **meant to be consumed by HTMX** and swapped into `#output`.
4. **Load Books** — Button uses HTMX (`hx-get="/books"`, `hx-target="#output"`, `hx-swap="innerHTML"`) to fetch the fragment and render the list in the page.
5. **Add Book form + POST route** — `index.html` includes a form with `hx-post="/books"` and `hx-on::after-request="this.reset()"`. In `server.js`, `POST /books` parses form data, creates a new book object, pushes it into `BOOKS_DATA`, and returns `renderBookList(BOOKS_DATA)` so the page refreshes from server output.

Because the server returns **HTML**, HTMX can insert the response into `#output` without client-side JSON parsing. That is the usual “server sends partial HTML” HTMX pattern.

## Reference: Event Listeners and HTMX

This project uses HTMX for server-driven UI updates and light JavaScript event listeners for small UI behaviors.

Instead of writing full frontend logic (like React), this app relies on:

- HTMX attributes for requests
- HTMX lifecycle events for hooks
- Minimal JavaScript for UI state changes

### 1) Traditional event listeners (JavaScript)

In normal JavaScript, we listen for user actions like this:

```js
button.addEventListener("click", () => {
  console.log("Button clicked");
});
```

How it works:

- You manually select an element
- Attach a listener
- Run logic when an event happens

Typical use cases:

- Toggling UI elements
- Form validation
- Animations
- DOM updates without server calls

### 2) HTMX approach (server-driven events)

HTMX replaces most manual event handling with declarative attributes:

```html
<button hx-get="/books" hx-target="#output">
  Load Books
</button>
```

What happens:

- User clicks button
- HTMX sends HTTP request (`GET /books`)
- Server returns HTML
- HTMX swaps response into `#output`

No manual `fetch()` or click listener is required for that flow.

### 3) HTMX lifecycle events

HTMX automatically triggers events during each request lifecycle:

- `htmx:beforeRequest` - before request is sent
- `htmx:afterRequest` - after response is received
- `htmx:beforeSwap` - before HTML is inserted
- `htmx:afterSwap` - after HTML is inserted

### 4) Using `hx-on` (inline event hooks)

HTMX lets you attach handlers directly in HTML:

```html
<button
  hx-get="/books"
  hx-target="#output"
  hx-on::after-request="this.innerText = 'Loaded'"
>
  Load Books
</button>
```

What this means:

- After request finishes
- Run inline JavaScript
- Update button text

This is not embedding custom functions into HTMX itself; it is binding to HTMX lifecycle events.

### 5) Using standard JS listeners with HTMX events

You can also listen with standard JavaScript:

```js
document.body.addEventListener("htmx:afterRequest", (event) => {
  console.log("HTMX request completed");
});
```

Useful for:

- Global event handling
- Logging and analytics
- UI state management

### 6) Common pattern in this project

This Books App combines both approaches.

HTMX handles:

- Loading books (`hx-get`)
- Adding books (`hx-post`)
- Updating UI from server responses

JavaScript handles:

- Toggling small UI states
- Resetting form state (`hx-on::after-request="this.reset()"`)
- Other lightweight interaction behavior

Example from this project:

```html
<form
  hx-post="/books"
  hx-target="#output"
  hx-swap="innerHTML"
  hx-on::after-request="this.reset()"
>
```

That clears the form after submission.

### 7) When to use what

Use HTMX when:

- Talking to the server
- Updating UI with server data
- Loading, saving, or deleting content

Use event listeners when:

- Toggling local UI state
- Handling local interactions
- Doing small DOM updates that do not need a server request

### Key takeaway

HTMX reduces the amount of JavaScript needed by moving interaction flows to server-driven HTML updates. Event listeners are still useful for local UI behavior and lifecycle hooks.

Think of it as:

- HTMX = server interaction layer
- Event listeners = UI behavior layer

### How to make JavaScript work with HTMX

When using `hx-on` inline handlers (for example `hx-on:click="onToggle(this)"`), make sure your JavaScript is wired for browser execution:

1. **Serve the script from `public/`**
   - If HTML references `/js/scripts.js`, the file must exist at `public/js/scripts.js`.
   - Files under `src/` are server/source files and are not directly served to the browser by default.

2. **Expose functions globally for inline `hx-on`**
   - `hx-on:click="onToggle(this)"` looks for `onToggle` in page scope.
   - Define it as `window.onToggle = function onToggle(btn) { ... }`.

3. **Do not hide handlers inside private scopes**
   - If a function is wrapped in an IIFE/module and not attached to `window`, inline HTMX handlers cannot call it.
   - In this project, `toggleBooksButton` works because `public/js/scripts.js` assigns `window.toggleBooksButton = toggleBooksButton`.

4. **Script loading order matters**
   - In `public/index.html`, `scripts.js` must load before HTMX when you rely on global handlers.
   - Use `defer` on both scripts and keep `scripts.js` first:
     - `<script src="/js/scripts.js" defer></script>`
     - `<script src="https://unpkg.com/htmx.org@1.9.12" defer></script>`
   - If order is wrong, HTMX/event code may run before your helper is ready.

5. **Make sure the handler actually performs the UI action**
   - Avoid defining inner helper functions without calling them.
   - Put the toggle/update logic directly in the called handler or call the helper explicitly.

6. **Use HTMX for requests, JS for local state**
   - Keep `hx-get`/`hx-post` for server round-trips.
   - Use JavaScript only for small UI behaviors (button text, local toggles, clearing local content).

## Developer notes: HTMX + Vanilla JS + Hono

Use this as a quick debugging and architecture checklist.

1. **Understand who owns each concern**
   - **Hono (`src/server.js`)** owns routes, validation, and final HTML returned to the browser.
   - **HTMX (`public/index.html`)** owns when requests happen and where responses get inserted.
   - **Vanilla JS (`public/js/scripts.js`)** owns small local behavior only (for example button text toggle).

2. **Treat HTMX endpoints as fragment endpoints**
   - `GET /books` and `POST /books` return partial HTML, not full pages.
   - Opening `/books` directly in the browser is fine for debugging, but it is intended to be swapped into `#output`.

3. **Do not rely only on client validation**
   - Browser `required` attributes improve UX but are not security controls.
   - `POST /books` still validates and trims input on the server before storing data.

4. **Escape any untrusted values before rendering HTML**
   - User input should not be inserted into HTML strings raw.
   - `renderBookList()` in `src/utils/helpers.js` escapes values to reduce XSS risk.

5. **Remember this app stores data in memory only**
   - `BOOKS_DATA` is an array in process memory.
   - Restarting the server resets added books.
   - Production apps should use a real database.

6. **Know the static-file boundary**
   - Files in `public/` are directly accessible by the browser (`/css/...`, `/js/...`).
   - Files in `src/` and `data/` run on the server side and are not directly served to the browser.

7. **Be careful with mixed rendering responsibilities**
   - If you manually manipulate DOM in JS and also let HTMX replace the same area, HTMX swaps can overwrite your manual edits.
   - Prefer server-rendered HTML + HTMX swaps for data sections, and keep JS adjustments lightweight.

## Tech stack

| Piece | Role |
| ----- | ---- |
| **Hono** | Web framework: routes, `c.html()` for fragments |
| **@hono/node-server** | Runs the app on Node.js and serves static files |
| **HTMX** (CDN) | Declarative partial updates from `index.html` |

The project uses **ES modules** (`"type": "module"` in `package.json`).

## Prerequisites

- **Node.js** (LTS recommended, e.g. 18+ or 20+)

## How to run it

From **this project folder** (the one that contains `package.json`):

```bash
npm install
npm start
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

- Stop the server with `Ctrl+C` in the terminal.

## About `/books` in the browser

Opening **[http://localhost:3000/books](http://localhost:3000/books)** in the browser shows the raw fragment only because the browser requested that URL and renders whatever HTML comes back. Treat that as incidental: **`/books` is a fragment endpoint, not a page**. Do not design the app around visiting it directly; **HTMX** is the intended consumer (for example `hx-get="/books"` on the button).

To inspect the response without using the UI:

```bash
curl http://localhost:3000/books
```

## Project layout

```text
PROJECT-6-SPA/
├── data/
│   └── bookdata.js          # BOOKS_DATA array (default export)
├── public/
│   ├── index.html           # HTMX: Load Books + Add Book form → #output
│   ├── js/
│   │   └── scripts.js       # Global handlers used by inline hx-on attributes
│   └── css/
│       └── styles.css       # App styles
├── src/
│   ├── server.js            # Hono: static files + GET/POST fragment routes
│   └── utils/
│       └── helpers.js       # renderBookList(books) + HTML escaping helper
├── package.json
└── README.md
```

## Useful files to read first

1. `src/server.js` — Static hosting, validation, and `GET/POST /books` fragment responses.
2. `src/utils/helpers.js` — How book objects become escaped HTML list markup.
3. `public/index.html` — HTMX attributes, targets/swaps, and script load order.
4. `public/js/scripts.js` — Global handler exposed for `hx-on` usage.
5. `data/bookdata.js` — Shape of each book object.

---

*Lesson-style repo: minimal server, static front end, HTMX-driven partial updates, with list rendering factored into a small helper module.*
