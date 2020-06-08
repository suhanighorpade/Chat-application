const jwt= require("jsonwebtoken")
const User= require("../models/user.js")
const Room= require("../models/room.js")

const auth= async function(req,res,next){

    try{
        const token= req.header("Authorization").replace("Bearer","").trim()
        const decoded =await jwt.verify(token,"secretkey")
        console.log(decoded)
        const user=await User.findOne({_id:decoded.id, 'tokens.token':token})
        if(!user)
            throw new Error("No such user")
        var room =await Room.findOne({
            title:req.params.title
        })
        if(!room)
           return res.status(404).send("No such room found")
        if(!room.isOwner(user))
           return res.status(401).send("Only onwer of room can perform this operation")
        
        req.room=room
        req.user=user
        req.token=token
        next()
    }
    catch(e){
        console.log(e)
        res.status(401).send(e)
    }
    
}


module.exports=auth