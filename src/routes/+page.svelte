<script>
    import { Canvas } from '@threlte/core'
    import Scene from '../lib/Scene.svelte'
    import { Sky } from '@threlte/extras';
    import { Studio } from '@threlte/studio'
    import { Environment  } from '@threlte/extras'
    

</script>


<div class="h-screen fixed left-0 top-0 w-full bg-[#000000]">
    <Canvas>   
        <Studio>
            <Scene />
        </Studio>
    </Canvas>
</div>