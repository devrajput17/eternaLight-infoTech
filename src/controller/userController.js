const userModel=require("../model/userModel.js")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")

const isValid= function(value){
    if(typeof(value)==undefined || typeof (value)==null) return false
    if(typeof(value)==String && value.trim().length==0) return false
    return true
}

const createUser= async function(req,res){
    try{
        let data =req.body
        if(Object.keys(data)==0) return res.status(400).send({status:false,msg:"please provide data"})

        const {name,email,password}=data

        if(!isValid(name)) return res.status(400).send({status:false,msg:"provide user name"})

        if(!isValid(email)) return res.status(400).send({status:false,msg:"provide user emailId"})

        if(!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){
            return res.status(400).send("please provide valid email")
        }

        const isEmail = await userModel.findOne({email:email})
        if(isEmail)   return res.status(400).send({status:false,msg:"email already exists"})

        if(!isValid(password)) return res.status(400).send({status:false,msg:"provide user password"})

        if (!(password.length > 8 && password.length < 15))
            return res.status(400).json({msg: "please ensure password length is in between 8-15"})

        let saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds)
        console.log(salt)
        let hash = await bcrypt.hash(req.body.password, salt)
        console.log(hash)

        const registerUser= await userModel.create(data)
        res.status(201).send({msg:data})

    }
    catch(err){
        res.status(500).send({msg:err.message})
    }
}

module.exports.createUser=createUser
///////////////////////////////////////////////////////////////////////////////////////////////////////////

const loginUser=async function (req,res){
    try{

        let data=req.body

        if (Object.keys(data)==0) return res.status(400).send({status:false, msg: "invalid paramaters please provide email-password" });

        let { email, password } = data;

        if (!isValid(email))  return res.status(400).send({ status: false, msg: "email is required" });

        const findUser = await userModel.findOne({ email });

        if (!findUser)  return res.status(401).send({ status: false, message: `Login failed! email is incorrect.` });


        if (!isValid(password))  return res.status(400).send({ status: false, msg: "password is required" });

        let encryptedPassword = findUser.password;

        const loggedUser = await bcrypt.compare(password, encryptedPassword);

    if (!loggedUser) {
      return res.status(401).send({ status: false, msg:" Login failed! password is incorrect" });
    }

    let userId = findUser._id;

    let token = await jwt.sign(
      {
        userId: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
      },
      "eternaLight infoTech"
    );

    res.status(200).send({ status: true, msg: "loggedin successfully", data: { userId, token } });


    }catch(err){
        res.status(500).send({msg:err.message})
    }
}

module.exports.loginUser=loginUser


///////////////////////////////////////////////////////////////////////////////////////////////////////
const getUser = async function (req, res) {
  try {
    let userId = req.params.userId
    let userIdFromToken = req.userId;

    
    if (!isValid(userId)) {
      return res.status(400).send({ status: false, msg: "userId invalid" })
    }
    let userProfile = await userModel.findById(userId)
    if (!userProfile) {
      return res.status(404).send({ status: false, msg: "not found " })
    }
    const findUser = await userModel.findById({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` })
        }
        //Authentication & authorization
        if (findUser._id.toString() != userIdFromToken) {
            return res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
        }

    let result = {
      
      _id: userProfile._id,
      name: userProfile.fname,
      email: userProfile.email,
      password: userProfile.password,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    }
    return res.status(200).send({ status: true, data: result })
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
};


module.exports.getUser = getUser



////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateUser = async function (req, res) {
  try {
      const userId = req.params.userId
      let userIdFromToken = req.userId;


      const findUser = await userModel.findById({ _id: userId })
      if (!findUser) {
          return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` })
      }
      //Authentication & authorization
      if (findUser._id.toString() != userIdFromToken) {
          return res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
      }
      if (!validator.isValid(userId)) {
          return res.status(400).send({ status: false, msg: "userId is required" })
      }
      if (!validator.isValidObjectId(userId)) {
          return res.status(400).send({ status: false, msg: "userId is invalid" })
      }
      let { name, email, password} = req.body
      const dataObject = {};
      if (Object.keys(req.body) == 0) {
          return res.status(400).send({ status: false, msg: "enter data to update" })
      }
      if (isValid(name)) {
          dataObject['name'] = name.trim()
      }
      if (isValid(email)) {
          let findMail = await userModel.findOne({ email: email })
          if (findMail) {
              return res.status(400).send({ status: false, msg: "this email is already register" })
          }
          dataObject['email'] = email.trim()
      }
      if (isValid(password)) {
          if (!password.length >= 8 && password.length <= 15) {
              return res.status(400).send({ status: false, msg: "password length should be 8 to 15" })
          }
          let saltRound = 10
          const hash = await bcrypt.hash(password, saltRound)
          dataObject['password'] = hash
      }
      const updateProfile = await userModel.findOneAndUpdate({ userId }, dataObject , { new: true })
      if (!updateProfile) {
          return res.status(404).send({ status: false, msg: "user profile not found" })
      }
      return res.status(200).send({ status: true, msg: "User Profile updated", data: updateProfile })

  }
  catch (err) {
      return res.status(500).send({ status: false, msg: err.message })
  }
}

module.exports.updateUser = updateUser
///////////////////////////////////////////////////////////////////////////////////////////////

const userLogout = async function(req,res){
    try {
        const deletedToken =  res.clearCookie("jwt")
        return res.status(200).send({status:true, msg:"jwt is deleted successfully",data:deletetoken})
          
    } catch (err) {
      return res.status(500).send({status:false,error:err.message})
    }
  }

  module.exports.userLogout=userLogout

