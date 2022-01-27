const mongoose = require("mongoose"); 

let userSchema = mongoose.Schema({
  firstName: String,
  lastName: String, 
  email: String, 
  password: String, 
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "orders"}]
}); 

let UserModel = mongoose.model("users", userSchema); 

module.exports = UserModel; 
