/******************************************************************************
 * Cosmos is a web application to display models of the Solar System as
 * envisaged by ancient philosophers such as Ptolemy and Copernicus. 
 *   
 * This script file contains function to define each planet, calculate orbits
 * and control the drawing.
 * 
 * Planet Number are:
 * 
 * 0 Earth (Water, Air & Fire)
 * 1 Mercury
 * 2 Venus
 * 3 Sun
 * 4 Moon
 * 5 Mars
 * 6 Jupiter
 * 7 Saturn
 * 
 */

/* global pi2, display, elapse */
    var planet;       // the planet currently being processed
    var outer = 75;   // the radial position of vernal and node symbols
    var xy = new CosmoPoint(0,0,0);  // working area for calca
    
/* ***************************************************************************
 * This function populates the Planets entities and sets planet properties as
 * described in Pedersen (mainly pp 423-429) or from the text.
 * 
 * The deferent, equant, epicycle are set up for those planets that mostof them)
 * need them. 
 * 
 * Prosneusis is set up for the Moon and pointF for Mercury
 */
function setUpPlanets(n) {
    planet = n;
    
   // Earth, Water, Air and Fire are always set up
    earth = new Entity("",""); earth.colour="#663300"; earth.size=1;
    water = new Entity("",""); water.colour="#8888ff"; water.size=2;
    air   = new Entity("",""); air.colour="#aabbcc";   air.size=3;
    fire  = new Entity(""," Earth"); fire.colour="#ffff77"; fire.size=4;
    
   // Various other common entities are set up.
    vernal  = new Entity(" ϒ",""); vernal.colour="#ffffff"; vernal.P.setValue(outer,0,0);
    lamdaA  = new Entity(" λa",""); lamdaA.colour="#ffffff";lamdaA.R=outer; 
    ascnd   = new Entity(" ☊",""); ascnd.colour="#ffffff"; ascnd.R=outer;
    meanSun = new Entity("λm☉",""); meanSun.colour = "#ffff00"; meanSun.R=outer;
             meanSun.longAtEpoch = toRadians(330.75); 
             meanSun.meanMotion = toRadians(0.9856352784);
    deferent = new Entity("","D"); deferent.colour="#ffaaff";deferent.size=1;
    equant   = new Entity("S","E"); equant.colour = "00ff00"; equant.size=1;
    epicycle = new Entity("P","");epicycle.colour = "#aaaaff";
    prosneusis = new Entity("D'",""); 
    pointF = new Entity("","F");
    
   
   // Selected planet is set up with its epicycle, deferent and equant
   switch(planet) {
       
       
    case 1: // Mercury
        rate = 0.01;
        mercury = new Entity("Mercury",""); mercury.colour="#aaaaff"; 
        mercury.R=60; mercury.e=3.0; mercury.r=22.5; mercury.size=4;
        mercury.lamdaAatEpoch=toRadians(181.1666);
        mercury.lamdaAmotion= toRadians(0.000027378); // 1 deg/century
        mercury.nodeAtEpoch= mercury.lamdaAatEpoch - toRadians(90.0);
        mercury.nodeMotion= toRadians(0.000027378);
        mercury.incl = toRadians(0.166);
        mercury.longAtEpoch = toRadians(330.75);
        mercury.meanMotion =toRadians(0.9856352784);
        doTrig(mercury);
        pointF.copy(mercury);
            pointF.R = 3.0; pointF.size=0; pointF.name="D"; pointF.cName="F";
            pointF.longAtEpoch = toRadians(330.75);
            pointF.meanMotion =toRadians(-0.9856352784);
            
        deferent.copy(mercury); deferent.name="C"; deferent.cName="D"; 
        deferent.size=1;
        epicycle.copy(mercury); epicycle.name="Mercury"; epicycle.cName="";
            epicycle.R=mercury.r;
            epicycle.incl=toRadians(6.5 + 0.166); doTrig(epicycle);
            epicycle.longAtEpoch=toRadians(21.916);
            epicycle.meanMotion=toRadians(3.1066990430);
        equant.copy(mercury);
            equant.name="S"; equant.cName="E";
            equant.colour="#00ff00"; equant.size=1;
        break;
        
    case 2:  //Venus
     rate = 0.02;
        venus = new Entity("Venus",""); venus.colour="#aaffff"; 
        venus.R=60; venus.e=1.25; venus.r=43.1666; venus.size=5;
        venus.lamdaAatEpoch=toRadians(46.1666);
        venus.lamdaAmotion= toRadians(0.000027378); // 1 deg/century
        venus.nodeAtEpoch= venus.lamdaAatEpoch - toRadians(90.0);
        venus.nodeMotion= toRadians(0.000027378);
        venus.incl = toRadians(0.1666);
        venus.longAtEpoch = toRadians(330.75);
        venus.meanMotion =toRadians(0.9856352784);
        doTrig(venus);
        deferent.copy(venus); deferent.name="C"; deferent.cName="D"; 
        deferent.size=1;
        epicycle.copy(venus); epicycle.name="Venus"; epicycle.cName="";
            epicycle.R=venus.r;
            epicycle.incl=toRadians(3.5 + 0.1666); doTrig(epicycle);
            epicycle.longAtEpoch=toRadians(71.1166);
            epicycle.meanMotion=toRadians(0.6165087339);
        equant.copy(venus);
            equant.e=2*venus.e; equant.name="S"; equant.cName="E";
            equant.colour="#00ff00"; equant.size=1;
        break;
       
    case 3: //Sun 
        sun  = new Entity("Sun","D"); sun.colour="#ffff00"; sun.size=8; 
        sun.R = 60; sun.e = 2.5; 
        sun.lamdaAatEpoch=toRadians(65.5); 
        sun.longAtEpoch = toRadians(330.75);
        sun.meanMotion = toRadians(0.9856352784);
        doTrig(sun);
        deferent.copy(sun);
        break;
        
    case 4: // Moon
        rate = 10E-4;
        moon = new Entity("C","D"); moon.colour="#b3ffff"; moon.size = 4;
        moon.R = 49.6833; moon.e = 10.3166;
        moon.maxDA = toRadians(11.98);
        moon.nodeAtEpoch = toRadians(264.25); moon.nodeMotion = toRadians(-0.0529687836);
        moon.lamdaAatEpoch = toRadians(268.816);
        moon.lamdaAmotion =  toRadians(0.9856352784 - 12.190746936); //OK
        moon.incl = toRadians(5.0); //OK
        moon.longAtEpoch = toRadians(41.22);
        moon.meanMotion =toRadians(0.9856352784 + 12.190746936);  //OK
        doTrig(moon);
        deferent.copy(moon); deferent.size=1;
        epicycle.copy(moon); epicycle.name="Moon"; epicycle.cName="";
            epicycle.R = 5.25; epicycle.longAtEpoch = toRadians(261.8166);
            epicycle.meanMotion = -toRadians(13.0649828601);
        equant.copy(moon); equant.name=" λm"; equant.cName=""; equant.R=60;
            equant.colour="#00ff00"; equant.size=1; equant.e=0;  
        break;
        
        
    case 5: //Mars
        rate = 0.02;
        mars = new Entity("Mars",""); mars.colour="#ff5555"; 
        mars.R=60; mars.e=6.0; mars.r=39.5; mars.size=5;
        mars.lamdaAatEpoch=toRadians(106.666);
        mars.lamdaAmotion= toRadians(0.000027378); // 1 deg/century
        mars.nodeAtEpoch= mars.lamdaAatEpoch - toRadians(85.5);
        mars.nodeMotion= toRadians(0.000027378);
        mars.incl = toRadians(1.0);
        mars.longAtEpoch = toRadians(3.5333);
        mars.meanMotion =toRadians(0.5240597114);
        doTrig(mars);
        deferent.copy(mars); deferent.name="C"; deferent.cName="D"; 
        deferent.size=1;
        epicycle.copy(mars); epicycle.name="Mars"; epicycle.cName="";
            epicycle.R=mars.r;
            epicycle.incl=0; epicycle.sini=0;
            epicycle.longAtEpoch=toRadians(327.2166);
            epicycle.meanMotion=toRadians(0.4615755671);
        equant.copy(mars);
            equant.e=2*mars.e; equant.name="S"; equant.cName="E";
            equant.colour="#00ff00"; equant.size=1;
        break;
        
    case 6: //Jupiter
        rate = 0.04;
        jupiter = new Entity("Jupiter",""); jupiter.colour="#ffaaff"; 
        jupiter.R=60; jupiter.e=2.75; jupiter.r=11.5; jupiter.size=6;
        jupiter.lamdaAatEpoch=toRadians(152.15);
        jupiter.lamdaAmotion= toRadians(0.000027378); // 1 deg/century
        jupiter.nodeAtEpoch= jupiter.lamdaAatEpoch - toRadians(71);
        jupiter.nodeMotion= toRadians(0.000027378);
        jupiter.incl = toRadians(1.5);
        jupiter.longAtEpoch = toRadians(184.6833);
        jupiter.meanMotion =toRadians(0.0831224364);
        doTrig(jupiter);
        deferent.copy(jupiter); deferent.name="C"; deferent.cName="D"; 
            deferent.size=1;
        epicycle.copy(jupiter); epicycle.name="Jupiter"; epicycle.cName="";
            epicycle.R=jupiter.r;
            epicycle.incl=0; epicycle.sini=0;
            epicycle.longAtEpoch=toRadians(146.0666);
            epicycle.meanMotion=toRadians(0.9025128421);
        equant.copy(jupiter);
            equant.e=2*jupiter.e; equant.name="S"; equant.cName="E";
            equant.colour="#00ff00"; equant.size=1;
        break;    
        
    case 7: //Saturn
        rate = 0.04;
        saturn = new Entity("Saturn",""); saturn.colour="#aaffff"; 
        saturn.R=60; saturn.e=3.4166; saturn.r=6.4155; saturn.size=6;
        saturn.lamdaAatEpoch=toRadians(224.166);
        saturn.lamdaAmotion= toRadians(0.000027378); // 1 deg/century
        saturn.nodeAtEpoch= saturn.lamdaAatEpoch - toRadians(133);
        saturn.nodeMotion= toRadians(0.000027378);
        saturn.incl = toRadians(2.5);
        saturn.longAtEpoch = toRadians(296.7166);
        saturn.meanMotion =toRadians(0.0334885402);
        doTrig(saturn);
        deferent.copy(saturn); deferent.name="C"; deferent.cName="D"; 
            deferent.size=1;
        epicycle.copy(saturn); epicycle.name="Saturn"; epicycle.cName="";
            epicycle.R=saturn.r;
            epicycle.incl=0; epicycle.sini=0;
            epicycle.longAtEpoch=toRadians(34.033);
            epicycle.meanMotion=toRadians(0.9521467383);
        equant.copy(saturn);
            equant.e=2*saturn.e; equant.name="S"; equant.cName="E";
            equant.colour="#00ff00"; equant.size=1;
        break;    
       
    }
}
    
