<script>
	import { T, useTask} from "@threlte/core";
    import { onMount, tick } from "svelte";
    import { TextureLoader } from 'three'
    import { useLoader } from '@threlte/core'
    import Water from '$lib/mesh/Water.svelte'
    import CustomSky from '$lib/mesh/CustomSky.svelte'
    import DuskSky from '$lib/mesh/DuskSky.svelte'
    import Crystal from '$lib/mesh/Crystal.svelte'
    import Portal from '$lib/mesh/Portal.svelte'
    import NewLandscape from '$lib/mesh/newLandscape.svelte'
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
    import { SMAAImageLoader } from 'postprocessing'

  	import {
        EffectComposer,
        EffectPass,
        RenderPass,
        SMAAEffect,
        SMAAPreset,
        BloomEffect,
        KernelSize,
        GodRaysEffect,
        EdgeDetectionMode,
        ToneMappingEffect,
        ToneMappingMode 
    } from 'postprocessing'

    // Load SMAA textures first
    const smaaImageLoader = new SMAAImageLoader()
    let smaaSearchTexture, smaaAreaTexture

    

    const {     
        scene,
        renderer,
        camera,
        size,
        renderStage, 
        autoRender,
        invalidate
    } = useThrelte()

    let godRaysLight = $state(null)

    const composer = new EffectComposer(renderer)
    const setupEffectComposer = (camera) => {

        composer.removeAllPasses()
        composer.addPass(new RenderPass(scene, camera))
        composer.addPass(
            new EffectPass(
                camera,
                new BloomEffect({
                    intensity: 0.8,
                    radius: 0.5,
                    luminanceThreshold: 0,
                    mipmapBlur: true,
                    kernelSize: KernelSize.MEDIUM
                })
            )
        )

        // Proper SMAA antialiasing with loaded textures
        const smaaEffect = new SMAAEffect(
            smaaSearchTexture,
            smaaAreaTexture,
            SMAAPreset.HIGH,
            EdgeDetectionMode.COLOR
        )
        
        // Optional: Fine-tune SMAA settings
        smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.001)
        
        composer.addPass(
            new EffectPass(camera, smaaEffect)
        )
        // Tone mapping effect
        const toneMappingEffect = new ToneMappingEffect({
            mode: ToneMappingMode.REINHARD2_ADAPTIVE,
            resolution: 256,
            whitePoint: 5.0,
            middleGrey: 2.6,
            minLuminance: 0.1,
            averageLuminance: 0.5,
            adaptationRate: 1.5,
        })
        
        // Add both effects in a single pass
        composer.addPass(
            new EffectPass(camera, smaaEffect, toneMappingEffect)
        )

  
    }


    $effect(() => {
        smaaImageLoader.load(([search, area]) => {
            smaaSearchTexture = search
            smaaAreaTexture = area
            // Now setup your composer
        })
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

<!-- <CustomSky/> -->
<!-- <DuskSky/> -->

<!-- <T.Mesh 
bind:ref={godRaysLight}
scale={[0.05,0.05,0.05]} 
position={[ -0.4192, 0.5609, -1.02 ]}>
    <T.SphereGeometry args={[1,20,20]}/>
    <T.MeshBasicMaterial
        color={"0xffddaa"}
        transparent={true}
        fog= {false}
    />
</T.Mesh> -->


<!-- <T.AmbientLight
intensity={0.5}
color={"white"}
></T.AmbientLight> -->

<!-- portal -->
<!-- <Portal /> -->

<NewLandscape 
scale={0.15}

/>

<!-- ground -->
<Water/>

<!-- rocks -->
<!-- <Rock1/> -->

<!-- camera -->
<T.PerspectiveCamera
    makeDefault
    position={[ 0, 0.34, 3.4 ]}
    fov={44.75}
    scale={[ 1, 1, 1 ]}
    rotation={[ 0, 0, 0 ]}
>

    <!-- {#snippet children({ref})}
        <OrbitControls 
        onchange={()=>{
            console.log(ref.rotation)
        }}
        enableDamping />
    {/snippet} -->
</T.PerspectiveCamera>