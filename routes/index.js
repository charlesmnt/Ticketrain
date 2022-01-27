var express = require('express');
const UserModer = require("../models/users"); 
const OrderModel = require("../models/orders"); 
const JourneyModel = require("../models/journeys");
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

<<<<<<< HEAD
router.post('/sign-in', async function(req, res, next) {


  res.render('index', { title: 'Express' });
=======
router.get("/home", (req, res) => {
  res.render("home");
>>>>>>> 499d19bfe92a4ad9247e174a005ae34927bcf0c0
});

module.exports = router;
