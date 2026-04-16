import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const PORT = Number(process.env.PORT) || 3333;

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Only allow https URLs we expect from GitHub APIs in markup. */
function safeGithubAssetUrl(u) {
  if (typeof u !== "string" || !u) return null;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.toLowerCase();
    const ok =
      host === "github.com" ||
      host.endsWith(".github.com") ||
      host === "avatars.githubusercontent.com" ||
      host.endsWith(".githubusercontent.com");
    return ok ? parsed.href : null;
  } catch {
    return null;
  }
}

const app = new Hono();

app.get("/search", async (c) => {
  const raw = c.req.query("query") ?? "";
  const query = raw.trim();
  if (!query) {
    return c.html('<p class="empty">Type to search GitHub users.</p>');
  }
  if (query.length > 256) {
    return c.html('<p class="empty">Query is too long.</p>');
  }

  const url =
    "https://api.github.com/search/users?q=" +
    encodeURIComponent(`${query} in:login`) +
    "&per_page=10";

  let res;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "htmx-github-profile-search",
      },
    });
  } catch {
    return c.html('<p class="empty">Network error talking to GitHub.</p>');
  }

  if (!res.ok) {
    return c.html('<p class="empty">GitHub returned an error.</p>');
  }

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0) {
    return c.html(
      `<p class="empty">No users found for ${escapeHtml(query)}.</p>`,
    );
  }

  //the results
  const cards = items
    .map((u) => {
      const login = escapeHtml(u.login ?? "");
      const avatar = safeGithubAssetUrl(u.avatar_url);
      const profile = safeGithubAssetUrl(u.html_url);
      if (!avatar || !profile) return "";
      return `<li class="user-card">
        <img src="${escapeHtml(avatar)}" alt="" width="40" height="40" loading="lazy" />
        <div class="user-card__meta">
          <strong>${login}</strong>
          <a href="${escapeHtml(profile)}" target="_blank" rel="noopener noreferrer">Profile</a>
        </div>
      </li>`;
    })
    .filter(Boolean)
    .join("");

  if (!cards) {
    return c.html('<p class="empty">Could not display results safely.</p>');
  }

  //returning the html with result
  return c.html(
    `<div class="result-card">
      <strong>Results for ${escapeHtml(query)}</strong>
      <ul class="user-list">${cards}</ul>
    </div>`,
  );
});

app.use("/*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Listening on http://127.0.0.1:${info.port}/`);
});
