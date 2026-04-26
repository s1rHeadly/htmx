# Books App (SPA lesson — Hono + HTMX)

## Project status (checkpoint)

| Area | State |
|------|--------|
| **Goal** | HTMX “server sends HTML fragments” pattern: list loads into `#output` without client JSON handling. |
| **Done** | Hono server on port 3000; static `public/`; seed data in `data/bookdata.js`; `GET /books` returns a book list fragment via `renderBookList()`; **Load Books** button wired with `hx-get` / target / swap; **Add Book** form present with `hx-post` (UI ready). |
| **Not done yet** | `POST /books` handler (form submit will fail until persistence + response are implemented). |
| **Stack** | Node ESM, Hono, `@hono/node-server`, HTMX from CDN. |

*Use this README as the lesson handoff: it matches the code in this folder at the time of the progress branch.*

---

Small practice app from an HTMX learning track: a **Node** server serves a static page and an **HTML fragment** endpoint for a list of books. The page includes **HTMX**, a **Load Books** control that requests `GET /books`, and an **Add Book** form wired for `POST /books` (server side for POST is still to be added). Responses are swapped into `#output`.

## What it does (so far)

1. **Home page** — Visiting `http://localhost:3000` serves `public/index.html` (“Books App”) with styling from `public/css/styles.css`.
2. **Book data** — Seed titles and authors live in `data/bookdata.js` as a default-exported array (`id`, `title`, `author`). The server imports it as `BOOKS_DATA` (ten sample books).
3. **`GET /books`** — Returns an **HTML** fragment: a `<ul class="book-list">` of `<li class="book-item">` rows (title, author, `data-id` on each item). The markup is produced by **`renderBookList(books)`** in `src/utils/helpers.js`; the route in `src/server.js` does `c.html(renderBookList(BOOKS_DATA))`. This is a **fragment endpoint**, **not** a full page: it is **not** meant to be visited directly as another “screen”; it is **meant to be consumed by HTMX** and swapped into `#output`.
4. **Load Books** — Button uses HTMX (`hx-get="/books"`, `hx-target="#output"`, `hx-swap="innerHTML"`) to fetch the fragment and render the list in the page.
5. **Add Book form (UI only)** — `index.html` includes a form with `hx-post="/books"` and the same target/swap so that, once implemented, submitting would refresh the list from the server. **`POST /books` is not defined in `server.js` yet**, so submitting the form will not succeed until you add that handler (and decide how new books are stored).

Because the server returns **HTML**, HTMX can insert the response into `#output` without client-side JSON parsing. That is the usual “server sends partial HTML” HTMX pattern.

## Tech stack

| Piece                 | Role                                                    |
| --------------------- | ------------------------------------------------------- |
| **Hono**              | Web framework: routes, `c.html()` for fragments       |
| **@hono/node-server** | Runs the app on Node.js and serves static files         |
| **HTMX** (CDN)        | Declarative partial updates from `index.html`         |

The project uses **ES modules** (`"type": "module"` in `package.json`).

## Prerequisites

- **Node.js** (LTS recommended, e.g. 18+ or 20+)

## How to run it

From **this project folder** (the one that contains `package.json`):

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

- Stop the server with `Ctrl+C` in the terminal.

## About `/books` in the browser

Opening **http://localhost:3000/books** in the browser shows the raw fragment only because the browser requested that URL and renders whatever HTML comes back. Treat that as incidental: **`/books` is a fragment endpoint, not a page**. Do not design the app around visiting it directly; **HTMX** is the intended consumer (for example `hx-get="/books"` on the button).

To inspect the response without using the UI:

```bash
curl http://localhost:3000/books
```

## Project layout

```
PROJECT-6-SPA/
├── data/
│   └── bookdata.js          # BOOKS_DATA array (default export)
├── public/
│   ├── index.html           # HTMX: Load Books + Add Book form → #output
│   └── css/
│       └── styles.css       # App styles
├── src/
│   ├── server.js            # Hono: static files + GET /books
│   └── utils/
│       └── helpers.js       # renderBookList(books) → HTML string
├── package.json
└── README.md
```

## Useful files to read first

1. `src/server.js` — Static hosting and `GET /books` returning HTML via the helper.
2. `src/utils/helpers.js` — How book objects become a list fragment.
3. `public/index.html` — HTMX attributes on the button and form.
4. `data/bookdata.js` — Shape of each book object.

---

*Lesson-style repo: minimal server, static front end, HTMX-driven partial updates, with list rendering factored into a small helper module.*
