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
    const userId = req.body?.userID;

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

    const existingAccount = await DematModel.findOne({ user: userId });
    if (existingAccount) {
      return res
        .status(400)
        .json({ error: "User has already  a demat account", user_exist: true });
    }

    const dematAccount = new DematModel(req.body);
    dematAccount.user = userId;
    dematAccount.demateAccountNumber = `${Math.floor(
      100000 + Math.random() * 900000000
    )}`;
    // Set the user ID
    dematAccount.bankDetails[0] = req.body.banksDetails; // Set the bank details
    dematAccount.verificationStatus = false;
    // Save the demat account
    await dematAccount.save();

    res.status(201).json({ message: "Demate account created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
dematRouter.post("/verify", async (req, res) => {
  try {
    const userId = req.body.userID;

    const existingAccount = await DematModel.findOne({ user: userId });
    if (existingAccount) {
      const dematAccount = new DematModel(existingAccount);
      dematAccount.user = userId;

      dematAccount.verificationStatus = req.body.verificationStatus;
      dematAccount.mobilenumber = req.body.mobilenumber;
      // Save the demat account
      await dematAccount.save();

      res.status(201).json({ message: "Demate account updated successfully" });
    } else {
      res
        .status(404)
        .json({ error: "User Not Found Please create Demate Account" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
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

    const holding = dematAccount.holdings;
    // const find=holding.find(hold=>hold.stockSymbol==req.params.symbol)
    res.json(holding);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
dematRouter.get("/transactions", async (req, res) => {
  try {
    const userId = req.body.userID;

    // Find the demat account associated with the user ID
    const dematAccount = await DematModel.findOne({ user: userId });

    if (!dematAccount) {
      return res.status(404).json({ error: "Demat account not found" });
    }

    const transactions = dematAccount.transactions;
    // const find=holding.find(hold=>hold.stockSymbol==req.params.symbol)
    res.json(transactions);
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
      return res
        .status(404)
        .json({ msg: "Demat account not found. Please create a Demat account." });
    }

    if (dematAccount.verificationStatus) {
      const existingStock = dematAccount.holdings.find((stock) => stock.stockSymbol === stockSymbol);

      if (existingStock) {
        existingStock.quantity += quantity;
      } else {
        dematAccount.holdings.push({
          stockSymbol,
          quantity,
          averagePrice,
        });
      }

      // Update the balance and add a transaction for the purchase
      const updated = await DematModel.findOneAndUpdate(
        { userID },
        dematAccount
      );

      res
        .status(200)
        .json({ updated, msg: "Congratulations, you have purchased the stock." });
    } else {
      return res
        .status(404)
        .json({ msg: "Your account is not verified.", verify: false });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error." });
  }
});
dematRouter.post("/buy", async (req, res) => {
  try {
    const { userID, stockSymbol, quantity, averagePrice } = req.body;

    const dematAccount = await DematModel.findOne({ userID });

    if (!dematAccount) {
      return res
        .status(404)
        .json({ msg: "Demat account not found. Please create a Demat account." });
    }

    if (dematAccount.verificationStatus) {
      const existingStock = dematAccount.holdings.find((stock) => stock.stockSymbol === stockSymbol);

      if (existingStock) {
        existingStock.quantity += quantity;
      } else {
        dematAccount.holdings.push({
          stockSymbol,
          quantity,
          averagePrice,
        });
      }

      // Update the balance and add a transaction for the purchase
      const updated = await DematModel.findOneAndUpdate(
        { userID },
        dematAccount
      );

      res
        .status(200)
        .json({ updated, msg: "Congratulations, you have purchased the stock." });
    } else {
      return res
        .status(404)
        .json({ msg: "Your account is not verified.", verify: true });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error." });
  }
});

// Sell stocks route
dematRouter.post("/sell", async (req, res) => {
  try {
    const { userID, stockSymbol, quantity } = req.body;
    

    const dematAccount = await DematModel.findOne({ userID });

    if (!dematAccount) {
      return res
        .status(404)
        .json({ msg: "Demat account not found. Please create a Demat account." });
    }

    if (dematAccount.verificationStatus) {
      const existingStock = dematAccount.holdings.find((stock) => stock.stockSymbol === stockSymbol);

      if (!existingStock) {
        return res.status(404).json({ msg: "No such stock found in your holdings." });
      }

      if (existingStock.quantity >= quantity) {
        existingStock.quantity -= quantity;

        if (existingStock.quantity === 0) {
          // Remove the stock from holdings
          dematAccount.holdings = dematAccount.holdings.filter(
            (stock) => stock.stockSymbol !== stockSymbol
          );
        }
        // quantity=+quantity
        // const price=+(existingStock.averagePrice)
        // const totalAmount=+(existingStock.averagePrice*quantity)
        console.log(existingStock.averagePrice,quantity)
        dematAccount.transactions.push({quantity,stockSymbol,price:existingStock.averagePrice,totalAmount:existingStock.averagePrice*quantity})
        // Update the balance and add a transaction for the sale
        const updated = await DematModel.findOneAndUpdate(
          { userID },
          dematAccount
        );

        res.status(200).json({ updated, msg: "Stock sold successfully." });
      } else {
        return res.status(400).json({ msg: "Insufficient quantity to sell." });
      }
    } else {
      return res
        .status(404)
        .json({ msg: "Your account is not verified.", verify:true });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error." });
  }
});


module.exports = {
  dematRouter,
};
