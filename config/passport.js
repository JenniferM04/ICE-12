const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const { validPassword } = require('../lib/passwordUtils');
const User = connection.models.User;
const saltRounds = 12;

// Strategies are responsible for authenticating requests by implementing an authentication mechanism that defines how to encode a credential, such as a password or an assertion from an identity provider (IdP), in a request.

// We are using a username and password strategy that requires a callback that will check if the user exists and if the password is valid and return true or false

// this uses the req.body.username and password from logging in to find a user and see if the user is valid - authentication

//this is what will trigger a failed login
// trigger successful login
// trigger failed login

//LocalStrategy is a passport.js strategy that allows you to authenticate users based on a username and password. It is used to verify user credentials by checking if the username and password are valid.

// In Passport.js, serializeUser and deserializeUser are two methods that are used to store and retrieve user data from a session. The serializeUser method is used to determine which data of the user object should be stored in the session.

// The result of the serializeUser method is attached to the session as req.session.passport.user = { ~~ serialized user object }.

// The deserializeUser method is used to retrieve the whole object from the session. It should return the full object to be attached to the request as req.user.

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findbyId(id, (err, user) => {
        done(err, user);
    });
})

// Local Strategy
passport.use(
    new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
        User.findOne({ username: username })
            .then(user => {
                // Create a new user
                if (!user) {
                    const newUser = new User({ username, password });
                    // Hash password before saving in database
                    const hashedPassword = bcrypt.hashSync(newUser.password, saltRounds);

                    if (hashedPassword) {
                        // reassign to user password
                        newUser.password = hashedPassword;

                        newUser.save().then(user => {
                            return done(null, user);
                        }).catch(err => {
                            return done(done, false, { message: err });
                        })
                    }
                } else {
                    bcrypt.compare(password, newUser.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Password was incorrect" })
                        }
                    });
                }
            })
            .catch(err => {
                return done(null, false, { message: err });
            });
    })
);