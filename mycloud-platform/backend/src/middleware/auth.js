const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.b4ff2064b0e1fd12be472e3b2e05d546c4225839b07544fe7d7d7a53f87403acae0ee50bdbc8c7875eca93b9907668463d686153a9f17bcc142285098677a4a4);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

