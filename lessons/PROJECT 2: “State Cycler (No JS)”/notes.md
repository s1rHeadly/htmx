# Project 2: State Cycler (No JS)

A **multi-step flow** where each step is its own HTML resource. **No `fetch`, no SPA state** — you move through the flow by loading the next fragment into the same container.

---

## What you are learning

- **File-driven (or server-driven) UI:** the “state” is *which HTML you last loaded into `#app`*
- **Replacing a whole region:** `hx-target="#app"` and `hx-swap="innerHTML"` so each step ships **content and the correct Next button**
- **Cycles:** step 3’s button points back to step 1 (`step-1.html`)

---

## Project files

```text
PROJECT 2: “State Cycler (No JS)”/
├── index.html    # Shell: #app with a “Start” button
├── step-1.html   # Fragment: Step 1 + Next → step 2
├── step-2.html   # Fragment: Step 2 + Next → step 3
└── step-3.html   # Fragment: Step 3 + Restart → step 1
```

`step-1.html` through `step-3.html` are **partial HTML fragments** (not full `<html>` documents): headings and buttons only. That fits `innerHTML` swaps cleanly.

---

## How the flow works

1. **`index.html`** loads HTMX `1.9.12` and renders:

   ```html
   <div id="app">
     <button hx-get="step-1.html" hx-target="#app" hx-swap="innerHTML">
       Start
     </button>
   </div>
   ```

2. Click **Start** → HTMX GETs `step-1.html` → the **inside of `#app`** is replaced by step 1’s markup (heading + **Next**).

3. **Next** on step 1 loads `step-2.html` into `#app`. Same for step 2 → step 3.

4. On step 3, **Restart** loads `step-1.html` again.

Each step’s button encodes the **next** resource. No global step counter in JavaScript.

---

## Comment in `index.html`: URL vs hidden field

The HTML comment mentions you *could* store step in **`?step=`** or a **hidden input** `name="step"`. This repo uses **one file per step** (`step-1.html`, …), which is the simplest teaching version. A backend could use one route like `/step?n=2` and return the same kind of fragments.

---

## How to run / open

All static files. Serve this folder with any static HTTP server (recommended) or open `index.html` directly if your browser allows local partial loads.

---

## Link to Project 3 (Pagination)

Same pattern: **each response includes content + navigation** for that screen. Pagination swaps “page” fragments; this project swaps “step” fragments.

---

## Things to try

- Add a **Back** button on step 2 that loads `step-1.html`.
- Add **`hx-indicator`** and CSS for a loading state while a step file loads.
