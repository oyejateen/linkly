const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const LinkTree = require('../models/LinkTree');
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3600000,
    });

    res.render('dashboard', {
      title: 'Dashboard',
      hasLinktree: false
    }); // Redirect to dashboard after successful registration
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3600000,
    });
  const usser = await User.findOne({ email })
    .populate('linktree', 'linkTreeName');
    
   

  if (usser.linktree) {
    const linkTree = await LinkTree.findOne({ linkTreeName: usser.linktree.linkTreeName, });
    res.render('dashboard', {
      title: 'Dashboard',
      linktree: usser.linktree,
      linktreeName: usser.linktree.linkTreeName,
      hasLinktree: true,
      linkTree
    });
  } else {
    res.render('dashboard', {
      title: 'Dashboard',
      hasLinktree: false
    });
  }
  } catch (err) {
    console.error(err);
    res.render('dashboard/error', { msg: err.message  });
  }
});

router.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/auth/login");
});

module.exports = router;