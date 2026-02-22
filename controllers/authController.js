import validator from "validator";
import { getDBConnection } from "../db/db.js";
import bcrypt from "bcryptjs";
export async function registerUser(req, res) {
  let { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  name = name.trim();
  email = email.trim();
  username = username.trim();
  const hash =  await bcrypt.hash(password, 10);

  if (!/^[a-zA-Z0-9_-]{1,20}$/.test(username)) {
    return res
      .status(400)
      .json({
        error:
          "Username must be 1–20 characters, using letters, numbers, _ or -.",
      });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const db = await getDBConnection();
    const existing = await db.get(
      `SELECT id FROM users WHERE username=? OR email=?`,
      [username, email],
    );

    if (existing) {
      res.status(400).json({ error: "Email or username already in use." });
    }

    const result = await db.run(
      `INSERT INTO users (name,username,email,password) VALUES (?,?,?,?)`,
      [name, username, email, hash],
    );

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }

  console.log("req.body", req.body);
}
