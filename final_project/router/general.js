const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


//Task 1
// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 2));
});

//Task 2
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

//Task 3
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  const { author } = req.params;
  const matched = Object.keys(books)
    .filter(isbn => books[isbn].author && books[isbn].author.toLowerCase() === author.toLowerCase())
    .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});
  if (Object.keys(matched).length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  return res.status(200).json(matched);
});

//Task 4
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  const { title } = req.params;
  const matched = Object.keys(books)
    .filter(isbn => books[isbn].title && books[isbn].title.toLowerCase() === title.toLowerCase())
    .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});
  if (Object.keys(matched).length === 0) {
    return res.status(404).json({ message: "No books found for this title" });
  }
  return res.status(200).json(matched);
});

//Task 5
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews || {});
});

//Task 6
public_users.post('/register', function (req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});


/** Task 10 (async): list all books */
public_users.get('/async/books', async (req, res) => {
  try {
    const resp = await axios.get('http://localhost:5000/');
    return res.status(200).json(resp.data);
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch books", error: String(e) });
  }
});

/** Task 11 (async): book by ISBN */
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const resp = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(resp.data);
  } catch (e) {
    return res.status(404).json({ message: "Could not fetch by ISBN", error: String(e) });
  }
});

/** Task 12 (async): books by author */
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const resp = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).json(resp.data);
  } catch (e) {
    return res.status(404).json({ message: "Could not fetch by author", error: String(e) });
  }
});

/** Task 13 (async): books by title */
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const resp = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return res.status(200).json(resp.data);
  } catch (e) {
    return res.status(404).json({ message: "Could not fetch by title", error: String(e) });
  }
});

module.exports.general = public_users;
