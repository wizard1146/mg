mg = typeof mg != 'undefined' ? mg : {}

mg.data = (function() {
  /* Meta variables */
  let clone = mg.utilities.clone
  
  /* Module Settings & Events */
  
  /* Memory */
  
  /* Computational variables */

  let reference = {}
  
  reference.classes = []
  reference.magicks = ['Blood magic','Death magic','Psionic','Shadow magic']

  

  return {
    get: function(item) { return clone( reference[item] ) }
  }
})()