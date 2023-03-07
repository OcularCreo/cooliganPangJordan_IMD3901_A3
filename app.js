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
        
        socket.broadcast.emit('playerLeft', socket.id);
        
        console.log(socket.id + ' disconnected');
    });

    /***** APP.JS SOCKETS CODE FOR JOINING, EXISITING, AND UPDATING PLAYERS *****/ 

    socket.broadcast.emit('joined', socket.id);//draws a players who joined for exisiting ones

    //used to draw exisiting players for players who joined
    socket.on('createExisting', (data)=>{
        io.to(data[0]).emit('existing', data[1]);
    });

    socket.on('updatePlayer', (data)=>{
        socket.broadcast.emit('updatePlayer', data);
    });

    /***** APP.JS SOCKETS CODE FOR MOLE EVENTS *****/

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

    //adding custom events CAN REMOVE THIS BTW
    socket.on('btnClick', (data)=>{
        io.sockets.emit("posChange", {x:2, y:0.5, z:0});
        console.log("changing position");
    });

});

let cycle = 0;      //tracks what cycle the game is on (number of times a set of moles have popped up)
let moleNum = 2;    //variable for how many moles to have pop up

//rises and drop moles on given interval.
setInterval(function(){
    
    let pushUp = []; //temp list of moles to have pop up

    //picking unique random number
    while(pushUp.length < moleNum){
        
        let randIdx = Math.floor(Math.random() * 3);

        //only add to list if the number hasn't been chosen yet
        if(pushUp.indexOf(randIdx) == -1){
            pushUp.push(randIdx);
        }
    }

    //when it's the very first cycle just make the selected moles pop up
    if(cycle == 0){
        io.sockets.emit('molePop', pushUp);//sending random index to all clients
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

    mStand = pushUp;    //store previously standing moles for next loop
    cycle++;            //keep track of cycle
    
}, 3000); //reduce time given expontially by 0.75 each 3 cycles