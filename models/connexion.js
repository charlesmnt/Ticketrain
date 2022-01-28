const mongoose = require('mongoose');
const dotenv = require("dotenv"); 
dotenv.config();

var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true
 };

// --------------------- BDD -----------------------------------------------------
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@cluster0.2ozuf.mongodb.net/" + process.env.DB_NAME + "?retryWrites=true",
   options,
   function(err) {
    if (err) {
      console.log(`error, failed to connect to the database because --> ${err}`);
    } else {
      console.info('*** Database Ticketac connection : Success ***');
    }
   }
);