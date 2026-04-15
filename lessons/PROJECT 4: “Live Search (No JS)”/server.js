/**
 * Live search backend for HTMX. Run from this folder:
 *   node server.js
 * Then open http://127.0.0.1:3333/
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 3333;

const FRUITS = [
  "Apple",
  "Ant",
  "Orange",
  "Banana",
  "Pear",
  "Pineapple",
  "Watermelon",
  "Strawberry",
  "Cherry",
  "Blueberry",
  "Raspberry",
  "Mango",
  "Kiwi",
  "Grape",
  "Lemon",
  "Lime",
  "Coconut",
  "Papaya",
  "Peach",
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function searchFragment(queryRaw) {
  const query = (queryRaw || "").trim();
  if (!query) {
    return '<div class="empty">Type to start searching…</div>';
  }

  const q = query.toLowerCase();
  const results = FRUITS.filter((item) =>
    item.toLowerCase().includes(q),
  );

  if (results.length === 0) {
    return '<div class="empty">No results found.</div>';
  }

  const title = escapeHtml(query);
  const lis = results
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("\n    ");

  return `<div class="result-card">
  <strong>Results for &quot;${title}&quot;</strong>

  <ul>
    ${lis}
  </ul>
</div>`;
}

function resolveStaticPath(urlPath) {
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
  const full = path.resolve(ROOT, rel);
  const rootResolved = path.resolve(ROOT);
  if (full !== rootResolved && !full.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return full;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const host = req.headers.host || "127.0.0.1";
  const u = new URL(req.url || "/", `http://${host}`);

  if (req.method === "GET" && u.pathname === "/search") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(searchFragment(u.searchParams.get("query")));
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405).end();
    return;
  }

  const filePath = resolveStaticPath(u.pathname);
  if (!filePath) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404).end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Live search: http://127.0.0.1:${PORT}/`);
});
