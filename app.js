const express   = require('express');         //require is similar to include in c/c++
const app       = express(); 
const http      = require('http');
const server    = http.createServer(app); 

const LISTEN_PORT = 8080;
const ABS_STATIC_PATH = __dirname + '/public';

//set up our routes
app.get('/', function(req, res){    //request, response
    res.sendfile('index.html', {root:ABS_STATIC_PATH});  //require an absolute path
});

server.listen(LISTEN_PORT);
app.use(express.static(ABS_STATIC_PATH));
console.log("Listening to port: " + LISTEN_PORT);