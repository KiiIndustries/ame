// Config creation
const CONFIG = {
    HEIGHT: 600,
    WIDTH:  800,
    FPS:     60,
}
// Loading details
let Loading = 0
// Utility Functions
const Utils = {
    // Checks if something's inside
    checkInside: function (point, area) {
        return (
            point.x >= area.x &&
            point.x <= area.x + area.w &&
            point.y >= area.y &&
            point.y <= area.y + area.h
        )
    },
    // Generate a palette
    palGen: function (canvas) {
        let context = canvas.getContext("2d")
        let imgData = context.getImageData( 0, 0,
            canvas.width, canvas.height
        )
        let palette = []
        let data = imgData.data
        loop:
        for (let pix = 0; pix < data.length; pix += 4) {
            // Skip transparent pixels
            if (data[pix + 3] != 255) { continue }
            // Get overall brightness
            let color = [
                data[pix + 0],
                data[pix + 1],
                data[pix + 2],
                Math.round(
                    (
                        data[pix + 0] +
                        data[pix + 1] +
                        data[pix + 2]
                    ) / 3
                )
            ]
            // Sort palette by [brightest, darkest]
            let index = 0
            while (index < palette.length) {
                // If the color already exists, move on
                if (
                    color[0] == palette[index][0] &&
                    color[1] == palette[index][1] &&
                    color[2] == palette[index][2]
                ) { continue loop }
                // Break the loop if the color's brightness
                // is brighter than the currently indexed
                // palette color
                if (color[3] > palette[index][3]) { break }
                index += 1
            }
            palette.splice(index, 0, color)
        }
        return palette
    },
    // Substitutes a targetColor with a replacementColor
    // NOTE: DOESN'T UPDATE PALETTES
    subCol: function (canvas, tarCol, repCol) {
        let context = canvas.getContext("2d")
        let imgData = context.getImageData( 0, 0,
            canvas.width, canvas.height
        )
        let data = imgData.data
        for (let p = 0; p < data.length; p += 4) {
            if (data[p + 3] !== 255) { continue }
            if (
                data[p + 0] == tarCol[0] &&
                data[p + 1] == tarCol[1] &&
                data[p + 2] == tarCol[2]
            ) {
                imgData.data[p + 0] = repCol[0]
                imgData.data[p + 1] = repCol[1]
                imgData.data[p + 2] = repCol[2]
            }
        }
        this.context.putImageData(imageData, 0, 0)
    }
}
// Canvas creation
const Canvas  = document.createElement("CANVAS");
Canvas.width  = CONFIG.WIDTH;
Canvas.height = CONFIG.HEIGHT;
// Context creation
const Context = Canvas.getContext("2d");
document.body.appendChild(Canvas);
// Input Handling
const Mouse = {
    x: 0,
    y: 0,
    p: false
}
Canvas.addEventListener("mousemove", function (evn) {
    Mouse.x = evn.offsetX
    Mouse.y = evn.offsetY
    Update()
})
Canvas.addEventListener("mousedown", function (evn) {
    if (evn.button != 0) { return }
    Mouse.p = true
    Update()
    Mouse.p = false
})
// Event Loop
const Update = function () {
    if (Loading != 0) { 
        // Wait 1 frame and try again
        console.log(`Loading! Loading queue: ${Loading}`)
        setTimeout(Update, 1000/CONFIG.FPS)
        return
    }
    Context.clearRect( 0, 0, CONFIG.WIDTH, CONFIG.HEIGHT)
    for (let e = 0; e < Elements.length; e++) {
        Elements[e].update()
    }
}
// Element building
const Element = function (template) {
    template  = template      || {}
    // Debugging
    this.name = template.name || "Default Element Name"
    this.desc = template.desc || "An unremarkable Element"
    // Position
    this.x = template.x || 0
    this.y = template.y || 0
    // Dimensions
    this.w = template.w || 10
    this.h = template.h || 10
    // Color
    this.c = template.c || "black"
    // Draw function
    this.draw = function () {
        Context.fillStyle = this.c
        Context.fillRect(this.x, this.y, this.w, this.h)
    }
    // Update function
    this.updates = ["draw"]
    this.update = function () {
        for (let u = 0; u < this.updates.length; u++) {
            this[this.updates[u]]()
        }
    }
    // Traits
    let traits = template.traits || []
    this.traits = {}
    for (let t = 0; t < traits.length; t++) {
        let trait = Traits[traits[t]]
        for (const key in trait) {
            // Adding to the update function
            if (key == "update") {
                let updateName = `${traits[t]}_update`
                this[updateName] = trait[key]
                this.updates.push(updateName)
                continue
            }
            if (key == "init") {
                trait[key](template, this)
                continue
            }
            // Allowing templates to overwrite default trait
            // keys
            if (template[key]) {
                this[key] = template[key]
                continue
            }
            // Finally adding the key
            this[key] = trait[key]
        }
        this.traits[traits[t]] = true
    }
}
// Container for all elements
const Elements = []
// Element Traits
const Traits = {
    Clickable: {
        update: function () {
            if (!Mouse.p) { return }
            if (!Utils.checkInside(Mouse, this)) {
                return
            }
            this.click()
            // Give this object click priority
            // Mouse.p = false
        },
        click: function () {
            console.log(`${this.name} was clicked!`)
        },
    },
    Hoverable: {
        init: function (template, element) {            
            element.mouseOver = false
        },
        update: function () {
            if (this.mouseOver) {
                if (Utils.checkInside(Mouse, this)) {
                    return
                }
                this.abandon()
            } else {
                if (Utils.checkInside(Mouse, this)) {
                    this.hover()
                }
                return
            }
        },
        hover: function () {
            this.mouseOver = true
            console.log(`${this.name} is being hovered!`)
        },
        abandon: function () {
            this.mouseOver = false
            console.log(`${this.name} was abandoned!`)
        }
    },
    Image: {
        init: function (template, element) {
            let image = new Image()
            image.src = template.file || "assets/art/default.png"
            Loading += 1
            image.onload = function () {
                element.canvas = document.createElement("canvas")
                element.canvas.width  = image.width
                element.canvas.height = image.height
                element.context = element.canvas.getContext("2d")
                element.context.drawImage(image, 0, 0)
                element.palette = Utils.palGen(element.canvas) 
                Loading -= 1
            }
        },
        draw: function () {
            Context.drawImage(
                this.canvas, 
                this.x, this.y,
                this.w, this.h
            )
        }
    },
    Recolorable: {
        init: function (template, element) {
            // Type checking
            if (!element.traits["Image"]) {
                console.log("You don't have the Image trait!")
                return false
            }
            element.recolor = function (newPal) {
                if (newPal.length != this.palette.length) {
                    console.log("Invalid Palette size!")
                    return
                }
                let i = this.context.getImageData( 0, 0,
                    this.canvas.width, this.canvas.height
                )
                let pal = this.palette
                for (let p = 0; p < i.data.length; p+=4) {
                    if (i.data[p + 3] != 255) { continue }
                    for (let c = 0; c < pal.length; c++) {
                        if (
                            pal[c][0] == i.data[p + 0] &&
                            pal[c][1] == i.data[p + 1] &&
                            pal[c][2] == i.data[p + 2]
                        ) {
                            i.data[p + 0] = newPal[c][0]
                            i.data[p + 1] = newPal[c][1]
                            i.data[p + 2] = newPal[c][2]
                        }
                    }
                }
                this.context.putImageData(i, 0, 0)
                this.palette = newPal
                // Queue an update
                setTimeout(() => {
                    Mouse.p = false
                    Update()
                }, 1000 / CONFIG.FPS)
            } 
        }
    }
}
// Element Templates
const Templates = {
    BlueBox: {
        name: "Blue Box",
        desc: "A simple element",

        x: 30,
        y: 10,
        w: 100,
        h: 12,

        c: "Blue"
    },
    HoverBox: {
        name: "Hoverable Element",
        desc: "We can hover over this element to change color!",

        x: 100,
        y: 100,
        w: 20,
        h: 20,

        c: "gray",

        traits: [
            "Hoverable"
        ]
    },
    ClickBox: {
        name: "Clickable Element",
        desc: "Clicking on this should do something fun!",

        x: 110,
        y: 110,
        w: 100,
        h: 100,

        c: "yellow",

        traits: [
            "Clickable"
        ]
    },
    ImageBox: {
        name: "Image Element",
        desc: "This should display an image!",

        x: 200,
        y: 200,
        w: 100,
        h: 100,

        traits: [
            "Image"
        ]

    },
    WeirdBox: {
        name: "Weird Element",
        desc: "This should display an image!",

        x: 100,
        y: 200,
        w:  50,
        h:  50,

        traits: [
            "Image",
            "Hoverable",
            "Clickable",
            "Recolorable"
        ],

        hover: function () {
            this.mouseOver = true
            console.log("Pick Me!!")
        },
        abandon: function () {
            this.mouseOver = false
            console.log("Waaaa!!!!")
        },

        click: function () {
            if (!this.clicks) {
                this.clicks = 0
            } 
            this.clicks += 1
            if (this.clicks % 2 == 0) {
                this.recolor([
                    [238, 195, 154, 196],
                    [  0,   0,   0,   0]
                ])
            } else {
                this.recolor([
                    [143,  86,  59,  96],
                    [  0,   0,   0,   0]
                ])
            }
        }

    }
}

// Testing
let ImageElement = new Element(Templates.ImageBox)
let ClickElement = new Element(Templates.ClickBox)
let HoverElement = new Element(Templates.HoverBox)
let PlainElement = new Element(Templates.BlueBox)
let WeirdElement = new Element(Templates.WeirdBox)

Elements.push(
    ImageElement,
    ClickElement,
    HoverElement,
    PlainElement,
    WeirdElement
)