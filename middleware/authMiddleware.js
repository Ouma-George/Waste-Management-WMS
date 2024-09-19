const jwt = require("../utils/jwt");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.cookies["accesstoken"]; // get token from cookie

  try {
    jwt.verify(token, process.env.jwt_secret, (err, mail) => {
      if (err) {
        console.log(err);
        res.status(403).json("You are not logged in :("); // send error 403 fobbiden if token is invalid
      } else {
        // if token is valid, proceed to next middleware
        req.mail = mail; // store mail in request object
        next();
      }
    });
  } catch (err) {
    res.status(500).json("This is an error"); // handle other esceptions with 500 internal server error
  }
};

module.exports = authMiddleware;