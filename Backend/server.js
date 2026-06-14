import exp from "express"
import {config} from "dotenv"
import cors from "cors"
import { connect } from "mongoose"
import { commonApp } from "./API/commonApi.js"
import { transactionApp } from "./API/transactionsApi.js"
import { customerApp } from "./API/customerApi.js"
import {razor} from "./API/razorpayApi.js"
import {payment} from "./API/paymentApi.js"
import cookieParser from "cookie-parser"
config()
const app=exp()
app.use(exp.json())
app.use(cors({
    origin: "https://digital-udhaar-khatabook.vercel.app/",
    credentials: true,
  }))
app.use(cookieParser())
app.use("/api/common",commonApp)
app.use("/api/transactions",transactionApp)
app.use("/api/razorpay",razor)
app.use("/api/payment",payment)
app.use("/api/customers",customerApp)
const connectDb=async()=>{
    try{
        await connect(process.env.DB_URL)
        console.log("Db connected")
        app.listen(process.env.PORT || 4000, ()=>{console.log(`server listening on ${process.env.PORT}`)})
    }
    catch(err)
    {
        console.log(err)
    }
}
connectDb()