/***************************************************************************** 
 * This is the function that calculates the positions of the objects and draws
 * them on the screen.
 * 
 * @param {type} elapse elapse time in days since the start of the animation.
 */
function doAnimation(elapse) {
 /* Draw Earth and vernal equinox */ 
    display.drawPlanet(fire);
    display.drawPlanet(air);
    display.drawPlanet(water);
    display.drawPlanet(earth);
    display.drawPlanet(vernal);
    display.join(earth,vernal,"#555555");
      
    switch(planet) {
        
        case 1: // Mercury
        
            doMeanSun(elapse);                 // show longitude of mean Sun
            doLamdaA(mercury, elapse);         // calc position of λa and show
            doNode(mercury,elapse);            // calc longitude ascending node and show
            doEquant(mercury);                 // draw equant 
            doPointF();                        // find points F and D
     
            // calc deferent anomaly and show deferent
            deferent.D.copy(pointF.P);        // set deferent centre 
            doAnomaly(deferent,elapse,7);
         
            doPosition(deferent);            // 3D position of planet/epicycle
            display.drawPlanet(deferent);    // display centre and planet/epicentre
            display.drawOrbit(deferent);     
            display.join(deferent,deferent, deferent.colour);
            doEpicycle(mercury,6);
            break;
            
        case 2: // Venus
        
            doMeanSun(elapse);               // show position of mean Sun
            doLamdaA(venus, elapse);         // calc position of λa and show
            doNode(venus,elapse);            // calc longitude ascending node and show
            doEquant(venus);                 // draw equant 
            doDeferent(venus,2);             // calc position of D and draw deferent
                 display.join(earth, deferent, venus.colour);            
                 display.join(deferent, deferent, deferent.colour);
            doEpicycle(venus,6);
            break;
       
        case 3: // Sun
          
            doMeanSun(elapse);              // show mean Sun
            doLamdaA(sun, elapse);          // set (fixed) position of λa and show
            doDeferent(sun,1);              // draw deferent and Sun
            display.join(earth, deferent, sun.colour);            
            display.join(deferent, deferent, deferent.colour);
            epicycle.P.copy(deferent.P);    // set P in epicycle for Longitude display. 
            break;
            
        case 4: // Moon
           
            doMeanSun(elapse);              // calc position of mean Sun and show
            doLamdaA(moon, elapse);         // calc position of λa and show
            doNode(moon,elapse);            // calc longitude ascending node and show
            doEquant(moon);                 // equant is centred on Earth
            doDeferent(moon,4);             // calc position of D and draw deferent 
                 display.join(earth, deferent, moon.colour);            
                 display.join(deferent, deferent, deferent.colour);
            doProsneusis();                 // calc position of d' 
            doEpicycle(moon,5);             // set up and draw epicycle
            break;
         
         case 5: // Mars
            
            doMeanSun(elapse);
            doLamdaA(mars, elapse);         // calc position of λa and show
            doNode(mars,elapse);            // calc longitude ascending node and show
            doEquant(mars);                 // draw equant 
            doDeferent(mars,2);             // calc position of D and draw deferent
                 display.join(earth, deferent, mars.colour);            
                 display.join(deferent, deferent, deferent.colour);
            doEpicycle(mars,3);
            break;
            
        
        
        case 6: // Jupiter
            
            doMeanSun(elapse);
            doLamdaA(jupiter, elapse);         // calc position of λa and show
            doNode(jupiter,elapse);            // calc longitude ascending node and show
            doEquant(jupiter);                 // draw equant 
            doDeferent(jupiter,2);             // calc position of D and draw deferent
                 display.join(earth, deferent, jupiter.colour);            
                 display.join(deferent, deferent, deferent.colour);
            doEpicycle(jupiter,3);
            break;
                
        case 7: // Saturn
            
            doMeanSun(elapse);
            doLamdaA(saturn, elapse);         // calc position of λa and show
            doNode(saturn,elapse);            // calc longitude ascending node and show
            doEquant(saturn);                 // draw equant 
            doDeferent(saturn,2);             // calc position of D and draw deferent
                 display.join(earth, deferent, saturn.colour);            
                 display.join(deferent, deferent, deferent.colour);
            doEpicycle(saturn,3);
            break;   
    }
/*draw info */
       let long = Math.atan2(epicycle.P.y, epicycle.P.x);
       if (long<0) long+=2*Math.PI;
       let lat = Math.asin(epicycle.P.z/epicycle.P.mag());
       display.drawInfo(elapse,long, lat);
}

