const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}), async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    res.render('room/selectRoom', {user: user.username});
});

router.get('/register', (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    const {email, username, password1, password2} = req.body;

    if (!email || !username || !password1 || !password2) {
        res.render('auth/register', {errMsg: "Please insert all fields.", email, username, password1, password2});
    }
    
    else if (password1.length < 6 || password2.length < 6) {
        res.render('auth/register', {passwordErrMsg: "Password must be 6 characters long.", email, username, password1, password2});
    }

    else if (password1 !== password2) {
        res.render('auth/register',  {passwordErrMsg: "Passwords don't match.", email, username, password1, password2})
    }

    else {
        const user = await User.findOne({email: email});

        if (user) {
            res.render('auth/register', {errMsg: "Email has been registered.", email, username, password1, password2});
        } else {
            const newUser = new User({
                email: email,
                username: username,
                password: password1
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, async (err, hash) => {
                    if (err) {
                        throw err;
                    }

                    newUser.password = hash;
                    try {
                        await newUser.save();
                        req.flash('success_message', 'You have successfully registered.');
                        res.redirect('/login');
                    }
                    catch (err) {
                        console.log(err.message);
                    }
                });
            });
        } 
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_message', 'You are logged out.');
    res.redirect('/login');
});

module.exports = router;