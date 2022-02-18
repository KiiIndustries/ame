Assets = {
  UIFrame: {
    traits: [
      "UI"
    ],
    sx: 0x180,
    sy: 0x000,
    
    x: 0x180,
    y: 0x000,
    w: 0x180,
    h: 0x200
  },
  MuteBGMButton: {
    traits: [
      "UI",
      "Button",
      "Toggle"
    ],
    sx: 0x000,
    sy: 0x030,

    x: 0x2e8,
    y: 0x1e9,
    w: 0x010,
    h: 0x010,

    on: "MuteBGM",
    off: "PlayBGM"
  },
  MuteSFXButton: {
    traits: [
      "UI",
      "Button",
      "Toggle"
    ],
    sx: 0x000,
    sy: 0x030,

    x: 0x2d0,
    y: 0x1e9,
    w: 0x010,
    h: 0x010,

    on: "MuteSFX",
    off: "PlaySFX"
  },
  DownloadButton: {
    traits: [
      "UI",
      "Button"
    ],

    sx: 0x030,
    sy: 0x000,

    x: 0x18C,
    y: 0x1D8,
    w: 0x020,
    h: 0x020,

    click: "downloadCharacter"
  },
  Character: {
    traits: [
      "Composite"
    ],
    x: 0x000,
    y: 0x000,

    w: 0x180,
    h: 0x200,

    src: 'graphics/character/',

    layers: {
      Body: {
        Front: ["Skin", "Static"],
        Color: "Skin"
      },
      Ears: {
        Front: ["Skin", "Static"],
        Color: "Skin"
      },
      Nose: {
        Front: ["Skin", "Static"],
        Color: "Skin"
      },
      Mouth: {
        Front: ["Skin", "Lipstick", "Static"],
        Color: "Lipstick"
      },
      Eyebrows: {
        Front: ["Skin", "Hair", "Static"],
        Color: "Hair"
      },
      Eyes: {
        Front: ["Skin", "Iris", "Static"],
        Color: "Iris"
      },
      Shirt: {
        Front: ["Skin", "Shirt", "Static"],
        Back:  ["Shirt", "Static"],
        Color: "Shirt"
      },
      Jacket: {
        Front: ["Skin", "Jacket", "Static"],
        Back:  ["Jacket", "Static"],
        Color: "Jacket"
      },
      Hair: {
        Front: ["Skin", "Hair", "Static"],
        Back:  ["Hair", "Static"],
        Color: "Hair"
      },
      Accessory: {
        Front: ["Skin", "Accessory", "Static"],
        Color: "Accessory"
      },
      Fringe: {
        Front: ["Skin", "Hair", "Static"],
        Color: "Hair"
      },
      Hat: {
        Front: ["Skin", "Hat", "Static"],
        Back:  ["Hat", "Static"],
        Color: "Hat"
      }
    }
  },
  LayerSelector: {
    traits: [
      "Carousel",
      "Kouhai"
    ],
    x: 0x1a0,
    y: 0x028,
    w: 0x140,
    h: 0x110,

    sx: 0x90,
    sy: 0x00,
    bw: 0x60,
    bh: 0x80,

    pad: 0x010,

    senpai: "Character",
    button: "Single",

    icons: true, 

    category: "Body",

    drawIcons: function () {
      let senpai  = this.getSenpai()
      let columns = Math.floor(
        (this.w + this.pad)
          /
        (this.bw + this.pad)
      )
      let rows    = Math.floor(
        (this.h + this.pad)
          /
        (this.bh + this.pad)
      )
      // Optimization: Cache the composits
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          for (const l in senpai.layers) {
            let layer = senpai.layers[l]

            if (
              layer.name != this.category
              // Remove for no mannequin
              && layer.name != "Body"
            ) { continue }

            let i = 
              this.index + x + y * columns 
                % 
              Math.floor(layer.canvas / senpai.w)
            
            // p indicates the layer is pressed
            let p = 0;
            if (i == layer.index) {
              p = 1
            }
            
            this.context.drawImage(
              layer.canvas,
              senpai.w * i, 0x000,
              senpai.w, senpai.h,
              this.x + x * (this.bw + this.pad),
              this.y + y * (this.bh + this.pad) + p * 0x02,
              this.bw, this.bh
            )
          }
        }
      }
    },
    click: function (index) {
      // Update the character's layers
      let layers = this.getSenpai().layers
      for (const l in layers) {
        let layer = layers[l]
        if (layer.name != this.category) { continue }
        
        layer.index = index
      }
    } 
  },
  CategorySelector: {
    traits: [
      "Carousel",
      "Kouhai"
    ],

    x: 0x1b0,
    y: 0x000,
    w: 0x120,
    h: 0x020,

    sx: 0x30,
    sy: 0x20,
    bw: 0x20,
    bh: 0x20,

    pad: 0x0,

    senpai: "LayerSelector",
    button: "Column",

    list: [
      "Body",
      "Ears",
      "Nose",
      "Mouth",
      "Eyebrows",
      "Eyes",
      "Shirt",
      "Jacket",
      "Hair",
      "Accessory",
      "Fringe",
      "Hat"
    ],

    click: function (index) {
      let senpai = this.getSenpai()
      senpai.category = this.list[index]
    }

  },
  ColorSelector: {
    traits: [
      "Carousel",
      "Kouhai"
    ],
    x: 0x1f0,
    y: 0x1d0,
    w: 0x0a0,
    h: 0x030,

    sx: 0x90,
    sh: 0xc0,
    bw: 0x20,
    bh: 0x30,

    pad: 0x0,

    senpai: "Character",
    button: "Single",

    category: "Skin",
    
    drawIcons: function () {
      let senpai = this.getSenpai()
      let columns = Math.floor(
        (this.w + this.pad)
          /
        (this.bw + this.pad)
      )
      let rows    = Math.floor(
        (this.h + this.pad)
          /
        (this.bh + this.pad)
      )

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          Ame.Utils.replace_colors(
            this.sheet
          )
        }
      }
    }
  }
}