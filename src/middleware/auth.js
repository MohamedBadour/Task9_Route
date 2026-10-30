import jwt from "jsonwebtoken";

// token is sent in the headers: { token: "<jwt>" }
export const auth = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ message: "Token not provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
