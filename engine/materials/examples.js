/*global THREE, requestAnimationFrame, Detector, dat */
THREE.ShaderTypes = {

    'phongBalanced' : {

        uniforms: {

            "uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
            "uDirLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },

            "uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },

            "uMaterialColor":  { type: "c", value: new THREE.Color( 0xffffff ) },
            "uSpecularColor":  { type: "c", value: new THREE.Color( 0xffffff ) },

            uKd: {
                type: "f",
                value: 0.7
            },
            uKs: {
                type: "f",
                value: 0.3
            },
            shininess: {
                type: "f",
                value: 100.0
            },
            uGroove: {
                type: "f",
                value: 1.0
            }
        },

        vertexShader: [

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",
            "varying vec3 vWorldPosition;",

            "void main() {",

                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "vNormal = normalize( normalMatrix * normal );",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vViewPosition = -mvPosition.xyz;",
                "vWorldPosition = position;",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform vec3 uMaterialColor;",
            "uniform vec3 uSpecularColor;",

            "uniform vec3 uDirLightPos;",
            "uniform vec3 uDirLightColor;",

            "uniform vec3 uAmbientLightColor;",
            
            "uniform float uKd;",
            "uniform float uKs;",
            "uniform float shininess;",

            "uniform float uGroove;",

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",
            "varying vec3 vWorldPosition;",

            "void main() {",

                // ambient
                "gl_FragColor = vec4( uAmbientLightColor * uMaterialColor, 1.0 );",

                // compute direction to light
                "vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
                "vec3 lVector = normalize( lDirection.xyz );",

                "vec3 normal = normalize( vNormal );",
                
                // diffuse: N * L. Normal must be normalized, since it's interpolated.
                
                // solution: 
                "for ( int i = 0; i < 2; i++) {",
                    "vec3 offset = (i==0) ? vWorldPosition : -vWorldPosition;",
                    "offset.y = 0.0;",
                    "vec3 jiggledNormal = normalize( normal + uGroove * normalize( offset ) );",
                    "float diffuse = max( dot( jiggledNormal, lVector ), 0.0);",

                    // scale diffuse contribution down by half, since there are two normals
                    "gl_FragColor.xyz += 0.5 * uKd * uMaterialColor * uDirLightColor * diffuse;",
                
                    // specular: N * H to a power. H is light vector + view vector
                    "vec3 viewPosition = normalize( vViewPosition );",
                    "vec3 pointHalfVector = normalize( lVector + viewPosition );",
                    "float pointDotNormalHalf = max( dot( jiggledNormal, pointHalfVector ), 0.0 );",
                    "float specular = uKs * pow( pointDotNormalHalf, shininess );",
                    "specular *= (8.0 + shininess)/(8.0*3.14159);",

                    // This can give a hard termination to the highlight, but it's better than some weird sparkle.
                    "if (diffuse <= 0.0) {",
                        "specular = 0.0;",
                    "}",

                    // scale specular contribution down by half, since there are two normals
                    "gl_FragColor.xyz += 0.5 * uDirLightColor * uSpecularColor * specular;",
                "}",

            "}"

        ].join("\n")

    }

    };

    if (!Detector.webgl) { Detector.addGetWebGLMessage(); }

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;

    var container, camera, scene, renderer;

    var cameraControls;

    var effectController;

    var clock = new THREE.Clock();

    var teapotSize = 600;

    var tess = 7, newTess = tess;

    var tessLevel = [2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32];
    var maxTessLevel = tessLevel.length - 1;

    var ambientLight, light;
    var teapot;
    var phongBalancedMaterial;

    init();
    animate();

    function init() {

        container = document.createElement('div');
        document.body.appendChild(container);

        // CAMERA

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 80000);
        camera.position.set(-400, 1250, -900);

        // LIGHTS

        ambientLight = new THREE.AmbientLight(0x333333); // 0.2

        light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(700, 3000, 1200);

        // RENDERER

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        renderer.setClearColorHex(0xAAAAAA, 1.0);

        container.appendChild(renderer.domElement);

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        // EVENTS

        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);

        // CONTROLS

        cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
        cameraControls.target.set(0, 0, 0);

        // MATERIALS
        // Note: setting per pixel off does not affect the specular highlight;
        // it affects only whether the light direction is recalculated each pixel.
        var materialColor = new THREE.Color();
        materialColor.setRGB(1.0, 0.8, 0.6);

        phongBalancedMaterial = createShaderMaterial("phongBalanced", light, ambientLight);
        phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);
        phongBalancedMaterial.side = THREE.DoubleSide;

        fillScene();

        // GUI

        setupGui();
    }

    function createShaderMaterial(id, light, ambientLight) {

        var shader = THREE.ShaderTypes[id];

        var u = THREE.UniformsUtils.clone(shader.uniforms);

        var vs = shader.vertexShader;
        var fs = shader.fragmentShader;

        var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

        material.uniforms.uDirLightPos.value = light.position;
        material.uniforms.uDirLightColor.value = light.color;

        material.uniforms.uAmbientLightColor.value = ambientLight.color;

        return material;

    }

    // EVENT HANDLERS

    function onWindowResize() {

        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

    }

    function onKeyDown(event) {

        switch (event.keyCode) {

            case 38: // up	
                newTess++; if (newTess > maxTessLevel) { newTess = maxTessLevel; }
                break;

            case 40: // down
                newTess--; if (newTess < 0) { newTess = 0; }
                break;
        }

    }

    function onKeyUp(event) {

        switch (event.keyCode) {

        }

    }

    function setupGui() {

        effectController = {

            shininess: 50.0,
            groove: 0.5,
            ka: 0.2,
            kd: 0.4,
            ks: 0.35,
            metallic: false,

            hue: 0.09,
            saturation: 0.46,
            value: 1.0,

            lhue: 0.04,
            lsaturation: 0.0,
            lvalue: 1.0,

            // bizarrely, if you initialize these with negative numbers, the sliders
            // will not show any decimal places.
            lx: 0.65,
            ly: 0.43,
            lz: 0.35,

            dummy: function () {
            }

        };

        var h;

        var gui = new dat.GUI();

        // material (attributes)

        h = gui.addFolder("Material control");

        h.add(effectController, "shininess", 1.0, 100.0, 1.0).name("shininess");
        h.add(effectController, "groove", 0.0, 2.0, 0.025).name("groove");
        h.add(effectController, "ka", 0.0, 1.0, 0.025).name("m_ka");
        h.add(effectController, "kd", 0.0, 1.0, 0.025).name("m_kd");
        h.add(effectController, "ks", 0.0, 1.0, 0.025).name("m_ks");
        h.add(effectController, "metallic");

        // material (color)

        h = gui.addFolder("Material color");

        h.add(effectController, "hue", 0.0, 1.0, 0.025).name("m_hue");
        h.add(effectController, "saturation", 0.0, 1.0, 0.025).name("m_saturation");
        h.add(effectController, "value", 0.0, 1.0, 0.025).name("m_value");

        // light (point)

        h = gui.addFolder("Light color");

        h.add(effectController, "lhue", 0.0, 1.0, 0.025).name("hue");
        h.add(effectController, "lsaturation", 0.0, 1.0, 0.025).name("saturation");
        h.add(effectController, "lvalue", 0.0, 1.0, 0.025).name("value");

        // light (directional)

        h = gui.addFolder("Light direction");

        h.add(effectController, "lx", -1.0, 1.0, 0.025).name("x");
        h.add(effectController, "ly", -1.0, 1.0, 0.025).name("y");
        h.add(effectController, "lz", -1.0, 1.0, 0.025).name("z");

    }

    //

    function animate() {

        requestAnimationFrame(animate);
        render();

    }

    function render() {

        var delta = clock.getDelta();

        cameraControls.update(delta);

        if (newTess !== tess ) {
            tess = newTess;

            fillScene();
        }

        phongBalancedMaterial.uniforms.shininess.value = effectController.shininess;
        phongBalancedMaterial.uniforms.uGroove.value = effectController.groove;
        phongBalancedMaterial.uniforms.uKd.value = effectController.kd;
        phongBalancedMaterial.uniforms.uKs.value = effectController.ks;

        var materialColor = new THREE.Color();
        materialColor.setHSV(effectController.hue, effectController.saturation, effectController.value);
        phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);

        if (!effectController.metallic) {
            materialColor.setRGB(1, 1, 1);
        }
        phongBalancedMaterial.uniforms.uSpecularColor.value.copy(materialColor);

        // Ambient's actually controlled by the light for this demo - TODO fix
        ambientLight.color.setHSV(effectController.hue, effectController.saturation, effectController.value * effectController.ka);

        light.position.set(effectController.lx, effectController.ly, effectController.lz);
        light.position.normalize();

        light.color.setHSV(effectController.lhue, effectController.lsaturation, effectController.lvalue);

        renderer.render(scene, camera);

    }

    function fillScene() {
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x808080, 2000, 4000);

        scene.add(camera);

        scene.add(ambientLight);
        scene.add(light);

        teapot = new THREE.Mesh(
            new THREE.TeapotGeometry(teapotSize, tessLevel[tess], false, true, false), phongBalancedMaterial);
        teapot.position.y = -teapotSize;

        scene.add(teapot);
    }