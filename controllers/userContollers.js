//homepage
const jwt = require("../utils/jwt");
const _db = require("../config/db");
require("dotenv").config();

exports.getHomepage = (req, res) => {
    let token = req.cookies["accesstoken"];
    jwt.verify(token, process.env.jwt_secret, (err, user) => {
        if (err) {
            // Render the landing page if not logged in
            res.render("user/homepage.ejs");
        } else {
            res.redirect("/home");
        }
    });
};
//sign up page
exports.getSignupPage = (req, res) => {
    res.render("user/signup.ejs");
  };
  
  
  //login page
  exports.getLoginPage = (req, res) => {
    res.render("user/login.ejs");
  };
//signup user
const bcrypt = require("../utils/bcrypt");
const _db = require("../config/db");

exports.signupUser = async (req, res) => {
    let entered_data = req.body;
    let db = _db.getDb();
    let { number, password, email } = entered_data;

    entered_data.password = bcrypt.hashPassword(password);
    entered_data.time_stamp = new Date().toGMTString();

    try {
        // Example SQL query to insert a new user
        let sql = `
            INSERT INTO users (number, password, email, time_stamp) 
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(sql, [number, entered_data.password, email, entered_data.time_stamp]);

        res.send("You are signed Up Now <a href='/login'>Login Here</a>");
    } catch (err) {
        console.error(err);
        res.send("There was an error signing up.");
    }
};
//login user
const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");
const _db = require("../config/db");
require("dotenv").config();

exports.loginUser = async (req, res) => {
    let { email, password } = req.body;
    let db = _db.getDb();

    try {
        // Example SQL query to fetch user by email
        let sql = `SELECT * FROM users WHERE email = ?`;
        let [result] = await db.execute(sql, [email]);

        if (!result || result.length === 0) {
            res.send("Email or password is wrong");
        } else {
            let password_in_db = result[0].password;
            let is_password_right = bcrypt.comparePassword(password, password_in_db);

            if (!is_password_right) {
                res.send("Email or password is wrong");
            } else {
                let access_token = jwt.sign({ email }, process.env.jwt_secret, { expiresIn: "5h" });
                res.cookie("accesstoken", access_token);
                console.log("User logged in");
                res.redirect("/home");
            }
        }
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
//dashboard
const jwt = require("../utils/jwt");
const _db = require("../config/db");

exports.getUserDashboard = async (req, res) => {
    let token = req.cookies["accesstoken"];
    let email = jwt.decode(token, process.env.jwt_secret).email;
    let db = _db.getDb();

    try {
        // Example SQL query to get requests associated with user email
        let sql = `
            SELECT * 
            FROM requests 
            WHERE email = ?
        `;
        let [result] = await db.execute(sql, [email]);

        let total_requests = result.length;
        let total_pending = result.filter(item => item.status === "pending").length;
        let total_resolved = result.filter(item => item.status === "resolved").length;
        let total_pickup_request = result.filter(item => item.request_type === "Pickup").length;
        let total_complaint_request = result.filter(item => item.request_type === "Complaint").length;
        let total_recycling_request = result.filter(item => item.request_type === "Recycling").length;
        let total_other_request = result.filter(item => item.request_type === "Other").length;
        let total_unassigned_driver_requests = result.filter(item => item.assignedDriver === "none").length;

        res.render("user/userDashboard.ejs", {
            result: {
                total_requests,
                total_pending,
                total_resolved,
                total_pickup_request,
                total_complaint_request,
                total_recycling_request,
                total_other_request,
                total_unassigned_driver_requests,
            },
        });
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
//logout user
exports.logoutUser = (req, res) => {
    res.clearCookie("accesstoken");
    res.redirect("/");
};
//raise and submit request
const jwt = require("../utils/jwt");
const _db = require("../config/db");

exports.getRaiseRequestPage = (req, res) => {
    res.render("user/request.ejs");
};

exports.submitRequest = async (req, res) => {
    let token = req.cookies["accesstoken"];
    let email = jwt.decode(token, process.env.jwt_secret).email;
    let data_to_insert_in_db = req.body;
    data_to_insert_in_db.email = email;
    data_to_insert_in_db.status = "pending";
    data_to_insert_in_db.time = new Date().toLocaleString();
    data_to_insert_in_db.assignedDriver = "none";

    let db = _db.getDb();

    try {
        // Example SQL query to insert a new request
        let sql = `
            INSERT INTO requests (email, request_type, status, time, assignedDriver) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(sql, [
            data_to_insert_in_db.email,
            data_to_insert_in_db.request_type,
            data_to_insert_in_db.status,
            data_to_insert_in_db.time,
            data_to_insert_in_db.assignedDriver
        ]);

        res.send("Your request has been submitted to our database.");
    } catch (err) {
        console.error(err);
        res.send("There was an error submitting the request.");
    }
};
//get my request.
const jwt = require("../utils/jwt");
const _db = require("../config/db");

exports.getMyRequests = async (req, res) => {
    let email = jwt.decode(req.cookies["accesstoken"], process.env.jwt_secret).email;
    let db = _db.getDb();

    try {
        // Example SQL query to get all requests associated with user email
        let sql = `
            SELECT * 
            FROM requests 
            WHERE email = ?
        `;
        let [result] = await db.execute(sql, [email]);

        res.render("user/my-requests.ejs", { requests: result.reverse() });
    } catch (err) {
        console.error(err);
        res.send("There was an error fetching requests.");
    }
};
