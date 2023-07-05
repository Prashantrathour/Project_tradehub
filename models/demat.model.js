const mongoose = require("mongoose")

const dematSchema = new mongoose.Schema({
  demateAccountNumber: String,
  accountHolderName: String,
  balance: Number,
  email:String,
  mobilenumber:String,
  user:String,
  userID:String,
  verificationStatus:Boolean,
  holdings: [
    {
      stockSymbol: String,
      quantity: Number,
      averagePrice:Number
    }
  ],
  transactions: [
    {
      transactionId: mongoose.Types.ObjectId,
      date:  {
        type: String,
        default: () => new Date().toLocaleString()
      },
      
      stockSymbol: String,
      quantity: Number,
      price: Number,
      totalAmount: Number
    }
  ],
    bankDetails:[{
      bankName: String,
      accountNumber: String,
      branch: String,
      IFSC: String
    }]
});


dematSchema.methods.updateBalanceAndTransaction = async function (transactionType, stockSymbol, quantity, price) {
  const transactionAmount = quantity * price;
  const update = {
    $inc: { balance: transactionType === 'Buy' ? -transactionAmount : transactionAmount },
    $push: {
      transactions: {
        transactionId: mongoose.Types.ObjectId(),
        date: new Date(),
        type: transactionType,
        stockSymbol,
        quantity,
        price,
        totalAmount: transactionAmount
      }
    }
  };
  return this.updateOne(update).exec();
};

const DematModel = mongoose.model("dmat", dematSchema)

module.exports = {
    DematModel
} 