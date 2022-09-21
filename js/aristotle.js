/* 
 * Aristotle sets up the planets as for the Aristotle system.
 */
/* global pi2, display, elapse */

function setUpPlanets() {
    earth = new Planet("", "#663300", 6, 0,0,0);
    water = new Planet("", "#8888ff", 10, 0,0,0);
    air   = new Planet("", "#aabbcc", 15,0,0,0);
    fire  = new Planet("Earth, Water, Air, Fire", "#f58f00", 20,0,0,0);
    moon  = new Planet("Moon","#fffddd",6,0.4,0.078,0.087,0);
    mercury = new Planet("Mercury", "#dddddd", 6, 0.8 ,0.24,0,0);
    venus = new Planet("Venus","#eeeeff", 7, 1.2, 0.62,0,0);
    sun   = new Planet("Sun","#ffff00", 8, 1.6, 1, 0, 0);
    mars  = new Planet("Mars", "#ff0033", 6, 2.0, 1.88, 0.003, 0.495 );
    jupiter = new Planet("Jupiter", "#aaddff", 7, 2.4, 11.9,0,0);
    saturn = new Planet("Saturn", "#ddddff", 7, 2.8, 29.44,0,0);
    //stars
    planets = [moon,mercury,venus, sun,mars,jupiter,saturn];
}

function Planet (name, colour, size, rad, per, inc, ascen) {
    this.name = name;
    this.colour = colour;
    this.tColour = colour;
    this.tOffset = new ScreenPoint(8,8);
    this.size = size;
    this.position = new CosmoPoint(0,0,0);
    this.period = per;             // orbital period in years
    this.distance = rad;           // radial distance from cetral body
    this.incl = inc;               // inclination
    this.ascend = ascen;           // ascending node;
    this.anomaly;                  // current anomaly (radians)
    this.orbit = new Circle();
    this.coso = Math.cos(this.ascend);
    this.sino = Math.sin(this.ascend);
    this.cosi = Math.cos(this.incl);
    this.sini = Math.sin(this.incl);
  
    
    this.doPosition = function (elapseYears) {    
        this.anomaly = (elapseYears * pi2/this.period) % pi2; 
        this.position.z = this.distance * this.sini * Math.sin(this.anomaly - this.ascend);
        let xy = Math.sqrt(this.distance * this.distance - this.position.z * this.position.z);
        this.position.x = xy * Math.sin(this.anomaly);
        this.position.y = xy * Math.cos(this.anomaly);
    };
}
        
    function doAristotle(elapse) {
       
        display.drawPlanet(fire);
        display.drawPlanet(air);
        display.drawPlanet(water);
        display.drawPlanet(earth);
  
        planets.forEach (doShow);
        display.doStars(planets[planets.length - 1].size);
    }
        function doShow(bod) {
            bod.doPosition(elapse);
            display.drawPlanet(bod);
            display.drawOrbit(bod);
    }
      
       
    
