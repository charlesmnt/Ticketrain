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

router.post("/search-journey", async (req, res) => {

  if(req.body.date !== "") {
    let journeys = await JourneyModel.find({ departure: req.body.departure, arrival: req.body.arrival, date: new Date(req.body.date)});

    if(journeys.length === 0) {
      res.redirect("/notfound"); 
    }
    
    let dateReq = {}
    let date = new Date(req.body.date); 
    dateReq.day = date.getDate();
    dateReq.month = date.getMonth() +1
    
    res.render("journeys", { journeys, dateReq }); 
  } else {
    res.redirect("/notfound");
  }
});

router.get("/add-trip/:tripId", async (req, res) => {
  let trip = await JourneyModel.findById(req.params.tripId); 

  if(req.session.basket == undefined) {
    req.session.basket = [];
    req.session.basket.push(trip);
  } else {
    req.session.basket.push(trip);
  }
  console.log(req.session.basket);
  res.redirect("/basket"); 
});

router.get("/basket", (req, res) => {
  if(req.session.basket !== undefined) {
    let totalPrice = 0; 
    for(let trip of req.session.basket) {
      totalPrice += trip.price
    }
    res.render("basket", { trips: req.session.basket, totalPrice });
  } else {
    res.redirect("/home");
  }
});

router.get("/confirm-basket", (req, res) => {
  res.redirect("/basket");
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

router.get("/notfound", (req, res) => {
  res.render("notfound");
});

module.exports = router;
