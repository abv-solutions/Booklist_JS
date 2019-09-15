//Select DOM elements
const form = document.querySelector('#book-form');
const list = document.querySelector('#book-list');
const title = document.querySelector('#title');
const author = document.querySelector('#author');
const rating = document.querySelector('#rating');
const search = document.querySelector('#search');
const txtElement = document.querySelector('.txt-type');
// Represents the book
class Book {
  constructor(title, author, rating, id) {
    this.title = title;
    this.author = author;
    this.rating = rating;
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
  static removeBook(target) {
    const books = Store.getBooks();
    const id = target.parentElement.parentElement.childNodes[7].textContent;
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
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td id="s${book.id}">
        <div class="stars-outer">
          <div class="stars-inner"></div>
        </div>
        <span class="number-rating badge badge-secondary"></span>
      </td>
      <td>${book.id}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
    `;
    list.appendChild(row);
    UI.setRating(book.rating, book.id);
  }
  static deleteBook(target) {
    target.parentElement.parentElement.remove();
  }
  static searchBooks(searchText) {
    const books = Store.getBooks();
    const regex = new RegExp(`^${searchText}`, 'gi');
    let matches = books.filter(book => {
      return book.title.match(regex) || book.author.match(regex) || book.id.match(regex);
    });
    UI.outputHTML(matches);
  }
  static outputHTML(matches) {
    list.innerHTML = '';
    if (matches.length > 0) {
      matches.forEach(match => {
        const book = new Book(match.title, match.author, match.rating, match.id);
        UI.addBookToList(book);
      });
    }
  }
  static setRating(rating, id) {
    const starsTotal = 5;
    const starPercentage = rating / starsTotal * 100;
    const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
    document.querySelector(`#s${id} .stars-inner`).style.width = starPercentageRounded;
    document.querySelector(`#s${id} .number-rating`).innerHTML = rating;
  }
  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    form.before(div);
    setTimeout(() => document.querySelector('.alert').remove(), 2000);
  }
  static clearFields() {
    title.value = '';
    author.value = '';
    rating.value = '';
  }
}
// Type writer effect
class TypeWriter {
  constructor(txtElement, words, wait) {
    this.txtElement = txtElement;
    this.words = words;
    this.txt = '';
    this.wordIndex = 0;
    this.wait = parseInt(wait, 10);
    this.isDeleting = false;
    this.type();
  }
  type() {
    const current = this.wordIndex % this.words.length;
    const fullText = this.words[current];
    let typeSpeed = 200;
    if (this.isDeleting) {
      this.txt = fullText.substring(0, this.txt.length - 1);
      typeSpeed /= 2;
    }
    else {
      this.txt = fullText.substring(0, this.txt.length + 1);
    }
    this.txtElement.innerHTML =  `<span class="txt">${this.txt}</span>`;
    this.txtElement.style.display = "inline";
    if (!this.isDeleting && this.txt === fullText) {
      this.isDeleting = true;
      typeSpeed = this.wait;
    }
    else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 1000;
      this.txtElement.style.display = "none";
    }
    // Cyclic function call
    setTimeout(() => this.type(), typeSpeed);
  }
  static start() {
    const words = JSON.parse(txtElement.getAttribute('data-words'));
    const wait = txtElement.getAttribute('data-wait');
    new TypeWriter(txtElement, words, wait);
  }
}
// Display books
document.addEventListener('DOMContentLoaded', () => {
  UI.displayBooks();
  TypeWriter.start();
});
// Add book
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = Math.random().toString().substr(2, 4);
  if (title.value === '' || author.value === '' || rating.value === '') {
    UI.showAlert('Please fill all the fields', 'danger');
  }
  else {
    const book = new Book(title.value, author.value, rating.value, id);
    UI.addBookToList(book);
    Store.addBook(book);
    UI.clearFields();
    UI.showAlert('Book added', 'success');
  }
});
// Remove book
list.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete')) {
    UI.deleteBook(e.target);
    Store.removeBook(e.target);
    UI.showAlert('Book removed', 'success');
  }
});
// Filter books
search.addEventListener('input', () => UI.searchBooks(search.value));
