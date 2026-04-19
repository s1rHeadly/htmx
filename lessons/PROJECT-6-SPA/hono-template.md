# Hono template — project tour and local setup

This note is for junior developers. It walks through **each file** in this starter, shows the important code where it helps, explains **what Hono is doing**, and how to **run the app on localhost**.

## What is Hono?

[Hono](https://hono.dev/) is a small, fast web framework. You define **routes** (for example: when someone sends `GET /`, run this function and return a response). Hono matches incoming HTTP requests to your handlers. It uses the same **Fetch API** shape as modern browsers (`Request` / `Response`), which is why you wire the app to Node with `fetch: app.fetch`.

On **Node.js**, you use the `hono` package together with **`@hono/node-server`**, which opens a TCP port and forwards each request to your Hono app.

## What this starter does (big picture)

1. **`package.json`** declares dependencies and a `start` script that runs `src/server.js`.
2. **`src/server.js`** creates a Hono app, registers `GET /` to return plain text, and calls `serve()` so the process listens on **port 3000**.
3. **`data/bookdata.js`** and **`public/css/styles.css`** are scaffolding for later (APIs or HTML pages); the running server does not use them yet.

---

## Project structure

```text
PROJECT-6-SPA/
├── package.json          # Name, scripts, dependencies, ES module mode
├── package-lock.json     # Locked dependency tree (npm creates/updates this)
├── .gitignore            # Files and folders git should not track
├── hono-template.md      # This document
├── src/
│   └── server.js         # Hono app + Node server entry point
├── data/
│   └── bookdata.js       # Sample data (not imported by server.js yet)
└── public/
    └── css/
        └── styles.css    # Global styles (not served until you add static/HTML)
```

---

## File by file

### `package.json`

**What it does:** Names the project, sets **`"type": "module"`** so Node treats `.js` files as ES modules (`import` / `export`), defines **`npm start`**, and lists **`hono`** and **`@hono/node-server`**.

```json
{
  "name": "spa-with-hono",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "@hono/node-server": "^1.13.0",
    "hono": "^4.7.0"
  }
}
```

### `package-lock.json`

**What it does:** Records the exact versions npm installed so installs are repeatable. You do not edit it by hand; **`npm install`** creates or updates it.

*(No snippet — file is long and machine-generated.)*

### `.gitignore`

**What it does:** Tells git to skip **`node_modules/`** (dependencies) and **`.env`** (secrets you might add later), so they are not committed.

```gitignore
node_modules/
.env
```

### `src/server.js`

**What it does:** This is the **Hono starter in one file**.

- **`new Hono()`** — empty app.
- **`app.get("/", ...)`** — handler for `GET /`; **`c`** is the request context; **`c.text()`** returns a plain-text response.
- **`serve({ fetch: app.fetch, port: 3000 })`** — Node adapter listens on port **3000** and passes each request to **`app.fetch`**.

```javascript
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hono is running ✅");
});

serve({
  fetch: app.fetch,
  port: 3000,
});
```

### `data/bookdata.js`

**What it does:** Holds sample **book** records as a JavaScript array. **`export default`** lets another file `import` it when you add a route like `GET /api/books`. **The current `server.js` does not import this file.**

```javascript
const BOOKS_DATA = [
  { id: "1", title: "The Final Empire", author: "Brandon Sanderson" },
  { id: "2", title: "The Way of Kings", author: "Brandon Sanderson" },
];

export default BOOKS_DATA;
```

### `public/css/styles.css`

**What it does:** Shared CSS (variables, typography, layout). Browsers only load it once you serve **HTML** that links to `/css/styles.css` (for example with Hono’s static file middleware). **The starter has no HTML route yet**, so this file is unused until you extend the app.

```css
@import url("https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap");

:root {
  --color-text: #333333;
  --color-text-muted: #777777;
  /* ... more design tokens and rules below ... */
}
```

### `hono-template.md`

**What it does:** This markdown file — a map of the repo and how to run it locally.

---

## Prerequisites

- **Node.js** installed (LTS is fine). Check with:

  ```bash
  node -v ```

  You should see a version number (for example `v20.x` or `v22.x`).

---

## How to run on localhost

From the **project root** (the folder that contains `package.json`), run:

```bash
cd "/path/to/PROJECT-6-SPA"
npm install
npm start
```

| Command | What happens |
|--------|----------------|
| **`npm install`** | Reads `package.json`, downloads `hono` and `@hono/node-server` into `node_modules/`, and creates or updates `package-lock.json`. |
| **`npm start`** | Runs **`node src/server.js`** (the `"start"` script in `package.json`). |

When the server is up, open:

[http://localhost:3000](http://localhost:3000)

You should see plain text like: **`Hono is running ✅`**.

To stop the server, focus the terminal and press **Ctrl+C**.

---

## Dependencies (quick reference)

| Package | Role |
|---------|------|
| **`hono`** | `Hono` class, routing, context helpers (`c.text`, `c.json`, `c.html`, …). |
| **`@hono/node-server`** | **`serve()`** — binds your app to a port on Node. |

The project uses **ES modules** because of **`"type": "module"`** in `package.json`.

---

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| `command not found: npm` | Install Node.js from [nodejs.org](https://nodejs.org/) or your package manager. |
| `EADDRINUSE` / port in use | Another process is using port **3000**. Stop it, or change **`port`** in `src/server.js`. |
| Blank page or connection refused | Confirm **`npm start`** is still running and the URL is **`http://localhost:3000`** (not `https` unless you add TLS). |

---

## Next steps (when you extend the app)

- Add routes with **`app.get`**, **`app.post`**, and so on.
- Return JSON with **`c.json({ ... })`** for APIs (you can **`import`** `data/bookdata.js` in `server.js`).
- Serve **`public/`** with Hono’s static middleware and add HTML that links **`/css/styles.css`**.

The mental model stays the same: **one Hono app**, **one `serve()` call**, and **handlers** that turn requests into responses.
