/* eslint-disable require-jsdoc */
// eslint-disable-next-line strict
var express = require('express');
var app = express();
const pdfshift = require('pdfshift')('4e7c052550824c539b8c3a2eebde4544');
const fs = require('fs');
var request = require('request');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.post('/', function(req, res){
    console.log(req.body.yop + ' ' + req.body.prn);
    request(
        {
            uri: 'http://localhost:9005/transcript?passing='+ req.body.yop +'&roll=' + req.body.prn
        },
        function(error, response, body) {
            // console.log(body);
            fs.writeFile('transcript44.html',body,callbackFunction(req.body.email));
        }
    );
});


function callbackFunction(email){
    let data = fs.readFileSync('transcript44.html', 'utf8');
    pdfshift.convert(data).then(function (binary_file) {
        fs.writeFile('result1.pdf', binary_file, 'binary', function () {
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'aadish.deshpande@gmail.com',
                    pass: 'aadish3809'
                }
            });
            var mailOptions = {
                from: 'aadish.deshpande@gmail.com',
                to: email,
                subject: 'Here is the transcript',
                text: 'Please download the attachment',
                html: '<b>Please download the attachment</b>',
                attachments: [
                    {
                        filename: 'result.pdf',
                        path: '/home/kratos/fabric-dev-servers/studentverification-network/result1.pdf',
                        contentType: 'application/pdf'
                    }
                ]
            };
            transporter.sendMail(mailOptions, function(err, response){
                if(err){
                    console.log(err);
                }
                console.log('Message sent: ' + response.message);
            });
        });
    }).catch(function() {});
}

app.listen(9010, function(){
    console.log('PDF Generator Server active...');
});