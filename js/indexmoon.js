
/* 
 * This script shows the Sun according to Ptolemy's Almagest.
 */
/* global pi2, display, elapse */
var year = 365.246667;           // Days in tropical year
        
function setUpPlanets() {
   // Planet (name, colour, size, rad, per, inc, ascen)
   /* Earth spheres */
    earth = new Planet("", "#663300", 1, 0,0,0);
    water = new Planet("", "#8888ff", 2, 0,0,0);
    air   = new Planet("", "#aabbcc", 4,0,0,0);
    fire  = new Planet("Earth", "#f58f00", 8,0,0,0);
    
   /* eq is a dummy planet for the vernal equinox */
    eq = new Planet (" ϒ","ffffff",0,0,0,0);
    eq.position.setValue(1.2,0,0);
    
   /* nd is a dummy planet representing the longitude of ascending node */
    nd = new Planet (" ☊","55ff55",0,1.2,0,0,0);
    nd.longAtEpoch = toRadians(317.16);
    nd.meanDailyMotion = toRadians(- 0.0529687);
    
    
   /* The mean sun rotates in uniform circular motion once per tropical year */
    sun   = new Planet("S'","#ffff00", 0, 1.2, 1, 0, 0);
    sun.longAtEpoch = toRadians(330.75);   // Sun longitude at epoch (radians)
    sun.meanDailyMotion = toRadians(0.985635); // Mean daily motion (tropical)
    
   
   /*ec is a dummy planet representing the centre of the deferent circle */
    ec   = new Planet("E","#9999ff", 1, 0.17686, 1, toRadians(5), 0);
    ec.longAtEpoch = toRadians(268.816);  // Ec longitude at epoch (radians)
    ec.meanDailyMotion = toRadians(0.985635 - 12.190746936); // Mean daily motion
  
    /*ecx is the opoosite of the deferent circle */
    ecx   = new Planet("E'","#9999ff", 1, 0.17686, 1, toRadians(5), 0);
    
   /* deferent circle */ 
    deferent = new Planet("C","#99ffff",1,0.85171,0,toRadians(5),0);
    deferent.meanDailyMotion =  toRadians(0.985635 + 12.190746936);
    deferent.longAtEpoch = 0.7219729;
    
   /* centre of epicycle */
   epc = new Planet("λm","#9999ff",0,0.7,1,toRadians(5),0);
   epc.meanDailyMotion =  toRadians(0.985635 + 12.190746936);
   epc.longAtEpoch = 0.7219729;
   
   /* epicycle */
   epi = new Planet("Moon","#FF88FF",2,0.09,0,toRadians(5),0);
   epi.meanDailyMotion = 0; //toRadians(-13.0647);
   epi.longAtEpoch = toRadians(41.366);
   
 
    
  
    //mercury = new Planet("Mercury", "#dddddd", 6, 0.8 ,0.24,0,0);
    //venus = new Planet("Venus","#eeeeff", 7, 1.2, 0.62,0,0);
    //mars  = new Planet("Mars", "#ff0033", 6, 2.0, 1.88, 0.003, 0.495 );
    //jupiter = new Planet("Jupiter", "#aaddff", 7, 2.4, 11.9,0,0);
    //saturn = new Planet("Saturn", "#ddddff", 7, 2.8, 29.44,0,0);
    //stars
    planets = [ sun];
    rate = rate/20; 
}


   /* draw the animation */     
    function doAnimation(elapse) {
        display.scale=100;
       /* Draw Earth */
        display.drawPlanet(fire);
        display.drawPlanet(air);
        display.drawPlanet(water);
        display.drawPlanet(earth);
       
       /* Draw Sun */ 
        sun.doPosition(elapse,0); 
        display.drawPlanet(sun);
        display.join(earth.position,sun.position,"#888888");
        
      /* Draw vernal equinox */
        display.drawPlanet(eq);
        display.drawOrbit(eq);
        
      /* Draw ascending Node */  
      let node = doNode(elapse);
      nd.doPosition(elapse,0);
      display.drawPlanet(nd);
      display.join(earth.position,nd.position,"#888888");
      
      /* Draw eccentr */
       ec.ascend = node;
       ec.doPosition(elapse,0);
       display.drawPlanet(ec);
       display.drawOrbit(ec);
       
       /* Longitude of Moon 
       longMoon.doPosition(elapse);
       display.drawPlanet(longMoon);
       display.join(earth.position,longMoon.position,"#9999ff"); */
       
       /* deferent circle with C */
       deferent.ascend = node;
       deferent.eccentre = ec.position;
       deferent.doPosition(elapse,0);
       display.drawPlanet(deferent);
       display.drawOrbit(deferent);
       
       /* vector Earth - C */
       display.join(earth.position, deferent.position, "#FFAAFF");
       
       /* draw the point E' opposite the eccentre */
       ecx.ascend = node;
       ecx.position = ec.position;
       ecx.position.mult(-1);
       display.drawPlanet(ecx);
       /* vector from E' to C */
       display.join(ecx.position,deferent.position, "#88FF88");
       
       /* find longitude of E'-C */
       let xy = new CosmoPoint(deferent.position.x, deferent.position.y, 0);
       xy.minus(ecx.position);
       let av = Math.atan2(xy.x,xy.y); // angle of vector E'-C
       
       /* epicycle with Moon */
       epi.ascend = node;
       epi.eccentre = deferent.position;
       epi.doPosition(elapse,av); //av
       display.drawPlanet(epi);
       display.drawOrbit(epi);
       
       
       /* the node of inclination nade at epoch 317.16 degrees + motion
        * -0.0529687/day.
        * @param {type} elapse
        * @returns {undefined}
        */
       function doNode(elapse) {
           return (toRadians(317.16) - elapse * year * toRadians(0.0529687)) % pi2;
       }
       
       /* equation 6.40 in P&J
       let e = ec.distance;
       let R = deferent.distance;
       let g = 1.850394 * longMoon.anomaly * toRadians(13.17638221);  // 2 Ws/Wt 
       let h = Math.sin(g);
       let rho = e*Math.cos(g)-Math.sqrt(R*R - e*e*h*h);
       epc.distance = rho;
       epc.doPosition(elapse);
       display.drawPlanet(epc);
       
       rho = e*Math.cos(g)+Math.sqrt(R*R - e*e*h*h);
       epc.distance = rho;
       epc.doPosition(elapse);
       display.drawPlanet(epc); */
       
    }
    
    


