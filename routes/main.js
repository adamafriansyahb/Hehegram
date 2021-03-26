const express = require('express');
const {checkRoom} = require('../config/auth'); 
const router = express.Router();

router.get('/', checkRoom, (req, res) => {
    const {username, roomName} = req.query;
    res.render('room/main', {username, roomName});
});

router.get('/selectRoom', (req, res) => {
    res.render('room/selectRoom', {user: req.query.username});
});

module.exports = router;