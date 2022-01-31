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

// Our scene is currently kind of boring though, so let's
// add some objects we can interact with we'll call Element

const Element = function (template) {
    // First up let's make sure Javascript doesn't get mad
    // at us if we don't pass it a template
    template  = template      || {}
    // Then we'll give our Element a name and description
    // for debugging later should we need it
    this.name = template.name || "Default Element Name"
    this.desc = template.desc || "An unremarkable Element"
    // Now we need to define where the element is on screen
    // so let's go ahead and add that now
    this.x = template.x || 0
    this.y = template.y || 0
    // We'll need some dimensions of the element as well
    this.w = template.w || 10
    this.h = template.h || 10
    // Aaaand a color!
    this.c = template.c || "black"

    // Now we need a way to actually display this element.
    // While I personally prefer Data-Oriented Design, ame
    // will be optimized for my time rather than performance
    // With that being said let's add the draw function!
    this.draw = function () {
        Context.fillStyle = this.c
        Context.fillRect(this.x, this.y, this.w, this.h)
    }
}
// Now let's test if this all worked!
const BlueBoxTemplate = {
    name: "Our Blue Box",
    desc: "A Element we're using to make sure this works!",
    x: 30,
    y: 10,
    w: 100,
    h: 12,
    c: "blue"
}
const BlueBox = new Element(BlueBoxTemplate)

BlueBox.draw()