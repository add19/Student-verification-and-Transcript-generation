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
    databaseURL: 'https://studentassetverification.firebaseio.com/'
});

var db = firebase.database();
var ref = db.ref('/');
let key = [];
var hash = [];

var idTracker=0;
// eslint-disable-next-line require-jsdoc
function syncAssign(hashArray){
    console.log('I have been called...');
    hash = hashArray;
    idTracker = 0;
    for(var i=0; i<hashArray.length; i++){
        key[idTracker] = firebase.database().ref('/' + idTracker).update(
            {
                hashValue: hash[i]
            }
        ).key;
        idTracker++;
    }

}

var mainString;
request('http://localhost:3000/api/GradeCard', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    //   console.log(body.url);
    console.log(body);
});

app.get('/', function(req, res){
    res.sendFile('indexForm.html',  {root: __dirname });
});

//post request to REST API
app.post('/gradecard', function(req, res){
    res.send('Thank you for registering ' + req.body.name + '\'s grade card with us...');
    mainString  = req.body.cpi + req.body.prn;
    //compute the hash of fields required for verification
    console.log(sha256(mainString));

    //transaction to add grade card to the asset ledger
    request.post({
        'headers': { 'content-type': 'application/json' },
        'url': 'http://localhost:3000/api/AddGradeCard',
        'body':JSON.stringify({
            '$class': 'org.studnetwork.AddGradeCard',
            'aGradeCard': {
                '$class': 'org.studnetwork.GradeCard',
                'gradecardId': req.body.prn,
                'description': 'Grade Card of ' + req.body.name,
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
                    for(var i=0; i<body.length; i++){
                        hash.push(body[i].hashValue);
                    }
                    syncAssign(hash);
                }
            });
        }
    });

});

app.listen(20001, function() {
    console.log('Stark Server Active....');
});

//commmand to restart rest server:    composer-rest-server -c admin@studentasset-network -n never -u true -d n