<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf, useDraco, interactivity } from "@threlte/extras";
    import { PointLight, TextureLoader } from "three";
    import { useLoader } from "@threlte/core";
    import { writable } from 'svelte/store';
    import * as THREE from "three"
    // Enable interactivity
    interactivity();

    let {  fallback, error, children, ref = $bindable(), ...props } = $props();
    const dracoLoader = useDraco();
    const portalGltf = useGltf("/model/newportal.glb", { dracoLoader });

    const floorTexture = useLoader(TextureLoader).load(
        "/textures/floor/seaside_rock_diff_4k.jpg",
    );
    const floorNormalTexture = useLoader(TextureLoader).load(
        "/textures/floor/seaside_rock_nor_gl_4k.jpg",
    );


    portalGltf.then((portalGltf) => {
        console.log("portalGltf", portalGltf.nodes.main.material.shading);
    });


    let portalMeshRef = $state(null)

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

    // Fragment shader - with aspect ratio correction
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
        uniform vec2 pos;
        uniform vec2 uResolution; // Add this uniform for aspect ratio
        
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
            // Calculate aspect ratio and correct UV coordinates
            float aspect = uResolution.x / uResolution.y;
            vec2 st = vUv;
            
            // Center and scale UV coordinates to maintain aspect ratio
            st = (st - 0.5) * vec2(aspect, 1.0) + 0.5;
            
            // Also correct the hole position to account for aspect ratio
            vec2 correctedPos = (pos - 0.5) * vec2(aspect, 1.0) + 0.5;
            
            // Calculate distance from current pixel to the hole position
            float holeDistance = distance(st, correctedPos);
            float holeRadius = 0.05; // Adjust this to control hole size
            float holeEdge = 0.02; // Smooth edge transition
            
            // Create hole mask - 0 = hole (transparent), 1 = normal
            float holeMask = smoothstep(holeRadius - holeEdge, holeRadius + holeEdge, holeDistance);
            
            // Create twirl effect - distance from center affects rotation
            vec2 center = vec2(0.5, 0.3); // This will now be properly centered
            center = (center - 0.5) * vec2(aspect, 1.0) + 0.5; // Apply aspect correction
            
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
            // Use original vUv.y for this since we want it relative to the actual geometry
            float bottomWeight = 1.0 - smoothstep(0.0, 0.7, vUv.y);
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
            
            // Add some glow effect at the edges (use original vUv for geometry-relative effects)
            float edgeGlow = 1.0 - distance(vUv, vec2(0.5));
            edgeGlow = pow(edgeGlow, 1.5);
            
            // Fresnel effect for more mystical look
            vec3 viewDirection = normalize(vPosition - cameraPosition);
            float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 2.0);
            
            // Final opacity calculation with bottom-heavy distribution
            float finalOpacity = (cloudMask * uCloudDensity + fresnel * 0.2) * uOpacity * edgeGlow * (0.5 + bottomWeight * 0.5);
            finalOpacity = clamp(finalOpacity, 0.0, 1.0);
            
            // Apply hole mask to opacity - multiplying by holeMask creates the hole
            finalOpacity *= holeMask;
            
            // In the hole area, make it completely black and transparent
            if (holeMask < 0.1) {
                color = vec3(0.0, 0.0, 0.0);
                finalOpacity = 0.0;
            }
            
            gl_FragColor = vec4(color, finalOpacity);
        }
    `

    // Updated uniforms with resolution
    const uniforms = writable({
        uTime: { value: 0.0 },
        uColor1: { value: [0,0,0].map(c => c / 255) }, // Main cloud color
        uColor2: { value: [129, 56, 255].map(c => c / 255) }, // Trail/edge color
        uOpacity: { value: 0.5 },
        uCloudDensity: { value: 8 },
        uCloudSpeed: { value: 5.0 },
        uTwirlStrength: { value: 0.9 }, // Controls twirling intensity
        uRiseSpeed: { value: 1 }, // Controls how fast clouds rise from bottom
        uEmissionStrength: { value: 4 }, // Controls glow intensity
        uEmissionColor: { value: [129, 56, 255].map(c => c / 255) }, // Bright emission color
        pos: { value: [0, 0] }, // Position of the hole (x, y in UV coordinates 0-1)
        uResolution: { value: [0.5, 1] } // Add resolution uniform
    });

    // Interactive event handlers
    const handlePointerMove = (e) => {
        // Get the UV coordinates from the intersection
        if (e.uv && portalMeshRef?.material?.uniforms) {
            console.log('UV coordinates:', e.uv.x, e.uv.y);
            
            // Direct uniform update
            portalMeshRef.material.uniforms.pos.value[0] = e.uv.x;
            portalMeshRef.material.uniforms.pos.value[1] = e.uv.y;
            portalMeshRef.material.uniforms.pos.needsUpdate = true;
            
            // Also update the store for consistency
            // uniforms.update(u => {
            //     const newUniforms = { ...u };
            //     newUniforms.pos = { value: [e.uv.x, 1.0 - e.uv.y] };
            //     console.log('Updated pos to:', newUniforms.pos.value);
            //     return newUniforms;
            // });
        }
    };

    const handlePointerEnter = (e) => {
        console.log('Portal entered');
        if (portalMeshRef?.material?.uniforms) {
            // Direct uniform update
            portalMeshRef.material.uniforms.uEmissionStrength.value = 6;
            portalMeshRef.material.uniforms.uEmissionStrength.needsUpdate = true;
        }
        
        // // Also update store
        // uniforms.update(u => {
        //     const newUniforms = { ...u };
        //     newUniforms.uEmissionStrength = { value: 6 };
        //     return newUniforms;
        // });
    };

    const handlePointerLeave = (e) => {
        console.log('Portal left');
        if (portalMeshRef?.material?.uniforms) {
            // Direct uniform update
            portalMeshRef.material.uniforms.pos.value[0] = 0.5;
            portalMeshRef.material.uniforms.pos.value[1] = 0.5;
            portalMeshRef.material.uniforms.pos.needsUpdate = true;
            portalMeshRef.material.uniforms.uEmissionStrength.value = 4;
            portalMeshRef.material.uniforms.uEmissionStrength.needsUpdate = true;
        }
        
        // Also update store
        // uniforms.update(u => {
        //     const newUniforms = { ...u };
        //     newUniforms.pos = { value: [0.5, 0.5] };
        //     newUniforms.uEmissionStrength = { value: 4 };
        //     return newUniforms;
        // });
    };

    useTask((delta) => {
        uniforms.update(u => ({
            ...u,
            uTime: { value: u.uTime.value + delta }
        }));
    });
</script>

<T.Group bind:ref dispose={false} {...props} 
rotation={[ 0, -1.5708, 0 ]}  
position={[ -0.3719, -0.8118, 0 ]} 
scale={[ 2.5, 2.5, 2.5 ]} 
>
    {#await portalGltf}
        {@render fallback?.()}
    {:then portalGltf}
        <!-- <T.PointLight
            distance={21}
            decay={1.6}
            color={[129, 56, 255].map(c => c / 255)}
            power={3.5867}
            position={[ -0.0094, 0.4529, -0.1206 ]}
            intensity={0.0467}
            
        /> -->

        <!-- <T.Mesh
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
        </T.Mesh> -->
        <T.Mesh
            geometry={portalGltf.nodes.main.geometry}
                
        >
            <T.MeshPhysicalMaterial
                map={$floorTexture}
                normalMap={$floorNormalTexture}
                color="#955b2a"
                roughness={0.7391}
                ior={0.3043}
            />
        </T.Mesh> 
        
        <!-- <T.Mesh
            bind:ref={portalMeshRef}
            geometry={portalGltf.nodes.middle.geometry}
            onpointerenter={handlePointerEnter}
            onpointerleave={handlePointerLeave}
            onpointermove={handlePointerMove}
        
        >
           
            <T.ShaderMaterial
                {vertexShader}
                {fragmentShader}
                uniforms={$uniforms}
                transparent={true}
                side={2}
                depthWrite={false}
            />
        </T.Mesh> -->
        <T.Mesh
            bind:ref={portalMeshRef}
            geometry={portalGltf.nodes.portal.geometry}
            position={[ -0.0281, 0, 0 ]}
            scale={[ 1, 1, 1 ]}
        >
           
            <T.ShaderMaterial
                {vertexShader}
                {fragmentShader}
                uniforms={$uniforms}
                transparent={true}
            />
        </T.Mesh>
    {:catch err}
        {@render error?.({ error: err })}
    {/await}

    {@render children?.({ ref })}
</T.Group>