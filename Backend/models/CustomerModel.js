import {Schema,model} from "mongoose"
const CustomerSchema=new Schema({
    UserId:{
        type:Schema.Types.ObjectId,
        required:[true,"UserId is required"]
    },
    name:{
        type:String,
        required:[true,"Customer Name required"]
    },
    phone:{
        type:Number,
        required:[true,"Phone number is required"]
    }
},
{
    versionKey:false,
    timestamps:true,
})
export const CustomerModel =new model("customer",CustomerSchema)