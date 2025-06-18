<script>
    import { T, useTask } from "@threlte/core";
    import * as THREE from 'three';
    import { extend } from '@threlte/core';
    import { Water } from 'three/addons/objects/Water2.js';
    import { TextureLoader } from 'three'
    import { useLoader } from '@threlte/core'
    import { onMount } from "svelte";
    
    
    const floorTexture = useLoader(TextureLoader).load('/textures/floor/seaside_rock_diff_4k.jpg')
    const floorNormalTexture = useLoader(TextureLoader).load('/textures/floor/seaside_rock_nor_gl_4k.jpg')


    // Extend Threlte to include Water
    extend({ Water });
    
    function deg2rad(n) {
        return n * (Math.PI/180)
    }

    const params = {
        color: '#fff',
        scale: 5,
        flowX: 0.8,
        flowY: 0.5
    };

    // Water parameters
    const waterParams = {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024,
        reflectivity:0.6,
    }

    useTask(()=>{ })

</script>

<!-- <T.Water 
    args={[
        new THREE.PlaneGeometry(3, 3),
        waterParams
    ]}
    position={[-0.0237, -0.75, 0]}
    rotation.x={deg2rad(-90)}
    scale={[3.5, 3.3, 2.5]}
/> -->
<!-- dummy -->
<!-- <T.Mesh
    position={[ 0, -0.7733, -0.0024 ]}
    rotation.x={deg2rad(-90)}
    scale={[3.5, 3.3, 2.5]}
>
    <T.PlaneGeometry args={[3,3]}/>
    <T.MeshPhysicalMaterial 
    map={$floorTexture}
    normalMap={$floorNormalTexture}
    color="#000000" opacity={1} transparent={false}
    roughness={0.1087} 
    metalness={0.1957} 
    clipIntersection={false} 
    clipShadows={false} 
    reflectivity={0.6196} 
    ior={0} 
    sheen={0} 
    sheenRoughness={0.0652} 
    clearcoatRoughness={0}/>
</T.Mesh> -->

