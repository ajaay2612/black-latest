<script>
	import { T, useTask} from "@threlte/core";
    import { onMount, tick } from "svelte";
    import { TextureLoader } from 'three'
    import { useLoader } from '@threlte/core'
    import Water from '$lib/mesh/Water.svelte'
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



<!-- <T.AmbientLight intensity={2} visible /> -->
<!-- <T.PointLight color="#f6a8a8" intensity={0.8096} scale={[ 1, 1, 1 ]} position={[ -0.486, -0.211, 1.0607 ]} distance={-2.3} power={9.2549} decay={8.1}/> -->
<T.DirectionalLight position={[ -2.6311, 6.7201, -38.7693 ]} color="#ffffff" intensity={0.16} target.position={[ -1.5, -1.6, 0 ]} visible scale={[ 0.5, 0.5, 0.5 ]} rotation={[ 0, 0, 0 ]}/>

<!-- portal -->
<T.Mesh position={[ -0.3248, -0.4189, 0.034 ]} scale={[ 0.263, 0.3218, 1 ]} visible>
    <T.PlaneGeometry args={[1,1.5]} />
    <T.MeshStandardMaterial
        color="#000000"               
        emissive="#ffffff"            
        emissiveIntensity={0.8}
        roughness={0.5}
        metalness={0}        
    />
</T.Mesh>

<!-- ground -->
<Water/>

<!-- <Crystal/> -->

<Rock1 position={[ 0.1508, -0.3843, 0.2003 ]}/>
<Rock1 position={[-0.85,-0.57,0]}/>


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
