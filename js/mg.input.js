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
      stage_start       : 'mgu-stage-start',
    },
    internal: {
    
    },
    outgoing: {
      input_key_movement: 'mgi-input-key-movement',
      input_key_action  : 'mgi-input-key-action',
      input_key_miscellaneous: 'mgi-input-key-misc',
    },
  }
  
  /* Memory */
  let body, main;
  /* Computational variables */

  
  let initialise = function() {
    body = qset('body')
    main = qset(`#${settings.app.id_tray}`)
    
    body.addEventListener('keypress', keyed)
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