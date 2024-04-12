const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const passport = require("passport");
const pug = require('pug');
require('dotenv').config();
require('./config/passport');

const routes = require('./routes/router.js');


// initialize method
const app = express();
// use port from env or default to 3000 if not set
const PORT = process.env.PORT || 3000;
const MONGO_STRING = process.env.DB_STRING;

mongoose.connect(MONGO_STRING)
.then(console.log(`MongoDB connected ${MONGO_STRING}`))
.catch((err) => console.log(err));


app.use(express.urlencoded({extended: false}));

// Express session
app.use(
    session({
        secret: "super secret!",
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ 
            mongoUrl: MONGO_STRING,
            mongooseConnection: mongoose.connection }),
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// configure routes
app.use('/', routes);

// setup template engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");


// Listent on port
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})