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

   update(velocity) {this.y += velocity;}
   
   collisionDetect(recepset) {
      for (let i = 0; i < recepset.length; i++) {
         if (recepset[i].type === 'receptor-inactivated') {
            const dx = this.x - recepset[i].x - recepset[i].width / 2;
            const dy = this.y - recepset[i].y - recepset[i].height / 2 ;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.height / 2 * Math.sqrt(2) + Math.sqrt((recepset[i].width / 2) ** 2 + (recepset[i].height / 2) ** 2 )) {
               recepset[i].width = 60;
               recepset[i].color = 'green';
               recepset[i].type = 'receptor-activated';
               return true;
            }
         }
      }
      return false;
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
         randy = random(0 + height, canvas.height - height);
         for (let mol of molecules) {
            if (Math.sqrt(  ( (mol.x - randx) ** 2 ) + ((mol.y - randy) ** 2) ) < 2 * width) {
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

let moleculesOnCanvas = {
   neurotransmitters : setMolecules(15, 15, 'orange', 'neurotransmitter', 25, 5),
   receptors : setMolecules(40, 40, 'blue', 'receptor-inactivated', 15, 3),
}

function loop() {
   ctx.fillStyle = 'rgb(255, 255, 255)';
   ctx.fillRect(0, 0, canvasWidth, canvasHeight);
   ctx.strokeRect(0, canvasHeight * 0.25, canvasWidth, canvasHeight * 0.5);
   for (let mtype in moleculesOnCanvas) {
      for (let i = 0; i < moleculesOnCanvas[mtype].length; i++) {
         moleculesOnCanvas[mtype][i].draw();
         if (moleculesOnCanvas[mtype][i].type !== 'receptor-inactivated') {
            moleculesOnCanvas[mtype][i].update(1);
            if (moleculesOnCanvas[mtype][i].type !== 'receptor-activated') {
               let activation = moleculesOnCanvas[mtype][i].collisionDetect(moleculesOnCanvas.receptors);
               if (activation === true) {
                  moleculesOnCanvas[mtype].splice(i, 1);
               }
            }
         }            
      }
   }
   requestAnimationFrame(loop);
}

loop();


