import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

/**
 * jpg textures are brighter
 * png textures are darker
 */
const EXTENSION = '.png'//'.jpg'
const TEXTURE_PATHS = ['assets/images/1'+EXTENSION, 'assets/images/2'+EXTENSION, 'assets/images/3'+EXTENSION, 
'assets/images/4'+EXTENSION, 'assets/images/5'+EXTENSION, 'assets/images/6'+EXTENSION]
const TEXTURES = []
const NORMAL_MAP_PATHS = ['assets/images/normal_lines.png', 'assets/images/normal_plain.png']
const NORMAL_LINE_KEY = 'normal_line'
const NORMAL_PLAIN_KEY = 'normal_plain'
const TEXTURE_BASE_KEY = 'texture'
const MODEL_PATH = './assets/Dial0123_lines.glb'
//const MODEL_PATH = './assets/Dial0123.glb'
const MODEL_NAME = 'Watch'
                        //smaller dials          bigger dial
const MESH_NAMES = ['Dialc061_10108_123_1', 'Dialc061_10108_123_2']

const SMALLER_DIALS = 'Dialc061_10108_123_1'
const BIGGER_DIAL = 'Dialc061_10108_123_2'
const LIGHT_INTENSITY = 0.5//0.75

const X_OFFSET = 1000//800
const Y_OFFSET = 400
const Z_POSITION = 1500//1000

let xrot = 0
let yrot = 0
let model
let lights = []
let imgElements = []
let smallDialMetalness = 0.9
let bigDialMetalness = 0.9
let numbersAndTextMetalness = 0.85

let positionMap = new Map()
let lookAtMap = new Map()
let positions = []
let lookAts = []

//fillUpDataMaps()
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
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 50)
    cameraManager.setPosition(0, -0.5, 5)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')

    //setupFrontLights(sceneManager)
    //setupLeftLights(sceneManager)

    //setupFrontOffsetRightLights(sceneManager)
    //setupFrontOffsetLeftLights(sceneManager)

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
    //model.applyNormalmapOn(assetMap.get(NORMAL_LINE_KEY), [BIGGER_DIAL])
    sceneManager.register(model)

    /* let light1 = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), 10)
    light1.setPosition(0, -0.5, 1000)
    light1.setLookAt(0, -0.5, 0)
    sceneManager.register(light1)
    lights.push(light1) */

    let left = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY)
    left.setPosition(0-X_OFFSET, -0.5+Y_OFFSET, Z_POSITION)
    left.setLookAt(0, -0.5, 0)
    sceneManager.register(left)
    lights.push(left)


    let right = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY)
    right.setPosition(0+X_OFFSET, -0.5-Y_OFFSET, Z_POSITION)
    right.setLookAt(0, -0.5, 0)
    sceneManager.register(right)
    lights.push(right)

    let center = new ENGINE.DirectLight('DirectLight', new THREE.Color(1, 1, 1), 1)
    center.setPosition(0, -0.5, 1000)
    center.setLookAt(0, -0.5, 0)
    sceneManager.register(center)
    lights.push(center)

    setupDebugUI()
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

function setupDebugUI()
{
    let debugUI = new ENGINE.DebugUI(document.getElementById('debug-ui-container'), 'Debug Menu')
    debugUI.addSlider('', 'Light Intensity', LIGHT_INTENSITY, 0, 1, value => {
        for (let light of lights)
            light.setIntensity(value)
    })
    /* debugUI.addSlider('', 'Light Intensity', LIGHT_INTENSITY, 0, 10, value => {
        for (let light of lights)
            light.setIntensity(value)
    }) */
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
}

