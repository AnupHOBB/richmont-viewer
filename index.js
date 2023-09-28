import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const EXTENSION = '.png'//'.jpg'
const TEXTURE_PATHS = ['assets/images/1'+EXTENSION, 'assets/images/2'+EXTENSION, 'assets/images/3'+EXTENSION, 
'assets/images/4'+EXTENSION, 'assets/images/5'+EXTENSION, 'assets/images/6'+EXTENSION]
const TEXTURES = []
const TEXTURE_BASE_KEY = 'texture'
const MODEL_PATH = './assets/Dial0123.glb'
//const MODEL_PATH = './assets/Richemont_Dial_Test.glb'
const MODEL_NAME = 'Watch'
                        //smaller dials          bigger dial
const MESH_NAMES = ['Dialc061_10108_123_1', 'Dialc061_10108_123_2']

const SMALLER_DIALS = 'Dialc061_10108_123_1'
const BIGGER_DIAL = 'Dialc061_10108_123_2'
const LIGHT_INTENSITY = 5//0.25

let xrot = 0
let yrot = 0
let model
let lights = []
let imgElements = []
let smallDialMetalness = 0.4
let bigDialMetalness = 0.4
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
    loader.execute(p=>{}, onLoadComplete)
}

function onLoadComplete(assetMap)
{
    for (let i=0; i<TEXTURE_PATHS.length; i++)
        TEXTURES.push(assetMap.get(TEXTURE_BASE_KEY+i).clone())
    let canvas = document.querySelector('canvas#scene')
    let sceneManager = new ENGINE.SceneManager(canvas)
    sceneManager.setSizeInPercent(1, 0.9)
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 50)
    cameraManager.setPosition(0, -0.5, 5)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')

    let centerLight = new ENGINE.SpotLight('DirectLightFrontLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    centerLight.setPosition(0, -0.5, 40)
    centerLight.setLookAt(0, -0.5, 0)
    sceneManager.register(centerLight)
    lights.push(centerLight)

    let leftLight = new ENGINE.SpotLight('SpotLightLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    leftLight.setPosition(-10, -0.5, 40)
    leftLight.setLookAt(-10, -0.5, 0)
    sceneManager.register(leftLight)
    lights.push(leftLight)

    let rightLight = new ENGINE.SpotLight('SpotLightRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    rightLight.setPosition(10, -0.5, 40)
    rightLight.setLookAt(10, -0.5, 0)
    sceneManager.register(rightLight)
    lights.push(rightLight)

    let topLight = new ENGINE.SpotLight('SpotLightTop', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLight.setPosition(0, 9.5, 40)
    topLight.setLookAt(0, 9.5, 0)
    sceneManager.register(topLight)
    lights.push(topLight)

    let bottomLight = new ENGINE.SpotLight('SpotLightBottom', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLight.setPosition(0, -10.5, 40)
    bottomLight.setLookAt(0, -10.5, 0)
    sceneManager.register(bottomLight)
    lights.push(bottomLight)

    let topLeftLight = new ENGINE.SpotLight('SpotLightTopLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLeftLight.setPosition(-10, 9.5, 40)
    topLeftLight.setLookAt(-10, 9.5, 0)
    sceneManager.register(topLeftLight)
    lights.push(topLeftLight)

    let topRightLight = new ENGINE.SpotLight('SpotLightTopRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topRightLight.setPosition(10, 9.5, 40)
    topRightLight.setLookAt(10, 9.5, 0)
    sceneManager.register(topRightLight)
    lights.push(topRightLight)

    let bottomLeftLight = new ENGINE.SpotLight('SpotLightBottomLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLeftLight.setPosition(-10, -10.5, 40)
    bottomLeftLight.setLookAt(-10, -10.5, 0)
    sceneManager.register(bottomLeftLight)
    lights.push(bottomLeftLight)

    let bottomRightLight = new ENGINE.SpotLight('SpotLightBottomRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomRightLight.setPosition(10, -10.5, 40)
    bottomRightLight.setLookAt(10, -10.5, 0)
    sceneManager.register(bottomRightLight)
    lights.push(bottomRightLight)

    let input = new ENGINE.InputManager('Input', canvas)
    input.registerMoveEvent(RotateModel)
    sceneManager.register(input)
    model = new ENGINE.MeshModel(MODEL_NAME, assetMap.get(MODEL_NAME), true)
    model.setPosition(0, -0.5, 0)
    model.setRotationOrder('XZY')
    yrot = 90
    model.setRotation(ENGINE.Maths.toRadians(yrot), 0, 0)
    model.setMetalness(1)
    model.setMetalnessOn(smallDialMetalness, [SMALLER_DIALS])
    model.setMetalnessOn(bigDialMetalness, [BIGGER_DIAL])
    sceneManager.register(model)
    setupDebugUI()
    onTextureClick(5)
}

function RotateModel(dx, dy)
{
    if (model != undefined)
    {
        xrot += dx * 0.5
        yrot += dy * 0.5
        model.setRotation(ENGINE.Maths.toRadians(yrot), 0, ENGINE.Maths.toRadians(-xrot))
    }
}

function setupDebugUI()
{
    let debugUI = new ENGINE.DebugUI(document.getElementById('debug-ui-container'), 'Debug Menu')
    debugUI.addSlider('', 'Light Intensity', LIGHT_INTENSITY, 0, 10, value => {
        for (let light of lights)
            light.setIntensity(value)
    })
    debugUI.addSlider('', 'Small Dial Metalness', 0.4, 0, 1, value => {
        smallDialMetalness = value
        if (model != undefined)
            model.setMetalnessOn(smallDialMetalness, [SMALLER_DIALS])
    })
    debugUI.addSlider('', 'Bigger Dial Metalness', 0.4, 0, 1, value => {
        bigDialMetalness = value
        if (model != undefined)
            model.setMetalnessOn(bigDialMetalness, [BIGGER_DIAL])
    })
    debugUI.addSlider('', 'Numbers and Text Metalness', 1, 0, 1, value => {
        if (model != undefined)
        {    
            model.setMetalness(value)
            model.setMetalnessOn(smallDialMetalness, [SMALLER_DIALS])
            model.setMetalnessOn(bigDialMetalness, [BIGGER_DIAL])
        }
    })
}