/**
 * Escape untrusted text before injecting into HTML.
 * This keeps user-provided values from being interpreted as markup/scripts.
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * HTML fragment: a ul of books for HTMX to swap into the page.
 * @param {Array<{ id: string | number, title: string, author: string }>} books
 * @returns {string}
 */
export function renderBookList(books) {
  const items = books
    .map(
      (book) => `
    <li class="book-item" data-id="${escapeHtml(book.id)}">
      <div class="details">
        <span class="title">${escapeHtml(book.title)}</span>
        <span class="author">${escapeHtml(book.author)}</span>
      </div>
    </li>`,
    )
    .join("");

  return `<ul class="book-list">${items}</ul>`;
}
