const _db = require("../config/db");

const isRequestRejected = async (req, res, next) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();

    try {
        // Example SQL query to fetch request status by requestId
        let sql = `SELECT status FROM requests WHERE requestId = ?`;
        let [rows] = await db.execute(sql, [requestId]);

        if (!rows || rows.length === 0) {
            res.status(404).json({
                isOk: false,
                msg: "Request not found.",
            });
        } else {
            let status = rows[0].status;
            if (status === "rejected") {
                res.json({
                    isOk: false,
                    msg: "This request is already rejected.",
                });
            } else {
                next(); // Proceed to next middleware
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error"); // handle server error
    }
};

module.exports = {
    isRequestRejected,
};
