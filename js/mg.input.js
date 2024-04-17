mg = typeof mg != 'undefined' ? mg : {}

mg.input = (function() {
  /* Meta variables */
  // let qset   = function( selector ) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  let qset       = mg.utilities.qselect
  let raiseEvent = mg.utilities.raiseEvent
  
  /* Module Settings & Events */
  let settings = {
    keys    : {
      movement: ['w','a','s','d','W','A','S','D'],
      actions : ['p','l','P','L'],
    },
    joystick: {
      maximum: 100,
    },
    app     : {
      id_tray   : 'mg-main',
      id_subtray: 'mg-submain',
    },
    canvas  : {
      show_xy   : 'mgx-show-xy',
      id_xy     : 'mgx-xy',
    },
  }
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
      selfDestruct: 'mgc-self-destruct',
      stage_start : 'mgu-stage-start',
      // Receive joystick
      joystick_dir: 'mgu-joystick-dir',
      joystick_aim: 'mgu-joystick-aim',
    },
    internal: {
    
    },
    outgoing: {
      input_key_movement: 'mgi-input-key-movement',
      input_key_action  : 'mgi-input-key-action',
      input_key_miscellaneous: 'mgi-input-key-misc',
      
      input_joystick_dir: `mgi-input-joystick-dir`,
      input_joystick_aim: `mgi-input-joystick-aim`,
    },
  }
  
  /* Memory */
  let body, main;
  /* Computational variables */

  
  let initialise = function() {
    body = qset('body')
    main = qset(`#${settings.app.id_tray}`)
    
    body.addEventListener('keypress', keyed)
    listen()
  }
  
  let listen = function() {
  
    // Joysticks
    main.addEventListener( events.incoming.joystick_dir, joystickDir )
    main.addEventListener( events.incoming.joystick_aim, joystickAim )
  }
  
  let joystickRotation = function(x, y) {
    let r = Math.atan2(y, x)
        r = r * 180 / Math.PI
        r -= 90
    if (r > 0) r -= 360
        r *= -1
    return (r * Math.PI) / 180
  }
  let joystickDir = function(e) { joystickInterpret(e.detail, 'dir') }
  let joystickAim = function(e) { joystickInterpret(e.detail, 'aim') }
  let joystickInterpret = function(datum, type) {
    let x  = parseInt(datum.x)
    let y  = parseInt(datum.y)
    let r  = joystickRotation(x, y)
    let len = Math.min( Math.sqrt(x*x + y*y), settings.joystick.maximum )
    let mx  = len * Math.cos(r + Math.PI/2) * -1
    let my  = len * Math.sin(r + Math.PI/2)
    let ev = events.outgoing['input_joystick_' + type]
    raiseEvent( main, ev, {x: mx, y: my, r: r, len: len, c: datum.cardinalDirection, xp: datum.xPosition, yp: datum.yPosition} )
  }
  
  let keyed = function(e) {
    let key = e.key
    
    if (settings.keys.movement.indexOf(key) != -1) {
      raiseEvent( body, events.outgoing.input_key_movement, key )
    } else if (settings.keys.actions.indexOf(key) != -1) {
      raiseEvent( body, events.outgoing.input_key_action, key )
    } else {
      raiseEvent( body, events.outgoing.input_key_miscellaneous, key )
    }
  }
  
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )

  return {
    init    : initialise,
    settings: function() { return settings },
  }
})()