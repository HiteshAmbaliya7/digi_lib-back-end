const User = require("../models/User");

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ users: users.map((u) => u.toSafeObject()) });
  } catch (err) {
    res.status(500).json({ message: "Could not load users.", error: err.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;
    console.log("add user ", req.body);

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Could not add this user.", error: err.message });
  }
};

exports.removeUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot remove your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User removed." });
  } catch (err) {
    res.status(500).json({ message: "Could not remove this user.", error: err.message });
  }
};
