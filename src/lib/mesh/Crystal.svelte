<script>
    import { T, useTask } from "@threlte/core";
    import * as THREE from "three";
    // import { MeshTransmissionMaterial }  from '$lib/materials/MeshTransmissionMaterial-----mine'
    import MeshTransmissionMaterial from '$lib/materials/MeshTransmissionMaterial.svelte'
    import { Mesh, BoxGeometry, MeshStandardMaterial  } from 'three'

    import { onMount } from 'svelte';

    import { useGltf, useDraco } from '@threlte/extras'
    import { Resolution } from "postprocessing";
    const dracoLoader = useDraco()
    const gltf = useGltf('/model/bunny-transformed.glb', {
        dracoLoader
    })

    gltf.then((gltf) => {
        console.log(gltf)
        // console.log(gltf.nodes['bunny'])
        // console.log(gltf.animations)
    })

    // let material = new MeshStandardMaterial({
    //     color:"#ffb7b7",
    //     emissive:"#cea5a5"
    // });
    // const material = Object.assign(new MeshTransmissionMaterial(), {
    //     samples:8,
    //     resolution:512,
    //     // clearcoat: 1,
    //     // clearcoatRoughness: 5,
    //     transmission: 1,
    //     chromaticAberration: 0.2,
    //     anisotrophicBlur: 1,
    //     // Set to > 0 for diffuse roughness
    //     roughness: 0.2,
    //     thickness: 0.3,
    //     // ior: 1.2,
    //     // Set to > 0 for animation
    //     // distortion: 0.2,
    //     // distortionScale: 0.2,
    //     // temporalDistortion: 0.4,
    // });


    const meshTransmissionConfig = {
        backside: true,
        samples: 8,
        resolution: 512,
        roughness: 0.2,
        thickness: 0.3,
        // ior: 1,
        chromaticAberration: 0.2,
        anisotropy: 1,
        distortion: 0.0,
        distortionScale: 0.3,
        temporalDistortion: 0.5,
        clearcoat: 1,
        attenuationDistance: 0.5,
        attenuationColor: "#ffffff",
        color: "#fff",
        background: "#fff"
    };

</script>



<!-- <T.PointLight color="#f6a8a8" intensity={10} scale={[ 1, 1, 1 ]} position={[ 0.3325, 1.5737, 0.309 ]} distance={-2.3} power={9.2549} decay={8.1}/> -->


<!-- Main Cube -->
<!-- {#if material}
    <T.Mesh 
        scale={[1.5, 1.5, 1.5]} position={[ 0, 4.3771, 3.3348 ]} 
        visible={false}>
        <T.BoxGeometry args={[1, 1, 1]} />
        <T is={material} color="#ffcbcb"/>
    </T.Mesh>    

{/if} -->

<!-- {#if $gltf}
  <T
    is={$gltf.nodes.bunny}
    material
  />
{/if} -->


{#await gltf then { scene , nodes}}
    <!-- {console.log('GLTF loaded:', {scene})} -->
    <!-- <T.Mesh 
    geometry={nodes.bunny.geometry}
    material = {material}
    position={[ 0, 0, 1.3407 ]}
    scale={1.5} 
    material.side={2} 
    material.shadowSide={0} /> -->

    <T.Mesh geometry={nodes.bunny.geometry}>
        <MeshTransmissionMaterial {...meshTransmissionConfig}/>
    </T.Mesh>

{/await}


<!-- 
<T.Mesh scale={[ 0.2747, 0.2426, 0.3324 ]} position={[ -0.0116, 0.3033, 1.2172 ]}>
    <T.DodecahedronGeometry />
    <T.MeshStandardMaterial color="hotpink" emissive="#fb5abd" />
</T.Mesh> -->
