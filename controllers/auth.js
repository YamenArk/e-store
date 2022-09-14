const User = require('../models/user');
const bcrypt = require('bcryptjs');


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage : message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage : message
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({where :{email: email} })
    .then(user => {
      if (!user) {
        req.flash('error','invalid email or passord');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error','invalid email or passord');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ where :{email: email} })
  .then(userDoc => {
    if (userDoc) {
      req.flash('error', 'E-Mail exists already, please pick a different one.');
      return res.redirect('/signup');
    }
    if (password != confirmPassword){
      req.flash('error', 'password != confirmPassword');
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12).then(hashedPassword => {
    return User.create({email : email , password : hashedPassword });
      })
    .then(user => {
      user.createCart();
      res.redirect('/login');
    });
})
.catch(err => {
  console.log(err);
});
};



exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
