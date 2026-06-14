import { Schema , model} from "mongoose";
const UserSchema=new Schema({
    role:{
        type:String,
        required:true,
        default:"USER",
        enum:["USER","ADMIN"],
    },
    Name:{
        type: String,
        required:[true,"Name must not be empty"]
    },
    email:{
        type:String,
        required:[true,"email must not be empty"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"password cannot be empty"]
    },
    razorpayConnected:{
        type:Boolean,
        required:[true,"razorpay status needed"],
        default:false
    },
    razorpayId:{
        type:String
    },
    accesssToken:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true,
    versionKey:false,
}
)
export const UserModel=new model("user",UserSchema)
