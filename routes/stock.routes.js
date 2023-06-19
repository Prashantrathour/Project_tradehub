const express = require("express");
const { StockModel, allStockModel } = require("../models/stock.model");
const { auth } = require("../middleware/auth.middleware");
const stockRouter = express.Router();

// stockRouter.use(auth)
// Get all stocks
stockRouter.get("/", async (req, res) => {
  const { page, limit } = req.query;
  if (page || limit) {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    try {
      const stocks = await StockModel.find().skip(skip).limit(limit);
      const number = await StockModel.countDocuments()
      const totalpage=Math.ceil(number/limit)
      res.json({result:stocks,page:page,limit:limit,totalpage});
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    return;
  }
  try {
    const stocks = await StockModel.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific stock by symbol
stockRouter.get("/:Symbol", async (req, res) => {
  try {
    const stockSymbol = await StockModel.find({ Symbol: req.params.Symbol });
    if (!stockSymbol) {
      return res.status(404).json({ message: "Stock not found" });
    } else if (stockSymbol) {
      res.json(stockSymbol);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
stockRouter.get("/allstocks/:Symbol", async (req, res) => {
  try {
    const stockSymbol = await allStockModel.findOne({ Symbol: req.params.Symbol });
    if (!stockSymbol) {
      return res.status(404).json({ message: "Stock not found" });
    } else if (stockSymbol) {
      res.json(stockSymbol);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { stockRouter };
