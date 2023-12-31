import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const DEBUG = false
const EXTENSION = '.png'
const TEXTURE_PATHS = ['assets/images/1'+EXTENSION, 'assets/images/2'+EXTENSION, 'assets/images/3'+EXTENSION, 
'assets/images/4'+EXTENSION, 'assets/images/5'+EXTENSION, 'assets/images/6'+EXTENSION]
const TEXTURES = []
const ENV_MAP = 'assets/images/envmap.webp'
const TEXTURE_BASE_KEY = 'texture'
const ENVMAP_KEY = 'envmap'
const MODEL_PATH = './assets/Dial0123_new.glb'
const MODEL_NAME = 'Watch'
                        //smaller dials          bigger dial
const MESH_NAMES = ['Dialc061_10108_123_1', 'Dialc061_10108_123_2']

const SMALLER_DIALS = 'Dialc061_10108_123_1'
const BIGGER_DIAL = 'Dialc061_10108_123_2'
const DIRECT_LIGHT_INTENSITY = 1
const AMBIENT_LIGHT_INTENSITY = 10
const LIGHT_SEPARATION = 5
const LIGHT_DISTANCE = 5
const GAMMA = 1.2
const PAN_SENSITIVITY = 0.01

let xrot = 0
let yrot = 0
let model
let lights = []
let imgElements = []
let smallDialMetalness = 0.96
let bigDialMetalness = 0.95
let numbersAndTextMetalness = 0.9
let ambient
let cameraManager

loadAssets()

window.onload = () => { fillupTextures(document.getElementById('color-menu')) }

function fillupTextures(textureContainer)
{
    for(let i=0; i<TEXTURE_PATHS.length; i++)
    {
        let imgElement = document.createElement('img')
        imgElement.className = 'color-item'
        imgElement.src = TEXTURE_PATHS[i]
        imgElement.addEventListener('click', ()=>{ onTextureClick(i) })
        textureContainer.appendChild(imgElement)
        imgElements.push(imgElement)
    }
}

function onTextureClick(index)
{
    if (model != undefined && TEXTURES.length > index)
        model.applyTextureOn(TEXTURES[index], MESH_NAMES)
    for (let i=0; i<imgElements.length; i++)
        imgElements[i].style.borderColor = (i == index) ? "rgb(25, 25, 112)" : "rgba(0, 0, 0, 0)"
}

function loadAssets()
{
    let loader = new ENGINE.AssetLoader()
    loader.addLoader(MODEL_NAME, MODEL_PATH, new GLTFLoader())
    for (let i=0; i<TEXTURE_PATHS.length; i++)
        loader.addLoader(TEXTURE_BASE_KEY+i, TEXTURE_PATHS[i], new THREE.TextureLoader())
    loader.addLoader(ENVMAP_KEY, ENV_MAP, new THREE.TextureLoader())
    loader.execute(p=>{}, onLoadComplete)
}

