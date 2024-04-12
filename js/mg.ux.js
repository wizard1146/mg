mg = typeof mg != 'undefined' ? mg : {}

mg.ux = (function() {
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
    splash  : {
    
    },
    mainmenu: {
      
    },
    canvas  : {
      show_xy   : 'mgx-show-xy',
      id_xy     : 'mgx-xy',
    },
    controls: {
      id_dir    : 'mg-joystick-dir',
      id_aim    : 'mg-joystick-aim',
      js_dir_options: {
        internalFillColor  : `rgba( 231, 231, 231, 0.87 )`,
        internalLineWidth  : 7,
        internalStrokeColor: `rgba(  14,  14,  14, 0.27 )`,
        externalLineWidth  : 18,
        externalStrokeColor: `rgba(  83,  83,  83, 0.03 )`,
      },
      js_aim_options: {
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
      stage_move  : 'mgx-stage-move',
    },
    internal: {
      state_transition : 'mgu-transition',
      container_wipe   : 'mgu-wipe',
      container_subwipe: 'mgu-subwipe',
    },
    outgoing: {
      stage_start      : 'mgu-stage-start',
      state_change     : 'mgu-state-change',
      
      joystick_dir: 'mgu-joystick-dir',
      joystick_aim: 'mgu-joystick-aim',
    },
  }
  
  /* State variables */
  let STATE    = { SPLASH: 0, MAINMENU: 1, CREATOR: 2, GAME: 3, SKILLTREE: 4 }
  let SUBSTATE = { STORY: 0, CHARSHEET: 1, INVENTORY: 2 }
  /* Memory */
  let body, main, state, substate, showX, showY;
  let js_dir, js_aim;
  
  /* Computational variables */

  
  let initialise = function() {
    console.log('mg.ux initialising')
    
    // assign body
    body = qset('body')
    // inject tray
    inject(`
     <div id="${settings.app.id_tray}">
       <div id="${settings.app.id_subtray}">
         <div id="${settings.canvas.id_xy}" class="absolute top-right">
           <div id="${settings.canvas.id_xy}-X" class="hidden relative"><div id="${settings.canvas.id_xy}-X-label">X</div><div id="${settings.canvas.id_xy}-X-value" class="absolute right text-right"></div></div>
           <div id="${settings.canvas.id_xy}-Y" class="hidden relative"><div id="${settings.canvas.id_xy}-Y-label">Y</div><div id="${settings.canvas.id_xy}-Y-value" class="absolute right text-right"></div></div>
         </div>
       </div>
     </div>`)
    // assign main
    main  = qset( `#${settings.app.id_tray}` )
    showX = qset( `#${settings.canvas.id_xy}-X-value`)
    showY = qset( `#${settings.canvas.id_xy}-Y-value`)
    
    // add listeners
    listen()
    
    // SIMULATE: request a game level + canvas
    setTimeout(requestStage, 1000)
  }
  
  let listen = function() {
    main.addEventListener( events.internal.container_wipe, wipe )
    main.addEventListener( events.internal.container_subwipe, subwipe )
    
    main.addEventListener( events.incoming.stage_move, updateStageXY )
  }

  
    

  let mainMenu = function() {
  
  }
  
  let swapState = function() {
    raiseEvent( events.outgoing.state_change )
  }
  
  let updateStageXY = function(e) {
    showX.innerHTML = (e.detail[0].toFixed(1)).toString().padStart(6,' ')
    showY.innerHTML = (e.detail[1].toFixed(1)).toString().padStart(6,' ')
  }
  
  /* Stage */
  let requestStage = function() {
  
    // request Canvas
    raiseEvent( main, events.outgoing.stage_start )
    
    // add the joysticks
    inject(`<div id="${settings.controls.id_dir}" class="absolute bottom-left"></div><div id="${settings.controls.id_aim}" class="absolute bottom-right"></div>`)
    js_dir   = new JoyStick(settings.controls.id_dir, settings.controls.js_dir_options, jsNotifyDir)
    js_point = new JoyStick(settings.controls.id_aim, settings.controls.js_aim_options, jsNotifyAim)
  }
  
  /* Joystick interactions */
  let jsNotifyDir = function(e) {
    raiseEvent( main, events.outgoing.joystick_dir, e)
  }
  let jsNotifyAim = function(e) {
    raiseEvent( main, events.outgoing.joystick_aim, e)
  }
  
  // Wipe & Subwipe functions
  let wipe = function() {
    main.innerHTML = ''
    main.insertAdjacentHTML('beforeend', `<div id="${settings.app.id_subtray}"></div>`)
  }
  
  let subwipe = function() { submain.innerHTML = '' }

  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )
  
  return {
  
  }
})()