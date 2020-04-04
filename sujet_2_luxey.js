// setup canvas

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width = 600;
const canvasHeight = canvas.height = 1000;

// function to generate random number

function random(min,max) {
   const num = Math.floor(Math.random()*(max-min)) + min;
   return num;
}

class Molecule {

   constructor(x, y, width, height, color, type) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.type = type;
   }

   draw() {
      ctx.fillStyle = this.color;
      if (this.type === 'neurotransmitter') {
         ctx.beginPath();
         ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
         ctx.fill();
      } else {
         ctx.fillRect(this.x, this.y, this.width, this.height);
      }
   }

   update(velocity = 0.13) {this.y += velocity;}
   
   collisionDetect(molset) {
      for (let i = 0; i < molset.length; i++) {
         if (/inactivated/.test(molset[i].type) === true) {
            if (this.x > molset[i].x - this.width
            && this.x < molset[i].x + molset[i].width + this.width
            && this.y > molset[i].y - this.height) {
               molset[i].width = 60;
               molset[i].color = '#80ffbf';
               molset[i].type = molset[i].type.replace(/inactivated/, 'activated');
               return true;
            }
         }
      }
   }
}

function setMolecules(width, height, color, type, n, alea) {
   let molecules = [];
   let randx, randy;
   while (molecules.length < (n + random(0 - alea, alea))) {
      let position = false; 
      while (position === false) {
         position = true;
         randx = random(0 + width, canvas.width - width);
         if (type == 'neurotransmitter') {
            randy = random(0 + height, canvas.height / 3 - height);
         } else {
            randy = random(canvas.height / 3 + height, canvas.height * 2/3 - height);
         }
         for (let mol of molecules) {
            if(randx > mol.x - mol.width && randx < mol.x + 2 * mol.width
            && randy > mol.y - mol.height && randy < mol.y + 2 * mol.height) {
               position = false;
               break;
            }
         }
      }
      let molecule =  new Molecule(randx, randy, width, height, color, type);             
      molecules.push(molecule);
   }
   return molecules;
}

function toclipboard(event) {
   let doc = document.getElementById("result");
   doc.select();
   document.execCommand("copy");
   alert("Datas are exported to clipboard !");
}

document.getElementById("clipboard").addEventListener("click", toclipboard);

let moleculesOnCanvas = {
   neurotransmitters : setMolecules(15, 15, '#ff4da6', 'neurotransmitter', 25, 5),
   receptors : setMolecules(40, 40, '#33ccff', 'receptor-inactivated', 15, 3),
} // objet contenant des listes de molecules

let nNT = moleculesOnCanvas['neurotransmitters'].length;
let nInactivated = moleculesOnCanvas['receptors'].length;
let nActivated = 0;
let oResult = document.getElementById("result");
oResult.innerHTML = "time (s)\ttot. inactivated\ttot. activated\ttot. NT\n";

let t = 0;
oResult.innerHTML += "t" + t + "\t" + nInactivated + "\t" + nActivated + "\t" + nNT + "\n";
t++;

window.setInterval(function() {
   if (t <= 120) {
      oResult.innerHTML += "t" + t + "\t" + nInactivated + "\t" + nActivated + "\t" + nNT + "\n";
      t++;
   }
}, 1000);

function loop() {
   ctx.fillStyle = '#ccf2ff';
   ctx.fillRect(0, 0, canvasWidth, canvasHeight); // dessinne le cytoplasme
   ctx.fillStyle = '#ffcce6'; // dessinne le cytoplasme
   ctx.fillRect(0, canvasHeight / 3, canvasWidth, canvasHeight / 3);
   ctx.fillStyle = 'black';
   for (let lwidth = 0; lwidth < 3; lwidth++) { // dessinne les bords avec une epaisseur donnee (ici 3 px)
      ctx.fillStyle = '#0080ff'
      ctx.strokeRect(lwidth, lwidth, canvasWidth - 2 * lwidth, canvasHeight);
      ctx.fillStyle = '#e600e6'
      ctx.strokeRect(lwidth, lwidth + canvasHeight / 3, canvasWidth - 2 * lwidth, canvasHeight / 3);

   }
   for (let mtype in moleculesOnCanvas) {
      for (let i = 0; i < moleculesOnCanvas[mtype].length; i++) {
         moleculesOnCanvas[mtype][i].draw(); // dessine une molecule
         if (/inactivated/.test(moleculesOnCanvas[mtype][i].type) === false) {
            moleculesOnCanvas[mtype][i].update(); // incremente la coordonee x d'une molecule mobile
            if (moleculesOnCanvas[mtype][i].type === 'neurotransmitter') {
               // verifie si un neurotransmetteur entre en colision avec un recepteur inactif
               let activation = moleculesOnCanvas[mtype][i].collisionDetect(moleculesOnCanvas.receptors);
               if (activation === true) {
                  nInactivated--;
                  nActivated++;
                  moleculesOnCanvas[mtype].splice(i, 1); // supprime le neurotransmetteur de son trableau
                  nNT--;
               }
            }
         }            
      }
   }
   requestAnimationFrame(loop);
}

loop();


