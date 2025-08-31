const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "project-vault@secret";
const JWT_EXPIRES_IN = "7d";

const signup = async ({ email, password, fullName }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      password: hashedPassword, // add password field in schema!
    },
  });

  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    message: "Signup successful",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    token,
  };
};

module.exports = { signup, login };
