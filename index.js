const express = require("express");
const { connection } = require("./db");
const { userRouter } = require("./routes/user.routes")
const { stockRouter } = require("./routes/stock.routes");
const { dematRouter } = require("./routes/demat.routes");
const cors = require("cors");
require("dotenv").config()
const cookieParser=require("cookie-parser")
const app = express()
app.use(cookieParser());
app.use(cors())
app.use(express.json())

app.use("/stocks", stockRouter)
app.use("/users", userRouter)
app.use("/demat",dematRouter)

app.listen(process.env.port,async()=>{
    try{
        await connection
        console.log(`Running port ${process.env.port}`)
        console.log("connected to DB")
    }catch(err){
        console.log(err)
        console.log("something went wrong")
    }
})