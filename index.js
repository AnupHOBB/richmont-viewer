import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const EXTENSION = '.png'
const TEXTURE_PATHS = ['assets/images/1'+EXTENSION, 'assets/images/2'+EXTENSION, 'assets/images/3'+EXTENSION, 
'assets/images/4'+EXTENSION, 'assets/images/5'+EXTENSION, 'assets/images/6'+EXTENSION]
const TEXTURES = []
const NORMAL_MAP_PATHS = ['assets/images/normal_lines.png', 'assets/images/normal_plain.png']
const NORMAL_LINE_KEY = 'normal_line'
const NORMAL_PLAIN_KEY = 'normal_plain'
const TEXTURE_BASE_KEY = 'texture'
const MODEL_PATH = './assets/Dial0123_lines.glb'

const MODEL_NAME = 'Watch'
                        //smaller dials          bigger dial
const MESH_NAMES = ['Dialc061_10108_123_1', 'Dialc061_10108_123_2']

const SMALLER_DIALS = 'Dialc061_10108_123_1'
const BIGGER_DIAL = 'Dialc061_10108_123_2'
const RADIAL_LIGHT_INTENSITY = 0.25
const MAIN_LIGHT_INTENSITY = 5

const X_OFFSET = 900
const Y_OFFSET = 400
const Z_POSITION = 1000

let xrot = 0
let yrot = 0
let model
let lights = []
let imgElements = []
let smallDialMetalness = 0.95
let bigDialMetalness = 0.85
let numbersAndTextMetalness = 0.85
let center

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
    loader.addLoader(NORMAL_LINE_KEY, NORMAL_MAP_PATHS[0], new THREE.TextureLoader())
    loader.addLoader(NORMAL_PLAIN_KEY, NORMAL_MAP_PATHS[1], new THREE.TextureLoader())
    loader.execute(p=>{}, onLoadComplete)
}

function onLoadComplete(assetMap)
{
    for (let i=0; i<TEXTURE_PATHS.length; i++)
        TEXTURES.push(assetMap.get(TEXTURE_BASE_KEY+i).clone())
    let canvas = document.querySelector('canvas#scene')
    let sceneManager = new ENGINE.SceneManager(canvas)
    sceneManager.setSizeInPercent(1, 0.9)
    sceneManager.setGamma(1)
    sceneManager.setSaturation(1)
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 50)
    cameraManager.setPosition(0, -0.5, 5)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    let input = new ENGINE.InputManager('Input', canvas)
    input.registerMoveEvent(rotateModel)
    sceneManager.register(input)
    model = new ENGINE.MeshModel(MODEL_NAME, assetMap.get(MODEL_NAME), true)
    model.setPosition(0, -0.5, 0)
    model.setRotationOrder('XZY')
    yrot = 90
    model.setRotation(ENGINE.Maths.toRadians(yrot), 0, 0)
    model.setMetalness(numbersAndTextMetalness)
    model.setMetalnessOn(smallDialMetalness, [SMALLER_DIALS])
    model.setMetalnessOn(bigDialMetalness, [BIGGER_DIAL])
    sceneManager.register(model)
    sceneManager.setSaturation(1)
    let color = 0.25
    const LIGHT_COLOR = new THREE.Color(color, color, color)
    let left = new ENGINE.DirectLight('DirectLightLeft', LIGHT_COLOR, RADIAL_LIGHT_INTENSITY)
    left.setPosition(0-X_OFFSET, -0.5+Y_OFFSET, Z_POSITION)
    left.setLookAt(0, -0.5, 0)
    sceneManager.register(left)
    lights.push(left)
    let right = new ENGINE.DirectLight('DirectLightRight', LIGHT_COLOR, RADIAL_LIGHT_INTENSITY)
    right.setPosition(0+X_OFFSET, -0.5-Y_OFFSET, Z_POSITION)
    right.setLookAt(0, -0.5, 0)
    sceneManager.register(right)
    lights.push(right)
    center = new ENGINE.DirectLight('DirectLightCenter', new THREE.Color(1, 1, 1), MAIN_LIGHT_INTENSITY)//1)
    center.setPosition(0, -0.5, 1000)
    center.setLookAt(0, -0.5, 0)
    sceneManager.register(center)
    setupDebugUI(sceneManager)
    onTextureClick(5)
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

function setupDebugUI(sceneManager)
{
    let debugUI = new ENGINE.DebugUI(document.getElementById('debug-ui-container'), 'Debug Menu')
    debugUI.addSlider('', 'Radial Light Intensity', RADIAL_LIGHT_INTENSITY, 0, 1, value => {
        for (let light of lights)
            light.setIntensity(value)
    })
    debugUI.addSlider('', 'Center Light Intensity', MAIN_LIGHT_INTENSITY, 0, 10, value => {
        center.setIntensity(value)
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
    debugUI.addSlider('', 'Gamma', 1, 0, 2.2, value => {
        sceneManager.setGamma(value)
    })
}