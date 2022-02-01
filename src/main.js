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
    // These were added later, don't worry about them
    // for now!
    clickCheck()
    updateScreen()
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

// Now that we've got a hoverable box, let's go ahead
// and add a clickable box! Luckily we already have
// most of the code we need for that.
const addClick   = function (element, click) {
    element.traits["click"] = true
    element["click"] = click || function () {
        console.log(`${this.name} was clicked!`)
    }
}
const clickCheck = function () {
    for (const e in Elements) {
        let element = Elements[e]
        if (!element.traits["click"])     { continue }
        if (!checkInside(Mouse, element)) { continue }
        element.click()
    }
}
const clickTemplate = {
    name: "Clickable Element",
    desc: "Clicking on this should do something fun!",

    x: 110,
    y: 110,
    w: 100,
    h: 100,
    c: "yellow"
}

let ClickBox = new Element(clickTemplate)
addClick(ClickBox)
Elements.push(ClickBox)

// Now let's do something a bit radical and create
// an image Element! Instead of just filling in a box
// with a boring color, it'll display an image!
const addImage = function (element, file) {
    // First up we'll need to load the image
    element.image      = new Image()
    element.image.src  = file || "assets/art/default.png"
    // Javascript is non-blocking meaning we'll have to
    // "wait" until the image is done loading to continue!
    element.image.onload = function () {
    // Once it's loaded, we can convert the image into a 
    // canvas for reasons which will become clear a bit
    // later on
    element.canvas = document.createElement("CANVAS")
    element.canvas.width  = element.image.width
    element.canvas.height = element.image.height
    element.context = element.canvas.getContext("2d")
    element.context.drawImage(element.image, 0 , 0)
    // With that insanity out of the way let's continue on
    // by going ahead and adding image to the traits
    element.traits["image"] = true
    // and updating the draw function 
    element.draw = function () {
        Context.drawImage(this.canvas, this.x, this.y)
    }
    element.palette = paletteGen(ImgBox.canvas)
    } // closing the onload
}
// Now let's add it!
const ImgTemp = {
    name: "Image Element",
    desc: "Checking to see if the image works!",

    x: 200,
    y: 200,
    w: 100,
    h: 100
}
let ImgBox = new Element(ImgTemp)
addImage(ImgBox)
Elements.push(ImgBox)

// Here comes the last bit we'll need to really make ame
// stand out compared to the others! We'll go ahead and 
// add something that'll recolor images meaning unlimited
// color possibilities!
// First off let's create a color palette generator, that
// way we know what colors a file has!
const paletteGen = function (canvas) {
    let context = canvas.getContext("2d")
    let imgData = context.getImageData( 0, 0,
        canvas.width, canvas.height
    )
    // Now that we've got the image data we'll need
    // to add all the colors in it to a palette so let's
    // first create the palette
    let palette = []
    // Then we'll loop through the data
    let data = imgData.data
    let track = 0
    loop:
    for (let pixel = 0; pixel < data.length; pixel += 4) {
        // imageData has 4 values, (red, green, blue, alpha)
        // so we'll step through the data 4 indexes at a
        // time and create an array that holds the rgb
        // values, (we'll ignore alpha for now) called color

        // Before anything else though, let's ignore
        // transparent pixels, we don't need them
        if (data[pixel + 3] != 255) { continue }
        let color = [
            data[pixel + 0],
            data[pixel + 1],
            data[pixel + 2],
            // Now we need a way to sort colors in our
            // palette, so on top of the 3 color values
            // we'll add a fourth one that corresponds
            // to average brightness.
            Math.round(
                (
                    data[pixel + 0] +
                    data[pixel + 1] +
                    data[pixel + 2]
                ) / 3
            )
        ]
        // If it doesn't, we'll need to add it based on
        // it's brightness which is easy enough to do! First
        // let's figure out where we need to slot it with a
        // simple linear search (we don't need a binary
        // search because the color palettes should be tiny)
        let index = 0
        while (index < palette.length) {
            // First let's check if the color is in the
            // palette, if it is we don't need to add it
            // We could have used an .includes() earlier
            // but I imagine that's iterating over the array
            // anyway so let's kill two birds with one stone
            // by adding it in here!
            if (
                color[0] == palette[index][0] &&
                color[1] == palette[index][1] &&
                color[2] == palette[index][2]
            ) { continue loop }
            // Now let's check if the color is brighter than
            // the current palette color, if it, we've come
            // to our stop!
            if (color[3] >= palette[index][3]) { break }
            // If it isn't, we'll go ahead and increment the
            // index and try again
            index += 1
        }
        // Now that we know where to stick the color in the 
        // palette, let's go ahead and add it!
        palette.splice(index, 0, color)
    }
    // Finally  we have our palette! Let's just return it
    return palette
}

// Obviously we have to test it! Let's see what we get when
// we add it to the addImage function!

// Now that we can make palettes, let's make a function that
// gives an image the ability recolor itself!
const addRecolor = function (element) {
    // First a bit of type checking
    if (!element.traits["image"]) {
        console.log("You're trying to add recoloring to something that isn't an image!!")
        return
    }
    // now let's sadd our own trait
    element.traits["recolor"] = true
    // And the way we'll recolor things!
    let palette = element.palette
    element.recolor = function (newPalette) {
        if (newPalette.length != this.palette.length) {
            console.log("Mismatched Palettes~")
            return
        }
        let i = this.context.getImageData( 0, 0,
            this.canvas.width, this.canvas.height
        )
        let palette = this.palette
        for (let pix = 0; pix < i.data.length; pix += 4) {
            if (i.data[pix + 3] != 255 ) { continue }
            for (let c = 0; c < palette.length; c++) {
                if (
                    palette[c][0] == i.data[pix + 0] &&
                    palette[c][1] == i.data[pix + 1] &&
                    palette[c][2] == i.data[pix + 2]
                ) {
                    i.data[pix + 0] = newPalette[c][0]
                    i.data[pix + 1] = newPalette[c][1]
                    i.data[pix + 2] = newPalette[c][2]
                    i.data[pix + 3] = 255
                }
            }
        }
        this.context.clearRect(0, 0,
            this.canvas.width, this.canvas.height
        )
        console.log(i)
        this.context.putImageData(i, 0, 0)
        this.palette = newPalette
    }
}
