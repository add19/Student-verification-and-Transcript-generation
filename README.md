A blockchain based(hyperledger) student verification system and Online Transcript generation using PDFShift API for html to PDF conversion.

Basically consists of 2 modules
  1. Student Verification System
  2. Transcript Generation System

Technologies used:
Node JS : For server side scripting
HTML/CSS/Javascript : For front end portal 
Firebase : For real time data additions 
pdfShift API : An API for converting HTML pages to PDF document
Hyperledger Composer : Private Blockchain 

1. Student Verification System( a) Student-verification-and-Transcript-generation/studentverification-network/login.js 
                                b).Student-verification-and-Transcript-generation/studentverification-network/loginCompany.js)

The hyperledger(private blockchain) network enables college authorities to safely add student grade card details. 
The colleges can enter student's gradecard details and these details are hashed into a string and the image of gradecard is uploaded on    the cloud server. These details are stored as JSON assets in blockchain network. The data can be added to the network only by the legal   college authorities by means of their business network card issued by the network administrator of the blockchain.  
The hashes are stored in the centralised firebase database which are used by the companies indirectly to verify the details.  

The Companies that want to verify student details enter the verification data on the form displayed through loginCompany.js script. Hashes of the input data is then generated and then matched with all the hashes in the firebase database. If the hashes match then it becomes obvious that the input data is correct and the url of the gradecard on the cloud is then output to the verifying company. 

2. Transcript Generation( a) Student-verification-and-Transcript-generation/studentverification-network/transcript_server.js
                          b) Student-verification-and-Transcript-generation/studentverification-network/transcriptInput.js
                          c) Student-verification-and-Transcript-generation/studentverification-network/pdfex.js)
The college authority would input all the student information about the subjects/courses taken and the scores achieved. These are stired in the firebase central database(NoSQL). 
When a request for transcript is received, the data of the requesting party is retrieved and then that data is populated in dynamic templating ejs(Student-verification-and-Transcript-generation/studentverification-network/views/pages/index.ejs) file. 
The generated file is hosted as an HTML file on the same port of transcript_server.js. The HTML is then converted to PDF file by PDFShift API(Student-verification-and-Transcript-generation/studentverification-network/pdfex.js) and the PDF file is mailed to the requested party by nodemailer.
