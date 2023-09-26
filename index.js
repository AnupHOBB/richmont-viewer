import * as THREE from './node_modules/three/src/Three.js'
import * as ENGINE from './engine/Engine.js'
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const COLORS = [{r:0, g:139, b:139}, {r:100, g:149, b:237}, {r:205, g:92, b:92}, {r:95, g:158, b:160}, {r:255, g:99, b:71}, 
{r:220, g:20, b:60}, {r:255, g:255, b:0}, {r:128, g:128, b:0}, {r:0, g:128, b:128}, {r:238, g:130, b:238}, {r:165, g:42, b:42}, 
{r:255, g:215, b:0}]
const TEXTURE_PATHS = ['assets/images/1.png', 'assets/images/2.png', 'assets/images/3.png', 'assets/images/4.png', 'assets/images/5.png', 'assets/images/6.png']
const TEXTURES = []
const TEXTURE_BASE_KEY = 'texture'
const MODEL_PATH = './assets/Richemont_Dial_Test.glb'
const MODEL_NAME = 'Watch'
const MESH_NAMES = ['Dialc061_10108_123_1', 'Dialc061_10108_123_2']
let xrot = 0
let yrot = 0
let model
loadAssets()

window.onload = () => 
{
    fillupTextures(document.getElementById('panel-texture-body'))
    //fillupColors(document.getElementById('panel-color-body'))
}

function fillupColors(colorContainer)
{
    for(let i=0; i<COLORS.length; i++)
    {
        let divElement = document.createElement('div')
        divElement.className = 'panel-content'
        divElement.style.backgroundColor = 'rgb('+COLORS[i].r+', '+COLORS[i].g+', '+COLORS[i].b+')'
        divElement.addEventListener('click', ()=>{onColorClick(i)})
        colorContainer.appendChild(divElement)
    }
}

function onColorClick(index)
{
    if (model != undefined)
        model.applyColor(new THREE.Color(COLORS[index].r/255, COLORS[index].g/255, COLORS[index].b/255))
}

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

    let leftLight = new ENGINE.DirectLight('DirectLightLeft', new THREE.Color(1, 1, 1), 0.25)
    leftLight.setPosition(-35, -0.5, 0)
    leftLight.setLookAt(0, -0.5, 0)
    sceneManager.register(leftLight)
    let rightLight = new ENGINE.DirectLight('DirectLightRight', new THREE.Color(1, 1, 1), 0.25)
    rightLight.setPosition(35, -0.5, 0)
    rightLight.setLookAt(0, -0.5, 0)
    sceneManager.register(rightLight)
    let frontLight = new ENGINE.DirectLight('DirectLightCenter', new THREE.Color(1, 1, 1), 0.25)
    frontLight.setPosition(0, -0.5, 50)
    frontLight.setLookAt(0, -0.5, 0)
    sceneManager.register(frontLight)
    let topLight = new ENGINE.DirectLight('DirectLightTop', new THREE.Color(1, 1, 1), 0.25)
    topLight.setPosition(0, 34.5, 0)
    topLight.setLookAt(0, -0.5, 0)
    sceneManager.register(topLight)
    let bottomLight = new ENGINE.DirectLight('DirectLightBottom', new THREE.Color(1, 1, 1), 0.25)
    bottomLight.setPosition(0, -35.5, 0)
    bottomLight.setLookAt(0, -0.5, 0)
    sceneManager.register(bottomLight)
    let rearLight = new ENGINE.DirectLight('DirectLightRear', new THREE.Color(1, 1, 1), 0.25)
    rearLight.setPosition(0, -0.5, -50)
    rearLight.setLookAt(0, -0.5, 0)
    sceneManager.register(rearLight)

    let input = new ENGINE.InputManager('Input', canvas)
    input.registerMoveEvent(RotateModel)
    sceneManager.register(input)
    model = new ENGINE.MeshModel(MODEL_NAME, assetMap.get(MODEL_NAME), true)
    model.setPosition(0, -0.5, 0)
    model.setRotationOrder('XZY')
    yrot = 90
    model.setRotation(ENGINE.Maths.toRadians(yrot), 0, 0)
    model.applyMaterialOn(new ENGINE.AnistropicLightingMaterial(), MESH_NAMES)
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