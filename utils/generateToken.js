const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = generateToken;



// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role || 'user', // Ensure role exists on your schema
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };