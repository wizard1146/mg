mg = typeof mg != 'undefined' ? mg : {}

mg.canvas = (function() {
  /* Meta variables */
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  let inject     = function(str) { body.insertAdjacentHTML('beforeend', str) }
  
  /* Module Settings & Events */
  let settings = {
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    canvas  : {
      id        : 'mg-canvas',
    },
    controls: {
      id_dir    : 'mg-joystick-dir',
      id_point  : 'mg-joystick-point',
      js_dir_options: {
        internalFillColor  : `rgba( 231, 231, 231, 0.87 )`,
        internalLineWidth  : 7,
        internalStrokeColor: `rgba(  14,  14,  14, 0.27 )`,
        externalLineWidth  : 18,
        externalStrokeColor: `rgba(  83,  83,  83, 0.03 )`,
      },
      js_point_options: {
        internalFillColor  : `rgba( 231, 231, 231, 0.87 )`,
        internalLineWidth  : 7,
        internalStrokeColor: `rgba(  14,  14,  14, 0.27 )`,
        externalLineWidth  : 18,
        externalStrokeColor: `rgba(  83,  83,  83, 0.03 )`,
        autoReturnToCenter : false,
      }
    }
  }
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
      
      stage_start      : 'mgu-stage-start',
      state_change     : 'mgu-state-change',
    },
    internal: {
      canvas_mousemove : 'mousemove',
    },
    outgoing: {
      initialise  : 'mgc-initialise',
      selfDestruct: 'mgc-self-destruct',
      stage_move  : 'mgx-stage-move',
    },
  }
  /* Memory */
  let main, canvas, stageX = 0, stageY = 0;
  let js_dir, js_point;
  /* Computational variables */

  
  let initialise = function() {
    // set up main
    main = qset( `#${settings.app.id_tray}` )
    
document.querySelector('body').addEventListener( events.incoming.stage_start, (e) => { console.log(e)} )
    eventify()
  }
  
  let eventify = function() {
    main.addEventListener( events.incoming.stage_start, stageStart )
  }
  
  let stageStart = function() {
    let s = `center fullscreen`
    let c = `<canvas id="${settings.canvas.id}" class="${s}"></canvas>`
        c += `<div id="${settings.controls.id_dir}"   class="absolute bottom-left"></div>`
        c += `<div id="${settings.controls.id_point}" class="absolute bottom-right"></div>`
    
    main.insertAdjacentHTML('beforeend', c)
    
    canvas = qset(`#${settings.canvas.id}`)
    
    // add the joysticks
    js_dir   = new JoyStick(settings.controls.id_dir, settings.controls.js_dir_options, (e) => {
      console.log(e)
    })
    js_point = new JoyStick(settings.controls.id_point, settings.controls.js_point_options, (e) => {
      console.log(e)
    })
    
    // listen to canvas
    canvas.addEventListener( events.internal.canvas_mousemove, stageMove)
  }
  
  let stageMove = function(e) {
    let bounds = canvas.getBoundingClientRect()
    stageX = (e.clientX - bounds.left) / (bounds.right  - bounds.left) * canvas.width
    stageY = (e.clientY - bounds.top ) / (bounds.bottom - bounds.top ) * canvas.height
    
    raiseEvent( main, events.outgoing.stage_move, [stageX, stageY] )
  }

  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )
  
  return {
    init: initialise,
  }
})()