<script>
	import { T, useTask} from "@threlte/core";
    import { onMount, tick } from "svelte";
    import { TextureLoader } from 'three'
    import { useLoader } from '@threlte/core'
    import Water from '$lib/mesh/Water.svelte'
    import CustomSky from '$lib/mesh/CustomSky.svelte'
    import Crystal from '$lib/mesh/Crystal.svelte'
    import Rock1 from '$lib/model/rock1.svelte'
    import {
        useGltf,
        useDraco,
        OrbitControls,
        TransformControls,
        useGltfAnimations,
        Gizmo,
        Environment
    } from "@threlte/extras";
    import { Mesh } from "three";
    import * as THREE from 'three';
    import {  useThrelte } from '@threlte/core'
  	import {
        EffectComposer,
        EffectPass,
        RenderPass,
        SMAAEffect,
        SMAAPreset,
        BloomEffect,
        KernelSize,
    } from 'postprocessing'




    function deg2rad(n) {
        return n * (Math.PI/180)
    }

    const {     
        scene,
        renderer,
        camera,
        size,
        renderStage, 
        autoRender,
        invalidate
    } = useThrelte()

    const composer = new EffectComposer(renderer)
    const setupEffectComposer = (camera) => {
        composer.removeAllPasses()
        composer.addPass(new RenderPass(scene, camera))
        composer.addPass(
            new EffectPass(
                camera,
                new BloomEffect({
                    intensity: 1.2,
                    radius: 0.75,
                    luminanceThreshold: 0,
                    mipmapBlur: true,
                    kernelSize: KernelSize.MEDIUM
                })
            )
        )
        composer.addPass(
            new EffectPass(
                camera,
                new SMAAEffect({
                preset: SMAAPreset.LOW
                })
            )
        )
    }


    $effect(() => {
        setupEffectComposer($camera)
    })
    $effect(() => {
        composer.setSize($size.width, $size.height)
    })




    onMount(() => {
        let before = autoRender.current
        autoRender.set(false)
        return () => autoRender.set(before)
    })


    useTask(
        'render',
        (delta) => {
            composer.render(delta);
        },
        { stage: renderStage, autoInvalidate: false }
    )

</script>

<CustomSky/>


<!-- <T.AmbientLight intensity={2} visible /> -->
<T.PointLight color="#ffffff" intensity={0.1627} scale={[ 0.02, 0.02, 0.02 ]} position={[ 0.1836, -0.3632, 0.2508 ]} distance={2.5} power={1} decay={3.1}/>
<T.PointLight color="#ffffff" intensity={0.2916} scale={[ 0.02, 0.02, 0.02 ]} position={[ -0.8055, -0.5111, 0.0801 ]} distance={0} power={4.2246} decay={2.1}/>


<T.DirectionalLight position={[ -4.2311, 9.3201, -51.7693 ]} color="#fff4eb" intensity={0.15} target.position={[ -1.5, -1.6, 0 ]} visible={false} scale={[ 0.5, 0.5, 0.5 ]} rotation={[ 0, 0, 0 ]}/>

<!-- <T.DirectionalLight position={[ 0.4039, -0.3642, 0.8428 ]} color="#d183f8" intensity={5} target.position={[ -0.512, -1.871, -1.24 ]} visible scale={[ 0.01, 0.01, 0.01 ]} rotation={[ 0, 0, 0 ]}/> -->

<!-- portal -->
<T.Mesh position={[ -0.3248, -0.3597, 0.034 ]} scale={[ 0.263, 0.3218, 1 ]} visible>
    <T.PlaneGeometry args={[1,1.5]} />
    <T.MeshStandardMaterial
        color="#ffffff"               
        emissive="#ffffff"            
        emissiveIntensity={0.9}
        roughness={0.5}
        metalness={0}        
    />
</T.Mesh>

<!-- ground -->
<Water/>

<!-- <Crystal/> -->

<Rock1  position={[ 0.1508, -0.3843, 0.2003 ]}/>
<Rock1 rotation={[ -3.1416, 0.5795, -3.1416 ]}   position={[-0.85,-0.57,0]}/>


<T.PerspectiveCamera
    makeDefault
    position={[ -0.2241, -0.4104, 1.6949 ]}
    matrixAutoUpdate
    fov={50.75}
    rotation={[ 0, 0, 0 ]}
    zoom={0.7}
    far={4200}
    near={1.39}
    scale={[ 0.2, 0.2, 0.2 ]}
>

    <!-- {#snippet children({ref})}
        <OrbitControls 
        onchange={()=>{
            console.log(ref.rotation)
        }}
        enableDamping />
    {/snippet} -->
</T.PerspectiveCamera>
