// Config creation
const CONFIG = {
    HEIGHT: 0x200,
    WIDTH:  0x300,
    FPS:    0x010,
    CAT:    0x00c, // How many categories
    OPT:    0x009, // How many options per category
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
    copy: function (target) {
        return JSON.parse(JSON.stringify(target))
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
window.addEventListener("mouseup", function (evn){
    Mouse.p = false
    for (e in Elements) {
        let element = Elements[e];
        if (element.pressed && !element.toggle) {
            element.pressed = false
            element.frame   = 0;
            element.rerender()
            Update()
            return
        }
    }
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
            Mouse.p = false
            this.click()
            // Give this object click priority
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
                this.mouseOver = false
                this.abandon()
            } else {
                if (Utils.checkInside(Mouse, this)) {
                    this.mouseOver = true
                    this.hover()
                }
                return
            }
        },
        hover: function () {
            console.log(`${this.name} is being hovered!`)
        },
        abandon: function () {
            console.log(`${this.name} was abandoned!`)
        }
    },
    Image: {
        init: function (template, element) {
            let image = new Image()
            image.src = template.src || "graphics/default.png"
            element.frame = template.frame || 0
            element.sx = template.sx ||   0
            element.sy = template.sy ||   0
            element.sw = template.sw || element.w
            element.sh = template.sh || element.h
            Loading += 1
            image.onload = function () {
                element.canvas = document.createElement("canvas")
                element.canvas.width  = element.sw
                element.canvas.height = element.sh
                element.context = element.canvas.getContext("2d")
                element.context.drawImage(
                    image,
                    element.sx,
                    element.sy,
                    element.sw,
                    element.sh,
                    0,
                    0,
                    element.sw,
                    element.sh
                )
                element.image = document.createElement("canvas")
                element.image.width  = image.width
                element.image.height = image.height
                let imgctx = element.image.getContext("2d")
                imgctx.drawImage(image, 0, 0)
                element.palette = template.palette || Utils.palGen(element.canvas) 
                Loading -= 1
            }
        },
        rerender: function () {
            // Wipe the old canvas
            this.context.clearRect(
                0, 0,
                this.sw, this.sh
            )
            // Draw the new one
            this.context.drawImage(
                this.image,
                this.sx + (this.frame * this.sw),
                this.sy,
                this.sw,
                this.sh,
                0,
                0,
                this.sw,
                this.sh
            )
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
                let context = this.image.getContext("2d")
                let i = context.getImageData( 0, 0,
                    this.image.width, this.image.height
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
                this.palette = newPal
                context.putImageData(i, 0, 0)
                this.rerender()
            } 
        }
    },
    Layer: {},
    MultiLayer: {
        init: function (template, element) {
            element.layers = []
            for (const l in template.layers) {
                let layer = new Element (template.layers[l])
                element.layers.push(layer)
            }
        },
        update: function () {
            for (const l in this.layers) {
                this.layers[l].update()
            }
        }
    },
    Customized: {
        init: function (template, element) {
            template.customize(template, element)
        }
    }
}
// UI Creation
let UI_FRAME;
// Category
let CAT_LB;
let CAT_RB;
// Layer
let LAY_LB;
let LAY_RB;
// Palette
let PAL_RB;
let PAL_LB;
// Misc
let AUD_BT;
let MUS_BT;
let SAV_BT;

