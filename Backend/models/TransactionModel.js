import { Schema,model } from "mongoose";
const TransactionSchema= new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:[true,"UserId is required"]
    },
    customerId:{
        type:Schema.Types.ObjectId,
        required:[true,"customerId is required"]
    },
    type:{
    type:String,
    enum:["credit","debit"],
    required:[true,"field must have credit or debit"]
    },
    date:{
        type:Date,
        default:Date.now,
    },
    amount:{
        type:Number,
        required:[true,"amount is required"],
        min:[0,"cant be negative"]
    },
    description:{
        type:String,
    },
    status:{
        type:String,
        required:[true,"status is required"],
        enum:["NOT PAID","PAID"]
    },
    paymentId:{
        type:String
    },
     isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },

    
})
export const TransactionModel=new model("Transaction",TransactionSchema)