// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// Session store for /customer routes
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true
    })
);

// Auth middleware for protected customer routes
app.use("/customer/auth/*", function auth(req, res, next) {

    const auth = req.session.authorization;
    const token = auth && auth.accessToken;
    if (!token) {
        return res.status(403).json({ message: "No token in session. Please login." });
    }
    jwt.verify(token, "access", (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid/expired token." });
        req.user = decoded; // { username }
        next();
    });
});

const PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
