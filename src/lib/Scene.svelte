<script>
	import { T, useTask} from "@threlte/core";
    import { onMount, tick } from "svelte";
    import { TextureLoader } from 'three'
    import { useLoader } from '@threlte/core'
    import Water from '$lib/mesh/Water.svelte'
    import Crystal from '$lib/mesh/Crystal.svelte'
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
        KernelSize
    } from 'postprocessing'


    function deg2rad(n) {
        return n * (Math.PI/180)
    }

    const { scene, renderer, camera, size } = useThrelte()

    const composer = new EffectComposer(renderer)
    const setupEffectComposer = (camera) => {
        composer.removeAllPasses()
        composer.addPass(new RenderPass(scene, camera))
        composer.addPass(
            new EffectPass(
                camera,
                new BloomEffect({
                    intensity: 1,
                    luminanceThreshold: 0.15,
                    height: 512,
                    width: 512,
                    luminanceSmoothing: 0.08,
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

    const { renderStage, autoRender } = useThrelte()

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



<T.AmbientLight intensity={2} />
<!-- <T.PointLight color="#f6a8a8" intensity={0.8096} scale={[ 1, 1, 1 ]} position={[ -0.486, -0.211, 1.0607 ]} distance={-2.3} power={9.2549} decay={8.1}/> -->
<T.DirectionalLight position={[ -4.5286, 14.5201, -22.9639 ]} color="#ffffff" intensity={0.02} target.position={[ 1.28, -0.2, 5.2 ]}/>

<!-- portal -->
<T.Mesh position={[ 0, -0.0043, -0.6 ]} scale={[ 1, 1, 1 ]}>
    <T.PlaneGeometry args={[1,1.5]} />
    <T.MeshStandardMaterial
        color="#ffffff"               
        emissive="#ffffff"            
        emissiveIntensity={0.39}
        envMapIntensity={-0.4}
        roughness={0.5}
        metalness={0}        
    />
</T.Mesh>

<!-- ground -->
<Water/>

<Crystal/>
<!-- ice steps -->
<!-- <T.Mesh position={[ 0.055, 0.3253, 0.3107 ]} scale={[ 1.552, 0.0849, 0.5697 ]}>
    <T.BoxGeometry/>
    <T.MeshPhysicalMaterial
        color="#e8e9ff"
        metalness={0}
        roughness={0.15}
        transmission={0.85}
        thickness={0.8}
        ior={1.31}
        clearcoat={0.9}
        clearcoatRoughness={0.1}
        opacity={0.95}
        transparent={true}
        reflectivity={0.5}
        sheen={0.3}
        sheenColor="#ffffff"
        emissive="#ccd2ff"
        emissiveIntensity={0.08}
    />
</T.Mesh> -->


<T.PerspectiveCamera
    makeDefault
    position={[ -1.3416, 0, 3.8794 ]}
    matrixAutoUpdate
    fov={50}
    rotation={[ 0, -0.2618, 0 ]}
>

    <!-- {#snippet children({ref})}
        <OrbitControls 
        onchange={()=>{
            console.log(ref.rotation)
        }}
        enableDamping />
    {/snippet} -->
</T.PerspectiveCamera>
