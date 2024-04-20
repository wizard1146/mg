mg = typeof mg != 'undefined' ? mg : {}

mg.ux = (function() {
  /* Meta variables */
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  let inject     = function(str, tar) { let t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
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
      id_fps    : 'mgx-fps',
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
    },
    hud: {
      id_hud         : 'mg-hud-main',
      id_x           : 'mg-hud-x',
      id_y           : 'mg-hud-y',
      id_sector      : 'mg-hud-sector',
      id_engine      : 'mg-hud-engine',
      id_engineThrust: 'mg-hud-engine-thrust',
      class_coords   : 'mg-hud-class-coords',
      class_sector   : 'mg-hud-class-sector',
    }
  }
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
      stage_move  : 'mgx-stage-move',
      canvas_tick : 'mgc-outgoing-tick',
    },
    internal: {
      state_transition : 'mgu-transition',
      container_wipe   : 'mgu-wipe',
      container_subwipe: 'mgu-subwipe',
    },
    outgoing: {
      injected_main    : `mgu-injected-main`,
      
      engine_start     : `mgu-engine-start`,
      stage_start      : 'mgu-stage-start',
      state_change     : 'mgu-state-change',
      stage_kill       : `mgu_stage_kill`,
      
      joystick_dir: 'mgu-joystick-dir',
      joystick_aim: 'mgu-joystick-aim',
    },
  }
  
  /* State variables */
  let STATE    = { SPLASH: 0, MAINMENU: 1, CREATOR: 2, GAME: 3, SKILLTREE: 4 }
  let SUBSTATE = { STORY: 0, CHARSHEET: 1, INVENTORY: 2 }
  /* Memory */
  let body, main, submain, state, substate, showX, showY;
  let js_dir, js_aim, hud_main;
  let jsDir, jsAim, hudX, hudY, hudSector, hudEngineThrust, hudFPS;
  
  /* Computational variables */

  
  let initialise = function() {
    console.log('mg.ux initialising')
    
    // assign body
    body = qset('body')
    // inject tray
    inject(`
     <div id="${settings.app.id_tray}">
       <div id="${settings.app.id_subtray}">
         <div id="${settings.canvas.id_xy}" class="absolute top-right hidden">
           <div id="${settings.canvas.id_xy}-X" class="hidden relative"><div id="${settings.canvas.id_xy}-X-label">X</div><div id="${settings.canvas.id_xy}-X-value" class="absolute right text-right"></div></div>
           <div id="${settings.canvas.id_xy}-Y" class="hidden relative"><div id="${settings.canvas.id_xy}-Y-label">Y</div><div id="${settings.canvas.id_xy}-Y-value" class="absolute right text-right"></div></div>
         </div>
         <div id="${settings.canvas.id_fps}" class="absolute top-right"><div class="value syne-mono text-grey"></div></div>
       </div>
     </div>`)
    // assign main
    main    = qset(`#${settings.app.id_tray}`)
    submain = qset(`#${settings.app.id_subtray}`)
    showX   = qset(`#${settings.canvas.id_xy}-X-value`)
    showY   = qset(`#${settings.canvas.id_xy}-Y-value`)
    hudFPS  = qset(`#${settings.canvas.id_fps} .value`)
    // inform modules
    raiseEvent( body, events.outgoing.injected_main )
    
    // add listeners
    listen()
    
    // SIMULATE: request a game level + canvas -> change this to a menu UI when desiring control
    setTimeout(requestStage, 1000)
    // setTimeout(endStage, 8000)
  }
  
  let listen = function() {
    main.addEventListener( events.internal.container_wipe, wipe )
    main.addEventListener( events.internal.container_subwipe, subwipe )
    
    main.addEventListener( events.incoming.stage_move, updateStageXY )
    
    // Listen for Canvas Tick
    main.addEventListener( events.incoming.canvas_tick, canvasTick )
  }

  

  let mainMenu = function() {
    inject(`
      
    `)
  }
  
  let swapState = function() {
    raiseEvent( events.outgoing.state_change )
  }
  
  let canvasTick = function(e) {
    let data = e.detail.data
    let hero = data.hero
    
    // show FPS
    hudFPS.innerHTML = mg?.canvas?.fps().toFixed(1)
    // hudFPS.innerHTML = hero.a.key + ',' + hero.a.cardinal
    
    updateCoordinates(hero)
    updateSector(hero)
    updateThrust(hero)
  }
  
  let updateStageXY = function(e) {
    showX.innerHTML = (e.detail[0].toFixed(1)).toString().padStart(6,' ')
    showY.innerHTML = (e.detail[1].toFixed(1)).toString().padStart(6,' ')
  }
  
  let updateCoordinates = function(hero) {
    hudX.innerHTML = Math.floor(hero.x)
    hudY.innerHTML = Math.floor(hero.y)
  }
  
  let updateSector = function(hero) {
    hudSector.innerHTML = `(${hero.sector.sx},${hero.sector.sy})`
  }
  
  let updateThrust = function(hero) {
    hudEngineThrust.innerHTML = `current heading: ${hero.r.toFixed(3)}<br/>current rotational speed: ${hero.v.r.toFixed(3)}` // `<br/>applied rotational delta: ${hero.dv.r.toFixed(3)}<br/>`
  }
  
  /* Stage */
  let requestStage = function() {
    // request Engine & Canvas
    raiseEvent( main, events.outgoing.engine_start )
    raiseEvent( main, events.outgoing.stage_start  )
    
    // add the joysticks
    inject(`<div id="${settings.controls.id_dir}" class="absolute bottom-left"></div><div id="${settings.controls.id_aim}" class="absolute bottom-right"></div>`, submain)
    jsDir   = new JoyStick(settings.controls.id_dir, settings.controls.js_dir_options, jsNotifyDir)
    jsPoint = new JoyStick(settings.controls.id_aim, settings.controls.js_aim_options, jsNotifyAim)
    
    // add the HUD
    inject(`<div id="${settings.hud.id_hud}" class="absolute fullscreen center no-pointer">
     <!-- HUD Coordinates -->
     <div id="${settings.hud.id_x}" class="${settings.hud.class_coords} absolute syne-mono text-right text-grey bottom-left"><div class="label"></div><div class="value"></div></div>
     <div id="${settings.hud.id_y}" class="${settings.hud.class_coords} absolute syne-mono text-right text-grey"><div class="label"></div><div class="value"></div></div>
     <!-- HUD Sector -->
     <div id="${settings.hud.id_sector}" class="${settings.hud.class_sector} absolute circle top-left syne-mono text-center text-grey"><div class="label"></div><div class="value"></div></div>
     <!-- HUD Engine -->
     <div id="${settings.hud.id_engine}" class="">
       <div id="${settings.hud.id_engineThrust}" class="absolute bottom-middle syne-mono text-grey"><div class="value"></div></div>
     </div>
    </div>`, submain)
    
    // shorthands for performance
    hudX      = qset(`#${settings.hud.id_x} .value`)
    hudY      = qset(`#${settings.hud.id_y} .value`)
    hudSector = qset(`#${settings.hud.id_sector} .value`)
    hudEngineThrust = qset(`#${settings.hud.id_engineThrust} .value`)
    
    // adjust the Coordinates
    js_dir   = qset(`#${settings.controls.id_dir}`)
    js_aim   = qset(`#${settings.controls.id_aim}`)
    hud_main = qset(`#${settings.hud.id_hud}`)
    hud_x    = qset(`#${settings.hud.id_x}`)
    hud_y    = qset(`#${settings.hud.id_y}`)
    hud_y.style.bottom = js_dir.clientHeight
    hud_x.style.setProperty('left', `calc(${js_dir.clientWidth}px - ${hud_x.clientWidth}px)`)
  }
  
  let endStage = function() {
    console.log(`Killing the stage.`)
    
    // Notify everyone
    raiseEvent( main, events.outgoing.stage_kill )
    
    // Remove &
    js_dir.remove()
    js_aim.remove()
    hud_x.remove()
    hud_y.remove()
    hud_main.remove()
    
    // Reset
    js_dir   = undefined
    js_aim   = undefined
    hud_main = undefined
    hud_x = undefined
    hud_y = undefined
    
    // we remove main and reinject with state
    main.remove()
    main = undefined
    setTimeout(function() { initialise() }, 8000 )
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