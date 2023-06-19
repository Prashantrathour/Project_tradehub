const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  Symbol: {
    type: String,
    required: true
  },
  Date: {
    type: String,
    required: true
  },
  Open: {
    type: Number,
    required: true
  },
  High: {
    type: Number,
    required: true
  },
  Low: {
    type: Number,
    required: true
  },
  Close: {
    type: Number,
    required: true
  },
  Volume: {
    type: Number,
    required: true
  },
  // logoUrl: {
  //   type: String,
  //   required: true
  // }
});
const StockModel= mongoose.model('stocks', stockSchema);
const allStockModel= mongoose.model('allstocks', stockSchema);
module.exports ={ StockModel,allStockModel}