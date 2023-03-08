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


let mStand;         //variable used to determine which moles are standing

//coop variables
let cycle = 0;      //tracks what cycle the game is on (number of times a set of moles have popped up)
let lives = 5;      //tracks lives of players in game
let score = 0;      //tracks score of players in game
let coop = false;   //variable used to determine if coop game is running

//competative veraibles
let battle = false;     //variable used to deremine if battle game is running
let p1Lives = 5;        //var for player 1 lives
let p2Lives = 5;        //var for player 2 lives
let p1 = 0;             //var for tracking who player 1 is
let p2 = 0;             //var for tracking who player 2 is
let extraMole = -1;
let sender = -1;        //tracks who sent a mole. -1 = no one, 0 = p1, 1 = p2

//socket.io / websockets stuff
io.on('connection', (socket)=>{
    console.log(socket.id + " connected");

    socket.on("disconnect", (data)=>{
        
        socket.broadcast.emit('playerLeft', socket.id);
        
        console.log(socket.id + ' disconnected');
    });

    /***** APP.JS SOCKETS CODE FOR UPDATING CORK LOCATIONS *****/
    socket.on('pickCork', (data)=>{
        socket.broadcast.emit('inhand', data);
    })

    socket.on('placeCork', (data)=>{
        socket.broadcast.emit('inhole', data);
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

    //when the game hasn't started, set player 1 as the socket.id that's been sent
    socket.on('setPlayer1', (data)=>{
        if(!battle){
            p1 = data;
        }
    });

    //when the game hasn't started, set player 2 as the socket.id that's been sent
    socket.on('setPlayer2', (data)=>{
        if(!battle){
            p2 = data;
        }
    });

    /***** APP.JS SOCKETS CODE FOR MOLE EVENTS *****/

    //starting the whack a mole game
    socket.on('beginCoop', (data)=>{
        if(!coop){
            coop = true;
            cycle = 0;
            lives = 5;
            io.sockets.emit('livesUpdate', lives);
            score = 0;
        }
    });

    //starting the whack a mole game
    socket.on('beginBattle', (data)=>{
        
        //only start the game if there is no game running and two different players are selected
        if(!battle && (p1 != p2) && (p1 != 0) && (p2 !=0)){
            
            battle = true;
            cycle = 0;
            p1Lives = 5;
            p2Lives = 5;
            io.sockets.emit('p1LivesUpdate', p1Lives);
            io.sockets.emit('p2LivesUpdate', p2Lives);
            score = 0;

            //spawn in only one cork for the battle. This cork can be stolen by either player and used to help manage moles
            io.sockets.emit('spawnCork', {x:0, y:1.25, z:0});
            io.sockets.emit('removeCork');  //remove any previously exhisiting corks
        }
    });

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

    //for when player hits a sent mole
    socket.on('extraHit', (data)=>{
        
        if(data == extraMole){
            extraMole = -1; //erase the previously sent mole to indicate successful hit
        }
    });

    //for battle mode. When player sends a mole to opponent
    socket.on('sendMole', (data)=>{

        //track who sent the mole
        sender = data;

    });

    /***** APP.JS SOCKETS CODE FOR UPDATING PLAYER SCORE *****/
    socket.on('changeScore', (data)=>{
        score++;
        io.sockets.emit('scoreUpdate', score);
    });

});

let moleNum = 3;    //variable for how many moles to have pop up
let corkPositions = [{x:4, y: 1, z: 4}, {x:-4, y: 1, z: 4}, {x:4, y: 1, z: -4}, {x:-4, y: 1, z: -4}];

//rises and drop moles on given interval.
setInterval(function(){
    
    if(coop){
        moleNum = 4;
        let pushUp = []; //temp list of moles to have pop up

        //picking unique random number
        while(pushUp.length < moleNum){
            
            let randIdx = Math.floor(Math.random() * 16);
    
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
                io.sockets.emit('moleDrop', mStand[j]); //drop the mole that hasn't been hit
                //only subtract from lives if there are any left
                if(lives > 0){
                    lives--;
                    io.sockets.emit('livesUpdate', lives);
                }
            }

            io.sockets.emit('removeCork');  //remove any previously exhisiting corks

            //when players miss 5 moles the game is over
            if(lives < 1){
                coop = false;
            }
            //if player/players have not failed the game then send out next batch of moles
            else{
                //adds 10% chance component to spawning in corks
                let chance = Math.random();
                if(chance < 0.1){
                    //spawn in cork at same location for all users
                    let corkIdx = Math.floor(Math.random() * 4);
                    io.sockets.emit('spawnCork', corkPositions[corkIdx]);
                }
        
                //wait for all moles to be dropped. Then have new ones stand up.
                //determine what type of item to have pop up, then send.
                setTimeout(function(){
                    io.sockets.emit('molePop', pushUp);
                }, 300);
            }
        } 
    
        mStand = pushUp;    //store previously standing moles for next loop
        cycle++;            //keep track of cycle
    } else if(battle){

        let pushUp = []; //temp list of moles to have pop up
        let mtoSend = -1;

        //picking unique random number, double for each player
        while(pushUp.length < (moleNum * 2)){
            
            let randIdx = Math.floor(Math.random() * 9);

            //first half should be between 0 and 8, other have should be between 9 and 17
            if(pushUp.length < moleNum){
                randIdx = Math.floor(Math.random() * 9);
            } else {
                randIdx = Math.floor(Math.random() * (18 - 9) + 9);
            }

            //only add to list if the number hasn't been chosen yet
            if(pushUp.indexOf(randIdx) == -1){
                pushUp.push(randIdx);
            }
        }

        //for when other player sends a mole to their opponent
        if(sender == p1){
            //look for extra number that hasn't already been chosen
            let randIdx = Math.floor(Math.random() * (18 - 9) + 9);
            while(pushUp.indexOf(randIdx) != -1){
                randIdx = Math.floor(Math.random() * (18 - 9) + 9);
            }

            mtoSend = randIdx; //get the mole to send index

        } else if(sender == p2){
            //look for extra number that hasn't already been chosen
            let randIdx = Math.floor(Math.random() * 9);
            while(pushUp.indexOf(randIdx) != -1){
                randIdx = Math.floor(Math.random() * 9);
            }

            //extraMole = randIdx; //store the extra mole
            mtoSend = randIdx;

        }

        if(cycle == 0){
            io.sockets.emit('molePop', pushUp); //sending random index to all clients
        } else {

            //check if any moles that have been sent are standing          
            if(extraMole != -1){

                //moles under 9 are P1's responsibility, the remaining above are P2's responsibility
                if(extraMole < 9 && p1Lives > 0){
                    p1Lives--;
                    io.sockets.emit('p1LivesUpdate', p1Lives);
                } else if(extraMole > 8 && p2Lives > 0) {
                    p2Lives--;
                    io.sockets.emit('p2LivesUpdate', p2Lives);
                }
                //drop the mole and reset extra mole
                io.sockets.emit('moleDrop', extraMole);
                extraMole = -1;
            }

            //drop all moles that are still standing
            for(let j = 0; j < mStand.length; j++){
                io.sockets.emit('moleDrop', mStand[j]);
                
                //if any of the moles in the first 9 idx were standing, this means p1 missed a mole
                //any other moles standing would mean p2 missed a mole
                if(mStand[j] < 9 && p1Lives > 0){
                    p1Lives--;
                    io.sockets.emit('p1LivesUpdate', p1Lives);
                } else if(mStand[j] > 8 && p2Lives > 0) {
                    p2Lives--;
                    io.sockets.emit('p2LivesUpdate', p2Lives);
                }

            }

            io.sockets.emit('removePB');  //remove any previously exhisiting PB

            //when either player runs out of lives stop the game
            if(p1Lives <= 0 || p2Lives <=0){
                battle = false;
            } else {

                //adds 10% chance component to spawning in bait/PB
                let chance = Math.random();
                if(chance < 0.7){
                    io.sockets.emit('spawnPB', {x:0, y:1.25, z:0});
                }

                setTimeout(function(){
                    io.sockets.emit('molePop', pushUp); //sending random index to all clients
                    
                    //when someone has sent a mole, send this out to their opponents grid
                    if(sender != -1){  
                        io.sockets.emit('popExtra', mtoSend); //send an extra
                        sender = -1;    //reset sender
                    }
                    
                }, 300);
            }
        }

        cycle++;
        mStand = pushUp;
        extraMole = mtoSend;
    }
    
}, 6000); //reduce time given expontially by 0.75 each 3 cycles