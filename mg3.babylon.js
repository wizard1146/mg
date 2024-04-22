

mg3 = typeof mg3 != 'undefined' ? mg3 : {}

mg3.engine = (function() {
  
  /* Meta Variables */

  /* Settings */
  let settings = {
    defaults: {
      camera: {
        alpha  : -Math.PI / 2,
        beta   :  Math.PI / 2.5,
        radius : 10,
        target : new BABYLON.Vector3( 0, 1, 0 ),

        wheelPrecision      : 11,
        rangeLowerProximity : 5,
        rangeHigherProximity: 135,
        startPosition       : new BABYLON.Vector3( -1.73, 2.37, 4.97 ),

        upperBetaLimit: Math.PI / 2.2,
        lowerBetaLimit: Math.PI / (Math.PI * 1.7),
        panningAxis   : new BABYLON.Vector3(1.1,0,-1.6),
        sensibilityX  : 2000,
        sensibilityY  : 2000,
      },
    },
  }

  /* Events */

  /* In-memory variables */
  let body, canvas, engine;

  /* Computational variables */


  let setup = function(size) {
    // some statics
    body = document.querySelector('body')

    // resize our canvas
    canvas = document.querySelector('canvas')
    canvas.height = size ? size : window.innerHeight
    canvas.width  = size ? size : window.innerWidth

    // create the engine
    engine = new BABYLON.Engine(canvas, false, {}, false)
    // visual
    engine.setHardwareScalingLevel(0.5)
    engine.resize()

    // prevent gltf files from auto-playing
    BABYLON.SceneLoader.OnPluginActivatedObservable.add((e) => {
      if (e.name === 'gltf' && e instanceof BABYLON.GLTFFileLoader) {
        e.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE
      }
    })
    
    // add event listeners
    window.addEventListener('resize', function() { engine.resize() })

  }
  
  let defaultScene = async function() {
    // generate scene
    let scene = await createScene()
    // animate
    engine.runRenderLoop(function() {
      scene.render()
    })
    // handler
    return scene
  }

  let createScene = function(options) {
    var scene = new BABYLON.Scene(engine)
    let c   = settings.defaults.camera
    let cam = {}
        cam.alpha  = options?.cameraAlpha  ? options?.cameraAlpha  : c.alpha
        cam.beta   = options?.cameraBeta   ? options?.cameraBeta   : c.beta
        cam.radius = options?.cameraRadius ? options?.cameraRadius : c.radius
        cam.target = options?.cameraTarget ? options?.cameraTarget : c.target
        cam.wp     = options?.cameraWheelPrecision  || c.wheelPrecision
        cam.lp     = options?.cameraLowerProximity  || c.rangeLowerProximity
        cam.hp     = options?.cameraHigherProximity || c.rangeHigherProximity
        cam.ub     = options?.cameraUpperBeta       || c.upperBetaLimit
        cam.lb     = options?.cameraLowerBeta       || c.lowerBetaLimit
        cam.pa     = options?.cameraPanningAxis     || c.panningAxis
        cam.sx     = options?.cameraSensibilityX    || c.sensibilityX
        cam.sy     = options?.cameraSensibilityY    || c.sensibilityY
        cam.sp     = options?.cameraStartPosition   || c.startPosition

    let camera = new BABYLON.ArcRotateCamera('viewport', cam.alpha, cam.beta, cam.radius, cam.target)
    
    // Attach camera to canvas
    camera.attachControl( canvas, true, false, 0 )
    // Adjust the camera movements
    scene.useRightHandedSystem = true
    // Camera target
    camera.setTarget( cam.target )
    // Wheel inputs
    camera.inputs.addMouseWheel()
    camera.wheelPrecision   = cam.wp
    // Restrict camera-to-target range
    camera.lowerRadiusLimit = cam.lp
    camera.upperRadiusLimit = cam.hp
    // Restrict camera to above ground level
    camera.upperBetaLimit   = cam.ub
    camera.lowerBetaLimit   = cam.lb
    // Restrict Y-axis movement to prevent compound movements allowing below-ground transposition
    camera.panningAxis      = cam.pa
    // Change the speed of rotation
    camera.angularSensibilityX = cam.sx
    camera.angularSensibilityY = cam.sy
    // Set starting position
    camera.position = cam.sp

    // All Light options
    let lightIntensity = options?.lightIntensity || 1

    // Set the Light
	let light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 4, 2), scene);
	light.diffuse  = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.specular = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.groundColor = new BABYLON.Color3(0, 0, 0);
    light.intensity = lightIntensity

    if (true) {
      // Central sphere for orientation
      if (false) {
        let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1, segments: 32}, scene);
        sphere.position.y = 1;
      }
      // Compass points for orientation
      let compass = [
        {name: 'north', color: BABYLON.Color3.Teal(),  x: 0,     y: -49.5},
        {name: 'east',  color: BABYLON.Color3.Red(),   x: 49.5,  y: 0},
        {name: 'south', color: BABYLON.Color3.Green(), x: 0,     y:  49.5},
        {name: 'west',  color: BABYLON.Color3.Blue(),  x: -49.5, y: 0},
      ]
      compass.forEach(point => {
        let p = BABYLON.MeshBuilder.CreateBox(point.name, {}, scene)
        p.position.x = point.x
        p.position.z = point.y
        let m = new BABYLON.StandardMaterial('material-for-' + point.name, scene)
        m.diffuseColor = point.color
        p.material = m
      })
      if (false) {
        const axes = new BABYLON.AxesViewer(scene, 5)
      }
    }
    ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
    ground.receiveShadows = true;
    // add akcb tag
    // ground.akcbTag = akcbGroundTag
    
    // Make a light
    const dirlight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1, -1, 0), scene);
    dirlight.position = new BABYLON.Vector3(0, 8, -11);
    // Shadow generator
    shadowGenerator = new BABYLON.ShadowGenerator(1024, dirlight);

    if (false) {
      engine.runRenderLoop(function() {
        camera.alpha += 0.001
      })
    }
    
    return scene
  }

  let reloadModel = async function(datum) {
    let asset = datum.detail
    let roots = scene.meshes.filter(item => item.id == '__root__')
    roots.forEach(root => { root.dispose() })

    model = await BABYLON.SceneLoader.LoadAssetContainerAsync( asset, undefined, scene, undefined, '.glb' )
    model.addAllToScene()

    let __root__ = scene.meshes.filter(item => item.id === '__root__')
    if (__root__.length > 0) { __root__ = __root__[0] }
    
    shadowGenerator.addShadowCaster( __root__, true )
  }

  let loadModel = async function(uri, payload) {
    let obj = await BABYLON.SceneLoader.ImportMeshAsync('', uri, '', scene)

    obj.meta = {}
    obj.meta.scale = 1

    obj._fx_scaleTo = function(scale) {
      obj.meta.scale = scale 
console.log(this.parent)
      this.meshes[0].scaling.scaleInPlace( obj.meta.scale )
    }

    if (payload?.scale) {
      obj._fx_scaleTo( payload.scale )
    }
  }

  return {
    setup       : setup,
    defaultScene: defaultScene, 
    loadModel   : loadModel,
    reloadModel : reloadModel,
  }
})()