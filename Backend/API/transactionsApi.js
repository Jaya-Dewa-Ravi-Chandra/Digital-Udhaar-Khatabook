import exp from "express";
import { TransactionModel } from "../models/TransactionModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";

export const transactionApp = exp.Router();

// ======================================================
// POST /api/transactions/credit
// ======================================================
transactionApp.post("/credit", verifyToken("USER"), async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;
    const newTransaction = new TransactionModel({
      userId: req.user.id,
      customerId,
      type: "credit",
      amount,
      description,
      status: "NOT PAID",
    });
    await newTransaction.save();
    return res.status(201).json({ message: "Credit transaction added", payload: newTransaction });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ======================================================
// POST /api/transactions/debit
// ======================================================
transactionApp.post("/debit", verifyToken("USER"), async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;
    const newTransaction = new TransactionModel({
      userId: req.user.id,
      customerId,
      type: "debit",
      amount,
      description,
      status: "PAID",
    });
    await newTransaction.save();
    return res.status(201).json({ message: "Debit transaction added", payload: newTransaction });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ======================================================
// GET /api/transactions/:customerId
// Only returns non-deleted transactions
// ======================================================
transactionApp.get("/:customerId", verifyToken("USER"), async (req, res) => {
  try {
    const payload = await TransactionModel.find({
      userId: req.user.id,
      customerId: req.params.customerId,
      isDeleted: false,               // ← exclude soft deleted
    });
    return res.status(200).json({ payload });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ======================================================
// GET /api/transactions/trash/all
// Returns all soft-deleted transactions for the user
// ======================================================
transactionApp.get("/trash/all", verifyToken("USER"), async (req, res) => {
  try {
    const payload = await TransactionModel.find({
      userId: req.user.id,
      isDeleted: true,
    }).sort({ deletedAt: -1 });       // most recently deleted first
    return res.status(200).json({ payload });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ======================================================
// PUT /api/transactions/:id
// ======================================================
transactionApp.put("/:id", verifyToken("USER"), async (req, res) => {
  try {
    const updatedTransaction = await TransactionModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    return res.status(200).json({ message: "Transaction updated", payload: updatedTransaction });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ======================================================
// DELETE /api/transactions/soft/:id   ← SOFT DELETE
// Marks isDeleted = true, saves deletedAt timestamp
// ======================================================
transactionApp.delete("/soft/:id", verifyToken("USER"), async (req, res) => {
  try {
    const transaction = await TransactionModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    return res.status(200).json({ message: "Transaction moved to trash" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ======================================================
// PUT /api/transactions/restore/:id   ← RESTORE
// Moves transaction back from trash
// ======================================================
transactionApp.put("/restore/:id", verifyToken("USER"), async (req, res) => {
  try {
    const transaction = await TransactionModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found in trash" });
    return res.status(200).json({ message: "Transaction restored" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ======================================================
// DELETE /api/transactions/hard/:id   ← HARD DELETE
// Permanently removes from DB — only if already soft deleted
// ======================================================
transactionApp.delete("/hard/:id", verifyToken("USER"), async (req, res) => {
  try {
    const transaction = await TransactionModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: true,               // can only hard delete from trash
    });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found in trash" });
    return res.status(200).json({ message: "Transaction permanently deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});