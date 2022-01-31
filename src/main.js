console.log("Hello World!");

CONFIG = {
    HEIGHT: 600,
    WIDTH:  800
}

// First let's create the Canvas and Context the user will
// interact with
const Canvas  = document.createElement("CANVAS");
Canvas.width  = CONFIG.WIDTH;
Canvas.height = CONFIG.HEIGHT;
const Context = Canvas.getContext("2d");
// Then we can go ahead and add them to the document.
document.body.appendChild(Canvas);
// Now let's see if it's there
Context.fillRect(10,10,80,80);

// Now that we've got the canvas up and running, we've
// essentially got output handled (we'll do audio later)
// So let's go ahead and add input! In this case we'll
// only need mouse input.

// Before anything else let's create the mouse we can
// reference easily in the future
const Mouse = {
    x: 0,
    y: 0
}
// Now to track where the mouse is on screen, let's add
// an event listener to the canvas
Canvas.addEventListener("mousemove", function (evn) {
    // An then we'll go ahead and update our mouse with
    // the current info
    Mouse.x = evn.offsetX
    Mouse.y = evn.offsetY
})
// We also need to track if the user has clicked on something, so let's go ahead and do that now!
Canvas.addEventListener("mousedown", function (evn) {
    // Only do something if the button pressed is 0 (LMB)
    if (evn.button != 0) { return }
    console.log(`X: ${evn.offsetX}, Y: ${evn.offsetY}`)
})