function setupFrontOffsetRightLights(sceneManager)
{
    /* let centerLight = new ENGINE.SpotLight('SpotLightCenter', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    centerLight.setPosition(0 + X_OFFSET, -0.5, Z_POSITION)
    centerLight.setLookAt(0, -0.5, 0)
    sceneManager.register(centerLight)
    lights.push(centerLight) */

    let leftLight = new ENGINE.SpotLight('SpotLightLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    leftLight.setPosition(-10 + X_OFFSET, -0.5, Z_POSITION)
    //leftLight.setLookAt(-10, -0.5, 0)
    leftLight.setLookAt(0, -0.5, 0)
    sceneManager.register(leftLight)
    lights.push(leftLight)

    /* let rightLight = new ENGINE.SpotLight('SpotLightRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    rightLight.setPosition(10 + X_OFFSET, -0.5, Z_POSITION)
    rightLight.setLookAt(10, -0.5, 0)
    sceneManager.register(rightLight)
    lights.push(rightLight) */

    /* let topLight = new ENGINE.SpotLight('SpotLightTop', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLight.setPosition(0 + X_OFFSET, 9.5, Z_POSITION)
    topLight.setLookAt(0, 9.5, 0)
    sceneManager.register(topLight)
    lights.push(topLight)

    let bottomLight = new ENGINE.SpotLight('SpotLightBottom', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLight.setPosition(0 + X_OFFSET, -10.5, Z_POSITION)
    bottomLight.setLookAt(0, -10.5, 0)
    sceneManager.register(bottomLight)
    lights.push(bottomLight)

    let topLeftLight = new ENGINE.SpotLight('SpotLightTopLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLeftLight.setPosition(-10 + X_OFFSET, 9.5, Z_POSITION)
    topLeftLight.setLookAt(-10, 9.5, 0)
    sceneManager.register(topLeftLight)
    lights.push(topLeftLight)

    let topRightLight = new ENGINE.SpotLight('SpotLightTopRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topRightLight.setPosition(10 + X_OFFSET, 9.5, Z_POSITION)
    topRightLight.setLookAt(10, 9.5, 0)
    sceneManager.register(topRightLight)
    lights.push(topRightLight)

    let bottomLeftLight = new ENGINE.SpotLight('SpotLightBottomLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLeftLight.setPosition(-10 + X_OFFSET, -10.5, Z_POSITION)
    bottomLeftLight.setLookAt(-10, -10.5, 0)
    sceneManager.register(bottomLeftLight)
    lights.push(bottomLeftLight)

    let bottomRightLight = new ENGINE.SpotLight('SpotLightBottomRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomRightLight.setPosition(10 + X_OFFSET, -10.5, Z_POSITION)
    bottomRightLight.setLookAt(10, -10.5, 0)
    sceneManager.register(bottomRightLight)
    lights.push(bottomRightLight) */
}

function setupFrontOffsetLeftLights(sceneManager)
{
    /* let centerLight = new ENGINE.SpotLight('SpotLightCenter', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    centerLight.setPosition(0 - X_OFFSET, -0.5, Z_POSITION)
    centerLight.setLookAt(0, -0.5, 0)
    sceneManager.register(centerLight)
    lights.push(centerLight)

    let leftLight = new ENGINE.SpotLight('SpotLightLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    leftLight.setPosition(-10 - X_OFFSET, -0.5, Z_POSITION)
    leftLight.setLookAt(-10, -0.5, 0)
    sceneManager.register(leftLight)
    lights.push(leftLight) */

    let rightLight = new ENGINE.SpotLight('SpotLightRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    rightLight.setPosition(10 - X_OFFSET, -0.5, Z_POSITION)
    //rightLight.setLookAt(10, -0.5, 0)
    rightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(rightLight)
    lights.push(rightLight)

    /* let topLight = new ENGINE.SpotLight('SpotLightTop', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLight.setPosition(0 - X_OFFSET, 9.5, Z_POSITION)
    topLight.setLookAt(0, 9.5, 0)
    sceneManager.register(topLight)
    lights.push(topLight)

    let bottomLight = new ENGINE.SpotLight('SpotLightBottom', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLight.setPosition(0 - X_OFFSET, -10.5, Z_POSITION)
    bottomLight.setLookAt(0, -10.5, 0)
    sceneManager.register(bottomLight)
    lights.push(bottomLight)

    let topLeftLight = new ENGINE.SpotLight('SpotLightTopLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLeftLight.setPosition(-10 - X_OFFSET, 9.5, Z_POSITION)
    topLeftLight.setLookAt(-10, 9.5, 0)
    sceneManager.register(topLeftLight)
    lights.push(topLeftLight)

    let topRightLight = new ENGINE.SpotLight('SpotLightTopRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topRightLight.setPosition(10 - X_OFFSET, 9.5, Z_POSITION)
    topRightLight.setLookAt(10, 9.5, 0)
    sceneManager.register(topRightLight)
    lights.push(topRightLight)

    let bottomLeftLight = new ENGINE.SpotLight('SpotLightBottomLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLeftLight.setPosition(-10 - X_OFFSET, -10.5, Z_POSITION)
    bottomLeftLight.setLookAt(-10, -10.5, 0)
    sceneManager.register(bottomLeftLight)
    lights.push(bottomLeftLight)

    let bottomRightLight = new ENGINE.SpotLight('SpotLightBottomRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomRightLight.setPosition(10 - X_OFFSET, -10.5, Z_POSITION)
    bottomRightLight.setLookAt(10, -10.5, 0)
    sceneManager.register(bottomRightLight)
    lights.push(bottomRightLight) */
}

function setupFrontLights(sceneManager)
{
    let centerLight = new ENGINE.SpotLight('SpotLightCenter', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
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
}

function setupLeftLights(sceneManager)
{
    let centerLight = new ENGINE.SpotLight('SpotLightCenter', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)    
    centerLight.setPosition(-40, -0.5, 0)
    centerLight.setLookAt(0, -0.5, 0)
    sceneManager.register(centerLight)
    lights.push(centerLight)

    let leftLight = new ENGINE.SpotLight('SpotLightLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    leftLight.setPosition(-40, -0.5, -10)
    leftLight.setLookAt(0, -0.5, -10)
    sceneManager.register(leftLight)
    lights.push(leftLight)

    let rightLight = new ENGINE.SpotLight('SpotLightRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    rightLight.setPosition(-40, -0.5, 10)
    rightLight.setLookAt(0, -0.5, 10)
    sceneManager.register(rightLight)
    lights.push(rightLight)

    let topLight = new ENGINE.SpotLight('SpotLightTop', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLight.setPosition(-40, 9.5, 0)
    topLight.setLookAt(0, 9.5, 0)
    sceneManager.register(topLight)
    lights.push(topLight)

    let bottomLight = new ENGINE.SpotLight('SpotLightBottom', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLight.setPosition(-40, -10.5, 0)
    bottomLight.setLookAt(0, -10.5, 0)
    sceneManager.register(bottomLight)
    lights.push(bottomLight)

    let topLeftLight = new ENGINE.SpotLight('SpotLightTopLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLeftLight.setPosition(-40, 9.5, -10)
    topLeftLight.setLookAt(0, 9.5, -10)
    sceneManager.register(topLeftLight)
    lights.push(topLeftLight)

    let topRightLight = new ENGINE.SpotLight('SpotLightTopRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topRightLight.setPosition(-40, 9.5, 10)
    topRightLight.setLookAt(0, 9.5, 10)
    sceneManager.register(topRightLight)
    lights.push(topRightLight)

    let bottomLeftLight = new ENGINE.SpotLight('SpotLightBottomLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLeftLight.setPosition(-40, -10.5, -10)
    bottomLeftLight.setLookAt(0, -10.5, -10)
    sceneManager.register(bottomLeftLight)
    lights.push(bottomLeftLight)

    let bottomRightLight = new ENGINE.SpotLight('SpotLightBottomRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomRightLight.setPosition(-40, -10.5, 10)
    bottomRightLight.setLookAt(0, -10.5, 10)
    sceneManager.register(bottomRightLight)
    lights.push(bottomRightLight)
}

function fillUpDataMaps()
{
    /* positionMap.set('centerLight', new THREE.Vector3(0, -0.5, 40))
    positionMap.set('leftLight', new THREE.Vector3(-10, -0.5, 40))
    positionMap.set('rightLight', new THREE.Vector3(10, -0.5, 40))
    positionMap.set('topLight', new THREE.Vector3(0, 9.5, 40))
    positionMap.set('bottomLight', new THREE.Vector3(0, -10.5, 40))
    positionMap.set('topLeftLight', new THREE.Vector3(-10, 9.5, 40))
    positionMap.set('topRightLight', new THREE.Vector3(10, 9.5, 40))
    positionMap.set('bottomLeftLight', new THREE.Vector3(-10, -10.5, 40))
    positionMap.set('bottomRightLight', new THREE.Vector3(10, -10.5, 40))

    lookAtMap.set('centerLight', new THREE.Vector3(0, -0.5, 0))
    lookAtMap.set('leftLight', new THREE.Vector3(-10, -0.5, 0))
    lookAtMap.set('rightLight', new THREE.Vector3(10, -0.5, 0))
    lookAtMap.set('topLight', new THREE.Vector3(0, 9.5, 0))
    lookAtMap.set('bottomLight', new THREE.Vector3(0, -10.5, 0))
    lookAtMap.set('topLeftLight', new THREE.Vector3(-10, 9.5, 0))
    lookAtMap.set('topRightLight', new THREE.Vector3(10, 9.5, 0))
    lookAtMap.set('bottomLeftLight', new THREE.Vector3(-10, -10.5, 0))
    lookAtMap.set('bottomRightLight', new THREE.Vector3(10, -10.5, 0)) */

    positions.push(new THREE.Vector3(-10, 9.5, 40))
    positions.push(new THREE.Vector3(0, 9.5, 40))
    positions.push(new THREE.Vector3(10, 9.5, 40))
    positions.push(new THREE.Vector3(-10, -0.5, 40))
    positions.push(new THREE.Vector3(0, -0.5, 40))
    positions.push(new THREE.Vector3(10, -0.5, 40))
    positions.push(new THREE.Vector3(-10, -10.5, 40))
    positions.push(new THREE.Vector3(0, -10.5, 40))
    positions.push(new THREE.Vector3(10, -10.5, 40))

    lookAts.push(new THREE.Vector3(-10, 9.5, 0))
    lookAts.push(new THREE.Vector3(0, 9.5, 0))
    lookAts.push(new THREE.Vector3(10, 9.5, 0))
    lookAts.push(new THREE.Vector3(-10, -0.5, 0))
    lookAts.push(new THREE.Vector3(0, -0.5, 0))
    lookAts.push(new THREE.Vector3(10, -0.5, 0))
    lookAts.push(new THREE.Vector3(-10, -10.5, 0))
    lookAts.push(new THREE.Vector3(0, -10.5, 0))
    lookAts.push(new THREE.Vector3(10, -10.5, 0))
}