var express = require('express');
const UserModel = require("../models/users"); 
const OrderModel = require("../models/orders"); 
const JourneyModel = require("../models/journeys");
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/sign-in', async function(req, res, next) {

  res.render('index', { title: 'Express' });
});

router.get("/home", (req, res) => {
  res.render("home");
});  

router.post("/search-journey", (req, res) => {
  console.log(req.body);
  res.render("journeys"); 
});


module.exports = router;
