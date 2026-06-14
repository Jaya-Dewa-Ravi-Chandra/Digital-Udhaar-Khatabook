// routes/payment.routes.js

import express from "express";
import crypto from "crypto";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { TransactionModel } from "../models/TransactionModel.js";
import { config } from "dotenv";
import Razorpay from "razorpay";
config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const payment = express.Router();

// ==========================================================
// CREATE ORDER FOR SINGLE TRANSACTION
// POST /api/payment/create-order/:transactionId
// ==========================================================

payment.post("/create-order/:transactionId", verifyToken("USER"), async (req, res) => {
  try {

    const { transactionId } = req.params;
    const userId = req.user.id;

    // ======================================================
    // FIND USER(MERCHANT)
    // ======================================================

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ======================================================
    // FIND TRANSACTION
    // ======================================================

    const transaction = await TransactionModel.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Transaction already paid",
      });
    }

    // ======================================================
    // CREATE ORDER USING TEST KEYS (SDK)
    // ======================================================

    const order = await razorpay.orders.create({
      amount: transaction.amount * 100,
      currency: "INR",
      receipt: `txn_${transaction._id}`,
      notes: {
        transactionId: transaction._id.toString(),
        customerId: transaction.customerId.toString(),
      },
    });

    // ======================================================
    // SAVE ORDER ID
    // ======================================================

    transaction.paymentId = order.id;
    await transaction.save();

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.log(error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data || error.message,
    });
  }
});


// ==========================================================
// CREATE ORDER FOR ALL PENDING CUSTOMER TRANSACTIONS
// POST /api/payment/create-order/customer/:customerId
// ==========================================================

payment.post("/create-order/customer/:customerId", verifyToken("USER"), async (req, res) => {
  try {

    const { customerId } = req.params;
    const userId = req.user.id;

    // ===================================================
    // GET ALL PENDING TRANSACTIONS
    // ===================================================

    const transactions = await TransactionModel.find({
      userId,
      customerId,
      status: "NOT PAID",
      type: "credit",
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending payments",
      });
    }

    // ===================================================
    // CALCULATE TOTAL
    // ===================================================

    let totalAmount = 0;
    transactions.forEach((txn) => {
      totalAmount += txn.amount;
    });

    // ===================================================
    // CREATE ORDER USING TEST KEYS (SDK)
    // ===================================================

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `customer_${customerId}_${Date.now()}`,
      notes: {
        customerId,
        totalTransactions: transactions.length,
      },
    });

    // ===================================================
    // SAVE SAME ORDER ID TO ALL TXNS
    // ===================================================

    await TransactionModel.updateMany(
      {
        _id: {
          $in: transactions.map((txn) => txn._id),
        },
      },
      {
        paymentId: order.id,
      }
    );

    return res.status(200).json({
      success: true,
      totalAmount,
      totalTransactions: transactions.length,
      order,
    });

  } catch (error) {
    console.log(error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data || error.message,
    });
  }
});


// ==========================================================
// VERIFY PAYMENT
// POST /api/payment/verify
// ==========================================================

payment.post("/verify", async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ======================================================
    // FIND TRANSACTION USING ORDER ID
    // ======================================================

    const transaction = await TransactionModel.findOne({
      paymentId: razorpay_order_id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ======================================================
    // VERIFY SIGNATURE — uses RAZORPAY_KEY_SECRET (fixed)
    // ======================================================

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // ======================================================
    // UPDATE ALL MATCHING TRANSACTIONS TO PAID
    // ======================================================

    await TransactionModel.updateMany(
      { paymentId: razorpay_order_id },
      { status: "PAID" }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default payment;
