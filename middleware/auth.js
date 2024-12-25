const jwt = require("jsonwebtoken");

async function verifyUser(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .send({ result: "Fail", message: "No token provided" });
  }

  jwt.verify(token, process.env.USER_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ result: "Fail", message: "Invalid token" });
    }
    req.user = decoded; 
    next(); 
  });
}

module.exports = { verifyUser };
