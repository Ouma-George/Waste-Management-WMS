// admincontrollers.js

const bcrypt = require('bcrypt');
const db = require('../config/db'); // Assuming db.js exports a pool

exports.redirectToLogin = (req, res) => {
    res.redirect('/admin/login');
};

exports.getLoginPage = (req, res) => { 
    if (req.session.isAdmin) {
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/adminlogin.html');
    }
};

exports.loginAdmin = async (req, res) => {
    let { email, password } = req.body;
    let mail = "georgeouma90@gmail.com";
    let hashed_pass = "d38d7a172ff22c70bf7286fe968692bc87527d61cfb521b5ef4eb0253a21ae27" // Admin@123 hashed with bcrypt

    // Example of checking credentials (replace with actual SQL query)
    if (email === mail && bcrypt.compareSync(password, hashed_pass)) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.send('Email or Password is wrong');
    }
};

exports.getAdminDashboard = async (req, res) => {
    try {
        // Example queries to get data (replace with actual SQL queries)
        const [
            result,
            driverData,
            userData
        ] = await Promise.all([
            db.query('SELECT * FROM requests'),
            db.query('SELECT vehicleType FROM drivers'),
            db.query('SELECT name FROM users')
        ]);

        const total_requests = result.length;
        const total_pending = result.filter(item => item.status === 'pending').length;
        const total_resolved = result.filter(item => item.status === 'resolved').length;
        // Calculate other totals similarly

        res.render('admin/adminDashboard.ejs', {
            result: {
                total_requests,
                total_pending,
                total_resolved,
                // Add other totals here
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const [requests, allDrivers] = await Promise.all([
            db.query('SELECT * FROM requests'),
            db.query('SELECT name FROM drivers')
        ]);

        res.render('admin/all-requests.ejs', { requests: requests.reverse(), drivers: allDrivers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.assignDriver = async (req, res) => {
    try {
        let { driverId, requestId } = req.query;

        // Example SQL update query to assign driver (replace with actual SQL query)
        const result = await db.query(
            'UPDATE requests SET assignedDriver = ? WHERE requestId = ?',
            [driverId, requestId]
        );

        if (result.affectedRows > 0) {
            res.json({
                isOK: true,
                msg: 'The driver has been assigned',
                driverName: driverId // Change this to the actual driver name retrieval logic
            });
        } else {
            res.json({
                isOK: false,
                msg: 'Something went wrong.'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Other functions like unassignDriver, rejectRequest, createDriver, getAllDrivers, deleteDriver, logoutAdmin should similarly be adjusted to use SQL queries.
