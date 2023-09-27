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
loadAssets()

window.onload = () => { fillupTextures(document.getElementById('panel-texture-body')) }

function fillupTextures(textureContainer)
{
    for(let i=0; i<TEXTURE_PATHS.length; i++)
    {
        let imgElement = document.createElement('img')
        imgElement.className = 'panel-content'
        imgElement.src = TEXTURE_PATHS[i]
        imgElement.addEventListener('click', ()=>{onTextureClick(i)})
        textureContainer.appendChild(imgElement)
    }
}

function onTextureClick(index)
{
    if (model != undefined && TEXTURES.length > index)
        model.applyTextureOn(TEXTURES[index], MESH_NAMES)
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
    sceneManager.setSizeInPercent(0.8, 1)
    let cameraManager = new ENGINE.StaticCameraManager('Camera', 50)
    cameraManager.setPosition(0, -0.5, 5)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')

    const LIGHT_INTENSITY = 1
    let frontLight = new ENGINE.SpotLight('DirectLightFront', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontLight.setPosition(0, -0.5, 5)
    frontLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontLight)
    let leftLight = new ENGINE.SpotLight('DirectLightLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    leftLight.setPosition(-5, -0.5, 0)
    leftLight.setLookAt(0, -0.5, 0)
    sceneManager.register(leftLight)
    let rightLight = new ENGINE.SpotLight('DirectLightRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    rightLight.setPosition(5, -0.5, 0)
    rightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(rightLight)
    let topLight = new ENGINE.SpotLight('DirectLightTop', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLight.setPosition(0, 4.5, 0)
    topLight.setLookAt(0, -0.5, 0) 
    sceneManager.register(topLight)
    let bottomLight = new ENGINE.SpotLight('DirectLightBottom', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLight.setPosition(0, -5.5, 0)
    bottomLight.setLookAt(0, -0.5, 0)
    sceneManager.register(bottomLight)
    let topLeftLight = new ENGINE.SpotLight('DirectLightTopLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topLeftLight.setPosition(-5, 4.5, 0)
    topLeftLight.setLookAt(0, -0.5, 0) 
    sceneManager.register(topLeftLight)
    let topRightLight = new ENGINE.SpotLight('DirectLightTopRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    topRightLight.setPosition(5, 4.5, 0)
    topRightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(topRightLight)
    let bottomLeftLight = new ENGINE.SpotLight('DirectLightBottomLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomLeftLight.setPosition(-5, 5.5, 0)
    bottomLeftLight.setLookAt(0, -0.5, 0) 
    sceneManager.register(bottomLeftLight)
    let bottomRightLight = new ENGINE.SpotLight('DirectLightBottomRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    bottomRightLight.setPosition(5, 5.5, 0)
    bottomRightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(bottomRightLight)

    let frontLeftLight = new ENGINE.SpotLight('DirectLightFrontLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontLeftLight.setPosition(-2.5, -0.5, 2.5)
    frontLeftLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontLeftLight)
    let frontRightLight = new ENGINE.SpotLight('DirectLightFrontRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontRightLight.setPosition(2.5, -0.5, 2.5)
    frontRightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontRightLight)
    let frontTopLight = new ENGINE.SpotLight('DirectLightFrontTop', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontTopLight.setPosition(0, 2, 2.5)
    frontTopLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontTopLight)
    let frontBottomLight = new ENGINE.SpotLight('DirectLightFrontBottom', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontBottomLight.setPosition(0, -3, 2.5)
    frontBottomLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontBottomLight)

    let frontTopLeftLight = new ENGINE.SpotLight('DirectLightFrontTopLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontTopLeftLight.setPosition(-2.5, 2, 2.5)
    frontTopLeftLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontTopLeftLight)
    let frontTopRightLight = new ENGINE.SpotLight('DirectLightFrontTopRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontTopRightLight.setPosition(2.5, 2, 2.5)
    frontTopRightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontTopRightLight)
    let frontBottomLeftLight = new ENGINE.SpotLight('DirectLightFrontBottomLeft', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontBottomLeftLight.setPosition(-2.5, -3, 2.5)
    frontBottomLeftLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontBottomLeftLight)
    let frontBottomRightLight = new ENGINE.SpotLight('DirectLightFrontBottomRight', new THREE.Color(1, 1, 1), LIGHT_INTENSITY, 50, ENGINE.Maths.toRadians(120), 1)
    frontBottomRightLight.setPosition(2.5, -3, 2.5)
    frontBottomRightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontBottomRightLight)

    let input = new ENGINE.InputManager('Input', canvas)
    input.registerMoveEvent(RotateModel)
    sceneManager.register(input)
    model = new ENGINE.MeshModel(MODEL_NAME, assetMap.get(MODEL_NAME), true)
    model.setPosition(0, -0.5, 0)
    model.setRotationOrder('XZY')
    yrot = 90
    model.setRotation(ENGINE.Maths.toRadians(yrot), 0, 0)
    model.applyMaterialOn(new ENGINE.AnistropicLightingMaterial(), ['Dialc061_10108_123_2'])//MESH_NAMES
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