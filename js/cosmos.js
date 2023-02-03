/* ************************************************************************
 * Cosmos is a web application to display models of the Solar System as
 * envisaged by ancient philosophers such as Ptolemy and Copernicus.  
 * 
 * This script file contains the technical infrastructure required for the 
 * running of the animation.
 */

/* Global Variables */

var display;             // object that generates the drawing
var mouseDown;           // non-zero when mouse is pressed
var saveX;               // saved X coordinate when mousedown inside display
var saveY;               // saved Y coordinate when mousedown inside display
var running;             // true when animation is running
var lastTime;            // timestamp at previous time thru the animation
var elapse = 0;          // time (days) since start
var rate;                // default run rate in days per millisecond.

var pi2 = 2*Math.PI;     // useful value


/* Initialisation creates required objects and sets initial values then
 * starts the animation by calling for an AnimationFrame 
 * @param {number} n the planet number to be displayed */
function init(n) {
    
   /* set up the screen. (The screen object is defined in the cosmoutils.js)*/
    display = new Screen();               // create the screen object
    display.reSize();                     // size to current window
    display.doAngles();                   // pre-calculte some trig values
    
   /* set listener to resize the display when window changes */
    window.onresize = function(event) {display.reSize();};
   
   /* initial settings */
    running = true;         // animation is running
    elapse = 0;             // elapse time is zero at start
    lastTime = 0;           // no previous timestamp
    rate = 0.01;            // default run rate .1 second per day
    drawOrbits = true;      // draw orbits and lines
    showNames = true;       // show object names
    mouseDown = 0;          // no mouse presses
    
   /* create planets. The setUpPlanets() function must be provided by another 
    * script file containing details of the diagram to be generated. It 
    * should perform all the one-time set-up actions prior to starting
    * the animation. */
    setUpPlanets(n);
        
   /* start animation */
    requestAnimationFrame(show);
}

/* Run the animation.  */
 function show(timeStamp) {
   /* check if simulation is running and quit if not */
    if (!running) return;
    
   /* track elapse time since start */ 
    elapse += (timeStamp - lastTime) * rate;
    lastTime = timeStamp;
    
   /* clear the screen ready to build new diagram */
    display.clearScreen();
    
   /* check if user has pressed mouse in display area */
    checkMouse();
   
   /* call the function that builds the image. doAnimation(elapse) must be 
    * defined in the javascript file for the object to be displayed.
    */ 
   doAnimation(elapse);
   
  /* display and go to next frame */ 
   requestAnimationFrame(show);
 }
    
/* functions that respond to buttons */
 function stopStart() {
    // toggle running/notrunning and change symbol on button 
    let button = document.getElementById("stopStart");
    running = !running;
    if (running) {
        button.textContent = "\u25A0";
        lastTime = performance.now();  // discount elapse time while !running
        requestAnimationFrame(show);   // start animation
    } else {button.textContent = "\u25B6"; }
 } 
 function reverse() { rate = - rate;}           // reverse direction
 function reSize() { display.reSize();}         // resize display window
 function names() { showNames = !showNames;}    // toggle display of  names
 function msd(n) { mouseDown = n;}              // mouse was pressed
 function msu() { mouseDown = 0;}               // Mose released 
 function trails() {drawOrbits = ! drawOrbits;} // toggle showing orbits

/*
 * When mouse is pressed on some buttons, a value is stored in mouseDown until
 * the mouse is released. This value is checked during animation so that zoom,
 * speed (etc) can be modified gradually.
 */
function checkMouse() {
    switch (mouseDown) {
        case 0: break;
        case 1: display.scale *= 1.01; break;                   // zoom+
        case 2: display.scale *= 0.99; break;                   // zoom-
        case 3: display.tilt+=0.005; display.doAngles(); break;  // tilt up
        case 4: display.tilt-=0.005; display.doAngles(); break;  // tilt down
        case 5: display.rotate+=0.01; display.doAngles(); break;// rotate+
        case 6: display.rotate-=0.01; display.doAngles(); break;// rotate-
        case 7: rate *= 1.01; break;                            // faster
        case 8: rate *= 0.99; break;                            // slower
            
    }
}
// Mousedown inside the display area to effect drag, save to coords
function mdown(event) {
    event.preventDefault();
    saveX = event.clientX;
    saveY = event.clientY;
}
// Mouseup inside the display shift relative to saved coordinats
function mup(event) {
    display.up+=  saveY - event.clientY; 
    display.left+= saveX - event.clientX;
    reDraw=true;
}
