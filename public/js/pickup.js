let holding = false;

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
        
        this.el.setAttribute("class", "interactive");

        this.el.addEventListener('mousedown', function(){
            
            if(holding == false){
                camEl = document.getElementById('camera');

                let item = this.cloneNode(true);
                camEl.appendChild(item);
                item.setAttribute("position", {x: -0.8, y:-0.8, z:-1});
                item.setAttribute("rotation", {x: 0, y:45, z:0});

                this.remove();
                holding = true;

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


