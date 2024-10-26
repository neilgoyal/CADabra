// import React, { Suspense } from 'react'
// import {Link} from "react-router-dom";

// import { Canvas, useLoader } from '@react-three/fiber';
// import { OrbitControls, useGLTF } from '@react-three/drei';


// function Model({ fileUrl }) {
//   const { scene } = useGLTF(fileUrl);
//   return <primitive object={scene} />;
// }

// function Viewer({ fileUrl }) {
//     return (
//       <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
//         <ambientLight intensity={0.5} />
//         <directionalLight position={[10, 10, 5]} intensity={1} />
//         <Suspense fallback={null}>
//           <Model fileUrl={fileUrl} />
//         </Suspense>
//         <OrbitControls />
//       </Canvas>
//     );
//   }

// export default Viewer

import React, { Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GridHelper, AxesHelper } from 'three';

function Model({ fileUrl }) {
  const gltf = useLoader(GLTFLoader, fileUrl);
  return <primitive object={gltf.scene} />;
}

function GridAndAxes() {
  return (
    <>
      {/* Add a grid helper for the ground plane */}
      <primitive object={new GridHelper(10, 10)} position={[0, -0.1, 0]} />

      {/* Add an axes helper to show the coordinate axes */}
      <primitive object={new AxesHelper(5)} />
    </>
  );
}

export default function Viewer({ fileUrl }) {
  const controlsRef = useRef();

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Suspense fallback={<Html center><div>Loading...</div></Html>}>
        <Model fileUrl={fileUrl} />
      </Suspense>

      {/* Add Grid and Axes helpers for the coordinate system */}
      <GridAndAxes />

      {/* Use ref for OrbitControls */}
      <OrbitControls ref={controlsRef} />
    </Canvas>
  );
}
