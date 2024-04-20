mg = typeof mg != 'undefined' ? mg : {}

mg.assets = (function() {
  /* Meta variables */
  let clone = mg.utilities.clone
  
  let sprites   = {}
  let directory = {}
  
  directory.knight      = {}
  directory.knight.idle = {}
  directory.knight.walk = {}
  
  let animations = {
    knight: {
      idle: {key: 'idle', width: 256, height: 256, columns: 5, count: 17},
      walk: {key: 'walk', width: 256, height: 256, columns: 4, count: 11},
    }
  }
  Object.entries(animations.knight).forEach(([key,animation],index) => {
    let t = {}
        t.width   = animation.width
        t.height  = animation.height
        t.columns = animation.columns
        t.count   = animation.count
    let m = []
    let c = 0, r = 0;
    for (var i = 0; i < t.count - 1; i++) {
      c++
      if (c >= t.columns) {
        r++
        c = 0
      }
      m.push([ c*t.width, r*t.height, t.width, t.height ])
    }
    animations.knight[key]['matrix'] = m
  })
  
  let cardinals = ['SW','W','NW','N','NE','E','SE','S']
  cardinals.forEach((dir, index) => {
    directory.knight.idle['idle_' + dir] = { uri: 'Idle/Knight_Idle_dir' + (index + 1), animation: animations.knight.idle.matrix }
    directory.knight.walk['walk_' + dir] = { uri: 'Walk/Knight_Walk_dir' + (index + 1), animation: animations.knight.walk.matrix }
  })

  let load = function() {
    let clas = 'knight'
    let list = ['idle','walk']
    
    list.forEach(anim => {
      Object.entries( directory[clas][anim] ).forEach(([k,v], i) => {
        directory[clas][anim][k]['img'] = new Image()
        directory[clas][anim][k]['img'].src = 'assets/' + clas + '/' + v.uri + '.png'
        /*
        
        sprites[clas] = sprites[clas] || {}
        sprites[clas][k] = new Image()
        sprites[clas][k].src = 'assets/' + clas + '/' + v.uri + '.png'
        sprites[clas][k].onload = function() {
          console.log(sprites)
        }*/
      })
    })
  }

  return {
    load: load,
    data: function() { return directory },
  }
})()