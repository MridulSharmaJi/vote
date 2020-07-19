var express = require('express');
var router = express.Router();
var Users = require('../models/user.js');
var path = require('path');
var fs = require('fs'); 
var multer = require('multer'); 
var pdf = require("pdf-creator-node");

var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null,'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname)) 
    } 
}); 
  
var upload = multer({ storage: storage });

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/* GET page. */
router.get('/', function(req, res, next) {
  let voted = req.cookies['voted'];
  if(voted==undefined)
    voted = 0;
  res.render('index',{
      voted: voted
  });
  
});

router.post('/vote', upload.single('image'), function(req, res, next) {
  var fname = req.body.inputFName;
  var lname = req.body.inputLName 
  var phone = req.body.inputPhone
  var aadhaar = req.body.inputAadhaar
  var add = req.body.inputAddress
  var state = req.body.stt
  var city = req.body.inputCity
  var image = '/uploads/' + req.file.filename;
  var html = fs.readFileSync('pdf/template.html', 'utf8');
  var pdfName = fname.toLowerCase()+'-'+Date.now()+'.pdf';
  var sex = req.body.sex
  var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "45mm",
    }
  };

  var data = { 
    fname: fname,
    lname: lname,
    sex: sex,
    address: add,
    aadhaar: aadhaar,
    city: city,
    state: state,
    phone: phone, 
    image: image,
    pdf: '/pdf/'+pdfName
  } 

  var document = {
    html: html,
    data: {
        users: data
    },
    path: "pdf/"+pdfName
  };

  pdf.create(document, options)
    .then(res => {
        console.log(res)
    })
    .catch(error => {
        console.error(error)
    });
  
  Users.create(data, (err, item) => { 
      if (err) { 
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: {}
        });
      } 
      else { 
          res.cookie('voted',1)
          res.redirect('/'); 
      } 
  }); 
          
});


router.get("/search", function(req, res) {
  let query = req.query.query;
  const regex = new RegExp(escapeRegex(query), 'gi');
  if (query=='') {
    res.render('search',{
      query: query,
      data: []
    })
  }
  else{ 
    var data = [];
    Users.find({
      $or: [
        {
          fname: regex
        },
        {
          lname: regex
        },
        {
          address: regex
        },
        {
          aadhaar: regex
        },
        {
          city: regex
        },
        {
          state: regex
        }
      ]
    }).sort().exec(function(err, results) {
      for (var i in results){
          data.push(results[i]);
      }
      res.render('search',{
        query: query,
        data: data
      })
    });
  }
});

router.get('/api/graph', function(req, res, next) {
  var states = [];
  var counts = [];
  Users.aggregate([
    {
        $group: {
           _id: '$state',
            points: { $sum: 1 }
       }
   }
 ]).exec(function(err, results) {
   if(err){
    console.log(err)
    res.json({ 
      labels: [],
      data: []
    })
   }
   else{
      for (var i in results){
        states.push(results[i]._id)
        counts.push(results[i].points)
      }
      res.json({ 
        labels: states,
        data: counts
      })
    }
  });
});

module.exports = router;
