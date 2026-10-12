const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  title: String,
  category: String,
  amount: Number,
  type: { type: String, enum: ["income", "expense"] },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  splitWith: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      share: Number // how much this person owes
    }
  ]
});
module.exports = mongoose.model("Transaction", transactionSchema);
