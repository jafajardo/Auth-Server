const User = require('../models/user.js');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(422).send({ error: 'Must provide email/password' });
  }

  // See if a user with the given email exists.
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    // If the user with email does exists, return an error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If a user with email does NOT exist, create and save user record.
    const user = new User({
      name: name,
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) { return next(err); }

      // Respond to request indicating the user was created.
      res.json({ token: tokenForUser(user) });
    });
  });

}