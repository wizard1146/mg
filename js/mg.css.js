mg = typeof mg != 'undefined' ? mg : {}

mg.css = (function() {
  /* Meta variables */
  let addCSS = mg.utilities.addCSS
  let qset   = function( selector ) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  
  /* Module Settings & Events */
  let settings = {
    // globals
    ruleIdentifier: 'mg-css-rules',
    
    // ui
    colors: {
      appBackground: `hsl(224deg,61%,13%)`,
    },
    joysticks: {
      size         : `50vmin`,
    },
    // ux
    
    id: {
      canvas_id_xy     : 'mgx-xy',
      joystick_dir     : 'mg-joystick-dir',
      joystick_point   : 'mg-joystick-aim',
    },
  }
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
      selfDestruct: 'mgc-self-destruct',
    },
    internal: {
    
    },
    outgoing: {
    
    },
  }
  
  /* Memory */
  
  /* Computational variables */

  
  let refresh = function() {
    let r = settings.ruleIdentifier
    // Remove previous CSS rules
    document.querySelectorAll( r ).forEach(e => e.remove())
    // Implement current CSS rules
    cssRules.forEach(rule => {
      addCSS( rule, r )
    })
  }
  
  let cssRules = [
    `
    :root {
      --app-background-color: ${settings.colors.appBackground};
    }
    body {
      background: var(--app-background-color);
    }
    `,
    `
    /* Shorthand classes */
    .absolute {
      position : absolute;
    }
    .fullscreen {
      width    : 100%;
      height   : 100%;
    }
    .center {
      position : absolute;
      left     : 50%;
      top      : 50%;
      transform: translate( -50%, -50% );
    }
    .top-left  {
      left     : 0%;
      top      : 0%;
    }
    .top-right {
      right    : 0%;
      top      : 0%;
    }
    .right {
      right    : 0%;
    }
    .left {
      left     : 0%;
    }
    .bottom-right {
      right    : 0%;
      bottom   : 0%;
    }
    .bottom-left {
      left     : 0%;
      bottom   : 0%;
    }
    .text-right {
      text-align: right;
    }
    `,
    ` 
    /* Core Elements */
    #mg-main, #mg-submain {
      position: absolute;
      left    : 0%;
      top     : 0%;
      height  : 100%;
      width   : 100%;
    }
    
    /* Canvas */
    #mg-canvas {

    }
    #${settings.id.canvas_id_xy} {
      padding-left  : 1.1vmin;
      padding-bottom: 0.8vmin;
      padding-top   : 0.5vmin;
      padding-right : 0.5vmin;
      border-bottom-left-radius: 6px;
      min-width : 8ch;
      color     : rgba( 231, 231, 231, 0.33 );
      background: rgba( 255, 255, 255, 0.03 );
    }
    
    #${settings.id.canvas_id_xy} div {
      display       : flex;
      flex-direction: row;
    }
    #${settings.id.canvas_id_xy} div div {
      white-space   : pre-wrap;
    }
    #${settings.id.canvas_id_xy}-X-value,
    #${settings.id.canvas_id_xy}-Y-value {
      right    : calc(0% + 1.5ch);
    }
    
    /* Joysticks */
    #${settings.id.joystick_dir},
    #${settings.id.joystick_point} {
      width    : ${settings.joysticks.size};
      height   : ${settings.joysticks.size};
    }
    #${settings.id.joystick_dir},
    #${settings.id.joystick_point} {
    
    }
    `,
  ]
  
  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, refresh )

  return {
    init    : refresh,
    refresh : refresh,
    settings: function() { return settings },
  }
})()