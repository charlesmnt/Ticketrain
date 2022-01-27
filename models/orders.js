const mongoose = require("mongoose"); 

let orderSchema = mongoose.Schema({
date_insert: Date, 
total: Number, 
user_email: String,
journeys: [{ type: mongoose.Schema.Types.ObjectId, ref: "journeys"}]
}); 

let OrderModel = mongoose.model("orders", orderSchema); 

module.exports = OrderModel; 
