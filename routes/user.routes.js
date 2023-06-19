const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user.model");
require("dotenv").config();
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    let userExist = await UserModel.findOne({ email });
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else if (!/^[a-zA-Z ]*$/.test(firstName)) {
        res.status(400).json({ msg: "Invalid First Name!" });
      } else if (!/^[a-zA-Z ]*$/.test(lastName)) {
        res.status(400).json({ msg: "Invalid Last Name!" });
      } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.status(400).json({ msg: "Invalid emailId!" });
      } else if (
        !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(
          password
        )
      ) {
        res.status(400).json({
          msg: "Password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character and minimum legth should be 8!",
        });
      } else if (userExist) {
        res.status(400).json({
          msg: "Email already exist, please login or signup with another email",state:true,
        });
      } else {
        const user = new UserModel({
          firstName,
          lastName,
          email,
          password: hash,
        });
        await user.save();
        res.json({ msg: "New user registered" });
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;


  if(email&&password){

      try {
        const user = await UserModel.findOne({ email });
        if (user) {
          bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
              var token = jwt.sign(
                { userID: user._id, user: user.firstName },
                process.env.secret
              );
              res.json({ msg: "Logged In!", token,user:user.firstName });
            } else {
                res.status(400).json({ msg: "Wrong Credentials" });
            }
          });
        } else {
           res.status(400).json({ msg: "User does  not exist" });
        }
      } catch (err) {
         res.status(400).json({ error: err.message });
      }
  }else{
    res.status(404).json({msg:`please enter-${!email?"email":"password"}`})
  }
});

userRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out successfully" });
});

module.exports = {
  userRouter,
};
