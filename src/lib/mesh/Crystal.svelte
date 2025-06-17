<script>
    import { T, useTask } from "@threlte/core";
    import * as THREE from "three";
    import { MeshTransmissionMaterial }  from '$lib/materials/MeshTransmissionMaterial.js'
    import { Mesh, BoxGeometry, MeshStandardMaterial  } from 'three'

    import { onMount } from 'svelte';

    // let material = new MeshStandardMaterial({
    //     color:"#ffb7b7",
    //     emissive:"#cea5a5"
    // });
    // const material = new MeshTransmissionMaterial({
    //     _transmission: 1,
    //     thickness: 0,
    //     roughness: 0,
    //     chromaticAberration: 0.03,
    //     anisotropicBlur: 0.1,
    //     distortion: 0,
    //     distortionScale: 0.5,
    //     temporalDistortion: 0.0,
    // })
    const material = Object.assign(new MeshTransmissionMaterial(6), {
        clearcoat: 0.2,
        clearcoatRoughness: 0,
        transmission: 1,
        chromaticAberration: 0.1,
        anisotrophicBlur: 0.1,
        // Set to > 0 for diffuse roughness
        roughness: 0,
        thickness: 0.35,
        ior: 1.1,
        // Set to > 0 for animation
        distortion: 0.5,
        distortionScale: 0.7,
        temporalDistortion: 0.4,
    });
    
</script>

<T.PointLight color="#f6a8a8" intensity={10} scale={[ 1, 1, 1 ]} position={[ 0.3325, 1.5737, 0.309 ]} distance={-2.3} power={9.2549} decay={8.1}/>


<!-- Main Cube -->
{#if material}
    <T.Mesh 
        scale={[1.5, 1.5, 1.5]} position={[ 0, 0.4013, 0.5369 ]}>
        <T.BoxGeometry args={[1, 1, 1]} />
        <T is={material}/>
    </T.Mesh>
{/if}
<!-- 
<T.Mesh scale={[ 0.2747, 0.2426, 0.3324 ]} position={[ -0.0116, 0.3033, 1.2172 ]}>
    <T.DodecahedronGeometry />
    <T.MeshStandardMaterial color="hotpink" emissive="#fb5abd" />
</T.Mesh> -->
