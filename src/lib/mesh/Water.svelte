<script>
    import { T, useTask } from "@threlte/core";
    import * as THREE from "three";
    import { extend } from "@threlte/core";
    import { Water } from "three/addons/objects/Water2.js";
    import { TextureLoader } from "three";
    import { useLoader } from "@threlte/core";
    import { onMount } from "svelte";
    import { useGltf, useDraco } from "@threlte/extras";

    const floorTexture = useLoader(TextureLoader).load(
        "/textures/floor/seaside_rock_diff_4k.jpg",
    );
    const floorNormalTexture = useLoader(TextureLoader).load(
        "/textures/floor/seaside_rock_nor_gl_4k.jpg",
    );

    const dracoLoader = useDraco();
    const groundGltf = useGltf("/model/ground.glb", { dracoLoader });

    // groundGltf.then((groundGltf) => {
    //     console.log("gltf", groundGltf);
    // });
    const terrainGltf = useGltf("/model/terrain.glb", { dracoLoader });

    terrainGltf.then((terrainGltf) => {
        console.log("terrainGltf", terrainGltf);
    });

    let { fallback, error, children, ref = $bindable(), ...props } = $props();


    // Extend Threlte to include Water
    extend({ Water });

    function deg2rad(n) {
        return n * (Math.PI / 180);
    }

    const params = {
        color: "#fff",
        scale: 5,
        flowX: 0.5,
        flowY: 0.2,
    };

    // Water parameters
    const waterParams = {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2(params.flowX, params.flowY),
        textureWidth: 1024,
        textureHeight: 1024,
        reflectivity: 0.3,
    };

    useTask(() => {});
</script>

<T.Water
    args={[new THREE.PlaneGeometry(3, 3), waterParams]}
    position={[0.0226, -0.75, 0]}
    rotation.x={deg2rad(-90)}
    scale={[3.5, 3.3, 2.5]}
/>

<!-- floor -->

{#await groundGltf}
    {@render fallback?.()}
{:then groundGltf}
    <T.Mesh
        position={[ 0, -0.8361, -0.0024 ]}
        rotation.y={deg2rad(10)}
        scale={[2.5, 2.5, 2.5]}

        geometry={groundGltf.nodes.Plane.geometry}
        receiveShadow
        castShadow
        rotation={[ 0, 0, 0 ]}
    >
    <T.MeshPhysicalMaterial
        map={$floorTexture}
        normalMap={$floorNormalTexture}
        color="#000000"
        opacity={1}
        transparent={false}
        roughness={0.1087}
        metalness={0.1957}
        clipIntersection={false}
        clipShadows={false}
        reflectivity={0.6196}
        ior={0.3261}
        sheen={0}
        sheenRoughness={0}
        clearcoatRoughness={0}
    />
    </T.Mesh>
{/await}

<!-- terrain -->

{#await terrainGltf}
    {@render fallback?.()}
{:then terrainGltf}
    <T.Mesh
        position={[ -0.4378, -0.6696, -0.0024 ]}
        rotation.y={deg2rad(10)}
        scale={[1.2, 1.2, 1.2]}

        geometry={terrainGltf.nodes.Plane001.geometry}
        receiveShadow
        castShadow
        rotation={[ 0, 3.1416, 0 ]}
    >
    <T.MeshPhysicalMaterial
        map={$floorTexture}
        normalMap={$floorNormalTexture}
        color="#000000"
        opacity={1}
        transparent={false}
        roughness={0.1087}
        metalness={0}
        clipIntersection={false}
        clipShadows={false}
        reflectivity={0}
        ior={0.0652}
        sheen={0}
        sheenRoughness={0}
        clearcoatRoughness={0}
        emissive="#000000"
    />
    </T.Mesh>
{/await}

<!-- <T.Mesh
    position={[0, -0.7733, -0.0024]}
    rotation.x={deg2rad(-90)}
    scale={[3.5, 3.3, 2.5]}
>
    <T.PlaneGeometry args={[3, 3]} />
    <T.MeshPhysicalMaterial
        map={$floorTexture}
        normalMap={$floorNormalTexture}
        color="#000000"
        opacity={1}
        transparent={false}
        roughness={0.1087}
        metalness={0.1957}
        clipIntersection={false}
        clipShadows={false}
        reflectivity={0.6196}
        ior={0}
        sheen={0}
        sheenRoughness={0.0652}
        clearcoatRoughness={0}
    />
</T.Mesh> -->
