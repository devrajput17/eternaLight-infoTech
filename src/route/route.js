const express=require("express")
const router=express.Router();

const userController=require("../controller/userController.js")
const middleware = require('../middleware/token.js')


router.post("/createUser", userController.createUser)
router.post("/loginUser", userController.loginUser)
router.get("/getUser", userController.getUser)
router.put("/updateUser", userController.updateUser)
router.put("/userLogout", userController.userLogout)











module.exports=router