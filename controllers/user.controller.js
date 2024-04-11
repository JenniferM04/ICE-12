const bcrypt = require("bcrypt");
const passport = require("passport");
const saltRounds = 12;
const MIN_PASSWORD_LENGTH = 8;
const MIN_USERNAME_LENGTH = 5;
const MAX_USERNAME_LENGTH = 25;

const { User } = require("../config/database");

/**
 * checks to see if username entered already exists
 * @param {*} usernameToFind
 * @returns A promise
 */
async function userExists(usernameToFind) {
  // findOne() returns a Promise
  // https://mongoosejs.com/docs/promises.html
  return User.findOne({ username: usernameToFind });
}

/**
 * Renders the login page with
 * @param {*} req 
 * @param {*} res 
 * @param {*} returnObj Object that may contain messages to display
 */
function renderLogin(req, res, returnObj) {
  const errorMessage = returnObj?.errorMessage || "";
  const successMessage = returnObj?.successMessage || "";
  
  res.render("login", {
    pageTitle: "Login",
    errorMessage: errorMessage,
    successMessage: successMessage
  });
}

/**
 * Render the register page
 * @param {*} req 
 * @param {*} res 
 * @param {*} errorMessage 
 */
function renderRegister(req, res, errorMessage = "") {
  res.render("register", {
    pageTitle: "Register a New Account",
    errorMessage: errorMessage,
  });
}

/**
 * renders home view
 * @param {*} req
 * @param {*} res
 */
exports.homeView = (req, res) => {
  res.render("home", {
    pageTitle: "INFT 2202 - Home Page",
  });
};

/**
 * render the login page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getLogin = (req, res, next) => {
  renderLogin(req, res);
};

/**
 * render the login failure page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const getLoginFailure = (req, res) => {
  renderLogin(req, res, { errorMessage: "Username/password combination does not exist. Please try again."})
};

/**
 * render the login success page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const getLoginSuccess = (req, res) => {
  res.render("login-success", {
    pageTitle: "",
    user: { username: req.body.username },
  });
};

/**
 * handle login form submit
 * @param {*} req
 * @param {*} res
 * @param {*} nex
 */
exports.postLogin = (req, res) => {
  let usernameEntry = req.body.username;
  let passwordEntry = req.body.password;

  passport.authenticate("local", function(err, user, info){
    if (err) {
      return res.status(400).json({ errors: err });
    }

    if (!user) {
      return res.status(400).json({ errors: "No user found" });
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.status(400).json({ errors: err });  
      }

      return res.status(200).json({ success: `logged in as ${user,id}`});
    });

  })(req, res, next);
};


/**
 * render logout
 * @param {*} req 
 * @param {*} res 
 */
exports.getLogout = (req, res) => {
  renderLogin(req, res, { successMessage: "Successfully logged out."});
}

/**
 * render the register page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getRegister = (req, res, next) => {
  renderRegister(req, res);
};

/**
 * handle register form submit
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.postRegister = (req, res) => {
  let usernameEntry = req.body.username?.trim();
  let passwordEntry = req.body.password?.trim();
  let errorMessages = [];

  if (usernameEntry == null || usernameEntry?.length == 0) {
    errorMessages.push("Username is required");
  } else if (
    usernameEntry.length < MIN_USERNAME_LENGTH ||
    usernameEntry.length > MAX_USERNAME_LENGTH
  ) {
    errorMessages.push(
      `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters inclusive.`
    );
  }

  if (passwordEntry == null || passwordEntry?.length == 0) {
    errorMessages.push("Password is required");
  } else if (passwordEntry.length < MIN_PASSWORD_LENGTH) {
    errorMessages.push(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }

  if (errorMessages.length > 0) {
    // initial entry validation failed
    // show errors on separate lines
    renderRegister(req, res, errorMessages.join("<br>"));
  } else {
    // initial entry passed
    // validate the user doe not already exist
    userExists(usernameEntry)
      .then(function (user) {
        if (user) {
          // user exists
          renderRegister(
            req,
            res,
            "Username already in use, please try another."
          );
        } else {
          // else user does not exist, create new record
          // hash password before adding
          const hashedPassword = bcrypt.hashSync(passwordEntry, saltRounds);

          if (hashedPassword) {
            // hash successful
            // create user object
            let userData = {
              username: usernameEntry,
              hashPassword: hashedPassword,
            };

            // creates schema model object
            let newUser = new User(userData);
            // save new user
            newUser.save();
            renderLogin(req, res);
          } else {
            renderRegister(req, res, "There was an error trying to register.");
          }
        }
      })
      .catch((err) => {
        console.log("An error occurred", err);
        renderRegister(
          req,
          res,
          "There was an error trying to register. Unable to connect to the database."
        );
      });
  }
};
module.exports = exports;
