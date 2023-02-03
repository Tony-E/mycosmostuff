/*****************************************************************************
 * Cosmos is a web application to display models of the Solar System as
 * envisaged by ancient philosophers such as Ptolemy and Copernicus. 
 * 
 * This script file contains utility function related to calculation of
 * orbits and drawing images.
 */ 
/* global pi2, planets, earth */
var showNames;           // show Names or not
var drawOrbits;          // draw orbits or not

/******************************************************************************
 *                             CosmoPoint 
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
/*******************************************************************************
 *                             ScreenPoint        
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
 * This is the display screen with methods to draw circles, lines and planets
 */
function Screen() {
    this.canvas = document.getElementById("layer1"); // The canvas in the DOM
    this.ctx = this.canvas.getContext("2d");         // The drawing contxt  
    this.reDraw = true;         // when true everything needs to be redrawn
    
   /* width & height of canvas should be based on screen width. The html page 
    * should be designed to have the diagram occupying about 70% of the width */ 
    this.width = Math.round(0.70 * window.innerWidth);
    this.height = this.width;    // diagram is square
    this.oldWidth = this.width;  // record screen size at startup
    
    this.scale=3  ;              // default scale in pixels per Ptolemy's "p" 
    this.oldScale=this.scale;    // scale when we started 
    
    this.centx;           // centre of the animation x and y pixels
    this.centy;
    
    this.up=0;            // user control values up, left, tilt, rotate
    this.left=0;
    this.tilt=0;
    this.rotate=0;
    
    this.sinr;           // sin and cos of rotate and tilt angles 
    this.cosr;           // are pre-calculated by the doAngles function
    this.sint;
    this.cost;
    
    
    // working areas for transpositions of 3D and 2D points
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
        this.ctx.fillStyle = "#05052f";
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
       // convert to 2d screen projection with tilt, up, left 
        this.d2.x =  this.centx - this.left    
                + (this.scale * this.d3.x);    
        this.d2.y = this.centy - this.up
                -(this.scale * (this.cost*this.d3.y + this.sint*this.d3.z));  
    };
    
    // draw a point with name and optional line from Earth.
    this.drawPoint = function(name,position,colour,join) {
        this.ctx.fillStyle = colour;   
        this.ctx.beginPath();             
        this.toScreen(position);   // position of body to screen coords
        this.ctx.arc(this.d2.x, this.d2.y, 2, 0, pi2);
        this.ctx.fill();
        if (showNames) {        // draw body name if required
            this.ctx.strokeStyle  = colour;
            this.ctx.fillText(name ,this.d2.x+2+2, this.d2.y+2);
            this.ctx.globalCompositeOperation = "source-over";
        }
        if (join) {
            this.ctx.beginPath();
            this.toScreen(planets[earth].P);
            this.ctx.moveTo(this.d2.x,this.d2.y);
            this.toScreen(position);
            this.ctx.lineTo(this.d2.x, this.d2.y);
            this.ctx.stroke();
        }
    };
    
    // draw a planet with its name (also used to draw any point or node that
    // needs to have body or name
    this.drawPlanet = function (bod) {
        this.ctx.fillStyle = bod.colour;   // using the body's colour
        this.ctx.beginPath();              // start drawing
        this.toScreen(bod.P);       // position of body to screen coords
        let pSize = bod.size * this.scale/this.oldScale;  // scale body size
        this.ctx.arc(this.d2.x, this.d2.y, pSize, 0, pi2);// draw
        this.ctx.fill();
        if (showNames) {           // draw body name if required
            this.ctx.strokeStyle  = bod.colour;
            this.ctx.fillText(bod.name ,this.d2.x+2 + pSize, this.d2.y+2);
            this.toScreen(bod.D);
            this.ctx.fillText(bod.cName ,this.d2.x+2, this.d2.y+2);
            this.ctx.globalCompositeOperation = "source-over";
            
        }
    };
    
    //   draw circle deferent or epicycle */
    this.drawOrbit = function (bod) {
       if (!drawOrbits) return;  // quit of no orbit should be drawn
       this.ctx.strokeStyle = bod.colour; // using body colour
       this.ctx.beginPath();     // start drawing
       
        /* the circle is constructed with a set of short lines so that the entire
         * figure can be transposed to the screen viewing angle with rotate, 
         * tilt, up,left. */
      
       let dt = 0.1;   // this should be small enough that the circles look OK
       for (let t=0; t<(pi2+dt); t=t+dt) {
          // space Z is based on distance and ascending node
           this.ds.z = bod.R * bod.sini * Math.sin(t - bod.node);
          // space X, Y are based on sin and cos of angle round the circle
           let xy = Math.sqrt(bod.R * bod.R - this.ds.z * this.ds.z);
           this.ds.x = xy * Math.cos(t);
           this.ds.y = xy * Math.sin(t);
          // if ecentre method, the circle is centred on an ecentric
           if (bod.method === 1) {this.ds.plus(bod.D);}
          // convert to screen coordinate and draw the arc (except first point)
           this.toScreen(this.ds);
           if (t===0) {this.ctx.moveTo(this.d2.x, this.d2.y);
           } else {this.ctx.lineTo(this.d2.x,this.d2.y);}
       }
       this.ctx.stroke(); // draw the circle
    };    
    
    // draw a line from the centre of a to the planet of b */
    this.join = function (a, b, c) {
       this.ctx.strokeStyle = c;
       this.ctx.beginPath();
       this.toScreen(a.D);
       this.ctx.moveTo(this.d2.x,this.d2.y);
       this.toScreen(b.P);
       this.ctx.lineTo(this.d2.x, this.d2.y);
       this.ctx.stroke();
    };
        
    // draw celestial sphere (not currently used
    this.doStars = function(r) {
        this.ctx.beginPath(); 
        let pat = this.ctx.createPattern(this.starImage, "repeat");
        this.ctx.strokeStyle = pat;
        this.ctx.lineWidth = "9";
        this.ctx.arc(this.centx, this.centy, r*this.scale/2, 0, 2 * Math.PI);
        this.ctx.stroke(); 
        this.ctx.lineWidth = "1";
    };
    
    // canvas has been resized 
    this.reSize = function() {
        reDraw = true;         // everything will have to be redrawn
       /* get new window size */ 
        this.width = Math.round(0.65 * innerWidth);
        this.height = Math.round(0.75 * innerHeight);
        
       /* align canvas, graphics and text to the same size */
        this.ctx.width = this.width;
        this.ctx.height = this.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
       /* set scale to fit canvas */
        this.scale = this.oldScale * this.width/this.oldWidth;
        
       /* set default centre */ 
        this.centy = (this.ctx.height/2);                         
        this.centx = (this.ctx.width/2); 
        
       /* set font size (needs to be reset after a canvas resize) */
        this.ctx.font = "12px Verdana";      
     };
    
    // Draw the Julian Day number, longitude and latitude 
    this.drawInfo = function (elapse, long, lat) {
       this.ctx.fillStyle  = "#ffffaa";
       let text = "JD: ";
       let jd = 1448273.0 + elapse;
       text += jd.toFixed(2);
       text += "   Long: " + toDegrees(long).toFixed(1) + "° ";
       text += "    Lat: " + toDegrees(lat).toFixed(1) + "° ";
       this.ctx.fillText(text,20, this.height-20);
    };
}
/* Entity is a data object containing details of a planet. The variables are
 * named as far as possible according to Pederson. Most Entities will have only
 * a subset of all the available preperties.
 *  
 * @returns {Entity} an empty Entity object.
 */
