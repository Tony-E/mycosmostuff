/* ****************************************************************************
 * These are some utility routines that support MyCosmos
 */

/* global pi2, showNames, drawOrbits */

/******************************************************************************
 *                             CosmoPoint 
 * 
 * General purpose 3D point or vector with a selection of computational methods.
 * @param {number} x      x,y,z coordinates of a point in space or space vector
 * @param {number} y
 * @param {number} z  
 */
function CosmoPoint(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.minus = function (p) {
        this.x -= p.x;
        this.y -= p.y;
        this.z -= p.z;
    };
    this.plus = function (p) {
        this.x += p.x;
        this.y += p.y;
        this.z += p.z;
    };
    this.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    this.sqr = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    };
    this.mult = function (a) {
        this.x *= a;
        this.y *= a;
        this.z *= a;
    };
    this.div = function (a) {
        this.x /= a;
        this.y /= a;
        this.z /= a;
    };
    this.zero = function () {
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
    };
    this.dot = function (p) {
        return p.x * this.x + p.y * this.y + p.z * this.z;
    };
    this.copy = function (p) {
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
    };
    this.dist = function (p) {
        return Math.sqrt(Math.pow(p.x-this.x,2)+Math.pow(p.y-this.y,2)+Math.pow(p.z-this.z,2));
    };
    this.setValue = function (x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };
}
/************************************************************************************************
 *                             ScreenPoint
 *                
 * This is a 2D point being the x, y pixel positions on the screen.
 * @param {type} x
 * @param {type} y
 */
function ScreenPoint(x,y) {
    this.x=x;
    this.y=y;
    this.copy = function(p) {
        this.x=p.x;
        this.y=p.y;
    };
    this.set = function(x,y) {
        this.x=x;
        this.y=y; 
    };
}

/******************************************************************************
 *                              Screen
 * 
 *     The display screen with methods to draw circles, lines and planets
 * 
 */
function Screen() {
    this.canvas = document.getElementById("layer1"); // The canvas in the DOM
    this.ctx = this.canvas.getContext("2d");         // The drawing contxt  
    //this.theText = document.getElementById("thetext");
    this.reDraw = true;          // everything needs to be redrawn (to start)
    
   /* width & height of canvas should be based on screen width */ 
    this.width = Math.round(0.70 * window.innerWidth);
    this.height = this.width;
    this.oldWidth = this.width;  // record screen size at startup
    this.scale=200;              // default scale in pixes per AU 
    this.oldScale=this.scale;    // scale when we started 
    
    this.centx;           // centre x and y pixels
    this.centy;
    
    this.up=0;            // user control values up, left, tilt, rotate
    this.left=0;
    this.tilt=0;
    this.rotate=0;
    
    this.sinr;           // sin and cos of rotate and tilt pre-calculated.
    this.cosr;
    this.sint;
    this.cost;
    
    
    // working areas for transpositions
    this.ds = new CosmoPoint(0,0,0);   // 3d space position of orbit or point
    this.d3 = new CosmoPoint(0,0,0);   // rotated 3d space position
    this.d2 = new ScreenPoint(0,0);    // screen projected position
  
    // set up commonly used sines and cosines
    this.doAngles = function () {    
        this.sint = Math.sin(this.tilt);   
        this.cost = Math.cos(this.tilt);  
        this.sinr = Math.sin(this.rotate); 
        this.cosr = Math.cos(this.rotate); 
    };
    
    // clear the background canvas
    this.clearScreen = function () {
        this.ctx.fillStyle = "#101033";
        this.ctx.beginPath();
        this.ctx.rect(0,0,this.width,this.height);
        this.ctx.fill();
    };
  
    // convert a 3D space coord to a 2D screen pixel coord
    this.toScreen = function (space) {
        // rotate 3D space coord
        this.d3.y = space.y * this.cosr - space.x * this.sinr;     
        this.d3.x = space.x * this.cosr + space.y * this.sinr;
        this.d3.z = space.z;  
        // convert to 2d screen with tilt, up, left 
        this.d2.x =  this.centx - this.left    
                + (this.scale * this.d3.x);    
        this.d2.y = this.centy - this.up
                -(this.scale * (this.cost*this.d3.y + this.sint*this.d3.z));  
      
    };
    
    // draw a planet with its name
    this.drawPlanet = function (bod) {
        this.ctx.fillStyle = bod.colour;
        this.ctx.beginPath();
        this.toScreen(bod.position);
        let pSize = bod.size * this.scale/this.oldScale;
        this.ctx.arc(this.d2.x, this.d2.y, pSize, 0, pi2);
        this.ctx.fill();
        if (showNames) {
            this.ctx.strokeStyle  = bod.tColour;
            this.ctx.fillText(bod.name ,this.d2.x+2 + pSize, this.d2.y+2);
            this.ctx.globalCompositeOperation = "source-over";
        }
    };
    
    // draw circle deferent or epicycle
    this.drawOrbit = function (bod) {
       if (!drawOrbits) return;
       this.ctx.strokeStyle = bod.colour;
       this.ctx.beginPath();
       
      /* the circle is constructed with a set of short lines so that the entire
       * figure can be transposed to the screen viewing angle */
       let dt = 0.05;
       for (let t=0; t<(pi2+dt); t=t+dt) {
          this.ds.z = bod.distance * bod.sini * Math.sin(t - bod.ascend);
          let xy = Math.sqrt(bod.distance * bod.distance - this.ds.z * this.ds.z);
          this.ds.x = xy * Math.cos(t);
          this.ds.y = xy * Math.sin(t);
          if (bod.method === 1) {this.ds.plus(bod.eccentre);}
          this.toScreen(this.ds);
          if (t===0) {this.ctx.moveTo(this.d2.x, this.d2.y);} else {this.ctx.lineTo(this.d2.x,this.d2.y);}
       }
       this.ctx.stroke(); 
       /* if eccentre method, draw vector from eccentre to planet */
       if (bod.method === 1) {
           this.ctx.strokeStyle = "#999999";
           this.ctx.beginPath();
           this.toScreen(bod.eccentre);
           this.ctx.moveTo(this.d2.x,this.d2.y);
           this.toScreen(bod.position);
           this.ctx.lineTo(this.d2.x, this.d2.y);
           this.ctx.stroke();
       }
    };    
    
    /* draw a line from a to b colour c */
    this.join = function (a, b, c) {
       this.ctx.strokeStyle = c;
       this.ctx.beginPath();
       this.toScreen(a);
       this.ctx.moveTo(this.d2.x,this.d2.y);
       this.toScreen(b);
       this.ctx.lineTo(this.d2.x, this.d2.y);
       this.ctx.stroke();
    };
        
    /* draw celestial sphere */
    this.doStars = function(r) {
        this.ctx.beginPath(); 
        let pat = this.ctx.createPattern(this.starImage, "repeat");
        this.ctx.strokeStyle = pat;
        this.ctx.lineWidth = "9";
        this.ctx.arc(this.centx, this.centy, r*this.scale/2, 0, 2 * Math.PI);
        this.ctx.stroke(); 
        this.ctx.lineWidth = "1";
        
    };
    
    /* canvas has been resized */
    this.reSize = function() {
        reDraw = true;         // everything will have to be redrawn
       /* get new window size and set canvas height and width */ 
        this.width = Math.round(0.65 * innerWidth);
        this.height = Math.round(0.75 * innerHeight);
       /* align canvas, graphics and text to the same size */
        this.ctx.width = this.width;
        this.ctx.height = this.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
       /* set scal to fit canvas */
        this.scale = this.oldScale * this.width/this.oldWidth;
       /* set default centre */ 
        this.centy = (this.ctx.height/2);                         
        this.centx = (this.ctx.width/2); 
       /* set font size (needs to be reset after a canvas resize) */
        this.ctx.font = "12px Verdana";      
     };
     
    this.drawInfo = function (elapse, long, lat) {
       this.ctx.strokeStyle  = "#FFFFAA";
       let text = "JD: ";
       text += (1448273.00000 + elapse).toFixed(2);
       text += "   Long: " + toDegrees(long).toFixed(1) + "° ";
       text += "    Lat: " + toDegrees(lat).toFixed(1) + "° ";
       this.ctx.fillText(text,20, this.height-20);
    };
}

