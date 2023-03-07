
let moles = 0;  // array of moles
moleNum = 16;   //for number of moles in the game

//position of moless
let molePositions = [   {x:-6,y:-0.75,z:6}, {x:-2,y:-0.75,z:6}, {x:2,y:-0.75,z:6}, {x:6,y:-0.75,z:6},
                        {x:-6,y:-0.75,z:2}, {x:-2,y:-0.75,z:2}, {x:2,y:-0.75,z:2}, {x:6,y:-0.75,z:2},
                        {x:-6,y:-0.75,z:-2}, {x:-2,y:-0.75,z:-2}, {x:2,y:-0.75,z:-2}, {x:6,y:-0.75,z:-2},
                        {x:-6,y:-0.75,z:-6}, {x:-2,y:-0.75,z:-6}, {x:2,y:-0.75,z:-6}, {x:6,y:-0.75,z:-6} ];

//animation to move object typically moles
AFRAME.registerComponent('moleanim', {
    init:function(){
        let curPos = this.el.getAttribute('position');
        console.log(curPos);
        
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

    //adding click events
    //when clicked the moles should emit the mHit to the server to update other players
    console.log(moles);
    for(i=0; i < moles.length; i++){
        moles[i].addEventListener('click', function(){
            socket.emit('mHit', this.id);
        });
    }

    /*
    //create all moles and make them a child of the moles entity (html)
    for(let i = 0; i < moleNum; i++){
        
        //creating mole body part parent
        let mGrp = document.createElement("a-entity");
        mGrp.setAttribute("position", molePositions[i]); //this needs to change for each position
        mGrp.setAttribute("id", i);
        mGrp.setAttribute("moleanim");
        mGrp.setAttribute("class", "interactive");

        //creating mole body
        let mBody = document.createElement("a-cylinder");
        mBody.setAttribute("position", {x:0, y:0, z:0});
        mBody.setAttribute("color", "#63421b");
        mBody.setAttribute("height", 1);
        mBody.setAttribute("radius", 0.25);
        mBody.setAttribute("id", "mBody");
        mBody.setAttribute("class", "interactive");
        mGrp.append(mBody);

        //creating mole head
        let mHead = document.createElement("a-sphere");
        mHead.setAttribute("position", {x:0, y:0.5, z:0});
        mHead.setAttribute("color", "#63421b");
        mHead.setAttribute("radius", 0.25);
        mHead.setAttribute("id", "mHead");
        mHead.setAttribute("class", "interactive");
        mGrp.append(mHead);

        //creating mole Snout
        let mSnout = document.createElement("a-cone");
        mSnout.setAttribute("position", {x:0, y:0.35, z:0.27});
        mSnout.setAttribute("rotation", {x:90, y:0, z:0});
        mSnout.setAttribute("color", "#DAA06D");
        mSnout.setAttribute("radius-bottom", 0.15);
        mSnout.setAttribute("height", 0.25);
        mSnout.setAttribute("id", "mHead");
        mSnout.setAttribute("class", "interactive");
        mGrp.append(mSnout);

        //creating mole left eye
        let mEyeL = document.createElement("a-sphere");
        mEyeL.setAttribute("position", {x:-0.16, y:0.4, z:0.172});
        mEyeL.setAttribute("color", "black");
        mEyeL.setAttribute("radius", 0.05);
        mEyeL.setAttribute("id", "mEyeL");
        mEyeL.setAttribute("class", "interactive");
        mGrp.append(mEyeL);

        //creating mole right eye
        let mEyeR = document.createElement("a-sphere");
        mEyeR.setAttribute("position", {x:0.16, y:0.4, z:0.172});
        mEyeR.setAttribute("color", "black");
        mEyeR.setAttribute("radius", 0.05);
        mEyeR.setAttribute("id", "mEyeR");
        mEyeR.setAttribute("class", "interactive");
        mGrp.append(mEyeR);

        //creating mole nose
        let mNose = document.createElement("a-sphere");
        mNose.setAttribute("position", {x:0, y:0.352, z:0.398});
        mNose.setAttribute("color", "black");
        mNose.setAttribute("radius", 0.025);
        mNose.setAttribute("id", "mNose");
        mNose.setAttribute("class", "interactive");
        mGrp.append(mNose);

        //add created mole into the mole group element
        molesEl.append(mGrp);

    }
    */

    //store all moles in the mole variable
    //moles = document.getElementById("moles").children;
    //moles = molesEl.children;

};