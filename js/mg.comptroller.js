mg = typeof mg != 'undefined' ? mg : {}

mg.comptroller = (function() {
  /* Meta variables */
  let qset   = function( selector ) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  let report = function( str ) { console.log( str ) }
  
  let events = {
    incoming: {
    
    },
    internal: {
    
    },
    outgoing: {
      initialise  : 'mgc-initialise',
      selfDestruct: 'mgc-self-destruct',
    },
  }
  
  /* Module Settings & Events */
  let settings = {
    moduleClassName: 'mg-script',
    modules: [
      'comptroller',
      'utilities',
      'constructs',
      'css',
      'data',
      'assets',
      'db',
      'engine',
      'ux',
      'canvas',
      'input',
    ],
  }
  
  /* Memory */
  
  /* Computational variables */
  let loadState = 0, loadLength = 0, loadStartTime = 0;

  
  let clear = function() {
    // send a self-destruct signal to all modules
    raiseEvent( qset('body'), events.outgoing.selfDestruct )
    // delete all module object
    settings.modules.forEach(module => {
      if (mg[module]) delete mg[module]
    })
    // empty "head"
    document.querySelectorAll( '.' + settings.moduleClassName ).forEach(s => s.remove())
  }
  
  let completeInitialisation = function() {
    let delta = new Date().getTime() - loadStartTime
    report(`Loading ${loadLength} files complete. Processing time: ${delta}ms`)
    // Post initialisation
    raiseEvent( qset('body'), events.outgoing.initialise )
  }
  
  let initialise = function(list) {
    // clone our loadList
    let loadList = list ? list : clone(settings.modules)
    
    // clear old scripts
    if (loadState === 0) clear(); loadStartTime = new Date().getTime();
    
    // perform some precomputations
    if (loadLength === 0 && loadList.length > 0) loadLength = loadList.length
    
    let h = qset('head')
    let f = function(e) {
      if (loadList.length > 0) { initialise(loadList) } else { completeInitialisation() }
    }
    let g = function(uri) { loadState++; report(`Loading ${uri}...`); let s = document.createElement('script'); s.src = uri; s.type = 'text/javascript'; s.className = settings.moduleClassName; s.addEventListener('load', f); h.appendChild(s) }
    
    // begin
    g(`js/mg.${loadList.shift()}.js`)
  }

  /* Helper functions */
  // Internal copy of clone() for our initial loadList (Copies any object deeply)
  let clone = function(obj) {
      let copy
      if (null == obj || 'object' != typeof obj) { return obj }
      if (obj instanceof String) { return (' ' + obj).slice(1) }  /* https://stackoverflow.com/a/31733628 */
      if (obj instanceof Date) { return new Date().setTime(obj.getTime()) }
      if (obj instanceof Array) {
         copy = []
         for (let i = 0; i < obj.length; i++) { copy[i] = clone(obj[i]) }
         return copy
      }
      if (obj instanceof Object) {
         copy = {}
         for (let attr in obj) { if (obj.hasOwnProperty(attr)) { copy[attr] = clone(obj[attr]) } }
         return copy
      }
      throw new Error('Unable to copy obj! Type not supported.')
  }  
  
  let raiseEvent = function(target, event, datum) { return target.dispatchEvent(new CustomEvent(event, {detail: datum})) };

  return {
    events: function() { return events },
    init  : initialise,
  }
})()