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
      size_max     : `180px`,
    },
    hud      : {
      width        : `40%`,
      height       : `13vmin`,
    },
    // ux
    
    // IDs
    id: {
      canvas_id_xy     : 'mgx-xy',
      joystick_dir     : 'mg-joystick-dir',
      joystick_point   : 'mg-joystick-aim',
      hud_main         : 'mg-hud-main',
      hud_x            : 'mg-hud-x',
      hud_y            : 'mg-hud-y',
      hud_coords_class : 'mg-hud-class-coords',
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
    .dev {
      border: 1px solid rgba( 255, 1, 1, 1 );
    }
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
    .bottom-middle {
      left     : 50%;
      bottom   : 0%;
      transform: translate( -50%, 0% );
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
    /* Colors & Effects */
    .translucent-white {
      background: rgba( 255, 255, 255, 0.04 );
    }
    .text-grey {
      color   : rgba( 67, 67, 89, 1.00 );
    }
    .backdrop-blur {
      backdrop-filter: blur(6px);
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
      max-width : ${settings.joysticks.size_max};
      max-height: ${settings.joysticks.size_max};
    }
    #${settings.id.joystick_dir},
    #${settings.id.joystick_point} {
    
    }
    
    /* HUD */
    #${settings.id.hud_main} {
      width  : ${settings.hud.width};
      height : ${settings.hud.height};
      border-top-left-radius : 12px;
      border-top-right-radius: 12px;
    }
    #${settings.id.hud_x},
    #${settings.id.hud_y} {
    
    }
    #${settings.id.hud_x} div,
    #${settings.id.hud_y} div {
      display: inline-block;
    }
    #${settings.id.hud_x} .value,
    #${settings.id.hud_y} .value {
    
    }
    .${settings.id.hud_coords_class} {
    
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