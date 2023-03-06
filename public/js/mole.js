
let moles = 0;//new Array(3);

class moleInfo {
    constructor(el){
        this.el = el; 
        this.isUp = false;
        this.upTime = 0;
    }
}

//animation to move object typically moles
AFRAME.registerComponent('moleanim', {
    init:function(){
        let curPos = this.el.getAttribute('position');
        console.log(curPos);
        
        //may want to do an emit instead to prevent unwanted clicking
        this.el.setAttribute('animation__drop', {'property':'position', 'to': {x:curPos.x, y:-0.6, z:curPos.z},
                                                'startEvents': 'click, fall', 'dur': 300});
        this.el.setAttribute('animation__rise', {'property':'position', 'to': {x:curPos.x, y:0.5, z:curPos.z},
                                                'startEvents': 'rising', 'dur': 300});
    }
});

let test = false;
let prev = 0;

window.onload = function(){
    
    moles = document.getElementById('moles').children;

    /*
    setInterval(function(){
        
        let moleIdx = Math.floor(Math.random() * moles.length);
        let mole = moles[moleIdx];
        mole.emit('rising', null, false);

        let mPos = mole.getAttribute('position');
        mole.dispatchEvent(moleEvent);

    }, 5000);

    */

};