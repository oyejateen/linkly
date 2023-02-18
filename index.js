const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require("cookie-parser"); // Import cookie-parser
const bcrypt = require('bcrypt');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const LinkTree = require('./models/LinkTree');

// Load environment variables
dotenv.config();

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(session({
  secret: "mummy",
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
// Set EJS as the view engine
app.set('view engine', 'ejs');


// Set up database connection
mongoose.connect('mongodb+srv://Mishri:mishri@mishri.ewwdber.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

// Set up routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

// Start the server
const port = process.env.PORT || 0000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
