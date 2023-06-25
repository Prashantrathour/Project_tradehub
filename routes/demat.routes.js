const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const { DematModel } = require("../models/demat.model");
const { auth } = require("../middleware/auth.middleware");
const { UserModel } = require("../models/user.model");
// require("dotenv").config()
const dematRouter = express.Router();

// Apply authentication middleware to all routes
dematRouter.use(auth);

// Get user's demat account
dematRouter.get("/", async (req, res) => {
  try {
    // Retrieve the logged-in user's ID from the request object
    const userId = req.user.userID;

    // Find the demat account associated with the user ID
    const dematAccount = await DematModel.findOne({ user: userId });

    if (!dematAccount) {
      return res.status(404).json({ message: "Demat account not found" });
    }

    res.json(dematAccount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create demat account for the logged-in user
dematRouter.post("/account", async (req, res) => {
  const { email, mobileNumber, bankDetails } = req.body;
  try {
    
    const userId = req.body.userID;

    // Check if the user already has a demat account
    const existingAccount = await DematModel.findOne({ user: userId });
    if (existingAccount) {
      return res
        .status(400)
        .json({ error: "User already has a demat account" });
    }

    const dematAccount = new DematModel(req.body);
    dematAccount.user = userId;
    dematAccount.demateAccountNumber = `${Math.floor(
      100000 + Math.random() * 900000000
    )}`;
    // Set the user ID
    dematAccount.bankDetails[0] = req.body.banksDetails; // Set the bank details

    // Save the demat account
    await dematAccount.save();

    res.status(201).json(dematAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update demat account for the logged-in user
dematRouter.get("/holding", async (req, res) => {
  try {
 
    const userId = req.body.userID;

    // Find the demat account associated with the user ID
    const dematAccount = await DematModel.findOne({ user: userId });

    if (!dematAccount) {
      return res.status(404).json({ error: "Demat account not found" });
    }

const holding=dematAccount.holdings
// const find=holding.find(hold=>hold.stockSymbol==req.params.symbol)
    res.json(holding);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete demat account for the logged-in user
dematRouter.get("/account/:id", async (req, res) => {
  try {
    // Retrieve the logged-in user's ID from the request object
    const userId = req.user.userID;

    // Find and delete the demat account associated with the user ID
    const deletedAccount = await DematModel.findOneAndDelete({ user: userId });

    if (!deletedAccount) {
      return res.status(404).json({ message: "Demat account not found" });
    }

    res.json({ message: "Demat account deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

dematRouter.post("/buy", async (req, res) => {
  try {

    const { userID, stockSymbol, quantity, averagePrice } = req.body;

    
    const dematAccount = await DematModel.findOne({ userID });

    if (!dematAccount) {
      return res.status(404).json({ msg: "Demat account not found Please create Demate account" });
    }

    dematAccount.holdings.push({
      stockSymbol,
      quantity,
      averagePrice
    });

    // Update the balance and add a transaction for the purchase
    const updated=await DematModel.findOneAndUpdate({ userID }, dematAccount);

    res
      .status(200)
      .json({updated, msg: "Congratulations you have purchase stock" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Sell stocks route
dematRouter.post('/sell', async (req, res) => {
  try {
    // Extract the data from the request body
    const { userID, stockSymbol, quantity, price } = req.body;

    // Find the demat account based on the account number
    const dematAccount = await DematModel.findOne({ userID });

    if (!dematAccount) {
      return res.status(404).json({ error: 'Demat account not found' });
    }

    // Find the stock holding to sell
    const holding = dematAccount.holdings.find((holding) => holding.stockSymbol === stockSymbol);

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock quantity' });
    }

    // Update the quantity and average price of the stock holding
    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      // Remove the holding if the quantity becomes zero
      dematAccount.holdings = dematAccount.holdings.filter((holding) => holding.quantity > 0);
    }

    // Update the balance and add a transaction for the sale
    await dematAccount.updateBalanceAndTransaction('Sell', stockSymbol, quantity, price);

    res.status(200).json(dematAccount);
  } catch (error) {
    console.error('Error selling stocks:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = {
  dematRouter,
};
