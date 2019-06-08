// eslint-disable-next-line strict
const request = require('request');
var express   = require('express');
var app       = express();
var bodyParser= require('body-parser');
var sha256    = require('sha256');
var firebase  = require('firebase');
var path = require('path');
app.use(bodyParser.urlencoded({ extended: true }));



firebase.initializeApp({
    apiKey: 'AIzaSyCw3PQASUjZUkT0tRIymBf7kAYSFKLr054',
    serviceAccount: './studentassetverification-c5294f798f54.json',
    databaseURL: 'https://studentassetverification.firebaseio.com/'
});

var db = firebase.database();
var ref = db.ref('/');
let key = 0;

app.get('/', function(req, res){
    if(firebase.auth().currentUser !== null){
        app.use(express.static(path.join( __dirname, '/Login_v3')));
        res.sendFile( path.join( __dirname, 'Login_v3', 'index1.html' ));
    }else{
        res.redirect('/login');
    }
});

app.get('/login', function(req, res){
    app.use(express.static(path.join( __dirname, '/Login_v3')));
    res.sendFile( path.join( __dirname, 'Login_v3', 'index.html' ));
});

app.get('/signup', function(req, res){
    res.sendFile( path.join( __dirname, 'Login_v3', 'indesxSignup.html' ));
});

app.post('/verify', function(req, res){
    //get form data
    var mainString  = req.body.cpi + req.body.prn + req.body.bcode;

    //create hash of the data
    // console.log(sha256(mainString));

    //retrieve all the hashes from firebase
    ref.once('value', function(snapshot){
        var data = snapshot.val();
        var flag = 0;
        //display verification message: valid or invalid user
        for(var i=0; i<data.length; i++){
            //compare hashes to the one created
            // eslint-disable-next-line eqeqeq
            if(data[i].hashValue == sha256(mainString)){
                flag = 1;
                res.send(
                    '<html> <head> <title>Sucess!</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css"> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script> <style>body {font-family: Arial, Helvetica, sans-serif;} #myImg {  border-radius: 5px; cursor: pointer; transition: 0.3s; }#myImg:hover {opacity: 0.7;} .modal display: none; position: fixed; /* Stay in place */ z-index: 1; /* Sit on top */padding-top: 100px; /* Location of the box */left: 0;top: 0;width: 100%; /* Full width */height: 100%; /* Full height */overflow: auto; /* Enable scroll if needed */background-color: rgb(0,0,0); /* Fallback color */background-color: rgba(0,0,0,0.9); /* Black w/ opacity */}/* Modal Content (image) */.modal-content {margin: auto; display: block;width: 80%;max-width: 700px;} #caption { margin: auto; display: block; width: 80%; max-width: 700px; text-align: center; color: #ccc; padding: 10px 0; height: 150px; } .modal-content, #caption {  -webkit-animation-name: zoom;-webkit-animation-duration: 0.6s; animation-name: zoom; animation-duration: 0.6s;  } .close {position: absolute;top: 15px; right: 35px; color: #f1f1f1;font-size: 40px; font-weight: bold; transition: 0.3s; } .close:hover, .close:focus {color: #bbb; text-decoration: none; cursor: pointer;} </style></head> <div class="alert alert-success"> <strong>Success!</strong> The student details are valid, here is the actual report card: <a href=' + data[i].gradeCard + ' class="alert-link">Grade Card</a>.</div>');
            }
            console.log(data[i].hashValue);
        }
        if(flag === 0){
            // req.flash('errorMessage', 'Invalid Student Credentials');
            res.send('<html> <head> <title>Invalid fields!</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css"> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script> </head> <div class="alert alert-danger"> <strong>Oops!</strong> The student details are invalid!</div>');
        }
    });
});

app.post('/signin', function(req, res){
    var email = req.body.email;
    var password  = req.body.pass;
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error){
        console.log(error);
    });
    console.log('Signed In!');
    res.redirect('/');
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
            // res.send("Logged out")
        }
    });

});


app.listen(30008, function(){
    console.log('Authentication Server active...');
});