function onLoadComplete(assetMap)
{
    for (let i=0; i<TEXTURE_PATHS.length; i++)
        TEXTURES.push(assetMap.get(TEXTURE_BASE_KEY+i).clone())
    let canvas = document.querySelector('canvas#scene')
    let sceneManager = new ENGINE.SceneManager(canvas)
    sceneManager.setGamma(GAMMA)
    sceneManager.setSaturation(1)
    cameraManager = new ENGINE.StaticCameraManager('Camera', 50)
    cameraManager.setPosition(0, -0.75, 5)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    let input = new ENGINE.InputManager('Input', canvas)
    input.registerLMBMoveEvent(rotateModel)
    input.registerRMBMoveEvent(panCamera)
    input.registerMouseWheelEvent(onZoom)
    sceneManager.register(input)
    model = new ENGINE.MeshModel(MODEL_NAME, assetMap.get(MODEL_NAME), true)
    model.setPosition(0, -0.5, 0)
    model.setRotationOrder('XZY')
    yrot = 90
    model.setRotation(ENGINE.Maths.toRadians(yrot), 0, 0)
    model.setMetalness(numbersAndTextMetalness)
    model.setMetalnessOn(smallDialMetalness, [SMALLER_DIALS])
    model.setMetalnessOn(bigDialMetalness, [BIGGER_DIAL])
    model.applyEnvmap(assetMap.get(ENVMAP_KEY))
    sceneManager.register(model)
    sceneManager.setSaturation(1)
    let color = 0.1
    const LIGHT_COLOR = new THREE.Color(color, color, color)
    let front1 = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    front1.setPosition(-LIGHT_SEPARATION/2, -2, LIGHT_DISTANCE)
    front1.setLookAt(0, -0.75, 0)
    sceneManager.register(front1)
    lights.push(front1)
    let front2 = new ENGINE.DirectLight('DirectLightRight', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    front2.setPosition(LIGHT_SEPARATION/2, 2, LIGHT_DISTANCE)
    front2.setLookAt(0, -0.75, 0)
    sceneManager.register(front2)
    lights.push(front2)

    let left1 = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    left1.setPosition(-LIGHT_DISTANCE, 0, -LIGHT_SEPARATION/2)
    left1.setLookAt(0, -0.75, 0)
    sceneManager.register(left1)
    lights.push(left1)
    let left2 = new ENGINE.DirectLight('DirectLightRight', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    left2.setPosition(-LIGHT_DISTANCE, 0, LIGHT_SEPARATION/2)
    left2.setLookAt(0, -0.75, 0)
    sceneManager.register(left2)
    lights.push(left2)

    let right1 = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    right1.setPosition(LIGHT_DISTANCE, 0, -LIGHT_SEPARATION/2)
    right1.setLookAt(0, -0.75, 0)
    sceneManager.register(right1)
    lights.push(right1)
    let right2 = new ENGINE.DirectLight('DirectLightRight', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    right2.setPosition(LIGHT_DISTANCE, 0, LIGHT_SEPARATION/2)
    right2.setLookAt(0, -0.75, 0)
    sceneManager.register(right2)
    lights.push(right2)

    let top1 = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    top1.setPosition(-LIGHT_SEPARATION/2, LIGHT_DISTANCE, 0)
    top1.setLookAt(0, -0.75, 0)
    sceneManager.register(top1)
    lights.push(top1)
    let top2 = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    top2.setPosition(LIGHT_SEPARATION/2, LIGHT_DISTANCE, 0)
    top2.setLookAt(0, -0.75, 0)
    sceneManager.register(top2)
    lights.push(top2)

    let bottom1 = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    bottom1.setPosition(-LIGHT_SEPARATION/2, -LIGHT_DISTANCE, 0)
    bottom1.setLookAt(0, -0.75, 0)
    sceneManager.register(bottom1)
    lights.push(bottom1)
    let bottom2 = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, DIRECT_LIGHT_INTENSITY)
    bottom2.setPosition(LIGHT_SEPARATION/2, -LIGHT_DISTANCE, 0)
    bottom2.setLookAt(0, -0.75, 0)
    sceneManager.register(bottom2)
    lights.push(bottom2)

    ambient = new ENGINE.AmbientLight('AmbientLight', new THREE.Color(1, 1, 1), AMBIENT_LIGHT_INTENSITY)
    sceneManager.register(ambient)
    if (DEBUG)
        setupDebugUI(sceneManager)
    onTextureClick(5)
    document.body.removeChild(document.getElementById("loading-container"))
}

function rotateModel(dx, dy)
{
    if (model != undefined)
    {
        xrot += dx * 0.5
        yrot += dy * 0.5
        model.setRotation(ENGINE.Maths.toRadians(yrot), 0, ENGINE.Maths.toRadians(-xrot))
    }
}

function onZoom(scale)
{
    if (cameraManager != null)
    {    
        let fov = cameraManager.getFOV()
        cameraManager.setFOV(fov + scale)
    }
}

function panCamera(dx, dy, x, y)
{
    let position = cameraManager.getPosition()
    position.x += dx * PAN_SENSITIVITY
    position.y -= dy * PAN_SENSITIVITY
    cameraManager.setPosition(position.x, position.y, position.z)
}

function setupDebugUI(sceneManager)
{
    let debugUI = new ENGINE.DebugUI(document.getElementById('debug-ui-container'), 'Debug Menu')
    debugUI.addSlider('Left Light Target', 'x', 0, -1, 1, value => {
        let lookAt = lights[0].getLookAt()
        lookAt.x = value
        lights[0].setLookAt(lookAt.x, lookAt.y, lookAt.z)
    })
    debugUI.addSlider('Left Light Target', 'y', -0.5, -1, 1, value => {
        let lookAt = lights[0].getLookAt()
        lookAt.y = value
        lights[0].setLookAt(lookAt.x, lookAt.y, lookAt.z)
    })
    debugUI.addSlider('Left Light Target', 'z', 0, -1, 1, value => {
        let lookAt = lights[0].getLookAt()
        lookAt.z = value
        lights[0].setLookAt(lookAt.x, lookAt.y, lookAt.z)
    })
    debugUI.addSlider('Right Light Target', 'x', 0, -1, 1, value => {
        let lookAt = lights[1].getLookAt()
        lookAt.x = value
        lights[1].setLookAt(lookAt.x, lookAt.y, lookAt.z)
    })
    debugUI.addSlider('Right Light Target', 'y', -0.5, -1, 1, value => {
        let lookAt = lights[1].getLookAt()
        lookAt.y = value
        lights[1].setLookAt(lookAt.x, lookAt.y, lookAt.z)
    })
    debugUI.addSlider('Right Light Target', 'z', 0, -1, 1, value => {
        let lookAt = lights[1].getLookAt()
        lookAt.z = value
        lights[1].setLookAt(lookAt.x, lookAt.y, lookAt.z)
    })
    debugUI.addSlider('', 'Lights separation', LIGHT_SEPARATION, 0, 10, value => {
        let halfValue = value/2
        for (let i=0; i<lights.length; i++)
        {    
            let position = lights[i].getPosition()
            position.x = (i==0)?-halfValue:halfValue
            lights[i].setPosition(position.x, position.y, position.z)
        }
    })
    debugUI.addSlider('', 'Lights distance', LIGHT_DISTANCE, 0, 10, value => {
        for (let i=0; i<lights.length; i++)
        {    
            let position = lights[i].getPosition()
            position.z = value
            lights[i].setPosition(position.x, position.y, position.z)
        }
    })
    debugUI.addSlider('', 'Direct Light Intensity', DIRECT_LIGHT_INTENSITY, 0, 10, value => {
        for (let light of lights)
            light.setIntensity(value)
    })
    debugUI.addSlider('', 'Ambient Light Intensity', AMBIENT_LIGHT_INTENSITY, 0, 10, value => {
        ambient.setIntensity(value)
    })
    debugUI.addSlider('', 'Small Dial Metalness', smallDialMetalness, 0, 1, value => {
        smallDialMetalness = value
        if (model != undefined)
            model.setMetalnessOn(smallDialMetalness, [SMALLER_DIALS])
    })
    debugUI.addSlider('', 'Bigger Dial Metalness', bigDialMetalness, 0, 1, value => {
        bigDialMetalness = value
        if (model != undefined)
            model.setMetalnessOn(bigDialMetalness, [BIGGER_DIAL])
    })
    debugUI.addSlider('', 'Numbers and Text Metalness', numbersAndTextMetalness, 0, 1, value => {
        if (model != undefined)
        {    
            model.setMetalness(value)
            model.setMetalnessOn(smallDialMetalness, [SMALLER_DIALS])
            model.setMetalnessOn(bigDialMetalness, [BIGGER_DIAL])
        }
    })
    debugUI.addSlider('', 'Gamma', GAMMA, 0, 2.2, value => {
        sceneManager.setGamma(value)
    })
}