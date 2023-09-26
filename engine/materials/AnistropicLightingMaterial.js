import * as THREE from '../../node_modules/three/src/Three.js'

const AnistropicLightingShader = 
{
    uniforms : 
    { 
        uDirLightPos:	{ type: "v3", value: new THREE.Vector3(-35, -0.5, 0) },
        uDirLightColor: { type: "c", value: new THREE.Color( 0xffffff ) },
        uAmbientLightColor: { type: "c", value: new THREE.Color( 0xffffff ) },
        uSpecularColor:  { type: "c", value: new THREE.Color( 0xffffff ) },
        uKd: { type: "f", value: 0.7 },
        uKs: { type: "f", value: 0.3 },
        shininess: { type: "f", value: 100.0 },
        uGroove: { type: "f", value: 1.0 },
        uDiffuseTexture: { type: "t", value: null }
    },
    vertexShader : 
    `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
    
        void main() 
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            vNormal = normalize( normalMatrix * normal );
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            vViewPosition = -mvPosition.xyz;
            vWorldPosition = position;
            vUv = uv;
        }
    `,
    fragmentShader : 
    ` 
        uniform vec3 uSpecularColor;
        uniform vec3 uDirLightPos;
        uniform vec3 uDirLightColor;
    
        uniform vec3 uAmbientLightColor;
    
        uniform float uKd;
        uniform float uKs;
        uniform float shininess;
    
        uniform float uGroove;

        uniform sampler2D uDiffuseTexture;
    
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
    
        void main() 
        {
            vec3 materialColor = texture2D(uDiffuseTexture, vUv).xyz;
            // ambient
            //gl_FragColor = vec4( uAmbientLightColor * materialColor, 1.0f );

            // compute direction to light
            vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0f );
            vec3 lVector = normalize( lDirection.xyz );
    
            vec3 normal = normalize( vNormal );
            
            // diffuse: N * L. Normal must be normalized, since it's interpolated.
            
            // solution: 
            for ( int i = 0; i < 2; i++) 
            {
                vec3 offset = (i==0) ? vWorldPosition : -vWorldPosition;
                offset.y = 0.0f;
                vec3 jiggledNormal = normalize( normal + uGroove * normalize( offset ) );
                float diffuse = max( dot( jiggledNormal, lVector ), 0.0f);
    
                // scale diffuse contribution down by half, since there are two normals
                //gl_FragColor.xyz += 0.5f * uKd * materialColor * uDirLightColor * diffuse;
                gl_FragColor.xyz += 0.5f * uKd * materialColor * uDirLightColor * diffuse;
            
                // specular: N * H to a power. H is light vector + view vector
                vec3 viewPosition = normalize( vViewPosition );
                vec3 pointHalfVector = normalize( lVector + viewPosition );
                float pointDotNormalHalf = max( dot( jiggledNormal, pointHalfVector ), 0.0f );
                float specular = uKs * pow( pointDotNormalHalf, shininess );
                specular *= (8.0f + shininess)/(8.0f*3.14159f);
    
                // This can give a hard termination to the highlight, but it's better than some weird sparkle.
                if (diffuse <= 0.0f) 
                    specular = 0.0f;
    
                // scale specular contribution down by half, since there are two normals
                //gl_FragColor.xyz += 0.5f * uDirLightColor * uSpecularColor * specular;
                gl_FragColor.xyz += 0.5f * materialColor * uSpecularColor * specular;
            }
        }
    `
}

export class AnistropicLightingMaterial extends THREE.ShaderMaterial
{
    constructor()
    {
        super({
            uniforms: AnistropicLightingShader.uniforms,
            vertexShader : AnistropicLightingShader.vertexShader,
            fragmentShader : AnistropicLightingShader.fragmentShader
        })
    }

    setDiffuseTexture(texture)
    {
        this.uniforms.uDiffuseTexture.value = texture
    }
}