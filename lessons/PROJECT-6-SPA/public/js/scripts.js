// Local UI state only. Data still comes from the server via HTMX requests.
let booksVisible = false;

function toggleBooksButton(btn) {
  booksVisible = !booksVisible;

  if (booksVisible) {
    btn.innerText = "Hide Books";
  } else {
    btn.innerText = "Load Books";
    // "Hide" is purely a client-side effect; we just clear the rendered fragment.
    const output = document.querySelector("#output");
    if (output) output.innerHTML = "";
  }
}

// Important for `hx-on::after-request="toggleBooksButton(this)"` in index.html:
// HTMX evaluates inline handlers in page/global scope, so the function must be
// reachable on `window`. If wrapped in an IIFE/module without this line,
// HTMX will throw because it cannot find `toggleBooksButton`.
window.toggleBooksButton = toggleBooksButton;
