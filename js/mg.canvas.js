mg = typeof mg != 'undefined' ? mg : {}

mg.canvas = (function() {
  /* Meta variables */
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  let engine     = mg.engine
  let inject     = function(str) { body.insertAdjacentHTML('beforeend', str) }
  
  /* Module Settings & Events */
  let settings = {
    dpi     : 192, // 192, 288
    fps     : 60,
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    canvas  : {
      id    : 'mg-canvas',
      hero  : {
        sprite_width : 156,
        sprite_height: 294,
        sprite_ratio : 294 / 156,
        size: 25,
      },
      grid  : {
        style: `rgba( 133, 133, 133, 0.33 )`,
      }
    },
  }
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
      
      stage_start      : 'mgu-stage-start',
      state_change     : 'mgu-state-change',
    },
    internal: {
      canvas_tick      : 'mgc_tick',
      canvas_mousemove : 'mousemove',
    },
    outgoing: {
      initialise  : 'mgc-initialise',
      selfDestruct: 'mgc-self-destruct',
      stage_move  : 'mgx-stage-move',
      tick        : 'mgc-outgoing-tick',
    },
  }
  /* Memory */
  let main, canvas, ctx, sf = 1, stageX = 0, stageY = 0;
  let data;
  let transform = {
    left: 0,
    top : 0,
  }
  /* Computational variables */

  
  /* Loop control */
  let anim = {
    stop: false,
    frame: 0,
    fps  : settings.fps,
    fpsi : 0,
    start: 0,
    now  : 0,
    then : 0,
    gone : 0,  
    prep : function() {
      anim.fpsi  = 1000 / anim.fps
      anim.then  = Date.now()
      anim.start = anim.then
      anim.loop()
    },
    loop : function() { 
      window.requestAnimationFrame( anim.loop )
      anim.now  = Date.now()
      anim.gone = anim.now - anim.then
      if (anim.gone > anim.fpsi) { 
        anim.then = anim.now - (anim.gone % anim.fpsi) 
        anim.frame++
        raiseEvent( canvas, events.internal.canvas_tick, anim.frame )
      }
    }
  }
  
  let initialise = function() {
    // set up main
    main = qset( `#${settings.app.id_tray}` )

    // document.querySelector('body').addEventListener( events.incoming.stage_start, (e) => { console.log(e)} )
    eventify()
  }
  
  let eventify = function() {
    main.addEventListener( events.incoming.stage_start, stageStart )
  }
  
  let stageStart = function() {
    let s = `center fullscreen`
    let c = `<canvas id="${settings.canvas.id}" class="${s}"></canvas>`
    
    // add the canvas
    main.insertAdjacentHTML('beforeend', c)
    
    canvas = qset(`#${settings.canvas.id}`)
    ctx    = canvas.getContext('2d')

    var wi = window.innerWidth
    var he = window.innerHeight
    canvas.style.width = wi + 'px'
    canvas.style.height = he + 'px'

    adjustDPI()
    
    // listen to canvas
    canvas.addEventListener( events.internal.canvas_mousemove, stageMove)
    
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
    renderHero()
    
    // Draw the gridlines
    renderGrid()
    
    // Notify the modules
    raiseEvent( main, events.outgoing.tick, {data: data, frames: e.detail} )
  }
  
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
  
  let c = 12000
  let renderGrid = function() {
    let L = data.limits
    let h = data.hero
    
    let vmax = 1.33 * L.boundBottom.reduce((a, b) => Math.max(a, b), -Infinity)
    let vmin = 1.33 * L.boundBottom.reduce((a, b) => Math.min(a, b),  Infinity)
    let hmax = 1.33 * L.boundLeft.reduce((a,b) => Math.max(a, b), -Infinity)
    let hmin = 1.33 * L.boundLeft.reduce((a,b) => Math.min(a, b),  Infinity)
    
    ctx.strokeStyle = settings.canvas.grid.style
    L.boundLeft.forEach(x => {
    c--
      let Line = (x - h.x)/sf + transform.left
      if (c > 0) console.log(Line, hero)
      ctx.beginPath()
      ctx.moveTo( Line, vmax)
      ctx.lineTo( Line, vmin)
      ctx.stroke()
    })
    L.boundBottom.forEach(y => {
      let Line = (y - (h.y * -1))/sf + transform.top
      ctx.beginPath()
      ctx.moveTo( hmin, Line)
      ctx.lineTo( hmax, Line)
      ctx.stroke()
    })
  }

  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )
  
  return {
    init: initialise,
  }
})()