/**
 * HTML fragment: a ul of books for HTMX to swap into the page.
 * @param {Array<{ id: string | number, title: string, author: string }>} books
 * @returns {string}
 */
export function renderBookList(books) {
  const items = books
    .map(
      (book) => `
    <li class="book-item" data-id="${book.id}">
      <div class="details">
        <span class="title">${book.title}</span>
        <span class="author">${book.author}</span>
      </div>
    </li>`,
    )
    .join("");

  return `<ul class="book-list">${items}</ul>`;
}
