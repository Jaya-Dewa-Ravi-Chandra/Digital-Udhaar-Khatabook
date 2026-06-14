// routes/razorpayApi.js

import express from "express";
import axios from "axios";
import crypto from "crypto";

import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";

export const razor = express.Router();



// =====================================================
// GET /api/razorpay/connect
// =====================================================

razor.get(
  "/connect",

  verifyToken("USER"),

  async (req, res) => {
    try {

      const clientId =
        process.env.RAZORPAY_CLIENT_ID;

      const redirectUri =
        process.env.RAZORPAY_REDIRECT_URI;



      // ==========================================
      // STORE USER ID INSIDE STATE
      // ==========================================

      const state = req.user._id.toString();



      // ==========================================
      // CREATE AUTH URL
      // ==========================================

      const authUrl =
        `https://auth.razorpay.com/authorize` +
        `?response_type=code` +
        `&client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&state=${state}`;



      // ==========================================
      // REDIRECT TO RAZORPAY
      // ==========================================

      return res.redirect(authUrl);

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }
);




// =====================================================
// GET /api/razorpay/callback
// =====================================================

razor.get("/callback", async (req, res) => {
  try {

    const { code, state } = req.query;



    // ==========================================
    // STATE CONTAINS USER ID
    // ==========================================

    const userId = state;



    if (!code) {

      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });

    }



    // ==========================================
    // EXCHANGE CODE FOR TOKEN
    // ==========================================

    const response = await axios.post(

      "https://auth.razorpay.com/token",

      {
        grant_type: "authorization_code",
        code,
      },

      {
        auth: {
          username:
            process.env.RAZORPAY_CLIENT_ID,

          password:
            process.env.RAZORPAY_CLIENT_SECRET,
        },
      }
    );



    const data = response.data;



    // ==========================================
    // SAVE MERCHANT DETAILS
    // ==========================================

    await UserModel.findByIdAndUpdate(

      userId,

      {
        razorpayConnected: true,

        razorpayId: data.merchant_id,

        accesssToken: data.access_token,
      },

      {
        new: true,
      }
    );



    // ==========================================
    // REDIRECT FRONTEND
    // ==========================================

    return res.redirect(
      "http://localhost:5173/dashboard?razorpay=connected"
    );

  } catch (error) {

    console.log(
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data || error.message,
    });

  }
});




// =====================================================
// DELETE /api/razorpay/disconnect
// =====================================================

razor.delete(
  "/disconnect",

  verifyToken("USER"),

  async (req, res) => {
    try {

      const userId = req.user._id;



      await UserModel.findByIdAndUpdate(

        userId,

        {
          razorpayConnected: false,

          razorpayId: null,

          accesssToken: null,
        }
      );



      return res.status(200).json({
        success: true,
        message: "Razorpay disconnected",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }
);




// =====================================================
// GET /api/razorpay/status
// =====================================================

razor.get(
  "/status",

  verifyToken("USER"),

  async (req, res) => {
    try {

      const user = await UserModel.findById(
        req.user._id
      );



      return res.status(200).json({
        success: true,

        connected:
          user.razorpayConnected,

        merchantId:
          user.razorpayId,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }
);



export default razor;