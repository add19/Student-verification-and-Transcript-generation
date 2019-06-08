// eslint-disable-next-line strict
const request = require('request');
var express   = require('express');
var app       = express();
var bodyParser= require('body-parser');
var sha256    = require('sha256');
var firebase  = require('firebase');

app.use(bodyParser.urlencoded({ extended: true }));

firebase.initializeApp({
    serviceAccount: './studentassetverification-c5294f798f54.json',
    // eslint-disable-next-line quotes
    databaseURL: "https://studentassetverification.firebaseio.com/"
});
var db = firebase.database();
var ref = db.ref('/');
let key = 0;

app.get('/', function(req, res){
    res.sendFile('indexVerify.html',  {root: __dirname });
});

app.post('/verify', function(req, res){
    //get form data
    var mainString  = req.body.cpi + req.body.prn;

    //create hash of the data
    console.log(sha256(mainString));

    //retrieve all the hashes from firebase
    ref.once('value', function(snapshot){
        var data = snapshot.val();
        var flag = 0;
        //compare hashes to the one created
        //display verification message: valid or invalid user
        for(var i=0; i<data.length; i++){
            // eslint-disable-next-line eqeqeq
            if(data[i].hashValue == sha256(mainString)){
                //Success page
                flag = 1;
                res.send('The student details are valid...');
            }
            console.log(data[i].hashValue);
        }
        if(flag === 0){
            res.send('The student details are invalid!!!');
        }
    });
});

app.listen(20000, function() {
    console.log('Stark Server Online....');
});