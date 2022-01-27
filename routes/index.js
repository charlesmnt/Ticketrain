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
    var user = await UserModel.findOne({email : req.body.email , password : req.body.password})
    console.log(user);
    if (user != null) {
      res.redirect('/home');
    } else {
      res.redirect('/');
    }
  });

  router.post('/sign-up', async function(req, res, next) {
    
    var alreadyExist = await UserModel.findOne({email : req.body.email});

    if (alreadyExist == null) {    
    var newUser = new UserModel ({
      firstName: req.body.name,
      lastName: req.body.firstname, 
      email: req.body.email, 
      password: req.body.password,
    })
    var userSaved = await newUser.save();
    res.redirect('/home')
  } else {
    res.redirect('/');
  }
});

router.get("/home", (req, res) => {
  res.render("home");
});

router.get("/home", (req, res) => {
  res.render("home");
});  

router.post("/search-journey", (req, res) => {
  console.log(req.body);
  res.render("journeys"); 
});


module.exports = router;
