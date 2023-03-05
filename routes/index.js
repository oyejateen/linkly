const express = require('express');
const router = express.Router();
const User = require('../models/user');
const LinkTree = require('../models/LinkTree');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const DOMPurify = require('dompurify');

router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

router.get('/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const linkTree = await LinkTree.findOne({ linkTreeName: username });
    
    if (linkTree) {
      

function convertToHtml(markdownString) {
  return marked(markdownString);
}

const blogsHtml = linkTree.blogs.map((blog) => {
  const originalXml = marked.parse(blog.content);
  let xml = originalXml;
  
  // Check if the content contains a link to a video streaming platform
  const videoLinkRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com|twitch\.tv|vimeo\.com|open\.spotify\.com)\/[\w\/?=]+)/g;
  
 /* const videoLinkRegex = /(https?:\/\/(?:www\.)?(?:(?:youtube\.com\/watch\?v=)|(?:youtube\.com\/embed\/)|(?:twitch\.tv\/videos\/)|(?:vimeo\.com\/))[\w\/?=]+)/g;*/
  const videoLinkMatches = blog.content.match(videoLinkRegex);
  
  // If there's a match, generate an iframe element with the video embedded for each link
  if (videoLinkMatches) {
    videoLinkMatches.forEach((videoUrl) => {
      let videoIframe;
      if (videoUrl.includes('youtube.com')) {
        // For YouTube
        const videoIdRegex = /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]+)/;
        const videoIdMatch = videoUrl.match(videoIdRegex);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          videoIframe = `<iframe width="270" height="160" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
      } else if (videoUrl.includes('twitch.tv')) {
        // For Twitch
        const videoIdRegex = /twitch\.tv\/videos\/(\d+)/;
        const videoIdMatch = videoUrl.match(videoIdRegex);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          videoIframe = `<iframe width="320" height="160" src="https://player.twitch.tv/?video=${videoId}&parent=localhost" frameborder="0" allowfullscreen></iframe>`;
        }
      } else if (videoUrl.includes('vimeo.com')) {
        // For Vimeo
        const videoIdRegex = /vimeo\.com\/(\d+)/;
        const videoIdMatch = videoUrl.match(videoIdRegex);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          videoIframe = `<iframe src="https://player.vimeo.com/video/${videoId}" width="320" height="160" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        }
      } else if (videoUrl.includes('spotify.com')) {
        // For Spotify
        const spotifyLinkRegex = /spotify\.com\/embed\/([-\w]+)/;
        const spotifyLinkMatch = videoUrl.match(spotifyLinkRegex);
        if (spotifyLinkMatch) {
          const trackId = spotifyLinkMatch[1];
          videoIframe = `<iframe src="https://open.spotify.com/embed/track/${trackId}" width="320" height="160" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
        }
      }
      
      if (videoIframe) {
        xml = videoIframe + xml.replace(videoLinkRegex, '');
        console.log(xml, "han heige han")
      }
    });
  }
  
  return { ...blog, xml };
});







/*
const blogsHtml = linkTree.blogs.map((blog) => {
  const xml = marked.parse(blog.content);
  return { ...blog, xml };
});*/

 // Output: "<h2>This is a heading</h2>\n<p>This is some <strong>bold</strong> text.</p>"



  //const bioHtml = convertToHtml(linkTree.bio);
    
res.render('dashboard/preview', { linkTree, blogsHtml });

} else if (username === "dashboard") {
      
      res.redirect('/auth/login');
      
} else {
      
  res.render('dashboard/error', { msg: "Page not found"  });
      
    }
} catch (err) {
console.log(err);
}
});

module.exports = router;
