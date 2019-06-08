/* eslint-disable strict */
const request = require('request');
var express   = require('express');
var app       = express();
var bodyParser= require('body-parser');
var sha256    = require('sha256');
var firebase  = require('firebase');
var path = require('path');
var cloudinary = require('cloudinary');
var multer = require('multer');

//specify how the file is to be stored
var storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});

//filter what types of image to be stored
var imageFilter = function(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({storage: storage, filter: imageFilter});

//configure cloudinary
cloudinary.config({
    cloud_name: 'dfxj4outa',
    api_key: '453999375899534',
    api_secret: 'qr7Q7uznxn3C0tXfx1aG6InsgtY'
});

// app.use(bodyParser.json);
app.use(bodyParser.urlencoded({ extended: true }));

//initialize firebase app
firebase.initializeApp({
    apiKey: 'AIzaSyCw3PQASUjZUkT0tRIymBf7kAYSFKLr054',
    serviceAccount: './studentassetverification-c5294f798f54.json',
    databaseURL: 'https://studentassetverification.firebaseio.com/'
});

//firbase db instance
var db = firebase.database();
var ref = db.ref('/');
let key = [];
var hash = [];
var cardLinks = [];

var idTracker=0;

//function to add hash data to firebase
// eslint-disable-next-line require-jsdoc
function syncAssign(hashArray, cardsArray){
    console.log('I have been called...');
    hash = hashArray;
    cardLinks = cardsArray;
    idTracker = 0;
    for(var i=0; i<hashArray.length; i++){
        key[idTracker] = firebase.database().ref('/' + idTracker).update(
            {
                hashValue: hash[i],
                gradeCard: cardLinks[i]
            }
        ).key;
        idTracker++;
    }

}

var mainString;

//authenticated users given access
app.get('/', function(req, res){
    if(firebase.auth().currentUser !== null){
        app.use(express.static(__dirname + '/Login_v1'));
        res.sendFile( path.join( __dirname, 'Login_v1', 'index1.html' ));
    }else{
        res.redirect('/login');
    }
});

//post request to REST API
app.post('/gradecard', upload.single('gradecardImage'), function(req, res){
    // res.send('Thank you for registering ' + req.body.first_name + ' ' + req.body.last_name + '\'s grade card with us...');
    res.send('<html> <head> <title>Sucess!</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css"> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script> </head> <div class="alert alert-success"> <strong>Success!</strong> Thank you for registering ' + req.body.first_name + ' ' + req.body.last_name + '\'s grade card with us...</div>');
    // console.log(req.body.gradecardImage);
    mainString  = req.body.cpi + req.body.prn + req.body.bcode;
    //compute the hash of fields required for verification
    console.log(sha256(mainString));

    cloudinary.uploader.upload(req.file.path, function(result){
        req.body.gradecardImage = result.secure_url;
        console.log(req.body.gradecardImage);

        //transaction to add grade card to the asset ledger
        request.post({
            'headers': { 'content-type': 'application/json' },
            'url': 'http://localhost:3000/api/AddGradeCard',
            'body':JSON.stringify({
                '$class': 'org.studnetwork.AddGradeCard',
                'aGradeCard': {
                    '$class': 'org.studnetwork.GradeCard',
                    'gradecardId': req.body.prn,
                    'description': req.body.gradecardImage,
                    'hashValue': sha256(mainString)
                },
                'transactionId': '',
                'timestamp': '2019-04-02T01:43:57.987Z'
            })
        }, (err, res, body)=>{
            //callback function after posting transaction
            if(err){
                console.log('Error for POST request: ', err);
            }else{
                //get all grade cards
                request('http://localhost:3000/api/GradeCard', { json:true }, (err, res, body) => {
                    if(err){
                        return console.log(err);
                    }else{
                        //extract hashes from the grade cards and add them to firebase
                        hash = [];
                        cardLinks = [];
                        for(var i=0; i<body.length; i++){
                            hash.push(body[i].hashValue);
                            cardLinks.push(body[i].description);
                        }
                        syncAssign(hash, cardLinks);
                    }
                });
            }
        });
    });
});

//login page
app.get('/login', function(req, res){
    app.use(express.static(__dirname + '/Login_v1'));
    res.sendFile( path.join( __dirname, 'Login_v1', 'index.html' ));
});

//signup page
app.get('/signup', function(req, res){
    res.sendFile( path.join( __dirname, 'Login_v1', 'indexSignup.html' ));
});

app.post('/signin', function(req, res){
    var email = req.body.email;
    var password  = req.body.pass;
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error){
        console.log(error);
    });
    res.send('Signed In!');
});

app.post('/login', function(req, res){
    var email = req.body.email;
    var pass  = req.body.pass;
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error){
        console.log('Got an error: ' + error);
    });
    firebase.auth().onAuthStateChanged(function(user){
        if(user){
            console.log('Logged in as: ' + user.email);
            res.redirect('/');
        }else{
            console.log('User signed out');
        }
    });

});
// app.get('/edit', function(req, res){
//     app.use(express.static(__dirname + '/Login_v1'));
//     res.sendFile( path.join( __dirname, 'Login_v1', 'index2.html' ));
// });

// app.post('/update', function(req, res){
//     // console.log("I am Hit");
//     // mainString  = req.body.cpi + req.body.prn + req.body.bcode;
//     console.log(mainString);
//     request('http://localhost:3000/api/GradeCard', { json: true }, (err, res, body) => {
//     if (err) { return console.log(err); }
//         console.log(body);
//         console.log(mainString);
//         // console.log(typeof mainString);
//         for(var i=0; i<body.length; i++){

//             if(body[i]['gradeCardId'] == req.body.prn){
//                 console.log("i am in" + mainString);
//                 request.post({
//                     'headers': { 'content-type': 'application/json' },
//                     'url': 'http://localhost:3000/api/GradeCard',
//                     'body':JSON.stringify({
//                         "$class": "org.studnetwork.GradeCard",
//                         "gradecardId": req.body.prn,
//                         "description": body[i]['description'],
//                         "hashValue": sha256(mainString)
//                     })
//                 });
//             }
//         }
//     }, function(){
//         res.redirect('/');
//     });
// });

app.listen(30009, function(){
    console.log('Authentication Server active...');
});