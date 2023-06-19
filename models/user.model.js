const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 40,
    },
    lastName:{
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    email:{
        type:String,
        required: true,
        unique: true   
    },
    password:String
})

const UserModel = mongoose.model("user",userSchema)

module.exports={
    UserModel
}