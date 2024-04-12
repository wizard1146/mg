mg = typeof mg != 'undefined' ? mg : {}

mg.db = (function() {
  /* Meta variables */
  let qset = mg.utilities.qselect
  
  /* Module Settings & Events */
  let settings = {
    dbName : 'mgdb',
    dbChars: 'characters',
    placeholders: {
      fieldTemplate: [
        {key: 'uuid', unique: true },
        {key: 'name', unique: false},
      ],
      keyPath: 'uuid',
    }
  }
  let events = {
    incoming: {
      initialise  : 'mgc-initialise',
    },
    internal: {
    
    },
    outgoing: {
    
    },
  }
  
  /* Memory */
  let db;
  /* Computational variables */


  // Initialise
  let initialise = async function(e, kp, f) {
    // window to delete database if corrupt
    
    // regular db load on initialise
    db = await loadDB( kp ? kp : null, f ? f : null )
    
    return db
  }
  
  // LoadDB
  let loadDB = async function(keypath, fields) {
    let kp = keypath ? keypath : settings.placeholders.keyPath
    let f  = fields  ? fields  : settings.placeholders.fieldTemplate
  
    return new Promise(async (res, rej) => {
      let r = window.indexedDB.open( settings.dbName )
      
      r.onerror = (e) => {
        rej( console.log('Error!') )
      }
      
      r.onsuccess = (e) => {
        res( e.target.result )
      }
      
      r.onupgradeneeded = (e) => {
        let os = e.target.result.createObjectStore( settings.dbChars, {keyPath: kp } )
        
        f.forEach((field, index) => {
          os.createIndex( field.key, field.key, {unique: field.unique} )
        })
      }
    })
  }
  
  // Operations
  let getCharacter = async function( uuid ) {
    return new Promise(async (res, rej) => {
      let t = await db.transaction([ settings.dbChars ])
      let s = t.objectStore( settings.dbChars )
      let r = s.get( uuid )
    
      r.onerror = (e) => {
        rej( new Error(`Unable to retrieve ${uuid}.`) )
      }
      
      r.onsuccess = (e) => {
        if (r.result) {
          res( r.result )
        } else {
          rej( new Error(`Unable to locate ${uuid}.`) )
        }
      }
    })
  }
  let writeCharacter = async function( data ) {
    return new Promise(async (res, rej) => {
      let t = await db.transaction([ settings.dbChars ], 'readwrite')
      let s = t.objectStore( settings.dbChars )
      let r = s.put( data )
      
      r.onerror = (e) => {
        rej( new Error(`Unable to write data: ${data}.`) )
      }
      r.onsuccess = (e) => {
        res( console.log(`Wrote data ${data}!`))
      }
    })
  }

  // Initialisation listener
  qset('body').addEventListener( events.incoming.initialise, initialise )
  
  return {
    load      : loadDB,
    char_get  : getCharacter,
    char_write: writeCharacter,
  }
})()