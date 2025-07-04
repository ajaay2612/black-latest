<script>
    import { Canvas } from '@threlte/core'
    import Scene from '../lib/Scene.svelte'
    import { Sky } from '@threlte/extras';
    import { Studio } from '@threlte/studio'
    import { Environment  } from '@threlte/extras'
    import { onMount } from 'svelte';
    import Stats from 'stats.js';
    
    onMount(()=>{
        var stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );

        function animate() {

            stats.begin();

            // monitored code goes here

            stats.end();

            requestAnimationFrame( animate );

        }

        requestAnimationFrame( animate );
    })

</script>


<div class="h-screen fixed left-0 top-0 w-full bg-[#000000]">
    <Canvas>   
        <Studio>
            <!-- <Sky 
                turbidity={17.1}
                rayleigh={0.077}
                azimuth={80.00}
                elevation={5.1} 
                mieCoefficient={0.0}
                mieDirectionalG={0.155}
            /> -->
            <Scene />
        </Studio>
    </Canvas>
</div>