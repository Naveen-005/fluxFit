var express = require('express');
var router = express.Router();

/* GET users listing. */

// router.get('/', function(req, res, next) {
//   res.render('./users/recentBookings', {user:true, layout: 'userLayout'});
// });

// router.get('/', function(req, res, next) {
//   res.render('./home/Homeindex', {layout: 'normalLayout'});
// });


router.get('/', function(req, res, next) {
  res.render('./users/dashboard', {user:true, layout: 'userLayout'});
});
router.get('/recent', function(req, res, next) {
  res.render('./users/recentBookings', {user:true, layout: 'userLayout'});
});


module.exports = router;
