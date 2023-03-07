
let moles = 0;  // array of moles
let holes = 0;  // array of holes
let corks = 0;

moleNum = 16;   //for number of moles in the game

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

    moles = document.getElementById("moles").children;
    holes = document.getElementById("holes").children;
    //corks = document.getElementById("corks").children;

    //adding click events
    //when clicked the moles should emit the mHit to the server to update other players
    for(i=0; i < moles.length; i++){
        moles[i].addEventListener('click', function(){
            let myId = Number(this.id.slice(-1));
            socket.emit('mHit', myId);
        });
    }

};