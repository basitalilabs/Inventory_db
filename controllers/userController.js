const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const registerUser = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email) === false) {
    throw new AppError("Invalid email format", 400);
  }

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (existingUser.rowCount > 0) {
    throw new AppError("Email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
    [name, email, hashedPassword]
  );

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: newUser.rows[0],
  });
});

const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (user.rowCount === 0) {
    throw new AppError("Invalid email or password", 400);
  }

  const isMatch = await bcrypt.compare(password, user.rows[0].password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 400);
  }

  const token = jwt.sign(
    { id: user.rows[0].id, email: user.rows[0].email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const { password: _, ...safeUser } = user.rows[0];

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: { token, user: safeUser },
  });
});

module.exports = { registerUser, loginUser };