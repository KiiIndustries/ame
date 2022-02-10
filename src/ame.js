const Ame = {
 // Configuring Ame
 CONFIG: {
  HEIGHT: 0x200,
  WIDTH:  0x300,
  FPS:    0x010,
 },
 Canvas:   null,
 Context:  null,
 UI_Sheet: null,
 Mouse: {x: 0, y: 0, p: false},
 Audio: {
  SFX: true,
  BGM: true,
  play_sfx: function (file_name) {
   if (!Ame.Audio.SFX) { return }
   let a = new Audio("/audio/"+file_name+".wav")
   a.play()
  }
 },
 init: function () {
  // Generating the display
  Ame.Canvas = document.createElement("canvas");
  Ame.Canvas.width  = Ame.CONFIG.WIDTH
  Ame.Canvas.height = Ame.CONFIG.HEIGHT
  Ame.Context = Ame.Canvas.getContext("2d");
  // Input Handling
  Ame.Canvas.addEventListener("mousemove", function(evn) {
   Mouse.x = evn.offsetX;
   Mouse.y = evn.offsetY;
   Ame.update("move")
  })
  Ame.Canvas.addEventListener("mousedown", function(evn) {
   if (evn.button != 0) { return }
   Mouse.p = true
   Ame.update("down")
  })
  window.addEventListener("mouseup", function (evn) {
   if (evn.button != 0) { return }
   Ame.update("up")
  })
  // Loading Assets
  let ui = new Image() 
  ui.src = "graphics/ui/sheet.png"
  Ame.start_loading("UI")
  ui.onload = function () {
   Ame.finish_loading("UI")
  }
  // Giving the Canvas for use
  return Ame.Canvas
 },
 // This keeps track of if something is loading
 Loading: [],
 Loading_Counter: 0,
 // Utility functions that are useful
 Utils: {
  // Point needs an x and y, and area needs x, y, w, h
  check_inside: function (point, area) {
   return (
    point.x >= area.x &&
    point.x <= area.x + area.w &&
    point.y >= area.y &&
    point.y <= area.y + area.h
   );
  },
  // Because Javascript's terrible at nesting
  copy: function (target) {
   return JSON.parse(JSON.stringify(target));
  },
  get_bright: function (color) {
   return Math.round(
    color[0] +
    color[1] + 
    color[2]
   )
  },
  // Generating a palette from a canvas
  generate_palette: function (canvas) {
   let context = canvas.getContext("2d");
   let img_data = context.getImageData(
    0, 0, canvas.width, canvas.height
   );
   let palette = [];
   let data = img_data.data;
   loop:         
   for (let p = 0; p < data.length; p += 4 ) {
    // Skip transparent pixels
    if (data[p + 3] !== 255) { continue }
    let color = [
     data[p + 0],
     data[p + 1],
     data[p + 2]
    ]
    let index = 0;
    while (index < palette.length) {
     if (
      Ame.Util.get_bright(color) >
      Ame.Util.get_bright(palette[index])
     ) { break }
     index += 1;
    }
    palette.splice(index, 0, color);
   }
   return palette;
  },
  // Replace colors in a canvas x, y, w, h are optional
  // o is the override if the palettes are mismatched
  replace_colors: function (canvas, oc, nc, x, y, w, h, o) {
   // Palette checking
   if (oc.length != nc.length) {
    if (!o) {
     console.log("Incompatible palette sizes!")
     return
    }
   }
   // Optional parameters to recolor a particular area
   x = x || 0;
   y = y || 0;
   w = w || canvas.width;
   h = h || canvas.height;
   // Sanity check for going past the canvas
   if (
    x < 0 ||
    y < 0 ||
    x + w > canvas.width ||
    y + h > canvas.height
   ) {
    console.log("Trying to index outside of the canvas!")
    return
   }
   let context = canvas.getContext("2d");
   let img_data = context.getImageData(
    0, 0, canvas.width, canvas.height
   )
   let data = img_data.data;
   // Loop through the rows
   for (let b = y; b < y + w; b++) {
    let row = b * canvas.width
    // Loop through the columns
    for (let a = x; a < x + w; a++) {
     let pixel = (a + row) * 4
     // Loop through the pallete for a match
     color_match:
     for (let c = 0; c < oc.length; c++) {
      // Replace matching pixels
      if (
       data[pixel + 0] == oc[c][0] &&
       data[pixel + 1] == oc[c][1] &&
       data[pixel + 2] == oc[c][2]
      ) {
       data[pixel + 0] = nc[c][0]
       data[pixel + 1] = nc[c][1]
       data[pixel + 2] = nc[c][2]
       break color_match
      }
     }
    }
   }
   context.putImageData(img_data, x, y)
   return true
  },
  start_loading: function (name) {
   name = name || "Pls"
   let time = performance.now()
   Ame.Loading.push([name, time])
  },
  finish_loading: function (name) {
   name = name || "Pls"
   for (const l in Ame.Loading) {
    if (Ame.Loading[l][0] != name) { continue }
    Ame.Loading.splice(l, 1)
    return
   }
   console.log(`PANIKKU: CAN'T UNLOAD ${name}`)
  },
  make_composite: function (tag) {
   let slides = []
   for (const e in Ame.Elements) {
       let element = Ame.Elements[e]
       if (element.name.slice(0,tag.length) != tag) {
           continue
       }
       slides.push(element.image)
   }
   return slides
  },
  draw_composite: function (slides, index, x, y, w, h, sw) {
   for (const s in slides) {
    Ame.Context.drawImage(
     slides[s],
     index * sw, 0,
     sw, slides[s].height,
     x, y,
     w, h
    )
   }
  },
 },
 recolor_layers: function (tag, new_colors) {
  for (const e in Ame.Elements) {
   let element = Ame.Elements[e]
   if (element.name.slice(-tag.length) != tag) {
    continue
   }
   if (Ame.replace_colors(element.img, element.palette, new_colors)) {
    element.palette = new_colors
   } else {
    console.log("Recolor failed!")
   }
  }
 },
 refresh_options: function (tag) {
  for (const e in Ame.Elements) {
   if (Ame.Elements[e].name != "Option Selector") { continue }
   Ame.Elements[e].load(tag)
   return
  }
  console.log("Error: Couldn't find the option selector")
 },
 update: function (type) {
  // If loading assets, don't update
  if (Ame.Loading.length != 0) {
   console.log(`Waiting on ${Ame.Loading.length} things to load!`);
   Ame.Loading_Counter++
   if (Ame.Loading_Counter > 100) {
    console.log("Whatever it is, it isn't loading, dumping:")
    for (const l in Ame.Loading) {
     console.log(`${Ame.Loading[l][0]}`);
    }
    console.log("Dump finished")
    Ame.Loading_Counter = 0;
    Ame.Loading = []
   }
   /* Debugging
   for (const l in Ame.Loading) {
    console.log(`Waiting on ${Ame.Loading[l][0]} to load!`);
   }
   */
   setTimeout(function () {
    Ame.update(type)
   }, 1000 / Ame.CONFIG.FPS)
   return
  }
  Ame.Loading_Counter = 0;
  Ame.Context.clearRect(
   0, 0, Ame.CONFIG.WIDTH, Ame.CONFIG.HEIGHT
  )
  for (const e in Ame.Elements) {
   Ame.Elements.update(type)
  }
 },
 Elements: [],
 Element: function (template) {
  template = template || {}
  this.name = template.name || "Default Name"
  this.desc = template.desc || "Default Desc"
  this.updates = template.updates || []
  this.update = function () {
   for (const u in this.updates) {
    this[this.updates[u]]()
   }
  }
  let traits = template.traits || []
  this.traits = {}
  for (const t in traits) {
   let trait = traits[t]
   for (const key in trait) {
    // Adding any update functions
    if (key == "update") {
     let updateName = `${traits.name}_update`
     this[updateName] = trait[key]
     this.updates.push(updateName)
     continue
    }
    // Doing any needed initializations
    if (key == "init") {
     trait[key](template, this)
     continue
    }
    // Lets overriding keys from the template
    if (template[key]) {
     this[key] = template[key]
     continue
    }
    // Finally adding the key
    this[key] = trait[key]
   }
   // Allowing for trait checking checking
   this.traits[trait.name] = true
  }
 },
 Traits: {
  Physical: {
   x: 0x00,
   y: 0x00,
   w: 0x10,
   h: 0x10
  },
  Visible: {
   c: "Black",
   draw: function () {
    Ame.Context.fillStyle = this.c;
    Ame.Context.drawRect(
     this.x, this.y,
     this.w, this.h
    )
   }
  },
  Image: {
   src: "graphics/default.png",
   init: function (element) {
    let id = element.name || "Generic ID"
    Ame.Utils.start_loading(element.name)
    let img = new Image()
    img.src = element.src
    img.onload = function () {
     this.img = document.createElement("canvas")
     this.img.width = img.width
     this.img.height = img.height
     let context = this.img.getContext("2d")
     context.drawImage(img, 0, 0)
     this.palette = Ame.Utils.generate_palette(this.img)
     Ame.Utils.finish_loading(id)
    }
   },
   draw: function () {
    Ame.Context.drawImage(this.img, this.x, this.y)
   }
  },
  Carousel: {
   x: 0x1b0,
   y: 0x000,
   w: 0x120,
   h: 0x020,
   // Button dimensions
   b_w:  0x010,
   b_h:  0x010,
   // Button coords on Sheet [L] 
   // Arranged vertically    [R]
   b_sx: 0x000,
   b_sy: 0x000,
   // Button coords on Screen
   l_x: 0x198,
   l_y: 0x008,
   r_x: 0x2d8,
   r_y: 0x008,
   // Button offsets for rendering
   l_o: 0x000,
   r_o: 0x000,
   // Selection audio
   b_ac: "click",
   b_ah: "hover",
   // Selection options
   s_sx: 0x30,
   s_sy: 0x20,
   s_sw: 0x20,
   s_sh: 0x20,
   // Selection audio
   s_ac: "cat_click",
   s_ah: "hover",
   s_list: [
    "body",
    "eye",
    "eyebrow",
    "ear",
    "nose",
    "mouth",
    "fringe",
    "hair",
    "accessory",
    "hat",
    "shirt",
    "jacket"
   ],
   // Current selection
   c_s: "jacket",
   // Current frame (of anim)
   c_f: 0x1000,
   hover: function (type) {
    if (type != "move") { return }
    // Check the carousel
    if (Ame.Utils.check_inside(Mouse, this)) {
     let last_index = this.mouse_index
     this.mouse_index = Math.floor((Ame.Mouse.x - this.x) / this.s_sw)
     // Making sure we haven't already known it's hovering
     if (last_index != this.mouse_index) {
      // Let's make sure it's not the selected index
      if ( this.s_list [
       (this.mouse_index + this.c_f) % this.s_list.length
      ] == this.c_s) {
       return
      }
      // If it's not, let's play a hover tick sound
      Ame.Audio.play_sfx(this.s_ah)
      return
     }
    }
    this.mouse_index = "false"
    // Check our buttons
    if (Ame.Utils.check_inside(Mouse, {
     x: this.l_x,
     y: this.l_y,
     w: this.b_w,
     h: this.b_h
    })) {
     if (this.l_o != 0x00) { return }
     this.l_o = this.b_w * 0x01
     Ame.Audio.play_sfx("hover")
     return
    } else {
     this.l_o = 0x00
    }
    if (Ame.Utils.check_inside(Mouse, {
     x: this.r_x,
     y: this.r_y,
     w: this.b_w,
     h: this.b_h
    })) {
     if (this.r_o != 0x00) { return }
     this.r_o = this.b_w * 0x01
     Ame.Audio.play_sfx("hover")
     return
    } else {
     this.r_o = 0x00
    }
   },
   click: function (type) {
    if (type != "down") { return }
    let x = Math.floor((Ame.Mouse.x - this.x) / this.s_sw)
    let o_s = this.c_s
    this.c_s = this.list[(this.c_f + x) % this.s_list.length]
    if (o_s != this.c_s) {
     Ame.Audio.play_sfx(this.s_ac)
     Ame.Utils.refresh_options(this.c_s)
    }
   },
   draw: function () {
    // Left button
    Ame.Context.drawImage(
     Ame.UI_Sheet,
     this.b_sx + this.l_o, 
     this.b_sy,
     this.b_h, this.b_h,
     this.l_x, this.l_y,
     this.b_h, this.b_h
    )
    // Right button
    Ame.Context.drawImage(
     Ame.UI_Sheet,
     this.b_sx + this.r_o, 
     this.b_sy + this.b_h,
     this.b_h, this.b_h,
     this.r_x, this.r_y,
     this.b_h, this.b_h
    )
    // Draw roulette
    for (let x = 0; x < Math.floor(this.w/this.s_sw); x++) {
     let s = Math.abs((this.c_f + x) % this.s_list.length)
     let p = 0
     // Draw hovered
     if (x == this.mouse_index) { p = this.s_sw }
     // Draw pressed
     if (this.list[s] == this.c_s) { p = this.s_sw * 2 }
     Ame.Context.drawImage(
      Ame.UI_Sheet,
      this.s_sx + p, this.s_sy + this.s_sh * s,
      this.s_sw, this.s_sh,
      this.x + this.s_sw * x, this.y,
      this.s_sw, this.s_sy
     )
    }
   },
   update: function (type) {
    this.click(type)
    this.hover(type)
    this.draw()
   },
  },
 }
}