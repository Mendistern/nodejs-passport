const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require('passport')

const app = express();

//paspport config
require('./config/passport')(passport)

//connect to database with URI from config file
const db = require("./config/keys").mongoUri;

//connect to mongo
mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(console.log("Connected to Database"))
  .catch(err => console.log(err));

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

//Body_parser
app.use(
  express.urlencoded({
    extended: false
  })
);

//Express session
app.use(
  session({
    secret: "session",
    resave: true,
    saveUninitialized: true
  })
);

//Passporrt midlleware
app.use(passport.initialize());
app.use(passport.session());


// connect flash
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next()
});

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.Port || 5000;

app.listen(PORT, console.log(`Server started at port ${PORT}`));