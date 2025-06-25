<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf, useDraco } from "@threlte/extras";
    import { PointLight, TextureLoader } from "three";
    import { useLoader } from "@threlte/core";
    import { writable } from 'svelte/store';

    let { fallback, error, children, ref = $bindable(), ...props } = $props();
    let meshRef = null;
    const dracoLoader = useDraco();
    const portalGltf = useGltf("/model/portal.glb", { dracoLoader });

    const floorTexture = useLoader(TextureLoader).load(
        "/textures/floor/seaside_rock_diff_4k.jpg",
    );
    const floorNormalTexture = useLoader(TextureLoader).load(
        "/textures/floor/seaside_rock_nor_gl_4k.jpg",
    );

    portalGltf.then((portalGltf) => {
        console.log("portalGltf", portalGltf);
    });

   
    // Vertex shader
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `

    // Fragment shader - the magic happens here
    const fragmentShader = `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uOpacity;
        uniform float uCloudDensity;
        uniform float uCloudSpeed;
        uniform float uTwirlStrength;
        uniform float uRiseSpeed;
        uniform float uEmissionStrength;
        uniform vec3 uEmissionColor;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Simple noise function
        float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        // Smooth noise
        float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        // Fractal Brownian Motion for more complex noise
        float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 0.0;
        
        for (int i = 0; i < 4; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
        }
        return value;
        }
        
        void main() {
        vec2 st = vUv;
        
        // Create twirl effect - distance from center affects rotation
        vec2 center = vec2(0.5, 0.3); // Offset center downward for bottom-heavy effect
        float distFromCenter = distance(st, center);
        float angle = uTime * uTwirlStrength + distFromCenter * 2.0;
        
        // Apply twirl transformation
        vec2 twirlOffset = vec2(
            cos(angle) * distFromCenter * 0.1,
            sin(angle) * distFromCenter * 0.1
        );
        
        // Rising motion - clouds move upward and disperse
        float riseOffset = uTime * uRiseSpeed;
        vec2 risingUV = st + vec2(0.0, -riseOffset);
        
        // Apply twirl to the rising coordinates
        risingUV += twirlOffset;
        
        // Create multiple layers of moving clouds with different behaviors
        vec2 cloud1 = risingUV + vec2(uTime * uCloudSpeed * 0.1, 0.0);
        vec2 cloud2 = risingUV + vec2(-uTime * uCloudSpeed * 0.08, uTime * uCloudSpeed * 0.02);
        vec2 cloud3 = risingUV + vec2(uTime * uCloudSpeed * 0.06, -uTime * uCloudSpeed * 0.04);
        
        // Sample noise at different scales
        float noise1 = fbm(cloud1 * 2.0);
        float noise2 = fbm(cloud2 * 3.5);
        float noise3 = fbm(cloud3 * 5.0);
        
        // Combine the noise layers
        float cloudMask = (noise1 + noise2 * 0.6 + noise3 * 0.3) / 1.9;
        
        // Add spiral swirling motion
        float spiral = sin(distFromCenter * 6.0 - uTime * 2.0) * 0.1;
        cloudMask += spiral;
        
        // Create bottom-heavy fuming effect
        float bottomWeight = 1.0 - smoothstep(0.0, 0.7, st.y);
        bottomWeight = pow(bottomWeight, 1.5);
        
        // Enhance clouds at the bottom
        cloudMask += bottomWeight * 0.3;
        
        // Create color mixing - uColor1 is main, uColor2 is trails/edges
        float cloudDensity = smoothstep(0.3, 0.8, cloudMask);
        vec3 color = mix(uColor2, uColor1, cloudDensity);
        
        // Add subtle edge trails with color2
        float edgeTrails = smoothstep(0.1, 0.4, cloudMask) - smoothstep(0.4, 0.7, cloudMask);
        color = mix(color, uColor2, edgeTrails * 0.5);
        
        // Add emission glow based on cloud density and movement
        float emissionMask = smoothstep(0.4, 0.9, cloudMask);
        
        // Create pulsing emission effect
        float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
        float emissionIntensity = emissionMask * uEmissionStrength * (0.7 + pulse * 0.3);
        
        // Mix emission color with base color
        vec3 emission = uEmissionColor * emissionIntensity;
        color += emission;
        
        // Add extra glow at the twirl center
        float centerGlow = 1.0 - smoothstep(0.0, 0.3, distFromCenter);
        centerGlow = pow(centerGlow, 2.0);
        color += uEmissionColor * centerGlow * uEmissionStrength * 0.5;
        
        // Add some glow effect at the edges
        float edgeGlow = 1.0 - distance(st, vec2(0.5));
        edgeGlow = pow(edgeGlow, 1.5);
        
        // Fresnel effect for more mystical look
        vec3 viewDirection = normalize(vPosition - cameraPosition);
        float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
        fresnel = pow(fresnel, 2.0);
        
        // Final opacity calculation with bottom-heavy distribution
        float finalOpacity = (cloudMask * uCloudDensity + fresnel * 0.2) * uOpacity * edgeGlow * (0.5 + bottomWeight * 0.5);
        finalOpacity = clamp(finalOpacity, 0.0, 1.0);
        
        gl_FragColor = vec4(color, finalOpacity);
        }
    `

    // Create reactive uniforms
    const uniforms = writable({
        uTime: { value: 0.0 },
        uColor1: { value: [0,0,0].map(c => c / 255) }, // Main cloud color
        uColor2: { value: [129, 56, 255].map(c => c / 255) }, // Trail/edge color
        uOpacity: { value: 0.5 },
        uCloudDensity: { value: 2 },
        uCloudSpeed: { value: 5.0 },
        uTwirlStrength: { value: 5.5 }, // Controls twirling intensity
        uRiseSpeed: { value: 5555 }, // Controls how fast clouds rise from bottom
        uEmissionStrength: { value: 3 }, // Controls glow intensity
        uEmissionColor: { value: [129, 56, 255].map(c => c / 255) } // Bright emission color (can go above 1.0)
    })

    useTask((delta) => {
        uniforms.update(u => ({
        ...u,
        uTime: { value: u.uTime.value + delta }
        }))
    })
</script>

<T.Group bind:ref dispose={false} {...props} 
scale={[ 0.35, 0.4, 0.3 ]}
position={[ -0.3747, -0.6717, 0.0504 ]}>
    {#await portalGltf}
        {@render fallback?.()}
    {:then portalGltf}
        <T.PointLight
            position={[ 0.0927, 1.8491, 0.0802 ]}
            distance={21}
            decay={2.5}
            color={[129, 56, 255].map(c => c / 255)}
            power={5}
            visible
        />

        <T.Mesh
            geometry={portalGltf.nodes.right.geometry}
        >
            <T.MeshPhysicalMaterial
                map={$floorTexture}
                normalMap={$floorNormalTexture}
                color="#000000"
                roughness={1}
                reflectivity={1}
                metalness={0}
        
            />
        </T.Mesh>
        <T.Mesh
            geometry={portalGltf.nodes.left.geometry}            
        >
            <T.MeshPhysicalMaterial
                map={$floorTexture}
                normalMap={$floorNormalTexture}
                color="#000000"
                roughness={1}
                reflectivity={1}
                metalness={0}
        
            />
        </T.Mesh>
        <T.Mesh
            geometry={portalGltf.nodes.middle.geometry}
            
        >
            <T.ShaderMaterial
                {vertexShader}
                {fragmentShader}
                uniforms={$uniforms}
                transparent={true}
                side={2}
                depthWrite={false}
            />
        </T.Mesh>
    {:catch err}
        {@render error?.({ error: err })}
    {/await}

    {@render children?.({ ref })}
</T.Group>
