<script>
	import { T, useTask} from "@threlte/core";
    import { onMount, tick } from "svelte";
    import { TextureLoader } from 'three'
    import { useLoader } from '@threlte/core'
    import Water from '$lib/mesh/Water.svelte'
    import CustomSky from '$lib/mesh/CustomSky.svelte'
    import Crystal from '$lib/mesh/Crystal.svelte'
    import Portal from '$lib/mesh/Portal.svelte'
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


<T.DirectionalLight position={[ -0.5269, 0.7927, -2.3517 ]} color="#fff4eb" intensity={0.1} target.position={[ -1.5, -1.6, 0 ]} visible scale={[ 0.5, 0.5, 0.5 ]} rotation={[ 0, 0, 0 ]}/>

<!-- portal -->
<Portal/>

<!-- ground -->
<Water/>

<!-- rocks -->
<Rock1/>

<!-- camera -->
<T.PerspectiveCamera
    makeDefault
    position={[ -0.3341, -0.3804, 1.8949 ]}
    fov={65}
>

    <!-- {#snippet children({ref})}
        <OrbitControls 
        onchange={()=>{
            console.log(ref.rotation)
        }}
        enableDamping />
    {/snippet} -->
</T.PerspectiveCamera>