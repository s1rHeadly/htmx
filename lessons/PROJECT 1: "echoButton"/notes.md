# Project 1: Echo Button

Static HTML demo of the smallest useful HTMX pattern: **click → GET a fragment → swap it into the page**.

---

## What you are learning

- **`hx-get`** — which URL to request
- **`hx-target`** — which element receives the response
- **`hx-swap="innerHTML"`** — replace the *inside* of the target (not the outer element)
- That you can have **several independent** HTMX controls on one page (each with its own target)

---

## Project files

```text
PROJECT 1: "echoButton"/
├── index.html      # Three buttons, three output areas, HTMX script
├── message.html    # Response fragment (full mini-document)
├── message1.html   # Same content (separate URL for demo)
└── message2.html   # Same content (separate URL for demo)
```

There is **no backend**. Each `hx-get` points at a **static `.html` file**. The browser requests that file; HTMX inserts the relevant part of the response into your target div.

---

## How it works

### 1. Load HTMX

`index.html` includes:

```html
<script src="https://unpkg.com/htmx.org@2.0.4"></script>
```

This lesson uses HTMX **2.0.4** (newer than some other projects). The attributes used here behave the same way as in 1.x for this demo.

### 2. First button (example)

```html
<button hx-get="message.html" hx-target="#output" hx-swap="innerHTML">
  Load Message
</button>
<div id="output">Waiting...</div>
```

When you click:

1. HTMX performs **`GET message.html`** (relative to the current page URL).
2. The server (or static host) returns the file’s HTML.
3. HTMX parses the response and swaps **`innerHTML`** into **`#output`**.

So `#output` changes from `Waiting...` to the paragraph returned in the response body.

### 3. Response files (`message.html`, etc.)

Each message file’s **`<body>`** contains:

```html
<p>Hello from HTMX 👋</p>
```

When the response is a full HTML page, HTMX extracts the content appropriate for your swap (the body content), so `#output` ends up showing the paragraph.

The three files **`message.html`**, **`message1.html`**, and **`message2.html`** are identical in this repo. They exist so you can wire **three buttons** to **three URLs** and **three targets** (`#output`, `#output1`, `#output2`) without them overwriting the same div.

---

## Mental model (from the comments in `index.html`)

**Without HTMX**, you might use JavaScript: `fetch`, then set `element.innerHTML`.

**With HTMX**, you declare what to fetch (`hx-get`) and where to put it (`hx-target`, `hx-swap`). The “next UI” is **whatever HTML lives at that URL**. In production, that URL is usually a **route** that returns HTML for the next state.

---

## How to run / open

Everything is static.

1. **Option A — static server (recommended):** from this folder:

   ```bash
   cd '/path/to/htmx/lessons/PROJECT 1: "echoButton"'
   npx --yes serve -l 3000 .
   ```

   Open the URL it prints and navigate to `index.html` if needed.

2. **Option B — open the file:** open `index.html` directly. Many browsers allow `hx-get` to load sibling `.html` files; if not, use Option A.

You need network access so the browser can load HTMX from `unpkg.com`.

---

## Things to try

- Change the text inside `message.html` and click again — the DOM updates with no custom JS.
- Point two buttons at the **same** file with different **`hx-target`** values and confirm each region updates only when its button is clicked.

---

## Small implementation note

`index.html` currently contains a duplicated `</body>` near the end. Browsers usually tolerate it; removing the extra tag is good cleanup when you edit the file.
