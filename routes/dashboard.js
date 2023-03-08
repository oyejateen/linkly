const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/user');
const LinkTree = require('../models/LinkTree');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Binary } = require('mongodb');
const cloudinary = require('cloudinary').v2;

 cloudinary.config({
  cloud_name: process.env.cn,
  api_key: process.env.apikey,
  api_secret: process.env.apisec
});
const upload = multer({
  storage: multer.diskStorage({
    
    destination: (req, file, cb) => {
      cb(null, './views/images');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }

    cb(null, true);
  }
});
// Dashboard
router.get('/', authMiddleware.requireAuth, async (req, res) => {
  try {
    const linkTrees = await LinkTree.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.render('dashboard', { linkTrees, user: req.user });
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Internal Server Error! Please go back and try again"  });
  }
});

// User's Linktree
router.post('/', authMiddleware.requireAuth, async (req, res) => {

  try {
    const user = await User.findOne({ email: req.session.user.email })
    .populate('linktree', 'linkTreeName');
    console.log(user)
  console.log(user.linktree);
console.log(user.linktree.linkTreeName);

  if (user.linktree) {
    res.render('dashboard', {
      title: 'Dashboard',
      linktreeName: user.linktree.linkTreeName,
      hasLinktree: true
    });
  } else {
    res.render('dashboard', {
      title: 'Dashboard',
      hasLinktree: false
    });
  }
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Internal Server Error! Please try again"  });
  }
});

router.post('/delete/:id', authMiddleware.requireAuth, async (req, res) => {
  try {
    await LinkTree.findByIdAndRemove(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Internal Server Error! Please try again"  });
  }
});

// Edit LinkTree
router.get('/edit/:id', authMiddleware.requireAuth, async (req, res) => {
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
    res.render('dashboard/error', { msg: "Profile with this name not found"  });
    }
    res.render('dashboard/editCreate', { linkTree, title: "Edit Your Layout" });
  } catch (err) {
    console.log(err);
   res.render('dashboard/error', { msg: "Profile with this name not found"  });
  }
});

router.post('/edit/:id', authMiddleware.requireAuth, upload.any(), async (req, res) => {
  const { layout, email } = req.body;
  console.log(req.body)
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
      res.render('dashboard/error', { msg: "Profile with this name not found"  });
    }
    const linkImage = req.files && req.files.find(file => file.fieldname === `profileBg`);
      console.log(linkImage)
      const imageUrl = linkImage ? (await cloudinary.uploader.upload(linkImage.path)).secure_url : linkTree.profileBg;
    linkTree.profileBg = imageUrl;
    linkTree.layout = layout;
 await linkTree.save();
    console.log(email)
    const user = await User.findOne({ email });
    console.log(user)
    user.linktree = linkTree._id;
    await user.save();
    res.redirect('/dashboard/edit/design/' + linkTree._id);
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Profile with this name not found"  });
  }
});
// Edit LinkTree design
router.get("/contact",function (req, res) {
  res.render("contact.ejs")
})
router.post("/messagess",function (req, res) {
const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  const data = {
    name: name,
    email: email,
    message: message
  };
  fs.appendFile("data.json", JSON.stringify(data), function(err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
    res.status(200).redirect('/');

});
});
router.get('/edit/design/:id', authMiddleware.requireAuth, async (req, res) => {
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
      res.render('dashboard/error', { msg: "Profile with this name not found"  });
    }
    console.log(linkTree, "hey")
    res.render('dashboard/editDesign', { linkTree, title: "Edit Your Design" });
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Profile with this name not found"  });
  }
});

router.post('/edit/design/:id', authMiddleware.requireAuth, upload.any(), async (req, res) => {
  const { title, name, pronounce, bio, header, link_title, link_url, description, linkTreeName, email } = req.body;
  console.log(req.body)
  console.log(req.files)
  
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    console.log(linkTree, "i")
    if (!linkTree) {
      res.render('dashboard/error', { msg: "Profile with this name not found"  });
    }

    
let links = [];
let blogs = [];

if (link_title && link_url) {
  const imageUrls = await Promise.all(req.files.map(async (file) => {
    if (file.fieldname === 'link_image[]') {
      const imageUrl = (await cloudinary.uploader.upload(file.path)).secure_url;
      console.log(imageUrl, "heyyyy")
      return imageUrl;
    }
  }));
  console.log(imageUrls, "hey baby")
  links = link_title.map((title, index) => {
    return { title: title, url: link_url[index], image: imageUrls[index] };
  });
}

if (title && description) {
  const imageUrls = [];
  if (Array.isArray(title) && Array.isArray(description) && title.length === description.length) {
    // process blog data
    blogs = await Promise.all(title.map(async (title, index) => {
      const blogImage = req.files && req.files.find(file => file.fieldname === `images[${index}]`);
      if (blogImage) {
        const imageUrl = (await cloudinary.uploader.upload(blogImage.path)).secure_url;
        imageUrls.push(imageUrl);
      }
      
      return { title: title, content: description[index], images: imageUrls[index] };
    }));
  }
}



if (req.files) {
  const profilePicture = req.files.find(file => file.fieldname === 'profilePicture');
if(profilePicture) {
  const profilePicturePath = profilePicture ? profilePicture.path : null;

  const uploadedFile = await cloudinary.uploader.upload(profilePicturePath);
      linkTree.profilePicture = uploadedFile.secure_url;
      fs.unlinkSync(profilePicturePath);
                   }
    }

    linkTree.title = title;
    linkTree.name = name;
    linkTree.pronounce = pronounce;
    linkTree.bio = bio;
    linkTree.linkTreeName = linkTreeName;
    linkTree.header = header;
    linkTree.links = links;
    linkTree.blogs = blogs;

    await linkTree.save();
    const user = await User.findOne({ email });
    user.linktree = linkTree._id;
    await user.save();
    console.log(user)
    res.redirect('/dashboard/success/' + linkTree._id);
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Profile with this name not found try again"  });
  }
});


