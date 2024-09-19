const jwt = require("../utils/jwt");
require("dotenv").config();

const isDriverLoggedIn = async (req, res, next) => {
  let access_token = req.cookies["accesstoken"];
  
  try {
    let decoded_jwt = jwt.decode(access_token, process.env.jwt_secret);
    req.driverId = decoded_jwt.id; // storing driver id in request object
    req.role = decoded_jwt.role; // storing role in request object.
    next(); // Proceed to next middleware
  } catch (err) {
    res.redirect("/driver"); // Redirect to login page
  }
};

module.exports = {
  isDriverLoggedIn,
};