// I just wanna hide this for now
{
    // Frame
    UI_FRAME = new Element ({
        name: "UI Frame",
        desc: "Just the boilerplate of the UI",

        x: 0x180,
        y: 0x000,
        w: 0x180,
        h: 0x200,

        sx: 0x180,
        sy: 0x000,

        src: "graphics/ui/sheet.png",

        traits: [
            "Image"
        ]
    })
    // Category
    CAT_LB = new Element ({
        name: "Left Category Button",
        desc: "Moves the Categories left",

        x: 0x198,
        y: 0x008,
        w: 0x010,
        h: 0x010,

        sx: 0x00,
        sy: 0x00,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                this.pressed = false
                this.frame = 0
                this.rerender()
                Mouse.p = false;
                Update()
            } else {
                this.pressed = true
                AUDIO.play('click')
                this.frame = 2
                this.rerender()
                Mouse.p = false;
                CAT_SEL.frame--
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })
    CAT_RB = new Element ({
        name: "Right Category Button",
        desc: "Moves the Categories right",

        x: 0x2d8,
        y: 0x008,
        w: 0x010,
        h: 0x010,

        sx: 0x00,
        sy: 0x10,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                this.pressed = false
                this.frame = 0
                this.rerender()
                Mouse.p = false;
                Update()
            } else {
                AUDIO.play('click')
                this.pressed = true
                this.frame = 2
                this.rerender()
                Mouse.p = false;
                CAT_SEL.frame++
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })

    // Layer
    LAY_LB = new Element ({
        name: "Left Layer Button",
        desc: "Moves layers left",

        x: 0x188,
        y: 0x090,
        w: 0x010,
        h: 0x040,

        sx: 0x00,
        sy: 0x40,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                Mouse.p = false;
                this.pressed = false
                this.frame = 0
                this.rerender()
                Update()
            } else {
                AUDIO.play('click')
                this.pressed = true
                Mouse.p = false;
                this.frame = 2
                this.rerender()
                OPT_SEL.frame -= 1
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })
    LAY_RB = new Element ({
        name: "Right Layer Button",
        desc: "Moves layers right",

        x: 0x2e8,
        y: 0x090,
        w: 0x010,
        h: 0x040,

        sx: 0x00,
        sy: 0x80,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                return
            }
            AUDIO.play('click')
            this.pressed = true
            Mouse.p = false;
            this.frame = 2
            this.rerender()
            OPT_SEL.frame += 1
            Update()            
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })

    // Palette
    PAL_LB = new Element ({
        name: "Left Palette Button",
        desc: "Moves the Palettes left",

        x: 0x1d0,
        y: 0x1e0,
        w: 0x010,
        h: 0x010,

        sx: 0x00,
        sy: 0x00,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                this.pressed = false
                this.frame = 0
                this.rerender()
                Mouse.p = false;
                Update()
            } else {
                AUDIO.play('click')
                this.pressed = true
                this.frame = 2
                this.rerender()
                Mouse.p = false;
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })
    PAL_RB = new Element ({
        name: "Right Palette Button",
        desc: "Moves the Palettes right",

        x: 0x2a0,
        y: 0x1e0,
        w: 0x010,
        h: 0x010,

        sx: 0x00,
        sy: 0x10,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                this.pressed = false
                this.frame = 0
                this.rerender()
                Mouse.p = false;
                Update()
            } else {
                AUDIO.play('click')
                this.pressed = true
                this.frame = 2
                this.rerender()
                Mouse.p = false;
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })

    // System
    AUD_BT = new Element ({
        name: "Mute Audio Button",
        desc: "Toggles on and off the Audio",

        x: 0x2d0,
        y: 0x1e9,
        w: 0x010,
        h: 0x010,

        sx: 0x00,
        sy: 0x30,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                this.pressed = false
                this.frame = 0
                this.rerender()
                Mouse.p = false;
                Update()
            } else {
                this.pressed = true
                this.frame = 2
                this.rerender()
                Mouse.p = false;
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })
    AUD_BT.toggle = true
    MUS_BT = new Element ({
        name: "Mute Audio Button",
        desc: "Toggles on and off the Audio",

        x: 0x2E8,
        y: 0x1e9,
        w: 0x010,
        h: 0x010,

        sx: 0x00,
        sy: 0x20,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                this.pressed = false
                this.frame = 0
                this.rerender()
                Mouse.p = false;
                Update()
            } else {
                this.pressed = true
                this.frame = 2
                this.rerender()
                Mouse.p = false;
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })
    MUS_BT.toggle = true
    SAV_BT = new Element ({
        name: "Small Button",
        desc: "A small button",

        x: 0x18C,
        y: 0x1D8,
        w: 0x020,
        h: 0x020,

        sx: 0x30,
        sy: 0x00,

        src: "graphics/ui/sheet.png",

        hover: function () {
            if (this.pressed) { return }
            this.frame = 1;
            this.rerender()
        },
        abandon: function () {
            if (this.pressed) { return }
            this.frame = 0;
            this.rerender()
        },
        click: function () {
            if (this.pressed) {
                this.pressed = false
                this.frame = 0
                this.rerender()
                Mouse.p = false;
                Update()
            } else {
                this.pressed = true
                this.frame = 2
                this.rerender()
                Mouse.p = false;
                Update()
            }
        },
        traits: [
            "Image",
            "Hoverable",
            "Clickable"
        ]
    })
    SAV_BT.toggle = true
}
// Character Creation 
const PAL = {
    SKIN: [
        [
            [0xff, 0xff, 0xf8, 253],
            [0xf2, 0xda, 0xba, 215],
            [0xd5, 0xb0, 0x81, 173],
            [0x99, 0x77, 0x61, 123],
            [0x75, 0x53, 0x3f,  88]
        ]
    ],
    HAIR: [],
    EYES: [],
    BASE: [],
}
const Layer = function (name) {
    return new Element ({
        name: name,
        desc: name + " layer",

        x: 0,
        y: 0,
        w: 0x180,
        h: 0x200,

        src:"/graphics/chara/" + name + ".png",

        traits: [
            "Image",
            "Layer",
            "Recolorable"
        ]
    })
}
const chg_col = function (palette, tag) {
    for (e in Elements) {
        let element = Elements[e]
        if (element.name.slice(-2) == tag) {
            element.recolor(palette)
        }
    }
    Update()
}
const chg_sel = function (sel, tag) {
    sel %= CONFIG.OPT
    for (e in Elements) {
        let element = Elements[e]
        if (element.name.slice(0,2) == tag) {
            element.frame = sel
            element.rerender()
        }
    }
    Update()
}
const cur_sel = function (tag) {
    for (e in Elements) {
        let element = Elements[e]
        if (element.name.slice(0,2) == tag) {
            return element.frame
        }
    } 
}
const make_composite = function (tag) {
    let slides = []
    for (e in Elements) {
        let element = Elements[e]
        if (element.name.slice(0,2) != tag) {
            continue
        }
        slides.push(element.image)
    }
    return slides
}
const draw_composite = function (slides, frame, x, y) {
    for (const s in slides) {
        Context.drawImage(slides[s],
            0x180 * frame, 0,
            0x180, 0x200,
            x, y, 0x60, 0x80)
    }
}
const draw_ui = function (sx, sy, sw, sh, x, y) {
    Context.drawImage(
        UI_FRAME.image, 
        sx, sy, sw, sh, 
         x,  y, sw, sh
    )
}
// Choice selector
const Option_Selector = function () {
    let cs = new Element({
        name: "Option Selector",
        desc: "Let's you choose which option you want",

        x: 0x1a0,
        y: 0x028,

        w: 0x140,
        h: 0x110,

        traits: ["Clickable"]
    })
    cs.load = function (tag) {
        this.tag    = tag
        this.slides = make_composite(tag)
    }
    cs.frame = 0x1000 * CONFIG.OPT
    cs.draw = function () {
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 3; x++) {
                let t = 1;
                let s = Math.abs((this.frame+x+3*y)%CONFIG.OPT)
                if (cur_sel(this.tag) == s) {
                    t = 0;
                }
                draw_ui(
                    0x90 + 0x60 * t, 0,
                    0x60, 0x80,
                    this.x + x * 0x70,
                    this.y + y * 0x90
                )
                draw_composite(
                    this.slides, 
                    s,
                    this.x + x * 0x70,
                    this.y + y * 0x90 - 2 * t
                )
            }
        }
    }
    cs.click = function () {
        let x = Mouse.x - this.x
        let y = Mouse.y - this.y
        if (x > 0xe0) {
            if (y > 0x90) {
                chg_sel(Math.abs(this.frame + 5), this.tag)
                return
            }
            if (y > 0x80) {
                return
            }
            chg_sel(Math.abs(this.frame + 2), this.tag)
            return
        }
        if (x > 0xd0) {
            return
        }
        if (x > 0x70) {
            if (y > 0x90) {
                chg_sel(Math.abs(this.frame + 4), this.tag)
                return
            }
            if (y > 0x80) {
                return
            }
            chg_sel(Math.abs(this.frame + 1), this.tag)
            return
        }
        if (x > 0x60) {
            return
        }

        if (y > 0x90) {
            chg_sel(Math.abs(this.frame + 3), this.tag)
            return
        }
        if (y > 0x80) {
            return
        }
        chg_sel(Math.abs(this.frame + 0), this.tag)
        return
    }
    return cs
}
const Category_Selector = function () {
    let cs = new Element({
        name: "Category Selector",
        desc: "Let's you choose which Category you want",

        x: 0x1b0,
        y: 0x000,

        w: 0x120,
        h: 0x020,

        traits: ["Clickable", "Hoverable"]
    })
    cs.Hoverable_update = function () {
        if (Utils.checkInside(Mouse, this)){
            let last_pos = this.mousePos
            this.mousePos  = Math.floor((Mouse.x - this.x) / 0x20)
            if (last_pos != this.mousePos) {
                if (
                    this.list[
                        (this.mousePos + this.frame) % CONFIG.CAT
                    ] == this.active_cat ) {
                        return
                    }
                AUDIO.play('hover')
            }
            return
        }
        this.mousePos = "false"
    }
    cs.hover = function () {}
    cs.active_cat = "ja"
    cs.frame = 0x1000 * CONFIG.CAT
    cs.list  = [
        "bo",
        "ey",
        "eb",
        "ea",
        "no",
        "mo",
        "fr",
        "ha",
        "ac",
        "ht",
        "sh",
        "ja"
    ]
    cs.click = function () {
        let x = Math.floor((Mouse.x - this.x) / 0x20)
        let old_cat = this.active_cat
        this.active_cat = this.list[(this.frame + x) % CONFIG.CAT]
        if (old_cat != this.active_cat) {
            AUDIO.play('cat_click')
        }
        OPT_SEL.load(this.active_cat)
        Update()
    }
    cs.draw = function () {
        Context.drawImage(
            UI_FRAME.image,
            0x00, 0x1e0,
            this.w, this.h,
            this.x, this.y,
            this.w, this.h
        )
        for (let x = 0; x < 9; x++) {
            let s = Math.abs((this.frame + x) % CONFIG.CAT)
            let p = 0
            if (x == this.mousePos) { p = 0x20}
            if (this.list[s] == this.active_cat) {
                p = 0x40
            }
            Context.drawImage(
                UI_FRAME.image,
                0x30 + p, 
                0x20 + 0x20 * s,
                0x20, 0x20,
                this.x + 0x20 * x, this.y,
                0x20, 0x20)
        }
    }
    return cs
}
const Color_Selector = function () {
    let cs = new Element({
        name: "Color Selector",
        desc: "Let's you choose which Color you want",

        x: 0x1e8,
        y: 0x1d0,

        w: 0x0b0,
        h: 0x0b0,

        traits: ["Clickable", "Hoverable"]
    })
    cs.list = [
        "sk", // skin color
        "ir", // iris color
        "ha", // brow color
        "sk", // skin color
        "sk", // skin color
        "mc", // mouth color
        "ha", // hair color
        "ha", // hair color
        "ac", // acc. color
        "hc", // hat color
        "sc", // shirt color
        "jc"  // jacket color
    ]
    cs.palettes = {
        sk: [
            [
                [255,255,255,255],
                [215,215,215,215],
                [185,185,185,185],
                [145,145,145,145],
                [105,105,105,105]
            ],
            [
                [0xff, 0xff, 0xf8, 5],
                [0xf2, 0xda, 0xba, 4],
                [0xd5, 0xb0, 0x81, 3],
                [0x99, 0x77, 0x61, 2],
                [0x75, 0x53, 0x3f, 1]
            ]
        ],
        ir: [
            [
                [255,255,255,255],
                [215,215,215,215],
                [185,185,185,185],
                [145,145,145,145],
                [105,105,105,105]
            ]
        ],
        ha: [
            [
                [255,255,255,255],
                [215,215,215,215],
                [185,185,185,185],
                [145,145,145,145]
            ]
        ],
        ac: [
            [
                [255,255,255,255],
                [215,215,215,215],
                [185,185,185,185],
                [145,145,145,145]
            ]
        ],
        hc: [
            [
                [255,255,255,255],
                [215,215,215,215],
                [185,185,185,185],
                [145,145,145,145]
            ]
        ],
        sc: [
            [
                [255,255,255,255],
                [215,215,215,215],
                [185,185,185,185],
                [145,145,145,145]
            ]
        ],
        jc: [
            [
                [255,255,255,255],
                [215,215,215,215],
                [185,185,185,185],
                [145,145,145,145]
            ]
        ],
    }
    cs.click = function () {
        let tag = this.list[
            CAT_SEL.list.indexOf(
                CAT_SEL.active_cat
            )
        ]
        console.log( tag )
        chg_col(this.palettes[tag][0], tag)
    }
    return cs
}
const OPT_SEL = new Option_Selector()
const CAT_SEL = new Category_Selector()
const COL_SEL = new Color_Selector()

