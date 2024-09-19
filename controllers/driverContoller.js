const db = _db.getDb(); // Assuming _db exports a MySQL connection

exports.loginDriver = async (req, res) => {
    let { email, password } = req.body;

    try {
        // Example SQL query to fetch driver details
        let sql = `SELECT * FROM drivers WHERE email = ?`;
        let [result] = await db.execute(sql, [email]);

        if (!result || result.length === 0) {
            res.send("Wrong email or password");
        } else {
            let password_in_db = result[0].password;
            let isPasswordOk = bcrypt.comparePassword(password, password_in_db);

            if (isPasswordOk) {
                let access_token = jwt.sign({ id: result[0].id, role: "driver" }, process.env.jwt_secret);
                res.cookie("accesstoken", access_token);
                res.redirect("/driver/dashboard");
            } else {
                res.send("Wrong email or password");
            }
        }
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
exports.getDriverDashboard = async (req, res) => {
    try {
        let db = _db.getDb();

        // Example SQL query to get requests assigned to the driver
        let sql = `
            SELECT * 
            FROM requests 
            WHERE assignedDriverId = ?
        `;
        let [result] = await db.execute(sql, [req.driverId]);

        let total_pending = result.filter(item => item.status === "pending").length;
        let total_resolved = result.filter(item => item.status === "resolved").length;
        let total_rejected = result.filter(item => item.status === "rejected").length;
        let total_pickup_request = result.filter(item => item.request_type === "Pickup").length;
        let total_complaint_request = result.filter(item => item.request_type === "Complaint").length;
        let total_recycling_request = result.filter(item => item.request_type === "Recycling").length;
        let total_other_request = result.filter(item => item.request_type === "Other").length;

        res.render("driver/driverDashboard.ejs", {
            result: {
                total_requests: result.length,
                total_pending,
                total_resolved,
                total_rejected,
                total_pickup_request,
                total_complaint_request,
                total_recycling_request,
                total_other_request,
            },
        });
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
exports.getPendingRequests = async (req, res) => {
    let db = _db.getDb();

    try {
        // Example SQL query to get pending requests assigned to the driver
        let sql = `
            SELECT * 
            FROM requests 
            WHERE assignedDriverId = ? AND status = 'pending'
        `;
        let [result] = await db.execute(sql, [req.driverId]);

        res.render("driver/pendingRequests.ejs", { requests: result });
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
exports.resolveRequest = async (req, res) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();

    try {
        // Example SQL query to update request status to resolved
        let sql = `
            UPDATE requests 
            SET status = 'resolved' 
            WHERE _id = ? AND assignedDriverId = ?
        `;
        let [result] = await db.execute(sql, [requestId, req.driverId]);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
exports.rejectRequest = async (req, res) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();

    try {
        // Example SQL query to update request status to rejected
        let sql = `
            UPDATE requests 
            SET status = 'rejected' 
            WHERE _id = ? AND assignedDriverId = ?
        `;
        let [result] = await db.execute(sql, [requestId, req.driverId]);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
exports.getRequestHistory = async (req, res) => {
    try {
        let db = _db.getDb();

        // Example SQL query to get all requests assigned to the driver
        let sql = `
            SELECT * 
            FROM requests 
            WHERE assignedDriverId = ?
        `;
        let [result] = await db.execute(sql, [req.driverId]);

        res.render("driver/history.ejs", { requests: result.reverse() });
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
};
exports.logoutDriver = (req, res) => {
    res.clearCookie("accesstoken");
    res.redirect("/driver");
};
