
let moles = 0;  // array of moles
let holes = 0;  // array of holes
let corks = 0;  // may not be used anymore

//moleNum = 16;   //for number of moles in the game

let startBtn = 0;   //global variable for start button

//animation to move object typically moles
AFRAME.registerComponent('moleanim', {
    init:function(){
        let curPos = this.el.getAttribute('position');
        //console.log(curPos);
        
        //may want to do an emit instead to prevent unwanted clicking
        this.el.setAttribute('animation__drop', {'property':'position', 'to': {x:curPos.x, y:-0.75, z:curPos.z},
                                                'startEvents': 'click, fall', 'dur': 300});
        this.el.setAttribute('animation__rise', {'property':'position', 'to': {x:curPos.x, y:0.4, z:curPos.z},
                                                'startEvents': 'rising', 'dur': 300});

        this.el.setAttribute("class", "interactive");
        if(this.el.children){
            
            let myChildren = this.el.children;
            for(let i = 0; i < myChildren.length; i++){
                myChildren[i].setAttribute("class", "interactive");
            }
        }
    }
});

window.onload = function(){

    let path = window.location.pathname;
    let page = path.split("/").pop();

    startBtn = document.getElementById("btn_start");    //getting start button

    moles = document.getElementById("moles").children;  //getting list of game moles
    holes = document.getElementById("holes").children;  //getting list of game holes

    //adding click events
    //when clicked the moles should emit the mHit to the server to update other players
    for(i=0; i < moles.length; i++){
        moles[i].addEventListener('click', function(){
            
            //extracting index from object's id
            let idStr = this.id;
            let idstart = idStr.indexOf("_") + 1;
            let idend = this.id.length;
            
            let myId = Number(idStr.substring(idstart, idend));

            socket.emit('mHit', myId);
            socket.emit('extraHit', myId);
            socket.emit('changeScore');
        });
    }

    //TESTING THINGS OUT
    for(i=0; i < moles.length; i++){
        changeMoleClass(moles[i], "");
    }

    if(page == 'wack.html'){

        //adding event to begin game to start button
        startBtn.addEventListener("click", function(){
            socket.emit('beginCoop');
        });

    } else if(page == 'attack.html'){
        
        //adding event to begin game to start button
        startBtn.addEventListener("click", function(){
            socket.emit('beginBattle');
        });

        let p1Btn = document.getElementById("p1_btn");    //getting player 1 button
        let p2Btn = document.getElementById("p2_btn");    //getting player 1 button

        //send server your id
        p1Btn.addEventListener("click", (data)=>{
            socket.emit("setPlayer1", socket.id);
        });

        //send server your id
        p2Btn.addEventListener("click", (data)=>{
            socket.emit("setPlayer2", socket.id);
        });

    }

};

//sets the class of a passed mole to the passed classname
function changeMoleClass(mole, className){
    
    let c = "class";

    mole.setAttribute(c, className);
    let moleChildren = mole.children;

    for(let i = 0; i < moleChildren.length; i++){
        moleChildren[i].setAttribute(c, className);
    }
}

//function creates a PB asset
function createPB(pos){

    let newPB = document.createElement('a-entity');
    newPB.setAttribute('id', 'PB');
    newPB.setAttribute('position', pos);
    newPB.setAttribute('class', 'interactive');

    let lid = document.createElement('a-cylinder');
    lid.setAttribute('position', {x:0, y:0.3, z:0});
    lid.setAttribute('color', 'red');
    lid.setAttribute('height', 0.075);
    lid.setAttribute('radius', 0.27);
    lid.setAttribute('class', 'interactive');

    let butter = document.createElement('a-cylinder');
    butter.setAttribute('position', {x:0, y:0, z:0});
    butter.setAttribute('color', '#d8b887');
    butter.setAttribute('height', 0.6);
    butter.setAttribute('radius', 0.25);
    butter.setAttribute('class', 'interactive');

    newPB.appendChild(butter);
    newPB.appendChild(lid);

    newPB.addEventListener('click', function(){

        //tell server that you sent a mole to your opponent
        socket.emit('sendMole', socket.id);

        //delete itself
        pbFloating = false;
        this.remove();
    });

    return newPB;

}