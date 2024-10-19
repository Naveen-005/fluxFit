var express = require("express");
const multer = require('multer');
const session = require('express-session');
var router = express.Router();
//var x=require("../public/images")

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, '../public/images');
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     cb(null, extractFileName(file));
//   }
// });
// const upload = multer({ storage: storage });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

var loginregister = require('../helpers/registerandlogin/userlogin')
var gymregister = require("../helpers/gymregister/gymreg")
var monitize = require("../helpers/adminHelpers/monetize")

const verifyLogin=(req,res,next)=>{
  if(req.session.ownerloggedIn){
    next()
  }else{
    res.redirect('/gymowner/register')
  }
}

/* GET home page. */
router.get("/registergym", verifyLogin,function (req, res, next) {
  res.render("gym-owner/registergym");

});

router.get('/address',function(req,res){

  res.render("gym-owner/getaddress");


})

router.post('/address',function(req,res){

  gymregister.gymregisterstep2(req.session.gymregid,req.body).then((response)=>{
  res.redirect("/gymowner/imageupload")
  })

  
})


router.get("/register", function (req, res, next) {
  res.render("gym-owner/register");
});

router.get("/imageupload", function (req, res, next) {
  res.render("gym-owner/gymimage");
});


router.post('/imageupload', upload.array('photos', 5), function (req, res, next) {
  var files = req.files;
  var redirectSent = false; // Flag to track if redirect has been sent
  
  for (let i = 0; i < files.length; i++) {
      //console.log("hi");
      const imageData = {
          data: files[i].buffer,
          contentType: files[i].mimetype,
          imageName: files[i].originalname
      };

      gymregister.gymregisterstep3(req.session.gymregid, imageData).then((response) => {
          console.log(response);
          
          // Check if redirect has already been sent
          if (!redirectSent) {
              redirectSent = true;
              res.redirect("/gymowner");
          }
      }).catch((error) => {
          console.error(error);
          
          
      });
  }
});



router.get("/imgview",(req,res)=>{
  const l='65d99ae31d14b2c98057a58e'
  gymregister.chk(l).then((response)=>{
    //res.writeHead(200, {'Content-Type': 'multipart/form-data'});
    const imagesHTML = response.images.map(image => `<img src="data:${image.contentType};base64,${image.data.toString('base64')}" alt="${image.imageName}">`);
    res.send(imagesHTML.join(''));
  })

})



router.get("/login",(req,res,next)=>{

  res.render("gym-owner/login")
})

router.post("/login",(req,res,next)=>{
  loginregister.login(req.body).then((response)=>{
    if(response.status){
      req.session.gymowner= response.val
      console.log(response.val)
      req.session.ownerloggedIn=true
    }  
    res.redirect("/gymowner");
    console.log(response)
  })
})

router.post('/register',(req,res,next)=>{
  loginregister.register(req.body).then((response)=>{
    console.log(response)
    req.session.gymowner= response
    req.session.ownerloggedIn=true
    res.redirect("/gymowner");
  })
})


router.post("/registergym", verifyLogin,function (req, res, next) {
 req.body.gymowner=req.session.gymowner._id
 req.body.verified=req.session.gymowner.verified

 //console.log('---***',req.body.verified)
  
  if (req.body.holidayDays) {
    
  }else{
    req.body.holidayDays=[]
  }
  req.body.dailyfees=gymregister.calculatedailyfee(req.body.monthlyFees,req.body.holidayDays)

  gymregister.gymregisterstep1(req.body).then((response)=>{
    console.log(response)
    req.session.gymregid=response._id
    res.redirect("/gymowner/address")
  }) 
});

router.get("/",verifyLogin, function (req, res, next) {
  gymregister.getdetailsofownersgym(req.session.gymowner._id).then((response)=>{
    console.log(response)
    res.render("gym-owner/owner-dashboard",{username:req.session.gymowner.username,response})
  })

//console.log(req.session.gymowner.username)
});


router.get('/apply-for-monetization',verifyLogin,(req,res)=>{

  monitize.apply(req.session.gymowner._id).then((response)=>{
    console.log(response)
  })

  

})



module.exports = router;
