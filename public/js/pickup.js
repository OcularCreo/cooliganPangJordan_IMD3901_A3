let holding = false;    //veraible to tell if player is holding an item
let camEl = 0;          //variable for camera element

let curCork = 0;
let corkFloating = false;

/*window.onload = function(){

    camEl = document.getElementById('camera');
    console.log('starting');

    holding = false;    //determines if object is being held
    
    //temporary and used for tests
    btn = document.getElementById('btn');
    btn.addEventListener('click', function(){
        camEl.removeChild(camEl.lastChild);
    });

}*/

//function creates corks at one of 4 locations
function createCork(position){
    
    let cork= document.createElement('a-cone');
    cork.setAttribute('position', position);
    cork.setAttribute('color', '#DAA06D');
    cork.setAttribute('radius-bottom', 0.15);
    cork.setAttribute('radius-top', 0.25);
    cork.setAttribute('height', 0.5);
    cork.setAttribute('holdable', '');
    cork.setAttribute('id', 'cork_'+curCork);

    curCork++;

    return cork;

}

//makes object with holdable attribute holdable
AFRAME.registerComponent('holdable', {
    init:function(){
        
        this.el.setAttribute("class", "interactive");

        //animation components for corks
        let curPos = this.el.getAttribute('position');
        this.el.setAttribute('animation__drop', {'property':'position', 'to': {x:curPos.x, y:-0.75, z:curPos.z},
                                                'startEvents': 'fall', 'dur': 300});
        this.el.setAttribute('animation__rise', {'property':'position', 'to': {x:curPos.x, y:1, z:curPos.z},
                                                'startEvents': 'rising', 'dur': 300});

        this.el.addEventListener('mousedown', function(){
            
            if(holding == false){
                camEl = document.getElementById('camera');

                let item = this.cloneNode(true);
                camEl.appendChild(item);
                item.setAttribute("position", {x: -0.8, y:-0.8, z:-1});
                item.setAttribute("rotation", {x: 0, y:45, z:0});

                this.remove();
                holding = true;
                corkFloating = false;

                socket.emit('pickCork', [this.getAttribute("id"), socket.id]);
            }

        });
    }
});

//used for placing corks in the mole holes
AFRAME.registerComponent('placeable', {
    init:function(){

        this.el.setAttribute("class", "interactive");

        this.el.addEventListener("click", function(){
            if(holding){
                
                //clone and remove item from players hand.
                camChildren = document.getElementById('camera');
                
                let cork = camEl.lastChild.cloneNode(true);
                this.appendChild(cork);

                camEl.removeChild(camEl.lastChild);

                //reset new cork pos and rot
                cork.setAttribute("position", {x:0,y:0,z:0});
                cork.setAttribute("rotation", {x:0,y:0,z:0});
                
                holding = false;

                socket.emit('placeCork', [cork.getAttribute("id"), socket.id, this.getAttribute("id")])
            }
        });

    }
});


