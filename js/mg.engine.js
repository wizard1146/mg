mg = typeof mg != 'undefined' ? mg : {}

mg.engine = (function() {
  /* Meta variables */
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  let Tile       = mg.constructs.tile;
  let Player     = mg.constructs.player;
  
  /* Module Settings & Events */
  let settings = {
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    game    : {
      size_unit    : 25,
      sizpu_sector : 40,

      speed_limiter: 14,
      speed_inverse_factor: 1.16,
      speed_max    : 100,
    
      size_quadrant: 30000,
      size_sector  :   500,
      count_sector :     5,
      count_stars  :   898,
      
      initial_x    : 0,
      initial_y    : 0,
      
      limit_rotation: 0.2,
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
  
  /* Start function */
  let start = function() {
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
    data.hero.cardinal = datum.c
  }
  
  /* Update Functions */
  let updateHero = function() {
    let hero = data.hero
    let changed = false
    
    // add velocity
    let limiter  = settings.game.speed_limiter
    let diff     = Math.abs(hero.r - hero.v.r)
    
    if (diff > Math.PI/2) { 
      hero.invert_animation = true; 
      limiter = settings.game.speed_inverse_factor * limiter 
    } else {
      hero.invert_animation = false;
    }
    
    // apply delta
    hero.deltaX = hero.v.x / limiter
    hero.deltaY = hero.v.y / limiter
    hero.deltaRotation = Math.min( (hero.v.r), settings.game.limit_rotation )
    
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
      //hero.r += hero.deltaRotation
      //hero.r  = hero.r % (2 * Math.PI)
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
    let hero = new Player('hero', {t: 'player', collider: collider})
    
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
        
        let tile = new Tile({mx: mx, my: my, collider: collider})
        data.sectors[tile.k] = tile
      }
    }
    // data.limits = calculateGridLimits()
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
  
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )

  return {
    data: function() { return data },
  }
})()


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

/*
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
  */