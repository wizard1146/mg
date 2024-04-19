mg = typeof mg != 'undefined' ? mg : {}

mg.constructs = (function() {
  /* Meta variables */
  
  /* Module Settings & Events */
  let settings = {
    game    : {
      size_unit    :  25,
      size_sector  : 500,
      
      initial_x    :   0,
      initial_y    :   0,
    }
  }
  
  /* Memory */
  
  /* Computational variables */

  
  /* Classes */
  class Artefact {
    constructor(k, options) {
      // Key, X, Y, Type, Seed
      this.k = k
      let args = {
        x: 0,
        y: 0,
        t: 'undefined',
        s: Math.random(),
        r: 0,
        a: {
          key  : '',
          freq :  1,
          count:  0,
          frame:  0,
          list : [],
        },
      }
      Object.entries(args).forEach(([k,v],i) => {
        if (options && options[k]) {
          this[k] = options[k]
        } else {
          this[k] = v
        }
      })
    }
    /* Animation Controllers */
    animateSet(key, list, freq) {
      this.a = {
        key  : key,
        freq : freq,
        count: 0,
        frame: 0,
        list : list,
      }
    }
    animateCount() {
      this.a.count++
      if (this.a.count !== 0 && this.a.count % this.a.freq == 0) {
        this.a.count = 0
        this.animateFrame()
      }
      return this.a.list[this.a.frame]
    }
    animateFrame() {
      this.a.frame++
      if (this.a.frame >= this.a.list.length) {
        this.a.frame = 0
      }
    }
  }

  class Collidable extends Artefact {
    constructor(key, options) {
      super(key, options)

      const w = options ? (options?.w ? options?.w : settings.game.size_unit) : settings.game.size_unit
      
      const bounds = [
        [-1 * w/2, -1 * w/2],
        [ 1 * w/2, -1 * w/2],
        [ 1 * w/2,  1 * w/2],
        [-1 * w/2,  1 * w/2],
      ]
      this.collisionObject = options.collider.createPolygon(this.x, this.y, bounds)
    }
  }

  class Movable extends Collidable {
    constructor(key, options) {
      super(key, options)
      this.deltaX = 0
      this.deltaY = 0
      this.deltaRotation = 0
    }
  }

  class Tile extends Collidable {
    constructor(options) {
      const mx = options.mx
      const my = options.my
      const key = `sector_MX${mx}_MY${my}`
 
      super(key, options)

      const ss = settings.game.size_sector 

      const mpx = mx * ss * 2
      const mpy = my * ss * 2    

      this.name = key
      this.mx   = mx
      this.my   = my
      this.t = 'tile'
      this.x = mpx
      this.y = mpy
      this.w = mpx - ss
      this.e = mpx + ss - 1
      this.n = mpy + ss - 1
      this.s = mpy - ss
      this.rangeVertical   = [mpy - ss, mpy + ss - 1]
      this.rangeHorizontal = [mpx - ss, mpx + ss - 1]
      this.items           = {}

      this.neighbours      = this.getNeighbours()
    }

    getNeighbours() {
      var n      = []
      var up     = this.my + 1
      var down   = this.my - 1 
      var left   = this.mx - 1
      var right  = this.mx + 1
      // Fill ABOVE, RIGHT, BELOW, LEFT
      for (var i = down; i < up+1; i++) {
        for (var j = left; j < right+1; j++) {
           n.push(`sector_MX${j}_MY${i}`)
        }
      }
      n.splice(n.indexOf(this.key), 1)
      return n
    }
  }
  
  class Star extends Artefact {
    constructor(key, options) {
      options.t = 'star'
      super(key, options)
    }
  }
  
  class Actor extends Movable {
    constructor(key, options) {
      super(key, options)
      let args = {
        v: {
          m: 0,
          r: 0,
          x: 0,
          y: 0,
        }
      }
      Object.entries(args).forEach(([k,v],i) => {
        if (options && options[k]) {
          this[k] = options[k]
        } else {
          this[k] = v
        }
      })
    }
  }
  
  class Player extends Actor {
    constructor(key, options) {
      super(key, options)
      this.sector = getSector( settings.game.initial_x, settings.game.initial_y )
    }
  }

  let getSector = function(x,y) {
    const ss = settings.game.size_sector

    let k = function(input, sectorSize) { return Math.floor((input - sectorSize) / (2 * sectorSize)) + 1 }
    let m = function(input, sectorSize) { return (2*input - 1) * sectorSize }

    let mx     = k( x, ss )
    let my     = k( y, ss )
    let left   = m( mx, ss )
    let right  = left + 2*ss - 1
    let bottom = m( my, ss )
    let top    = bottom + 2*ss - 1

    return {sx: mx, sy: my, left: left, bottom: bottom, right: right, top: top}
  }

  return {
    artefact  : Artefact,
    collidable: Collidable,
    movable   : Movable,
    tile      : Tile,
    star      : Star,
    actor     : Actor,
    player    : Player,
  }
})()
