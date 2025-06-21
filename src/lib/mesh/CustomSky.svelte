<script>
    import { T } from "@threlte/core";
    import { useTask } from "@threlte/core";

    
    // Sky shader material with UV-based gradient
    const skyVertexShader = `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const skyFragmentShader = `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        uniform float horizonBlend;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
            // Use UV.y instead of world position Y
            // UV.y goes from 0 (bottom) to 1 (top) of the sphere
            float h = (vUv.y - 0.5) * 2.0 + offset; // Convert to -1 to 1 range, then apply offset
            
            // Create horizon blend mask based on UV
            float horizonMask = 1.0 - abs(h);
            horizonMask = pow(max(horizonMask, 0.0), horizonBlend + 0.1);
            
            // Create separate gradients for top and bottom
            vec3 skyColor;
            if (h >= 0.0) {
                // Above horizon - blend from horizon to top
                float skyMix = pow(h, exponent);
                skyColor = mix(horizonColor, topColor, skyMix);
            } else {
                // Below horizon - blend from horizon to bottom
                float bottomMix = pow(abs(h), exponent);
                skyColor = mix(horizonColor, bottomColor, bottomMix);
            }
            
            // Apply horizon blending when horizonBlend > 0
            if (horizonBlend > 0.0) {
                // Create horizon effect based on UV
                float horizonEffect = 1.0 - abs((vUv.y - 0.5) * 2.0);
                horizonEffect = pow(horizonEffect, horizonBlend);
                
                // Blend with horizon color
                skyColor = mix(skyColor, horizonColor, horizonEffect * 0.8);
            }
            
            gl_FragColor = vec4(skyColor, 1.0);
        }
    `;


    // ----------------------------------------
    
    
    // Stars shader - creates procedural starfield
    const starsVertexShader = `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const starsFragmentShader = `
        uniform float time;
        uniform float starDensity;
        uniform float starBrightness;
        uniform float twinkleSpeed;
        uniform float starSize;
        uniform vec3 starColor1;
        uniform vec3 starColor2;
        uniform vec3 starColor3;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        // Hash function for pseudo-random numbers
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        // Noise function
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Create multiple layers of stars at different scales
            vec3 starField = vec3(0.0);
            
            // Layer 1 - Large bright stars
            vec2 starUV1 = uv * starDensity;
            vec2 starGrid1 = floor(starUV1);
            vec2 starLocal1 = fract(starUV1);
            
            float starRandom1 = hash(starGrid1);
            if (starRandom1 > 0.995) { // Only 0.5% of cells have stars
                vec2 starPos1 = vec2(hash(starGrid1 + 0.1), hash(starGrid1 + 0.2));
                float starDist1 = length(starLocal1 - starPos1);
                float starMask1 = 1.0 - smoothstep(0.0, starSize * 0.008, starDist1);
                
                // Twinkling effect
                float twinkle1 = 0.5 + 0.5 * sin(time * twinkleSpeed + starRandom1 * 6.28);
                twinkle1 = mix(0.7, 1.0, twinkle1);
                
                // Star color variation
                vec3 starCol1 = mix(starColor1, starColor2, hash(starGrid1 + 0.3));
                starField += starCol1 * starMask1 * starBrightness * twinkle1;
            }
            
            // Layer 2 - Medium stars
            vec2 starUV2 = uv * starDensity * 1.5;
            vec2 starGrid2 = floor(starUV2);
            vec2 starLocal2 = fract(starUV2);
            
            float starRandom2 = hash(starGrid2 + 10.0);
            if (starRandom2 > 0.99) { // 1% of cells
                vec2 starPos2 = vec2(hash(starGrid2 + 0.4), hash(starGrid2 + 0.5));
                float starDist2 = length(starLocal2 - starPos2);
                float starMask2 = 1.0 - smoothstep(0.0, starSize * 0.01, starDist2);
                
                float twinkle2 = 0.6 + 0.4 * sin(time * twinkleSpeed * 1.3 + starRandom2 * 6.28);
                vec3 starCol2 = mix(starColor2, starColor3, hash(starGrid2 + 0.6));
                starField += starCol2 * starMask2 * starBrightness * 0.8 * twinkle2;
            }
            
            // Layer 3 - Small distant stars
            vec2 starUV3 = uv * starDensity * 2.5;
            vec2 starGrid3 = floor(starUV3);
            vec2 starLocal3 = fract(starUV3);
            
            float starRandom3 = hash(starGrid3 + 20.0);
            if (starRandom3 > 0.985) { // 1.5% of cells
                vec2 starPos3 = vec2(hash(starGrid3 + 0.7), hash(starGrid3 + 0.8));
                float starDist3 = length(starLocal3 - starPos3);
                float starMask3 = 1.0 - smoothstep(0.0, starSize * 0.01, starDist3);
                
                float twinkle3 = 0.7 + 0.3 * sin(time * twinkleSpeed * 0.8 + starRandom3 * 6.28);
                vec3 starCol3 = mix(starColor1, starColor3, hash(starGrid3 + 0.9));
                starField += starCol3 * starMask3 * starBrightness * 0.6 * twinkle3;
            }
            
            // Fade stars near horizon (optional - matches your sky)
            float horizonFade = smoothstep(0.3, 0.7, vUv.y);
            starField *= horizonFade;
            
            // Only show stars where it's dark enough
            float skyBrightness = length(vec3(37.0/255.0, 25.0/255.0, 56.0/255.0));
            float starVisibility = 1.0 - smoothstep(0.0, skyBrightness * 2.0, skyBrightness);
            starField *= max(0.8, starVisibility); // Always show some stars
            
            gl_FragColor = vec4(starField, 1.0);
        }
    `;

    

    // Sky parameters for Threlte/Three.js
    const skyParams = {
        topColor: [0.00, 0.00, 0.00],
        bottomColor: [0.00, 0.00, 0.00],
        horizonColor: [(2/1.5)/255, (1/1.5)/255, (3/1.5)/255],
        offset: 0,  // Now controls UV offset - positive shifts horizon up, negative down
        exponent: 0.2,
        horizonBlend: 15
    };
    
    
    // Star parameters
    const starParams = {
        starDensity:180.0,      // Higher = more stars
        starBrightness: 1.5,    // Overall brightness
        twinkleSpeed: 3,      // Twinkling animation speed
        starSize: 5.5,          // Size multiplier
        starColor1: [1.0, 1.0, 1.0],        // White stars
        starColor2: [0.8, 0.9, 1.0],        // Slightly blue stars
        starColor3: [1.0, 0.9, 0.7]         // Slightly warm stars
    };

    
    let starMaterial = $state(null);
    let elapsedTime = 0; // Add this to accumulate time

    useTask((delta) => {
        if (starMaterial) {
            elapsedTime += delta; // Accumulate the delta time
            starMaterial.uniforms.time.value = elapsedTime; // Use accumulated time
        }
    });


