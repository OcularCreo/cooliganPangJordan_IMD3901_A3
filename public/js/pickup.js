let grab = false; 
let holding = false;
let testCube = 0;

let grabbedItem = 0;
let camEl = 0;

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

//makes object with holdable attribute holdable
AFRAME.registerComponent('holdable', {
    init:function(){
        this.el.addEventListener('click', function(){
    
            camEl = document.getElementById('camera');

            let item = this.cloneNode(true);
            camEl.appendChild(item);
            item.setAttribute("position", {x: -0.8, y:-0.8, z:-1});
            item.setAttribute("rotation", {x: 0, y:45, z:0});
            item.setAttribute("scale", {x: 0.75, y:0.75, z:0.75});
            console.log("picked up");
            this.remove();
        });
    }
});


