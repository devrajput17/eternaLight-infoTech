const express=require("express")
const bodyParser=require("body-parser")
const route=require("./route/route.js")
const mongoose=require("mongoose")
const app=express()
const port=process.env.PORT||8000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb://localhost:27017/eternaLight",{useNewUrlParser:true})
.then(()=>console.log("mongodb is connected"))
.catch(err=>console.log("msg:msg.err"))

app.use("/",route)

app.listen(port,()=>{
    console.log(`express is running on port ${port}`)
})