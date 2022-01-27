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

router.get("/notfound", (req, res) => {
  res.render("notfound");
});

module.exports = router;