function Entity(n1, n2) {
    this.name = n1;                            // Name to show in orbit
    this.cName= n2;                            // Name of central point
    this.P = new CosmoPoint(0,0,0);            // 3D coordinate of centre
    this.D = new CosmoPoint(0,0,0);            // 3D coordinate of eccentre
    this.C = new CosmoPoint(0,0,0);            // Position of epicycle centre
    this.size = 0;                             // Size of drawn blob
    
    this.R = 0.0;               // Radius of equant and deferent
    this.r = 0.0;               // Radius of epicycle
    this.maxDA = 0.0;           // Max angle subtended by DT at C
    
    // describe the position of D
    this.lamdaA = 0.0;           // longitude of A - direction of D from Earth
    this.lamdaAatEpoch = 0.0;    // longitude of A at epoch
    this.lamdaAmotion = 0.0;     // motion of lamdaA(radians per day)
    this.e = 0.0;                // distance of D from Earth
        
    // describe motion
    this.longAtEpoch = 0.0;      // Longitude at epoch (radians)
    this.meanMotion = 0.0;       // rate of increase of mean longitude (radians/day)
    this.anomaly = 0.0;          // current longitude
    
    // latitude
    this.node = 0.0;             // longitude of ascending node (radians)
    this.nodeAtEpoch = 0.0;      // long. asc. node at epoch (radians)
    this.nodeMotion;             // daily rate of change of long asc. node
    this.incl = 0.0;             // inclination in radians
    
    // epicycle for this planet
    this.epi;
    
    // computing method
    this.method = 1;             // orbit calculation method for this object
                                 // 1. Orbit Centred on eccentre
    this.animationRate = 20;     // suitable animation rate for this object
    
    /* trig functions pre-calculated */
    this.cosi =1;
    this.sini =0;
    
   /******************** copy entity values **********************
    * 
    * @param {type} e the entity from which property values are to be copied.
    */
    this.copy = function(e) {
        this.name = e.name;
        this.cName= e.cName;
        this.P.copy(e.P);
        this.D.copy(e.D);
        this.C.copy(e.C);           
        this.size = e.size;
        this.R = e.R;
        this.r = e.r;        
        this.maxDA = e.maxDA;
        this.lamdaA = e.lamdaA;
        this.lamdaAatEpoch = e.lamdaAatEpoch;
        this.lamdaAmotion = e.lamdaAmotion;
        this.e = e.e;                
        this.longAtEpoch = e.longAtEpoch;
        this.meanMotion = e.meanMotion;
        this.node = e.node;
        this.nodeAtEpoch = e.nodeAtEpoch;
        this.nodeMotion = e.nodeMotion;
        this.incl = e.incl;           
        this.cosi = e.cosi;
        this.sini = e.sini;
    };
}   

// funtions to convert to/from degrees/radians
function toRadians (deg) { return deg*Math.PI/180;}
function toDegrees (rad) { return rad*180/Math.PI;}
  
