const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const { listUsers, addUser, removeUser } = require("../controllers/adminController");

router.use(protect, requireRole("admin"));

router.get("/users", listUsers);
router.post("/users", addUser);
router.delete("/users/:id", removeUser);

module.exports = router;
