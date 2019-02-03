const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')

//login page
router.get('/login', (req, res) => res.render('login'))

//Register page
router.get('/register', (req, res) => res.render('register'));

//user model
const User = require('../models/Users')

//register handle
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        password2
    } = req.body;

    let errors = [];

    //check required fields
    if (!email || !name || !password || !password2) {
        errors.push({
            msg: 'Please fill in all fields'
        });
    }

    //check passords match
    if (password !== password2) {
        errors.push({
            msg: 'Please provide passowrds that match.'
        });
    }

    //check passwords length
    if (password.length < 6) {
        errors.push({
            msg: 'Password must be at least 6 Characters'
        });
    };


    console.log(req.body);

    if (errors.length > 0) {
        //validation did not pass
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
        console.log('There are some errors..');

    } else {
        //validation passed
        User.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    //user exists
                    errors.push({
                        msg: 'Email is already registered'
                    })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    //hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) {
                                throw err;
                            }
                            //set password to hash
                            newUser.password = hash;
                            //save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can login')
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err))
                        })
                    })

                    console.log(newUser);

                }
            })
    }

});

//login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

//logout user
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;