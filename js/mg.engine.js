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
      rotation: 0,
    }
  }
  /* Computational variables */


  let initialise = function() {
    body = qset('body')
    
    body.addEventListener( events.incoming.injected_main, function() { main = qset(`#${settings.app.id_tray}`); listen() } )
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
    data.hero.rotation = datum.r
  }
  
  let heartbeat = function() {
  
  }
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )

  return {
    data: function() { return data },
  }
})()