<script>
    import { T } from "@threlte/core";
    import { useTask } from "@threlte/core";

</script>

<!-- Sky Environment Sphere - Now you can lower it as much as you want -->
<T.Mesh 
    scale={[10, 10, 10]} 
    position={[ 0, -1.6655, 0.4 ]}>
    <T.SphereGeometry args={[1, 32, 16]} />
    <T.MeshStandardMaterial
        side={1}
        color="#fff"
        transparent={true}
        blending={2}
        emissive="#ffffff"
        emissiveIntensity={1}
    />
</T.Mesh>

