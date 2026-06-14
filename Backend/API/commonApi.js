import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { hash, compare } from "bcrypt";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/VerifyToken.js";
const { sign } = jwt;
export const commonApp = exp.Router();
config();

// ── Sign Up ────────────────────────────────────────────
commonApp.post("/signup", async (req, res) => {
  try {
    const newUser = req.body;
    newUser.password = await hash(newUser.password, 12);
    const newUserDoc = new UserModel(newUser);
    await newUserDoc.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// ── Sign In ────────────────────────────────────────────
commonApp.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Invalid email" });
  const isMatched = await compare(password, user.password);
  if (!isMatched)
    return res.status(400).json({ message: "Invalid password" });
  if (!user.isActive)
    return res.status(403).json({ message: "Your account is blocked by Admin" });
  const signedToken = sign(
    { id: user._id, email, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );
  res.cookie("token", signedToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  let userObj = user.toObject();
  delete userObj.password;
  res.status(200).json({ message: "login success", payload: userObj });
});

// ── Sign Out ───────────────────────────────────────────
commonApp.get("/Signout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  res.status(200).json({ message: "Logout success" });
});

// ── Check Auth ─────────────────────────────────────────
commonApp.get("/check-auth", verifyToken("USER", "ADMIN"), (req, res) => {
  res.status(200).json({ message: "authenticated", payload: req.user });
});

// ── Change Password ────────────────────────────────────
commonApp.put("/password", verifyToken("USER", "ADMIN"), async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const user = await UserModel.findOne({ email: req.user.email });
  const isMatched = await compare(oldpassword, user.password);
  if (!isMatched)
    return res.status(400).json({ message: "Invalid password" });
  const sameMatched = await compare(newpassword, user.password);
  if (sameMatched)
    return res.status(400).json({ message: "Can't be same as previous password" });
  const password = await hash(newpassword, 12);
  const updatedDoc = await UserModel.findOneAndUpdate(
    { email: req.user.email },
    { $set: { password } },
    { new: true }
  );
  await updatedDoc.save();
  res.status(200).json({ message: "Password changed" });
});

// ══════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════

// ── Get All Users ──────────────────────────────────────
// GET /api/common/users
commonApp.get("/users", verifyToken("ADMIN"), async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0 }); // exclude passwords
    res.status(200).json({ message: "Users fetched", payload: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// ── Block User ─────────────────────────────────────────
// PUT /api/common/block-user/:id
commonApp.put("/block-user/:id", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user)
      return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN")
      return res.status(403).json({ message: "Cannot block an admin" });
    if (!user.isActive)
      return res.status(400).json({ message: "User is already blocked" });
    await UserModel.findByIdAndUpdate(id, { $set: { isActive: false } });
    res.status(200).json({ message: "User blocked" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// ── Unblock User ───────────────────────────────────────
// PUT /api/common/unblock-user/:id
commonApp.put("/unblock-user/:id", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user)
      return res.status(404).json({ message: "User not found" });
    if (user.isActive)
      return res.status(400).json({ message: "User is already active" });
    await UserModel.findByIdAndUpdate(id, { $set: { isActive: true } });
    res.status(200).json({ message: "User unblocked" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});
