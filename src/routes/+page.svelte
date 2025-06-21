<script>
    import { Canvas } from '@threlte/core'
    import Scene from '../lib/Scene.svelte'
    import { Sky } from '@threlte/extras';
    import { Studio } from '@threlte/studio'
    import { Environment } from '@threlte/extras'
  
</script>


<div class="h-screen fixed left-0 top-0 w-full bg-[#000000]">
    <Canvas>
        <Environment
        isBackground={!false}        
        url="/hdr/HDR_white_dwarf_star.hdr" />
        <Studio>
            <!-- <Sky 
                turbidity={20}
                rayleigh={4}
                azimuth={180.00}
                elevation={-5} 
                mieCoefficient={0.1}
                mieDirectionalG={0.59}
            /> -->
            <Scene />
        </Studio>
    </Canvas>
</div>