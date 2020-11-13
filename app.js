var express = require('express');
var app = express();
const port = 80;
var http = require('http');
var server = http.createServer(app);

app.use(express.static('public'));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) 
{
  console.log("Request received");
  res.send('Hello World Response for / from NodeJS and Express on Port 80')
});

server.listen(80,'10.0.1.4', () => 
{
    console.log(`Example app listening on Port ${port}`)
});