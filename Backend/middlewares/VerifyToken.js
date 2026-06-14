import jwt from "jsonwebtoken"
import { config } from "dotenv"
config()
const{verify}=jwt
export const verifyToken=(...allowedRoles)=>//no of allowed roles differ from one role to another
{
    return(req,res,next)=>{
        try{
        let token=req.cookies?.token
        console.log(token)
        if(!token)
            return res.status(401).json({message:"please login first"})
        let decodedToken=verify(token,process.env.SECRET_KEY)
        req.user=decodedToken
        //check role of the user is same as the role in token
        if(!allowedRoles.includes(decodedToken.role))
            return res.json({message:"No access to perform given action"})
        next()
    }
    catch(err)
    {
        res.status(401).json({message:"invalid token"})
    }
}

}