const express = require('express');
const db = require('./db');
const path = require('path');
const session = require("express-session");
const app = express();
app.use(express.static("public"));

const todo = require('./routes/todo');
const user = require('./routes/user');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));
app.use('/user',user);
app.use('/todo', todo);

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.listen(3000, () => {
    console.log("서버 실행 중 http://localhost:3000");
});