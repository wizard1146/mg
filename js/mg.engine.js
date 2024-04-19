mg = typeof mg != 'undefined' ? mg : {}

mg.engine = (function() {
  /* Meta variables */
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  
  /* Module Settings & Events */
  let settings = {
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    game    : {
      size_unit    : 25,
      sizpu_sector : 40,

      speed_limiter: 9,
      speed_max    : 100,
    
      size_quadrant: 30000,
      size_sector  :   500,
      count_sector :     5,
      count_stars  :   898,
      
      initial_x    : 0,
      initial_y    : 0,
    }
  }
  let events = {
    incoming: {
      initialise    : 'mgc-initialise',
      injected_main : `mgu-injected-main`,
      engine_start  : `mgu-engine-start`,
      stage_start   : `mgu-stage-start`,
      
      input_key_movement     : 'mgi-input-key-movement',
      input_key_action       : 'mgi-input-key-action',
      input_key_miscellaneous: 'mgi-input-key-misc',
      
      input_joystick_dir     : `mgi-input-joystick-dir`,
      input_joystick_aim     : `mgi-input-joystick-aim`,
    }
  }
  /* Memory */
  let body, main;
  // Main data output
  let data = {
    hero    : {},
    sectors : {},
    limits  : {},
    settings: {},
  }
  /* Computational variables */
  let collider;


  /* Initialise */
  let initialise = function() {
    body = qset('body')
    
    body.addEventListener( events.incoming.injected_main, function() { 
      main = qset(`#${settings.app.id_tray}`); 
      listen(); 
      main.addEventListener( events.incoming.engine_start, start );
      } )
  }

/*

        player.collisionObject.x += player.changeX
        player.collisionObject.y += player.changeY
        // Collision checking
        this.collider.update()
        // Collision resolution
        let potentials = player.collisionObject.potentials()
        for (const potential of potentials) {
          let collided = player.collisionObject.collides(potential, player.collisionResult)
          if (collided) {
            player.collisionObject.x -= player.collisionResult.overlap * player.collisionResult.overlap_x
            player.collisionObject.y -= player.collisionResult.overlap * player.collisionResult.overlap_y
          }
        }

    // Collision Object
    player.width = this.playerWidth
    player.torso = this.playerTorso
    player.legs  = this.playerLegs
    const shape = [
       [-1 * player.width/2, -1 * player.torso],
       [ 1 * player.width/2, -1 * player.torso],
       [ 1 * player.width/2,  1 * player.legs ],
       [-1 * player.width/2,  1 * player.legs ],
    ]
    player.collisionObject = this.collider.createPolygon(point.x, point.y, shape) //[[-14,-15],[14,-15],[14,20],[-14,20]]
*/
  
  /* Start function */
  let start = function() {
  console.log('a')
    // preform some calculations
    settings.game.size_sector   = settings.game.sizpu_sector * settings.game.size_unit / 2
    settings.game.size_quadrant = settings.game.sizpu_sector * 5
    console.log(`Initialised game with following settings: `, settings.game)

    // generate collider
    collider = new collisions.generate()
    // generate map
    generateMap()
    // generate player
    generatePlayer()
    // update the data package
    data.settings.size_sector = settings.game.size_sector
    // 
    heartbeat()
  }
  
  let heartbeat = function() {
    window.requestAnimationFrame( heartbeat )
    
    updateHero()
  }
  
  let listen = function() {
    main.addEventListener( events.incoming.input_joystick_dir, joystickDir )
    main.addEventListener( events.incoming.input_joystick_aim, joystickAim )
  }
  
  let joystickDir = function(e) {
    let datum = e.detail
    
    data.hero.v = {
      x: datum.x,
      y: datum.y,
      m: datum.len,
      r: datum.r,
    }
  }
  let joystickAim = function(e) {
    let datum = e.detail
    
    // Update hero rotation
    data.hero.r = datum.r
  }
  
  /* Update Functions */
  let updateHero = function() {
    let hero = data.hero
    let changed = false
    // add velocity
    let magnitude = hero.v.m
    let rotation  = hero.v.r
    
    hero.deltaX = hero.v.x / settings.game.speed_limiter
    hero.deltaY = hero.v.y / settings.game.speed_limiter
    
    // resolve deltas
    if (hero.deltaX != 0) {
      hero.x += hero.deltaX
      hero.deltaX = 0
      changed = true
    }
    if (hero.deltaY != 0) {
      hero.y += hero.deltaY
      hero.deltaY = 0
      changed = true
    }
    if (hero.deltaRotation != 0) {
      hero.deltaRotation = 0
      changed = true
    }
    if (changed) {
      // calculate new neighbours
      hero.sector = getSector(hero.x, hero.y)
    }
  }
  
  /* Generate functions */
  // Generate Player
  let generatePlayer = function() {
    let hero = new Player('hero', {t: 'player'})
    
    data.hero = hero
  }

  let generateMap = function() {
    let sect  = settings.game.size_sector
    let count = settings.game.count_sector
    let half  = Math.floor(count/2)
    
    let mx, my;
    for (var i = 0; i < count; i++) {
      mx = i - half
      for (var j = 0; j < count; j++) {
        my = j - half
        
        let tile = new Tile({mx: mx, my: my})
        data.sectors[tile.k] = tile
      }
    }
    data.limits = calculateGridLimits()
  }

  let calculateGridLimits = function() {
    const ss = settings.game.size_sector
    let vmax, vmin, hmax, hmin;
    Object.entries(data.sectors).forEach(([name,data],index) => {
      hmin = hmin < data.w ? hmin : data.w
      hmax = hmax > data.e ? hmax : data.e
      vmin = vmin < data.s ? vmin : data.s
      vmax = vmax > data.n ? vmax : data.n
    })
    let hlims = [], vlims = [];
    for (var i = hmin; i < hmax; i += ss*2) {
      hlims.push(i)
    }
    for (var i = vmin; i < vmax; i += ss*2) {
      vlims.push(i)
    }
    return {hmin: hmin, hmax: hmax, vmin: vmin, vmax: vmax, vlims: vlims, hlims: hlims}
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
  
  let getTile = function(key) {
    return data.sectors[key] ? data.sectors[key] : false
  }
  
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
      this.collisionObject = collider.createPolygon(this.x, this.y, bounds)
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
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )

  return {
    data: function() { return data },
  }
})()

/*
  // Calculation Functions
  let getSector = function(x,y) {
    let m = data.limits.boundLeft
    let n = data.limits.boundBottom
    let j = data.limits.assocLeft
    let k = data.limits.assocBottom
      
    let p, q, r, s;
    for (var i = 0; i < m.length; i++) {
      if (m[i] > x) { break }
      p = m[i]
      r = j[i]
    }
    for (var i = 0; i < n.length; i++) {
      if (n[i] > y) { break }
      q = n[i]
      s = k[i]
    }
    return {sx: r, sy: s, left: p, bottom: q}
  }*/
/*

    // clear stars
    data.stars = {}
    let starCount = settings.game.count_stars
    let size = settings.game.size_quadrant
    // seed with stars
    for (var i = 0; i < starCount; i++) {
      let x = Math.floor(Math.random() * size * 2 - size)
      let y = Math.floor(Math.random() * size * 2 - size)
      let c = `star_x${x}_y${y}`
      
      // calculate sector
      let bounds = getSector(x,y)
      let sectorAddress = `sector_MX${bounds.sx}_MY${bounds.sy}`
      
      let star = new Star(c, {x: x, y: y})
      
      data.stars[c] = star
      
      let sector = data.sectors[sectorAddress]
      if (sector) {
        sector.items[c] = star
      }
    }
*/