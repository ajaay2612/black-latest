<script>
    import { extend } from "@threlte/core";
    import { T, useTask } from "@threlte/core";
    import * as THREE from "three";
    import {
        useGltf,
        useDraco,
        interactivity,
        Instance,
        InstancedMesh,
    } from "@threlte/extras";
    import { emissive } from "three/src/nodes/TSL.js";
    import { useTexture } from "@threlte/extras";

    function deg2rad(n) {
        return n * (Math.PI / 180);
    }

    const dracoLoader = useDraco();
    let { fallback, error, children, ref = $bindable(), ...props } = $props();

    const gltf = useGltf("/model/newLandscape.glb", { dracoLoader });

    const material = new THREE.MeshStandardMaterial({
        color: "#fcf3ed",
        roughness: 0.8,
        metalness: 0.2,
        emissive: 0x000000,
    });
</script>

<T.Group bind:ref dispose={false} {...props}>
    {#await gltf}
        {@render fallback?.()}
    {:then gltf}
        <T.Mesh
            geometry={gltf.nodes.Circle014.geometry}
            material={gltf.materials.plainWhite}
            position={[-0.14, 0.67, 0.08]}
        />
        <T.Mesh
            geometry={gltf.nodes.Circle015.geometry}
            material={gltf.materials.white}
            position={[0.01, 7.47, 0.08]}
        />
        <T.Mesh
            geometry={gltf.nodes.Circle016.geometry}
            material={gltf.materials.white}
            position={[0.01, 0.29, 0.08]}
        />
        <T.Mesh
            geometry={gltf.nodes.Circle017.geometry}
            material={gltf.materials.white}
            position={[0.01, 6.67, 0.08]}
        />
        <T.Mesh
            geometry={gltf.nodes.Plane006.geometry}
            material={gltf.materials.white}
            position={[-0.14, 0.67, 4.66]}
            scale={24.25}
        />
        <T.Mesh
            geometry={gltf.nodes.Plane007.geometry}
            material={gltf.materials.white}
            position={[-0.14, -2.26, 4.66]}
            scale={24.25}
        />
    {:catch err}
        {@render error?.({ error: err })}
    {/await}

    {@render children?.({ ref })}
</T.Group>
