import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const EXTENSION = '.jpg'//'.png'
const TEXTURE_PATHS = ['assets/images/1'+EXTENSION, 'assets/images/2'+EXTENSION, 'assets/images/3'+EXTENSION, 
'assets/images/4'+EXTENSION, 'assets/images/5'+EXTENSION, 'assets/images/6'+EXTENSION]
const TEXTURES = []
const TEXTURE_BASE_KEY = 'texture'
const MODEL_PATH = './assets/Dial0123.glb'
//const MODEL_PATH = './assets/Richemont_Dial_Test.glb'
const MODEL_NAME = 'Watch'
                        //smaller dials          bigger dial
const MESH_NAMES = ['Dialc061_10108_123_1', 'Dialc061_10108_123_2']
let xrot = 0
let yrot = 0
let model
let imgElements = []
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
    const LIGHT_INTENSITY = 1
    let frontLeftLight = new ENGINE.SpotLight('DirectLightFrontLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontLeftLight.setPosition(-4, -0.5, 2.5)
    frontLeftLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontLeftLight)
    let frontRightLight = new ENGINE.SpotLight('DirectLightFrontRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontRightLight.setPosition(4, -0.5, 2.5)
    frontRightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontRightLight)
    let frontTopLight = new ENGINE.SpotLight('DirectLightFrontTop', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontTopLight.setPosition(0, 3.5, 2.5)
    frontTopLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontTopLight)
    let frontBottomLight = new ENGINE.SpotLight('DirectLightFrontBottom', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontBottomLight.setPosition(0, -4.5, 2.5)
    frontBottomLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontBottomLight)
    let input = new ENGINE.InputManager('Input', canvas)
    input.registerMoveEvent(RotateModel)
    sceneManager.register(input)
    model = new ENGINE.MeshModel(MODEL_NAME, assetMap.get(MODEL_NAME), true)
    model.setPosition(0, -0.5, 0)
    model.setRotationOrder('XZY')
    yrot = 90
    model.setRotation(ENGINE.Maths.toRadians(yrot), 0, 0)
    model.setMetalness(0.9)
    sceneManager.register(model)
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