var express = require('express');
const UserModel = require("../models/users"); 
const OrderModel = require("../models/orders"); 
const JourneyModel = require("../models/journeys");
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/sign-in', async function(req, res, next) {
    var user = await UserModel.findOne({email : req.body.email , password : req.body.password})
     if (user != null) {
      req.session.userId = user._id;
      console.log(req.session.userId);
      res.render('home');
      
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
    req.session.userId = userSaved._id;
    res.redirect('/home')
  } else {
    res.redirect('/');
  }
});

router.get("/home", (req, res) => {
  
  if (req.session.userId == null) {
    res.redirect('/');
  } else {
    res.render("home");
  }
});


router.post("/search-journey", (req, res) => {
  console.log(req.body);
  res.render("journeys"); 
});

router.get("/MyLastTrips", async function (req, res) {
  
  if (req.session.userId == null) {
    res.redirect('/');
  } else {
    var MyLastOrder = await UserModel.findById(req.session.userId).populate({path: 'orders', populate:{path: 'journeys', model: OrderModel }}).exec();
    console.log(MyLastOrder);
    res.render("home");
  }
});

module.exports = router;
