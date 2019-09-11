// Represents the book
class Book {
  constructor(title, author, id) {
    this.title = title;
    this.author = author;
    this.id = id;
  }
}
// Handles book storage
class Store {
  static getBooks() {
    let books;
    if (localStorage.getItem('books') === null) {
      books = [];
    }
    else {
      books = JSON.parse(localStorage.getItem('books'));
    }
    return books;
  }
  static addBook(book) {
    const books = Store.getBooks();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
  }
  static removeBook(id) {
    const books = Store.getBooks();
    books.forEach((book, index) => {
      if (book.id === id) {
        books.splice(index, 1);
      }
    });
    localStorage.setItem('books', JSON.stringify(books));
  }
}
// Handles UI tasks
class UI {
  static displayBooks() {
    const books = Store.getBooks();
    books.forEach(book => UI.addBookToList(book));
  }
  static addBookToList(book) {
    const list = document.querySelector('#book-list');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.id}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
    `
    list.appendChild(row);
  }
  static deleteBook(target) {
    if (target.classList.contains('delete')) {
      target.parentElement.parentElement.remove();
    }
  }
  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector('.container');
    const form = document.querySelector('#book-form');
    container.insertBefore(div, form);
    setTimeout(() => document.querySelector('.alert').remove(), 2000);
  }
  static clearFields() {
    document.querySelector('#title').value = '';
    document.querySelector('#author').value = '';
  }
}
// Display books
document.addEventListener('DOMContentLoaded', UI.displayBooks);
// Add book
document.querySelector('#book-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.querySelector('#title').value;
  const author = document.querySelector('#author').value;
  const id = Math.random().toString().substr(2, 4);
  if (title === '' || author === '') {
    UI.showAlert('Please fill all the fields', 'danger');
  }
  else {
    const book = new Book(title, author, id);
    UI.addBookToList(book);
    Store.addBook(book);
    UI.clearFields();
    UI.showAlert('Book added', 'success');
  }
});
// Remove book
document.querySelector('#book-list').addEventListener('click', (e) => {
  const id = e.target.parentElement.previousElementSibling.textContent;
  UI.deleteBook(e.target);
  Store.removeBook(id);
  UI.showAlert('Book removed', 'success');
});
