// ---------------------------------------------------------------------------
// This file starts your web server. When someone visits a URL in the browser,
// the request hits this app; each "route" below decides what to send back.
// ---------------------------------------------------------------------------

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import BOOKS_DATA from "../data/bookdata.js";

// `Hono()` is your app object. You attach routes to it (URLs + what to return).
const app = new Hono();

// --- Static files (HTML, CSS, images in the /public folder) -----------------
// For ANY path (/*), look for a matching file under ./public first.
// Example: / → public/index.html, /css/styles.css → public/css/styles.css
// If there is NO file for that path, Hono skips ahead to the next handler
// (so /books is not a file — it reaches the route below).
app.use("/*", serveStatic({ root: "./public" }));

// --- API route: return JSON (good for fetch() or for HTMX later) ------------
// GET /books → browser or JavaScript receives the book list as JSON.
// `c` is the "context": it holds the request and helpers like c.json().
app.get("/books", (c) => {
  return c.json(BOOKS_DATA);
});

// --- Start listening ------------------------------------------------------------
// Opens port 3000. Your terminal shows the server running; visit:
// http://localhost:3000
serve({
  fetch: app.fetch,
  port: 3000,
});
