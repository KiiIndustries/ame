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
    // These were added later, don't worry about them
    // for now!
    hoverCheck()
    updateScreen()
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
    // will be optimized for time rather than performance.
    // With that being said let's add the draw function!
    this.draw = function () {
        Context.fillStyle = this.c
        Context.fillRect(this.x, this.y, this.w, this.h)
    }
    this.traits = {}
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

// Great, now that we know it all works let's go ahead
// and add a container to hold all the Elements we may
// want to create!

const Elements = []

// Then we can add our entity
Elements.push(BlueBox)

// Now let's go ahead and add an option to include a bit
// of interactivity to an Element by adding what happens
// if the mouse hovers over an element
const addHover = function (element, hover, leave) {
    // First thing's first, let's add to the element
    // some way for us to check if it has the hover
    // trait at all. We'll also add "traits" to the
    // original constructor
    element.traits["hover"] = true
    element.hovered         = false
    // First we'll take an element and assign an action
    // to it when the mouse is 'hover'ing over it
    element["hover"] = hover || function () {
        this.hovered = true
        this.c     = "red"
    }
    // as well as an action when the mouse is no longer
    // hovering over it
    element["leave"] = leave || function () {
        this.hovered = false
        this.c = "green"
    }
}
// Now we need to figure out how we're going to go about
// letting the element know that the mouse is hovering over
// it! First up we need a simple way to detect if a point
// is inside an area which we can create with the following
const checkInside = function (point, area) {
    return (
        point.x >= area.x &&
        point.x <= area.x + area.w &&
        point.y >= area.y &&
        point.y <= area.y + area.h
    )
}
// With that done we can go ahead and apply this function
// to a more general check
const hoverCheck = function () {
    // First we'll search through all the elements
    for (const e in Elements) {
        let element = Elements[e]
        // Skip any elements that don't have the hover trait
        if (!element.traits["hover"]) { continue }
        // Then check if the mouse and element are colliding
        if (checkInside(Mouse, element)) {
            // If it is inside, we'll first check to make
            // sure it isn't already hovered over
            if (element.hovered) { continue }
            // Finally if it isn't being hovered we'll
            // trigger the hover
            element.hover()
        } else {
            // Now if it isn't inside, there's a possibility
            // that element has been left by the mouse, so
            // we'll go ahead and check that.
            if (!element.hovered) { continue }
            // If we made it this far, the element must have
            // been left
            element.leave()
        }
    }
}
// Now we need a way to see changes so we'll go ahead and
// create a function that will wipe the screen and redraw
// all the elements on it!
const updateScreen = function () {
    Context.clearRect(0,0,CONFIG.WIDTH, CONFIG.HEIGHT)
    for (const e in Elements) {
        let element = Elements[e]
        element.draw()
    }
}

// Now let's create a new element for the array and then
// add the hover trait to it!
const HoverTemplate = {
    name: "Hoverable Element",
    desc: "We can hover over this element to change color!",

    x: 100,
    y: 100,
    w: 20,
    h: 20,
    c: "gray"
}
// Then create the actual element
let HoverBox = new Element(HoverTemplate)
addHover(HoverBox)
Elements.push(HoverBox)
