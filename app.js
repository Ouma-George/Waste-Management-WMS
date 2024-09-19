const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const http = require("http");
const path = require("path");
const session = require("express-session");
const { request } = require("express");
const { response } = require("express");
const expressValidator = require("express-validator");
const db = require("./config/db.js");
const indexRoutes = require("./routes/index");
const { ValidatorsImpl } = require("express-validator/lib/chain");

db.app.use(express.json());
dotenv.config();


const app = express();
const port = 5500;
const secretKey = 'd38d7a172ff22c70bf7286fe968692bc87527d61cfb521b5ef4eb0253a21ae27'


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "public/views"));
app.use(express.static(path.join(__dirname, "public/")));
app.use(cookieParser());



db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});


app.use("/", indexRoutes);

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "public/views/index.html"));
});

app.listen("5500", () => {
    console.log("Application is running successfully");
});