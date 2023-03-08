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
const cors = require('cors');
const User = require('./models/user');

dotenv.config();

app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static('views'));
app.use(session({
  secret: process.env.secrett,
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.set('view engine', 'ejs');


mongoose.connect(process.env.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

async function lala() {

const allUsers = await User.find();
console.log(allUsers[0])

  await LinkTree.deleteMany({ layout: 'layout4', });
  const allLinktrees = await LinkTree.find();
  console.log(allLinktrees)
}



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
