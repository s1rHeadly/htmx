// ---------------------------------------------------------------------------
// This file starts your web server. When someone visits a URL in the browser,
// the request hits this app; each "route" below decides what to send back.
// ---------------------------------------------------------------------------

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import BOOKS_DATA from "../data/bookdata.js";
import { renderBookList } from "./utils/helpers.js";

// `Hono()` is your app object. You attach routes to it (URLs + what to return).
const app = new Hono();

// --- Static files (HTML, CSS, images in the /public folder) -----------------
// For ANY path (/*), look for a matching file under ./public first.
// Example: / → public/index.html, /css/styles.css → public/css/styles.css
// If there is NO file for that path, Hono skips ahead to the next handler
// (so /books is not a file — it reaches the route).

// Think of the public folder as the web root.
app.use("/*", serveStatic({ root: "./public" }));

// --- HTMX fragment route -------------------------------------------------------
// GET /books returns HTML (not JSON). HTMX swaps this directly into #output.
// `c` is the "context": it holds request/response helpers like c.html().
app.get("/books", (c) => c.html(renderBookList(BOOKS_DATA)));

app.post("/books", async (c) => {
  // parseBody() reads form fields sent by HTMX from <form hx-post="/books">.
  const body = await c.req.parseBody();
  const title = String(body.title ?? "").trim();
  const author = String(body.author ?? "").trim();

  // Server-side validation still matters even if the browser has `required`.
  // Never trust only client-side checks.
  if (!title || !author) {
    return c.html(
      `<p class="form-error">Both title and author are required.</p>${renderBookList(BOOKS_DATA)}`,
      400,
    );
  }

  const newBook = {
    id: Date.now(),
    title,
    author,
  };

  // Lesson note: this is in-memory only. Restarting Node resets this array.
  BOOKS_DATA.push(newBook);

  return c.html(renderBookList(BOOKS_DATA));
});

// --- Start listening ------------------------------------------------------------
// Opens port 3000. Your terminal shows the server running; visit:
// http://localhost:3000
serve({
  fetch: app.fetch,
  port: 3000,
});
