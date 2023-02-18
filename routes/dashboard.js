const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/user');
const LinkTree = require('../models/LinkTree');


// Dashboard
router.get('/', authMiddleware.requireAuth, async (req, res) => {
  try {
    console.log(req.user)
    const linkTrees = await LinkTree.find({ userId: req.user.id }).sort({ createdAt: -1 });
    console.log(linkTrees)
    res.render('dashboard', { linkTrees, user: req.user });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});


// Update user's linktree
router.post('/', authMiddleware.requireAuth, async (req, res) => {
  const { title, subtitle, profileUrl, links } = req.body;

  try {
    const linkTree = await LinkTree.create({
      title,
      subtitle,
      profileUrl,
      links,
      backgroundColor: '#f9f9f9',
      backgroundImageUrl: '',
      userId: req.user.id,
    });
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});
// Create LinkTree Page
router.get('/create', authMiddleware.requireAuth, (req, res) => {
  res.render('dashboard/create');
});

router.post('/create', authMiddleware.requireAuth, async (req, res) => {
  const { layout } = req.body;
  try {
    const linkTree = await LinkTree.create({
      layout,
      userId: req.user.id,
    });
    res.redirect('/dashboard/design/' + linkTree._id);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// Design LinkTree Page
router.get('/design/:id', authMiddleware.requireAuth, async (req, res) => {
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
      res.status(404).send('LinkTree page not found');
    }
    res.render('dashboard/design', { linkTree });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

router.post('/design/:id', authMiddleware.requireAuth, async (req, res) => {
  const { profilePicture, name, pronounce, bio, socialLinks, links } = req.body;
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
      res.status(404).send('LinkTree page not found');
    }
    linkTree.profilePicture = profilePicture;
    linkTree.name = name;
    linkTree.pronounce = pronounce;
    linkTree.bio = bio;
    linkTree.socialLinks = socialLinks;
    linkTree.links = links;
    await linkTree.save();
    res.redirect('/dashboard/preview/' + linkTree._id);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// Preview LinkTree Page
router.get('/preview/:id', authMiddleware.requireAuth, async (req, res) => {
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
      res.status(404).send('LinkTree page not found');
    }
    res.render('dashboard/preview', { linkTree });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});
router.get('dashboard/check-name', async (req, res) => {
  console.log('logijdhdhdhdhdhin')
  const { linkTreeName } = req.query;
  const linkTree = await LinkTree.findOne({ profileUrl: linkTreeName });
  if (linkTree) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
});


module.exports = router;
