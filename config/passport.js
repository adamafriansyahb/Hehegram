const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new localStrategy({usernameField: 'email'}, async (email, password, done) => {
            try {
                const user = await User.findOne({email: email});
                if (!user) {
                    return done(null, false, {message: "Incorrect email address."});
                }

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        throw err;
                    }

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: "Incorrect password."});
                    }
                });
            }
            catch (err) {
                console.log(err.message);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}