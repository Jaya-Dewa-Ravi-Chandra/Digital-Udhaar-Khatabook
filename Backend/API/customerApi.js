import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { CustomerModel } from "../models/CustomerModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { config } from "dotenv";
export const customerApp = exp.Router();
config();

//POST    /api/customers
customerApp.post("/upload-customer",verifyToken("USER"),async(req,res)=>{
    try{
    const {name,phone}=req.body
    const newCustomer=new CustomerModel({UserId:req.user.id,name:name,phone:phone})
    await newCustomer.save()
    if(newCustomer)
        return res.status(200).json({message:"Uploaded customer"})
}
catch(err)
{
    console.log(err)
    return res.status(500).json({err:err})
}
}
)
//GET     /api/customers
customerApp.get("/get-customers",verifyToken("USER"),async(req,res)=>{
    try{
        const payload=await CustomerModel.find({UserId:req.user.id})
        if(payload)
            return res.status(200).json({payload:payload})
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({err:err})
    }
})
//GET     /api/customers/:id
customerApp.get("/get-customerById/:id",verifyToken("USER"),async(req,res)=>{
    try{
        const id=req.params.id
        const payload=await CustomerModel.findOne({_id:id})
        if(payload)
            return res.status(200).json({payload:payload})
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({err:err})
    }
})
//PUT     /api/customers/:id
customerApp.put("/edit-customerById/:id",verifyToken("USER"),async(req,res)=>{
    try{
        const updatedCustomer=req.body
        const id=req.params.id
        const newCustomer=await CustomerModel.findOneAndUpdate({_id:id},{$set:updatedCustomer},{new:true})
        if(newCustomer)
            return res.status(200).json({payload:newCustomer})
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({err:err})
    }
})
//DELETE  /api/customers/:id
customerApp.delete("/delete-customerById/:id",verifyToken("USER"),async(req,res)=>{
    try{
        const id=req.params.id
        const deletedCustomer=await CustomerModel.findOneAndDelete({_id:id})
        if(deletedCustomer)
            return res.status(200).json({message:"customer deleted"})
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({err:err})
    }
})

