import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GridHelper, AxesHelper } from 'three';

function Model({ fileUrl }) {
  const gltf = useLoader(GLTFLoader, fileUrl);

  // Clean up resources when the model changes
  useEffect(() => {
    return () => {
      gltf.scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });
    };
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

function GridAndAxes() {
  return (
    <>
      <primitive object={new GridHelper(10, 10)} position={[0, -0.1, 0]} />
      <primitive object={new AxesHelper(5)} />
    </>
  );
}

export default function Viewer({ fileUrl }) {
  const controlsRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      controlsRef.current?.update();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45 }}
      onCreated={({ gl }) => {
        gl.physicallyCorrectLights = true;
      }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <Suspense fallback={<Html center><div style={{ color: 'white' }}>Loading...</div></Html>}>
        <Model fileUrl={fileUrl} />
      </Suspense>

      <GridAndAxes />
      <OrbitControls ref={controlsRef} />
    </Canvas>
  );
}
