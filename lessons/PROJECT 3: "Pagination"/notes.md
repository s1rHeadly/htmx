# Project 3: Pagination (No JS)

Paginated content using **static HTML “pages”** and HTMX **replacing `#results`** with each page’s markup. Same idea as the State Cycler: **each fragment includes its own Prev/Next controls.**

---

## What you are learning

- Pagination without client-side page state
- **`hx-target` + `hx-swap="innerHTML"`** on buttons inside swapped content
- How this mirrors **Project 2** (steps) with a more “list UI” shape

---

## Actual layout in this repo

```text
Project3 Pagination/
├── index.html   # Entry: “Load Page 1” → index1.html into #results
├── index1.html  # Page 1 + Prev + Next
├── index2.html  # Page 2 + Prev + Next
├── index3.html  # Page 3 + Prev only
└── notes.md
```

Older drafts used names like `page-1.html`; **this folder uses `index1.html`, `index2.html`, `index3.html`.**

---

## Walkthrough

### `index.html`

- Loads HTMX `1.9.12`.
- `<div id="results">` contains a button:

  - `hx-get="index1.html"`
  - `hx-target="#results"`
  - `hx-swap="innerHTML"`

Clicking **Load Page 1** replaces everything inside `#results` with the body content from `index1.html` (including that page’s own buttons).

### `index1.html`, `index2.html`, `index3.html`

Each file is a **small full HTML document** with:

- A heading (`Page 1` … `Page 3`)
- A list of three items per page
- Buttons that also target `#results` / `innerHTML`

Navigation:

| Page | Prev loads | Next loads    |
| ------ | ------------- | ------------- |
| 1      | `index.html`  | `index2.html` |
| 2      | `index1.html` | `index3.html` |
| 3      | `index2.html` | —             |

HTMX handles full-document responses by extracting the part needed for the swap into `#results`.

---

## Label quirk (learning moment)

On **page 1**, the button that loads `index.html` is labeled **Prev →** in the source even though it goes back to the initial “Load Page 1” shell. Renaming it (for example **Home** or **Back**) would match behavior more clearly.

---

## How to run / open

Serve the `Project3 Pagination` folder with a static server, or open `index.html` locally if your environment allows loading sibling files.

---

## Manual test plan

1. From `index.html`, load page 1.
2. **Next** through pages 2 and 3.
3. **Prev** from page 3 → 2 → 1; from page 1 **Prev** returns to the initial `#results` content.

---

## Optional upgrades

- **Jump to page:** buttons that `hx-get` `index1.html` / `index2.html` / `index3.html` directly.
- **Auto-load:** on the shell, a div with `hx-trigger="load"` and `hx-get="index1.html"` into `#results`.
- **Backend:** `/page?page=2` returning only a **fragment** (no full `<html>`), same swap pattern.

---

## Takeaway

> You request the **HTML for the next page** and swap it in — you are not maintaining page index state in JavaScript.

That is server-driven UI thinking, whether the responder is Node or static files.