/* Planet object hold properties of planet and may used for other symbols
 * that need to be drawn.
 * @param {type} name
 * @param {type} colour
 * @param {type} size
 * @param {type} rad
 * @param {type} per
 * @param {type} inc
 * @param {type} ascen
 * @returns {Planet}
 */
function Planet (name, colour, size, rad, per, inc, ascen) {
    this.name = name;
    this.colour = colour;
    this.tColour = colour;
    this.tOffset = new ScreenPoint(8,8);
    this.size = size;
    this.position = new CosmoPoint(0,0,0);
    this.latitude = 0;
    this.eccentre = new CosmoPoint(0,0,0);
    this.method = 1;               // 1 has eccentre
    this.period = per;             // orbital period in years
    this.distance = rad;           // radialus deferent(R)
    this.e;                        // eccentricity
    this.ga;                       // eccentric angle
    this.incl = inc;               // inclination
    this.ascend = ascen;           // ascending node;
    this.anomaly;                  // anomaly (radians)relative to centre
    this.longAtEpoch;              // mean longitude at epoch
    this.meanDailyMotion;          // Mean daily motion
    this.orbit = new Circle();
    /* trig functions pre-calculated */
    this.coso = Math.cos(this.ascend);
    this.sino = Math.sin(this.ascend);
    this.cosi = Math.cos(this.incl);
    this.sini = Math.sin(this.incl);
    
   /* Calculate anomaly of this object */
    this.doAnomaly = function (elapseDays) {
        this.anomaly = (this.longAtEpoch + elapseDays * this.meanDailyMotion) % pi2;  
        return this.anomaly;
    };
  
   /* Calculate position of this object */
    this.doPosition = function (elapseDays, adjust) {    
        this.anomaly = (adjust + this.longAtEpoch + elapseDays * this.meanDailyMotion) % pi2;  
        if (this.method === 1) {
            let dNode = Math.sin(this.anomaly-this.ascend);
            this.latitude =  this.incl * dNode;
            this.position.z = this.distance * this.sini * dNode;
            this.position.x = this.distance * Math.cos(this.anomaly);
            this.position.y = this.distance * Math.sin(this.anomaly);
            this.position.plus(this.eccentre);
        }
        
    };
    

    
}

/***********************************************************************
 * 
 *        Objects to be drawn on the screen.
 * @param {char} name 
 * @param {#rrggbb} colour
 * @param {integer} size of planet drawing
 * 
 */


function Line (start, end, colour) {
    this.x = start;
    this.y = end;
    this.colour = colour;
}
 
function Circle () {
    this.centre = new CosmoPoint(0,0,0);
    this.radius;
    this.colour;
}

function toRadians (deg) {
    return deg*Math.PI/180;
}

function toDegrees (rad) {
    return rad*180/Math.PI;
}
  