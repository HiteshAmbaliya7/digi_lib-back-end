const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { setAuthCookie, clearAuthCookie } = require("../utils/authCookie");

exports.signup = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    console.log("signup ", req.body);
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, mobile, password });
    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json({ user: user.toSafeObject(), token });
  } catch (err) {
    res.status(500).json({ message: "Could not create your account.", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login  ", req.body);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // password has select: false on the schema, so it must be requested explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const passwordMatches = user && (await user.comparePassword(password));

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(200).json({ user: user.toSafeObject(), token });
  } catch (err) {
    res.status(500).json({ message: "Could not log in.", error: err.message });
  }
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ message: "Logged out." });
};

// Called by the frontend on page load to rehydrate the session, since the
// httpOnly cookie can't be read or decoded by client-side JS.
exports.me = async (req, res) => {
  res.status(200).json({ user: req.user.toSafeObject() });
};
