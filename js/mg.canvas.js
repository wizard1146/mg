mg = typeof mg != 'undefined' ? mg : {}

mg.canvas = (function() {
  /* Meta variables */
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  let engine     = mg.engine
  let assets     = mg.assets
  let inject     = function(str, tar) { var t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
  /* Module Settings & Events */
  let settings = {
    dpi     : 192, // 192, 288
    fps     : 120,
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    canvas  : {
      id    : 'mg-canvas',
      hero  : {
        /*
        sprite_width : 156,
        sprite_height: 294,
        sprite_ratio : 294 / 156,
        size: 24,
        */
        sprite_width : 256,
        sprite_height: 256,
        sprite_ratio : 256 / 256,
        size: 201,
      },
      grid  : {
        style: `rgba( 133, 133, 167, 0.13 )`,
      },
      // Reset canvas styles
      default_strokeStyle: '#000',
    },
  }
  let events = {
    incoming: {
      initialise    : 'mgc-initialise',
      injected_main : `mgu-injected-main`,
      
      stage_start      : 'mgu-stage-start',
      state_change     : 'mgu-state-change',
      stage_kill       : `mgu_stage_kill`,
    },
    internal: {
      canvas_tick      : 'mgc_tick',
      canvas_mousemove : 'mousemove',
    },
    outgoing: {
      initialise    : 'mgc-initialise',
      selfDestruct  : 'mgc-self-destruct',
      stage_move    : 'mgx-stage-move',
      tick          : 'mgc-outgoing-tick',
    },
  }
  /* Memory */
  let body, main, submain, canvas, ctx, sf = 1, stageX = 0, stageY = 0;
  let canvasWidth, canvasHeight;
  let data;
  let sprites = {
    main: {

    },
  };
  let transform = {
    left: 0,
    top : 0,
  }
  /* Computational variables */

  
  /* Loop control */
  let anim = {
    stop : false,
    frame: 0,
    fps  : settings.fps,
    fpsi : 0,
    start: 0,
    now  : 0,
    then : 0,
    gone : 0,  
    prep : function() {
      anim.stop  = false
      anim.fpsi  = 1000 / anim.fps
      anim.then  = performance.now()
      anim.start = anim.then
      anim.loop()
    },
    loop : function() { 
      if (anim.stop) { return }
      window.requestAnimationFrame( anim.loop )
      anim.now  = performance.now()
      anim.gone = anim.now - anim.then
      if (anim.gone > anim.fpsi) { 
        anim.then = anim.now - (anim.gone % anim.fpsi) 
        anim.frame++
        raiseEvent( canvas, events.internal.canvas_tick, anim.frame )
      }
    },
    cease : function() {
      anim.stop = true
    },
    reset : function() {
      anim.cease()
      anim.frame = 0
    },
    rates: function() { return 1000 * anim.frame/(anim.now - anim.start) },
  }
  
  let initialise = function() {
    body = qset('body')
    // set up main
    body.addEventListener( events.incoming.injected_main, function() {
      main    = qset(`#${settings.app.id_tray}`)
      submain = qset(`#${settings.app.id_subtray}`)
      eventify()
    } )
    
    main    = qset(`#${settings.app.id_tray}`)
    submain = qset(`#${settings.app.id_subtray}`)
    
    eventify()
    
    // Asset Loading
    assets.load()
  }
  
  let eventify = function() {
    main.addEventListener( events.incoming.stage_start, stageStart )
    main.addEventListener( events.incoming.stage_kill , stageEnd   )
  }
  
  let stageStart = function() {
    let s = `center fullscreen`
    let c = `<canvas id="${settings.canvas.id}" class="${s}"></canvas>`
    
    // add the canvas
    inject(c, submain)
    
    canvas = qset(`#${settings.canvas.id}`)
    ctx    = canvas.getContext('2d')

    var wi = window.innerWidth
    var he = window.innerHeight
    canvas.style.width = wi + 'px'
    canvas.style.height = he + 'px'

    let m = adjustDPI()
    canvasWidth  = m[0]
    canvasHeight = m[1]
    console.log(`Canvas w x h: ${canvasWidth}, ${canvasHeight}`)
    
    // listen to canvas
    // canvas.addEventListener( events.internal.canvas_mousemove, stageMove)
    
    canvas.addEventListener( events.internal.canvas_tick, tick )
    
    // preload hero
    hero = new Image()
    hero.src = 'assets/arrow.png'
    
    // set up the transformation
    transform.left = canvas.width  / 2 * 1/sf
    transform.top  = canvas.height / 2 * 1/sf
    
    // start the loop
    anim.prep()
  }
  
  let stageEnd = function() {
    anim.reset()
    canvas.remove()
    canvas = undefined
  }

  // DPI
  let adjustDPI = function() {
    // CSS Size
    canvas.style.width  = canvas.style.width  || canvas.width  + 'px'
    canvas.style.height = canvas.style.height || canvas.height + 'px'

    // Scale
    sf = settings.dpi / 96

    var w = parseFloat( canvas.style.width )
    var h = parseFloat( canvas.style.height )

    var os = canvas.width / w 
    var bs = sf / os
    var b  = canvas.cloneNode(false)
    b.getContext('2d').drawImage(canvas, 0, 0)

    canvas.width = Math.ceil( w * sf )
    canvas.height = Math.ceil( h * sf )

    ctx.setTransform( bs, 0, 0, bs, 0, 0 ) 
    ctx.drawImage( b, 0, 0 )
    ctx.setTransform( sf, 0, 0, sf, 0, 0 )
    
    return [canvas.width, canvas.height]
  }
  
  let stageMove = function(e) {
    let bounds = canvas.getBoundingClientRect()
    stageX = (e.clientX - bounds.left) / (bounds.right  - bounds.left) * canvas.width
    stageY = (e.clientY - bounds.top ) / (bounds.bottom - bounds.top ) * canvas.height
    
    raiseEvent( main, events.outgoing.stage_move, [stageX, stageY] )
  }
  
  // Tick
  let tick = function(e) {
    // Grab latest data
    data = engine.data()
    
    // Clear
    ctx.clearRect( 0, 0, canvas.width, canvas.height )
    
    // Draw the background
    
    // Draw the hero
    // renderHero()
    renderHero2()
    
    // Draw the gridlines
    renderGrid()
    
    // Notify the modules
    raiseEvent( main, events.outgoing.tick, {data: data, frames: e.detail} )
  }
  
  
  let renderHero2 = function(state, frame) {
    let h = data.hero
    let t = settings.canvas.hero.size
    let r = settings.canvas.hero.sprite_ratio
    ctx.save()
    ctx.translate( transform.left, transform.top )
    // ctx.rotate( h.r )
    ctx.translate( -t/2, -t*r/2 )
    
    // Animation
    let anims  = assets.data()
    let clas   = 'knight'
    let s      = h.v.m !== 0 ? 'walk' : 'idle'
    let point  = h.cardinal == 'C' ? (h.a.cardinal == 'C' ? 'S' : h.a.cardinal) : h.cardinal
    let freq   = s == 'idle' ? 12 : 4
    let key    = s + '_' + point
    
    let m      = anims[clas][s][key]
    
    // Set a new animation set
    if (h.a.key == '' || (h.a.key != key)) { // && h.cardinal != 'C'
      h.animateSet(key, m.animation, freq)
    }
    let i = h.animateCount()
    ctx.drawImage( m.img, i[0], i[1], i[2], i[3], 0, 0, t, t*r ) 
    ctx.restore()
  }
  
  let renderGrid = function() {
  /*
     Pseudo-code
       we only want to render to the edges of our screen
       we want to know the offset of 
   */
    const ss = data.settings.size_sector
    let h = data.hero
    let deltaX = h.sector.left - h.x
    let deltaY = h.sector.bottom - (1 * h.y)
    
    let c = Math.ceil(canvasWidth / ss)
    let d = Math.floor(c/2) + 1
    
    // console.log(c, `${h.sector.left} - ${Math.floor(h.x)}: `, Math.floor(deltaX), `${h.sector.bottom} - ${Math.floor(h.y)}: `, Math.floor(deltaY))
    
    
    ctx.strokeStyle = settings.canvas.grid.style
    for (var i = -d; i < d; i++) {
      // draw Vertical lines
      let xLine = deltaX/sf + transform.left + (i * ss)
      ctx.beginPath()
      ctx.moveTo( xLine,  d * ss )
      ctx.lineTo( xLine, -d * ss )
      ctx.stroke()
      // draw Horizontal lines
      let yLine = deltaY/sf - transform.top + (i * ss)
      ctx.beginPath()
      ctx.moveTo(  d * ss, -yLine )
      ctx.lineTo( -d * ss, -yLine )
      ctx.stroke()
    }
    ctx.strokeStyle = settings.canvas.default_strokeStyle
  }

  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )
  
  return {
    init: initialise,
    fps : anim.rates,
  }
})()


    
    /*
  let renderHero = function() {
    let h = data.hero
    let t = settings.canvas.hero.size
    let r = settings.canvas.hero.sprite_ratio
    ctx.save()
    ctx.translate( transform.left, transform.top )
    ctx.rotate( h.r )
    ctx.translate( -t/2, -t*r/2 )
    ctx.drawImage( hero, 0, 0, t, t*r )
    ctx.restore()
  }
  
    let prefix = ''
    if (h.v.m !== 0) {
      prefix = 'walk_'
    } else if (h.v.m === 0) {
      prefix = 'idle_'
    }
    let dir  = prefix + (h.cardinal == 'C' ? 'S' : h.cardinal)
    let freq = prefix == 'idle_' ? 12 : 4

    if (h.a.key == '' || (h.a.key != dir && h.cardinal != 'C')) {
      let animationList;
      if (prefix == 'idle_') {
        
        animationList = [
        [   0,   0,256,256],
        [ 256,   0,256,256],
        [ 512,   0,256,256],
        [ 768,   0,256,256],
        [1024,   0,256,256],
        [   0, 256,256,256],
        [ 256, 256,256,256],
        [ 512, 256,256,256],
        [ 768, 256,256,256],
        [1024, 256,256,256],
        [   0, 512,256,256],
        [ 256, 512,256,256],
        [ 512, 512,256,256],
        [ 768, 512,256,256],
        [1024, 512,256,256],
        [   0, 768,256,256],
        [ 256, 768,256,256],
        ]
      } else if (prefix == 'walk_') {
        animationList = [
        [   0,   0,256,256],
        [ 256,   0,256,256],
        [ 512,   0,256,256],
        [ 768,   0,256,256],
        [   0, 256,256,256],
        [ 256, 256,256,256],
        [ 512, 256,256,256],
        [ 768, 256,256,256],
        [   0, 512,256,256],
        [ 256, 512,256,256],
        [ 512, 512,256,256],
        ]
      }
      h.animateSet(dir, animationList, freq)
    } 
    let i = h.animateCount()
    // console.log(i)
    
    ctx.drawImage( sprites.main[dir], i[0], i[1], i[2], i[3], 0, 0, t, t*r ) 
    */

    /*
    
    let idleKeys = {
     'walk_SW': 'Walk/Knight_Walk_dir1',
     'walk_W' : 'Walk/Knight_Walk_dir2',
     'walk_NW': 'Walk/Knight_Walk_dir3',
     'walk_N' : 'Walk/Knight_Walk_dir4',
     'walk_NE': 'Walk/Knight_Walk_dir5',
     'walk_E' : 'Walk/Knight_Walk_dir6',
     'walk_SE': 'Walk/Knight_Walk_dir7',
     'walk_S' : 'Walk/Knight_Walk_dir8',
     'idle_SW': 'Idle/Knight_Idle_dir1',
     'idle_W' : 'Idle/Knight_Idle_dir2',
     'idle_NW': 'Idle/Knight_Idle_dir3',
     'idle_N' : 'Idle/Knight_Idle_dir4',
     'idle_NE': 'Idle/Knight_Idle_dir5',
     'idle_E' : 'Idle/Knight_Idle_dir6',
     'idle_SE': 'Idle/Knight_Idle_dir7',
     'idle_S' : 'Idle/Knight_Idle_dir8',
    }
    Object.entries(idleKeys).forEach(([k,v], i) => {
      sprites.main[k] = new Image()
      sprites.main[k].src = 'assets/knight/' + v + '.png'
      sprites.main[k].onload = function() {
        console.log(sprites)
      }
    })
    */
    // document.querySelector('body').addEventListener( events.incoming.stage_start, (e) => { console.log(e)} )
