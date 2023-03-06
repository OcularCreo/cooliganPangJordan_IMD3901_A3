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

//let mStand = -1;
let mStand;

//socket.io / websockets stuff
io.on('connection', (socket)=>{
    console.log(socket.id + " connected");

    socket.on("disconnect", (data)=>{
        console.log(socket.id + ' disconnected');
    });

    //adding custom events
    socket.on('btnClick', (data)=>{
        io.sockets.emit("posChange", {x:2, y:0.5, z:0});
        console.log("changing position");
    });

    /*socket.on('moleMoved', (data)=>{
        io.sockets.emit('molePos', {id:data.id, x:data.x, y:data.y, z:data.z});
    });*/

    //for when a player hits a mole
    socket.on('mHit', (data)=>{
        
        let idx = mStand.indexOf(Number(data)); //find if the index is in the array

        //only do the following if the number has been found in the array
        if(idx > -1){
            //remove from list of standing moles
            mStand.splice(idx, 1);
            
            //udpate other player's moles
            io.sockets.emit('moleDrop', data);
        }
        
    });

});

let mDown = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
let cycle = 0;
let moleNum = 2;

//generate random number
setInterval(function(){
    
    let pushUp = []; //list of moles to have pop up

    //pick x num of moles
    for(let i = 0; i < moleNum; i++){
        let randIdx = Math.floor(Math.random() * 3);    //make sure to watch for length of moles
        pushUp.push(randIdx);
    }

    if(cycle == 0){
        //io.sockets.emit('molePop', randIdx);  
        io.sockets.emit('molePop', pushUp);          //sending random index to all clients
    } else {
        
        //drop all moles that are still standing
        for(let j = 0; j < mStand.length; j++){
            io.sockets.emit('moleDrop', mStand[j]);
        }
        
        //wait for all moles to be dropped. Then have new ones stand up.
        setTimeout(function(){
            io.sockets.emit('molePop', pushUp);
        }, 300);
    } 
    
    /*else if(mStand != -1){
        
        //moles that are untouched
        io.sockets.emit('moleDrop', mStand);
        setTimeout(function(){
            io.sockets.emit('molePop', randIdx);
        }, 300);

    } else {
        //moles that are touched
        io.sockets.emit('molePop', randIdx);
    }*/

    mStand = pushUp; //store previously standing moles for next loop

    cycle++;
    
}, 3000);