</script>

<!-- Sky Environment Sphere - Now you can lower it as much as you want -->
<T.Mesh scale={[15, 15, 15]} position={[ 0, -1.6655, 0.4 ]}>
    <T.SphereGeometry args={[1, 32, 16]} />
    <T.ShaderMaterial
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={{
            topColor: { value: skyParams.topColor },
            bottomColor: { value: skyParams.bottomColor },
            horizonColor: { value: skyParams.horizonColor },
            offset: { value: skyParams.offset },
            exponent: { value: skyParams.exponent },
            horizonBlend: { value: skyParams.horizonBlend }
        }}
        side={1}
        depthWrite={false}
        depthTest={false}
    />
</T.Mesh>

<!-- Stars Layer - Rendered after/over your sky -->
<T.Mesh scale={[12, 12, 12]} position={[0, -1.6655, 0.4]}>
    <T.SphereGeometry args={[1, 32, 16]} />
    <T.ShaderMaterial
        bind:ref={starMaterial}
        vertexShader={starsVertexShader}
        fragmentShader={starsFragmentShader}
        uniforms={{
            time: { value: 0 },
            starDensity: { value: starParams.starDensity },
            starBrightness: { value: starParams.starBrightness },
            twinkleSpeed: { value: starParams.twinkleSpeed },
            starSize: { value: starParams.starSize },
            starColor1: { value: starParams.starColor1 },
            starColor2: { value: starParams.starColor2 },
            starColor3: { value: starParams.starColor3 }
        }}
        side={1}
        transparent={true}
        blending={2}
        depthWrite={false}
        depthTest={false}
    />
</T.Mesh>