const Audio_Player = function () {
    let a = {}
    a.SFX   = true;
    a.BGM   = true;
    a.play = function (sfx) {
        if (!this.SFX) { return }
        let c = new Audio('/audio/'+sfx+'.wav')
        c.play()
    }
    return a
}
const AUDIO  = new Audio_Player()
// Finally add all the elements
Elements.push(
    // UI First
    UI_FRAME,
    CAT_LB,
    CAT_RB,
    LAY_LB,
    LAY_RB,
    PAL_RB,
    PAL_LB,
    AUD_BT,
    MUS_BT,
    SAV_BT,
    // Character Second
    new Layer("ja_b_jc"),
    new Layer("ja_b_st"),
    new Layer('ht_b_hc'),
    new Layer('ht_b_st'),
    new Layer('ha_b_ha'),
    new Layer('ha_b_st'),
    new Layer('sh_b_sc'),
    new Layer('sh_b_st'),
    new Layer('ea_b_sk'),
    new Layer('ea_b_st'),
    new Layer('bo_f_sk'),
    new Layer('bo_f_st'),
    new Layer('fr_f_sk'),
    new Layer('mo_f_sk'),
    new Layer('mo_f_st'),
    new Layer('no_f_sk'),
    new Layer('no_f_st'),
    new Layer('eb_f_sk'),
    new Layer('eb_f_ha'),
    new Layer('eb_f_st'),
    new Layer('ey_f_ir'),
    new Layer('ey_f_sk'),
    new Layer('ey_f_st'),
    new Layer('ha_f_ha'),
    new Layer('ha_f_st'),
    new Layer('ac_f_ac'),
    new Layer('ac_f_st'),
    new Layer('sh_f_sc'),
    new Layer('sh_f_st'),
    new Layer('ja_f_jc'),
    new Layer('ja_f_st'),
    new Layer('fr_f_ha'),
    new Layer('fr_f_st'),
    new Layer('ht_f_hc'),
    new Layer('ht_f_st'),

    OPT_SEL,
    CAT_SEL,
    COL_SEL
)
const on_load = function () {
    if (Loading == 0) {
        OPT_SEL.load("ja")
        Update()
        return
    }
    setTimeout(on_load, 1000/CONFIG.FPS)
}
on_load()