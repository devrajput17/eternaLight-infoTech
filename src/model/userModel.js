const mongoose=require("mongoose")
const ObjectId=mongoose.Schema.Types.ObjectId

const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minLength:8,
        maxLength:15,
        trim:true
    }
},{timestamps:true})

module.exports= mongoose.model("user", userSchema)