/* calculate the longitude of the eccentric (lamdaA) and draw the position */
function doLamdaA(p,elapse) {
   // set up  λa for planet p
    lamdaA.anomaly = (p.lamdaAatEpoch + p.lamdaAmotion * elapse) %pi2;
    lamdaA.sini = p.sini; lamdaA.node = p.node;
    doPosition(lamdaA);
    display.drawPlanet(lamdaA);
    display.join(earth, lamdaA, lamdaA.colour);
}

/* calculate position of the eccentre, draw point D and the deferent circle */
function doDeferent(p, method) {
   // calc centre of deferent (D) direction  λa, distance e
    deferent.D.copy(lamdaA.P);       // D is along the line to λa
    deferent.D.mult(p.e/outer);      // D is distance e from centre
    deferent.node = p.node;          // node is same as planet
    doAnomaly(deferent,elapse,method);    // anomaly of planet round deferent
    doPosition(deferent);            // 3D position of planet/epicycle
    display.drawPlanet(deferent);    // display centre and planet/epicentre
    display.drawOrbit(deferent);     // draw deferent orbit
}

/* pre-calculate some trig rations for the planet */
function doTrig(p) {
    p.coso = Math.cos(p.node);
    p.sino = Math.sin(p.node);
    p.cosi = Math.cos(p.incl);
    p.sini = Math.sin(p.incl);
}

