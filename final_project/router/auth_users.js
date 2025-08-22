const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory users store (shared with general.js)
let users = [];

const isValid = (username) => {
  // Username is valid if it does NOT already exist
  const existing = users.find(u => u.username === username);
  return !existing;
};

const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username && u.password === password);
  return !!user;
};


// Task7
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

//Task 8: Add or modify a review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const reviewText = req.query.review || req.body?.review;

  if (!reviewText) {
    return res.status(400).json({ message: "Provide review via ?review= or JSON body {review}" });
  }
  const username = req.session?.authorization?.username;
  if (!username) return res.status(403).json({ message: "Not logged in" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (!book.reviews) book.reviews = {};
  // Add or update this user's review for this ISBN
  book.reviews[username] = reviewText;

  return res.status(200).json({ message: "Review added/updated", reviews: book.reviews });
});

// Task 9: Delete a review by the logged-in user

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const username = req.session?.authorization?.username;
  if (!username) return res.status(403).json({ message: "Not logged in" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review by this user to delete" });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
