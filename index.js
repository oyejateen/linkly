const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require("cookie-parser"); // 
const bcrypt = require('bcrypt');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const LinkTree = require('./models/LinkTree');

dotenv.config();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(session({
  secret: process.env.secrett,
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.set('view engine', 'ejs');


mongoose.connect('mongodb+srv://Mishri:mishri@mishri.ewwdber.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});


const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);


const port = 0000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
