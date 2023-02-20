const express   = require('express');         //require is similar to include in c/c++
const app       = express(); 
const http      = require('http');
const server    = http.createServer(app); 
const io        = require('socket.io')(server);

const LISTEN_PORT = 8080;

server.listen(LISTEN_PORT);
const ABS_STATIC_PATH = __dirname + '/public';
app.use(express.static(ABS_STATIC_PATH));

console.log("Listening to port: " + LISTEN_PORT);

//set up our routes
app.get('/', function(req, res){    //request, response
    res.sendfile('index.html', {root:ABS_STATIC_PATH});  //require an absolute path
});

app.get('/wack', function(req, res){    //request, response
    res.sendfile('wack.html', {root:ABS_STATIC_PATH});  //require an absolute path
});


//socket.io / websockets stuff
io.on('connection', (socket)=>{
    console.log(socket.id + " connected");

    socket.on("disconnected", (data)=>{
        console.log(socket.id + 'disconnected');
    });

    //adding custom events
    socket.on('btnClick', (data)=>{
        io.sockets.emit("posChange", {x:2, y:0.5, z:0});
        console.log("changing position");
    });

});