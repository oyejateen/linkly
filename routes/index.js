const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

router.get('/linktree/:username', (req, res) => {
  const username = req.params.username;
  User.findOne({ linkTreeName: username }, (err, user) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }

    if (!user) {
      return res.sendStatus(404);
    }

    res.render('linktree', { user: user });
  });
});

module.exports = router;
