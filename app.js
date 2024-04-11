const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const pug = require('pug');
const user = require('./routes/user.route');
require('dotenv').config();

// initialize method
const app = express();
// use port from env or default to 3000 if not set
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: false}));

// Express session
app.use(
    session({
        secret: "super secret!",
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// configure routes
app.use('/', user);

// setup template engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");


// Listent on port
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})