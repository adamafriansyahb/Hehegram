if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// Passport and Session
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

// Database
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', (error) => {
    console.log(error);
});
db.once('open', () => {
    console.log('Connected to database');
});

// Routes
const authRoute = require('./routes/auth');
const roomRoute = require('./routes/main');

const {checkAuth} = require('./config/auth');

app.use('/', authRoute);
app.use('/', checkAuth, roomRoute);

// Socket.io 
const http = require('http').Server(app);
const io = require('socket.io')(http);
const formatMessage = require('./config/message');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./config/user');
const botName = 'Bot'

io.on('connection', (socket) => {

    socket.on('joinRoom', ({username, roomName}) => {
        const user = userJoin(socket.id, username, roomName);

        // Join to a particular room
        socket.join(user.room);

        // Welcome current users
        socket.emit('message', formatMessage(botName, "Welcome to LeleGram"));
    
        // Broadcast message when a user joins 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat.`));
    
        // Show all online users to the frontend
        io.to(user.room).emit('roomUser', {
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, message));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`));
        
            // Since a user left, show current online users to the frontend
            io.to(user.room).emit('roomUser', {
                users: getRoomUsers(user.room)
            });
        }
    });

});

http.listen(process.env.PORT || 3000, () => {
    console.log('Server running...');
});