/* calculate 3D position from current anomaly */
function doPosition(p) {
   // distance of current anomaly from ascending node needed for Z coordinate
    let dNode = Math.sin(p.anomaly-p.node);
   // calc coordinates from basic trig
    p.P.z = p.R * p.sini * dNode;
    p.P.x = p.R * Math.cos(p.anomaly);
    p.P.y = p.R * Math.sin(p.anomaly);
   // shift according to coords of centre
    p.P.plus(p.D);
}

/* calculate current longitude of ascending node */
function doNode(p, elapse) {
    p.node = (p.nodeAtEpoch + elapse * p.nodeMotion) % pi2;
    deferent.node = p.node;
    equant.node = p.node;
    epicycle.node = p.node;
    ascnd.P.setValue(Math.cos(p.node), Math.sin(p.node), 0);
    ascnd.P.mult(outer);
    display.drawPlanet(ascnd);
    display.join(earth, ascnd, "#9999ff");
}

/* calculate and show position of mean Sun */
function doMeanSun(elapse) {
    doAnomaly(meanSun,elapse,1);
    doPosition(meanSun);
    display.drawPlanet(meanSun);
    display.join(earth, meanSun, "#999999");
}

/* draw point C and epicycle */
function doEpicycle(p, method) {
    epicycle.D.copy(deferent.P);
    epicycle.node = deferent.node;
    doAnomaly(epicycle,elapse, method);
    doPosition(epicycle);
    display.drawPlanet(epicycle);
    display.drawOrbit(epicycle);
    display.join(epicycle,epicycle, p.colour);
}