router.get('/xd', authMiddleware.requireAuth, (req, res) => {
  res.render('dashboard/xd');
});
router.post('/api/posts', async (req, res) => {
try {
  console.log(req.body)
const { linkTreeName } = req.body
const linkTree = await LinkTree.findOne({ linkTreeName: linkTreeName });
  console.log(linkTreeName);
console.log(linkTree)
if (!linkTree) {
return res.status(200).json({ message: 'Linktree with this name available' });
} else {
return res.status(406).json({ message: 'Linktree name not available' });
}
} catch (err) {
console.log(err);
res.status(500).send('Internal server error');
}
});

router.get('/create', (req, res) => {
  res.render('dashboard/create');
});

router.post('/create', authMiddleware.requireAuth, upload.any(), async (req, res) => {
  const { layout } = req.body;
  
  console.log(req.file)
  console.log(req.body)
  try {
    const linkImage = req.files && req.files.find(file => file.fieldname === `profileBg`);
      console.log(linkImage)
      const imageUrl = linkImage ? (await cloudinary.uploader.upload(linkImage.path)).secure_url : null;
    const linkTree = await LinkTree.create({
      layout,
      userId: req.user._id,
      profileBg: imageUrl,
    });
    res.redirect('/dashboard/design/' + linkTree._id);
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Internal Server Error! Try again"  });
  }
});

// Design LinkTree 
router.get('/design/:id', authMiddleware.requireAuth, async (req, res) => {
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
      res.render('dashboard/error', { msg: "Profile with this name not found"  });
    }
    console.log(linkTree, "first w")
    res.render('dashboard/design', { linkTree, user: req.user });
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Internal Server Error! Try again"  });
  }
});



router.post('/design/:id', authMiddleware.requireAuth, upload.any(), async (req, res) => {
  const { title, name, pronounce, bio, header, link_title, link_url, description, linkTreeName } = req.body;
  console.log(req.body)
  console.log(req.files)
  
  try {
    const linkTree = await LinkTree.findById(req.params.id);
    if (!linkTree) {
      res.render('dashboard/error', { msg: "Profile with this name not found"  });
    }
    const linkPree = await LinkTree.findOne({ linkTreeName: linkTreeName });
if (linkPree) {
res.render('dashboard/error', { msg: "LinkTree with similar name already exists. Please change your linkTreeName"  });
}
let links = [];
let blogs = [];

if (link_title && link_url) {
  const imageUrls = await Promise.all(req.files.map(async (file) => {
    if (file.fieldname === 'link_image[]') {
      const imageUrl = (await cloudinary.uploader.upload(file.path)).secure_url;
      console.log(imageUrl, "heyyyy")
      return imageUrl;
    }
  }));
  console.log(imageUrls, "hey baby")
  links = link_title.map((title, index) => {
    return { title: title, url: link_url[index], image: imageUrls[index] };
  });
}

if (title && description) {
  const imageUrls = [];
  if (Array.isArray(title) && Array.isArray(description) && title.length === description.length) {
    // process blog data
    blogs = await Promise.all(title.map(async (title, index) => {
      const blogImage = req.files && req.files.find(file => file.fieldname === `images[${index}]`);
      if (blogImage) {
        const imageUrl = (await cloudinary.uploader.upload(blogImage.path)).secure_url;
        imageUrls.push(imageUrl);
      }
      
      return { title: title, content: description[index], images: imageUrls[index] };
    }));
  }
}

if (req.files) {
  const profilePicture = req.files.find(file => file.fieldname === 'profilePicture');
const profilePicturePath = profilePicture ? profilePicture.path : null;

  const uploadedFile = await cloudinary.uploader.upload(profilePicturePath);
      linkTree.profilePicture = uploadedFile.secure_url;
      fs.unlinkSync(profilePicturePath);
    }

    linkTree.title = title;
    linkTree.name = name;
    linkTree.pronounce = pronounce;
    linkTree.bio = bio;
    linkTree.linkTreeName = linkTreeName;
    linkTree.header = header;
    linkTree.links = links;
    linkTree.blogs = blogs;
    await linkTree.save();
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      { linktree: linkTree._id },
      { new: true }
    );
    if (!user) {
      return res.render('dashboard/error', { msg: "User Not Found"  });
    }
    console.log(linkTree)
    res.redirect('/dashboard/success/' + linkTree._id);
  } catch (err) {
    console.log(err);
    res.render('dashboard/error', { msg: "Internal Server Error! Try again"  });
  }
});

// Preview LinkTree
router.get('/success/:id', authMiddleware.requireAuth, async (req, res) => {
try {
const linkTree = await LinkTree.findById(req.params.id);
if (!linkTree) {
res.render('dashboard/error', { msg: "Profile with this name not found"  });
}
  
  console.log(linkTree)
  console.log(linkTree.profilePicture)
  console.log(linkTree.linkTreeName)
res.render('dashboard/success', { linkTree });
} catch (err) {
console.log(err);
res.render('dashboard/error', { msg: "Internal Server Error! Try again"  });
}
});

module.exports = router;