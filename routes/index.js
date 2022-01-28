var express = require('express');
const dotenv = require("dotenv"); 
const UserModel = require("../models/users"); 
const OrderModel = require("../models/orders"); 
const JourneyModel = require("../models/journeys");
var router = express.Router();
dotenv.config(); 
const stripe = require('stripe')(process.env.SECRET_STRIPE);


/* GET home page. */
router.get('/', function(req, res, next) {
  let isAuth = false;
  req.session.compteurPanier = 0;
  if(req.session.userId !== undefined) {
    isAuth = true; 
  }
  res.render('index', { isAuth, compteurPanier : req.session.compteurPanier });
});

router.post('/sign-in', async function(req, res, next) {
    var user = await UserModel.findOne({email : req.body.email , password : req.body.password})
     if (user != null) {
      req.session.userId = { user : user._id, email : user.email};
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
    req.session.userId = { user : userSaved._id, email : userSaved.email};
    res.redirect('/home')
  } else {
    res.redirect('/');
  }
});

router.get("/logout", (req, res) => {
  req.session.userId = undefined; 
  res.redirect("/");
});

router.get("/home", (req, res) => {
  if(req.session.basket == undefined){
    req.session.compteurPanier = 0;
  } else {
    req.session.compteurPanier = req.session.basket.length
  }
  let isAuth = false;

  if (req.session.userId == null) {
    res.redirect('/');
  } else {
    isAuth = true; 
    res.render("home", { isAuth, compteurPanier : req.session.compteurPanier });
  }
});

router.post("/search-journey", async (req, res) => {

  if(req.session.basket == undefined){
    req.session.compteurPanier = 0;
  } else {
    req.session.compteurPanier = req.session.basket.length
  }

  let isAuth = false;
  if(req.session.userId !== undefined) {
    isAuth = true; 
  }

var departure = req.body.departure.substring(0,1).toUpperCase() + req.body.departure.substring(1).toLowerCase();
var arrival = req.body.arrival.substring(0,1).toUpperCase() + req.body.arrival.substring(1).toLowerCase(); 

// One Way
if(req.body.departureDate !== "" && req.body.returnDate == "") {
    req.session.returnJourneys = [];
    req.session.departureJourneys = await JourneyModel.find({ departure, arrival, date: new Date(req.body.departureDate)});

    if(req.session.departureJourneys.length === 0) {
      res.redirect("/notfound"); 
    }
    
    req.session.depDate = {}
    req.session.arrDate = {}
    let date = new Date(req.body.departureDate); 
    req.session.depDate.day = date.getDate();
    req.session.depDate.month = date.getMonth() +1
  
    res.render("journeys", { departureJourneys : req.session.departureJourneys, returnJourneys: req.session.returnJourneys, depDate : req.session.depDate, arrDate : req.session.arrDate, isAuth, compteurPanier : req.session.compteurPanier }); 

// RETURN 
  } else if (req.body.departureDate !== "" && req.body.returnDate !== "") {

    req.session.departureJourneys = await JourneyModel.find({ departure, arrival, date: new Date(req.body.departureDate)});

    req.session.returnJourneys = await JourneyModel.find({departure: arrival, arrival: departure, date: new Date(req.body.returnDate)});

    if(req.session.departureJourneys.length === 0) {
      res.redirect("/notfound"); 
    }

    req.session.depDate = {}
    let date1 = new Date(req.body.departureDate); 
    req.session.depDate.day = date1.getDate();
    req.session.depDate.month = date1.getMonth() +1

    req.session.arrDate = {}
    let date2 = new Date(req.body.returnDate); 
    req.session.arrDate.day = date2.getDate();
    req.session.arrDate.month = date2.getMonth() +1

    res.render("journeys", { departureJourneys: req.session.departureJourneys , returnJourneys: req.session.returnJourneys, depDate : req.session.depDate, arrDate : req.session.arrDate, isAuth, compteurPanier : req.session.compteurPanier }); 

  } else {
    res.redirect("/notfound");s
  }
});

router.get("/add-trip/:tripId", async (req, res) => {
  
  let isAuth = false;
  if(req.session.userId !== undefined) {
    isAuth = true; 
  }

  if(req.session.basket == undefined){
    req.session.compteurPanier = 0;
  } else {
    req.session.compteurPanier = req.session.basket.length
  }

  let trip = await JourneyModel.findById(req.params.tripId); 
    if(req.session.basket == undefined) {
    req.session.basket = [];
    req.session.basket.push(trip);
    
  } else {
    req.session.basket.push(trip);
  }
  req.session.compteurPanier = req.session.basket.length;

    
  res.render("journeys", {returnJourneys: req.session.returnJourneys, departureJourneys: req.session.departureJourneys, isAuth, compteurPanier : req.session.compteurPanier, depDate : req.session.depDate , arrDate : req.session.arrDate}); 
});

router.get("/delete-trip/:index", (req, res) => {
  let foundTrip = req.session.basket.splice(req.params.index, 1); 
  res.redirect("/basket");
});

router.get("/basket", (req, res) => {

  if(req.session.basket == undefined){
    req.session.compteurPanier = 0;
  } else {
    req.session.compteurPanier = req.session.basket.length
  }

  let isAuth = false;
  if(req.session.userId !== undefined) {
    isAuth = true; 
  }
  if(req.session.basket !== undefined) {
    let totalPrice = 0; 
    for(let trip of req.session.basket) {
      totalPrice += trip.price;
    }
    
    res.render("basket", { trips: req.session.basket, totalPrice, isAuth, compteurPanier : req.session.compteurPanier });
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
      quantity: 1,
    })}

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'payment',
    success_url: 'http://localhost:3000/home',
    cancel_url: 'http://localhost:3000/error',
  });
  
  var listeTrips = [];
  for (trips of req.session.basket) {
  listeTrips.push(trips._id)
  };

  var totalBasket = req.session.basket.reduce(function(somme, valeur){
    return somme + valeur.price;
  }, 0);

  var newOrders = new OrderModel ({
    date_insert: new Date, 
    total: totalBasket, 
    user_email: req.session.userId.email,
    journeys: listeTrips
  })

    var ordersSave = await newOrders.save();
    console.log(ordersSave._id);
    var userOrderId = await UserModel.findById(req.session.userId.user);
    userOrderId.orders.push(ordersSave._id);
    userOrderId.save();

  res.redirect(303, session.url);
 });

router.get("/MyLastTrips", async function (req, res) {
  let isAuth = false;
  if (req.session.userId == null) {
    res.redirect('/');
  } else {
   isAuth = true;
   var MyLastOrder = await UserModel.findById(req.session.userId.user).populate({path: 'orders', populate: {path: 'journeys'}}).exec();
   var MyLastTrips = MyLastOrder.orders; 
  
    res.render("mytrips", {MyLastTrips, isAuth, compteurPanier : req.session.compteurPanier });
  }
});

router.get("/notfound", (req, res) => {
  let isAuth = false;
  if(req.session.userId !== undefined) {
    isAuth = true; 
  }
  res.render("notfound", { isAuth, compteurPanier : req.session.compteurPanier });
});



module.exports = router;
