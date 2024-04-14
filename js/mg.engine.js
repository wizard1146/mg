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
      size_quadrant: 10000,
      size_sector  :   500,
      count_sector :    21,
      count_stars  :   898,
    }
  }
  let events = {
    incoming: {
      initialise    : 'mgc-initialise',
      injected_main : `mgu-injected-main`,
      
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
    hero: {
      deltaX: 0,
      deltaY: 0,
      deltaRotation: 0,
      x : 0,
      y : 0,
      r : 0,
    },
    sectors: {},
    limits : {
      boundLeft: [],
      assocLeft: [],
      boundBottom: [],
      assocBottom: [],
    }
  }
  /* Computational variables */


  /* Classes */
  class Artefact {
    constructor(k, options) {
      // Key, X, Y, Type, Seed
      this.k = k
      let args = {
        x: 1,
        y: 1,
        t: 'undefined',
        r: 0,
        s: Math.random(),
      }
      Object.entries(args).forEach(([k,v],i) => {
        if (options && options[k]) {
          this[k] = options[k]
        } else {
          this[k] = v
        }
      })
      this.deltaX = 0
      this.deltaY = 0
      this.deltaRotation = 0
    }
  }
  
  class Star extends Artefact {
    constructor(key, options) {
      options.t = 'star'
      super(key, options)
    }
  }
  
  class Actor extends Artefact {
    constructor(key, options) {
      super(key, options)
    }
  }
  
  class Player extends Actor {
    constructor(key, options) {
      super(key, options)
    }
  }

  /* Initialise */
  let initialise = function() {
    body = qset('body')
    
    body.addEventListener( events.incoming.injected_main, function() { main = qset(`#${settings.app.id_tray}`); listen(); start(); } )
  }
  
  /* Start function */
  let start = function() {
    // generate map
    generateMap()
    // generate player
    generatePlayer()
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
    // resolve deltas
    if (hero.deltaX != 0) {
      hero.deltaX = 0
      changed = true
    }
    if (hero.deltaY != 0) {
      hero.deltaY = 0
      changed = true
    }
    if (hero.deltaRotation != 0) {
      hero.deltaRotation = 0
      changed = true
    }
    if (changed) {
      // calculate new neighbours
      
    }
  }
  
  /* Generate functions */
  // Generate Player
  let generatePlayer = function() {
    let hero = new Player('hero', {t: 'player'})
    
    data.hero = hero
  }
  // Generate Map
  let generateMap = function() {
    let starCount = settings.game.count_stars
    let size = settings.game.size_quadrant
    let sect  = settings.game.size_sector
    let count = settings.game.count_sector
    let half  = Math.floor(count/2)
    
    let mx, my;
    let limits = {
      up   :  half,
      down : -half,
      left : -half,
      right:  half,
    }
    for (var i = 0; i < count; i++) {
      mx = i - half
      for (var j = 0; j < count; j++) {
        my = j - half
        
        var name = `sector_MX${mx}_MY${my}`
        
        // Map neighbours
        var n     = []
        var up    = my + 1
        var down  = my - 1
        var left  = mx - 1
        var right = mx + 1
        // rotate TOP ROW, LEFT COL, BOTTOM ROW, RIGHT COL
        if (up <= limits.up) {
          if (left >= limits.left) {
            n.push(`sector_MX${mx-1}_MY${my+1}`)
          }
          n.push(`sector_MX${mx}_MY${my+1}`)
          if (right <= limits.right) {
            n.push(`sector_MX${mx+1}_MY${my+1}`)
          }
        }
        if (right <= limits.right) {
          n.push(`sector_MX${mx+1}_MY${my}`)
          if (down >= limits.down) {
            n.push(`sector_MX${mx+1}_MY${my-1}`)
          }
        }
        if (down >= limits.down) {
          n.push(`sector_MX${mx}_MY${my-1}`)
          if (left >= limits.left) {
            n.push(`sector_MX${mx-1}_MY${my-1}`)
          }
        }
        if (left >= limits.left) {
          n.push(`sector_MX${mx-1}_MY${my}`)
        }
        
        let mpx, mpy;
        mpx = mx * sect * 2
        mpy = my * sect * 2
        
        data.sectors[name] = {
          x : mpx,
          y : mpy,
          w : mpx - sect,
          e : mpx + sect - 1,
          n : mpy + sect - 1,
          s : mpy - sect,
          rangeVertical  : [mpy - sect, mpy + sect - 1],
          rangeHorizontal: [mpx - sect, mpx + sect - 1],
          neighbours     : n,
          items          : {},
        }
        data.limits = data.limits || {}
        data.limits.boundLeft = data.limits.boundLeft || []
        data.limits.assocLeft = data.limits.assocLeft || []
        if (data.limits.boundLeft.indexOf(mpx - sect) == -1) { data.limits.boundLeft.push( mpx - sect ); data.limits.assocLeft.push( mx ) }
        data.limits.boundBottom = data.limits.boundBottom || []
        data.limits.assocBottom = data.limits.assocBottom || []
        if (data.limits.boundBottom.indexOf(mpy - sect) == -1) { data.limits.boundBottom.push( mpy - sect ); data.limits.assocBottom.push( my ) }
      }
    }
    
    // clear stars
    data.stars = {}
    
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
  }
  
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
  }
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )

  return {
    data: function() { return data },
  }
})()