mg = typeof mg != 'undefined' ? mg : {}

mg.canvas = (function() {
  /* Meta variables */
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  let engine     = mg.engine
  let inject     = function(str) { body.insertAdjacentHTML('beforeend', str) }
  
  /* Module Settings & Events */
  let settings = {
    fps     : 60,
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    canvas  : {
      id        : 'mg-canvas',
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
  let main, canvas, ctx, stageX = 0, stageY = 0;
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
    
    // listen to canvas
    canvas.addEventListener( events.internal.canvas_mousemove, stageMove)
    
    canvas.addEventListener( events.internal.canvas_tick, tick )
    
    // preload hero
    hero = new Image()
    hero.src = 'assets/arrow.png'
    
    // start the loop
    anim.prep()
  }
  
  let stageMove = function(e) {
    let bounds = canvas.getBoundingClientRect()
    stageX = (e.clientX - bounds.left) / (bounds.right  - bounds.left) * canvas.width
    stageY = (e.clientY - bounds.top ) / (bounds.bottom - bounds.top ) * canvas.height
    
    raiseEvent( main, events.outgoing.stage_move, [stageX, stageY] )
  }
  
  // Tick	
    let w = 156
    let h = 294
    let r = h/w
    let t = 18
    
  let tick = function(e) {
    // Notify the modules
    raiseEvent( main, events.outgoing.tick, [e.detail] )
    
    // Clear
    ctx.clearRect( 0, 0, canvas.width, canvas.height )
    
    // Draw the background
    
    // Draw the hero
    let m = engine.data()
    ctx.save()
    ctx.translate( canvas.width/2, canvas.height/2 )
    ctx.rotate( m.hero.rotation )
    ctx.translate( -t/2, -t*r/2 )
    ctx.drawImage( hero, 0, 0, t, t*r )
    ctx.restore()
    
    // ctx.drawImage( hero, canvas.width/2 - t/2, canvas.height/2 - t*r/2, t, t*r )
    
  }

  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )
  
  return {
    init: initialise,
  }
})()