/* draw point D' for the moon, calc and show position of Moon */
function doProsneusis(p) {
   // D' is locaded at minus deferent.D 
    prosneusis.P.copy(deferent.D);
    prosneusis.P.mult(-1);
    display.drawPlanet(prosneusis);
    display.join(epicycle, prosneusis, "#5555ff");
    display.join(earth,prosneusis, "#5555ff" );
}

/* draw equant circle centre E and circumference S  */
function doEquant(p) {
    
    equant.D.copy(lamdaA.P);       // D is along the line to λa
    equant.D.mult(equant.e/outer); // D is distance e from centre
    equant.node = p.node;          // node is same as parent planet  
    doAnomaly(equant,elapse,1);    // anomaly of planet round deferent
    doPosition(equant);            // 3D position of "S"
    display.drawPlanet(equant);
    display.drawOrbit(equant);
    display.join(equant,equant,equant.colour);
}

/* Establish locations of F then D in a manner unique to Mercury. */
function doPointF() {
   
    pointF.D.copy(lamdaA.P);           // F is 2e in direction lamdaA
    pointF.D.mult(2*mercury.e/outer);
    //Anomaly of D from F is opposite side of λa from equant anomaly
    pointF.anomaly = lamdaA.anomaly-(equant.anomaly-lamdaA.anomaly);  
    doPosition(pointF);
    display.drawPlanet(pointF);
    display.drawOrbit(pointF);
    display.join(earth,pointF,pointF.colour);
    display.join(pointF,pointF,pointF.colour);
}

/* anomaly using various methods */
function doAnomaly(p,elapse, method) {
    switch(method)  {
        case 1: // uniform motion round centre
            p.anomaly = (p.longAtEpoch + elapse * p.meanMotion) % pi2;
            break;
        case 2: // round deferent with uniform motion as seen from E
            p.anomaly = equant.anomaly;
            p.anomaly-=Math.asin(p.e*Math.sin(p.anomaly - lamdaA.anomaly)/p.R);
            break;
        case 3: // parallel to Earth->Sun direction
            p.anomaly = meanSun.anomaly;
            break;
        case 4: // round deferent with uniform motion as seen from Earth 
            p.anomaly = equant.anomaly;
            p.anomaly+=Math.asin(p.e*Math.sin(p.anomaly - lamdaA.anomaly)/p.R);
            break;
        case 5: // uniform relative to vector prosneusis->C
            p.anomaly = Math.atan2(deferent.P.y-prosneusis.P.y, deferent.P.x-prosneusis.P.x);
            p.anomaly+= (p.longAtEpoch + elapse * p.meanMotion) % pi2;
            break;
        case 6: // uniform relative to vector E-C
            p.anomaly = Math.atan2(deferent.P.y-equant.D.y, deferent.P.x-equant.D.x);
            p.anomaly+= (p.longAtEpoch + elapse * p.meanMotion) % pi2;
            break;
        case 7: // uniform as seen from E but D is rotating round F (Mercury)
            // get the length and longitude of E->D
            let ED = equant.D.dist(deferent.D); // length of ED
            let lamED = Math.atan2(deferent.D.y-equant.D.y, deferent.D.x-equant.D.x);
            // use sine rule in triange CED to get longitide of E->C
            let beta =equant.anomaly - lamED; 
            let alpha = Math.asin(ED/deferent.R * Math.sin(beta));
            deferent.anomaly = equant.anomaly + alpha;
            break;
    }
}
