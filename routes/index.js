var express = require('express');
const UserModel = require("../models/users"); 
const OrderModel = require("../models/orders"); 
const JourneyModel = require("../models/journeys");
var router = express.Router();
const stripe = require('stripe')('sk_test_51KMbZUBK5cElSMIeDDWOkQHxvFzLW4xWtbuR2u08BuJ74xqC8satLEOYn3MydGGIVClw3gU53XUVFVIYYnQiwPrr00UP5mvIOR');


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
var departure = req.body.departure.substring(0,1).toUpperCase() + req.body.departure.substring(1).toLowerCase();
var arrival = req.body.arrival.substring(0,1).toUpperCase() + req.body.arrival.substring(1).toLowerCase(); 
if(req.body.date !== "") {
    let journeys = await JourneyModel.find({ departure, arrival, date: new Date(req.body.date)});

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

router.post("/create-checkout-session", async (req, res) => {
var line_items = [];

for (var i=0; i<req.session.basket.length; i++) {
  line_items.push(
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.basket[i].departure + "/" + req.session.basket[i].arrival,
        },
        unit_amount: req.session.basket[i].price*100,
      },
      quantity: req.session.basket.length,
    })}

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'payment',
    success_url: 'http://localhost:3000/home',
    cancel_url: 'http://localhost:3000/error',
  });
 
  res.redirect(303, session.url);
 });

router.get("/MyLastTrips", async function (req, res) {
  
  if (req.session.userId == null) {
    res.redirect('/');
  } else {
   
   var MyLastOrder = await UserModel.findById(req.session.userId).populate({path: 'orders', populate: {path: 'journeys'}}).exec();
   var MyLastTrips = MyLastOrder.orders; 
  
    res.render("mytrips", {MyLastTrips});
  }
});

router.get("/notfound", (req, res) => {
  res.render("notfound");
});



module.exports = router;
