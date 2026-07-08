"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

const START_CAM = new THREE.Vector3(0, 1.05, 2.35);
const END_CAM = new THREE.Vector3(0, 1.55, 7.4);
const LOOK_AT = new THREE.Vector3(0, 0.65, 0);
const START_ROT = Math.PI; // front toward camera
const END_ROT = Math.PI * 1.14; // settled 3/4 hero angle
const INTRO_DURATION = 3.2; // seconds

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const WHEEL_NAMES = ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"];

function CarModel({
  groupRef,
  wheelsRef,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  wheelsRef: React.RefObject<THREE.Object3D[]>;
}) {
  const { scene } = useGLTF("/models/car.glb");
  const model = useMemo(() => scene.clone(true), [scene]);

  // the source model ships bright red paint — recolored to a deep gloss
  // black so it sits with the site's monochrome theme instead of fighting it
  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material?.name === "Body_Color") {
        const mat = (child.material as THREE.MeshStandardMaterial).clone();
        mat.color.setRGB(0.035, 0.035, 0.04);
        mat.metalness = 0.75;
        mat.roughness = 0.25;
        child.material = mat;
      }
    });

    wheelsRef.current = WHEEL_NAMES.map((name) => model.getObjectByName(name)).filter(
      (obj): obj is THREE.Object3D => Boolean(obj),
    );
  }, [model, wheelsRef]);

  return (
    <group ref={groupRef} rotation={[0, START_ROT, 0]}>
      <primitive object={model} />
    </group>
  );
}

function Rig({ onIntroComplete }: { onIntroComplete: () => void }) {
  const { camera } = useThree();
  const carGroupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Object3D[]>([]);
  const elapsedRef = useRef(0);
  const prevEasedRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    camera.position.copy(START_CAM);
    camera.lookAt(LOOK_AT);
  }, [camera]);

  useFrame((_, delta) => {
    if (doneRef.current) return;
    // the first frame after Suspense resolves reports a delta covering the
    // whole asset-load time (seconds), which would otherwise snap the intro
    // straight to its end pose in one frame — clamp it like a normal frame
    elapsedRef.current += Math.min(delta, 0.05);
    const t = Math.min(1, elapsedRef.current / INTRO_DURATION);
    const eased = easeInOutCubic(t);

    camera.position.lerpVectors(START_CAM, END_CAM, eased);
    camera.lookAt(LOOK_AT);

    if (carGroupRef.current) {
      carGroupRef.current.rotation.y = THREE.MathUtils.lerp(START_ROT, END_ROT, eased);
    }

    // wheels spin fastest mid-reveal (camera moving fastest) and settle to a
    // stop as the intro eases in — derived from the same eased curve so the
    // "deceleration" reads as connected to the car actually coming to rest
    const spin = (eased - prevEasedRef.current) * 46;
    prevEasedRef.current = eased;
    for (const wheel of wheelsRef.current) {
      wheel.rotation.x -= spin;
    }

    if (t >= 1) {
      doneRef.current = true;
      onIntroComplete();
    }
  });

  return <CarModel groupRef={carGroupRef} wheelsRef={wheelsRef} />;
}

export default function HeroCar3D({
  onIntroComplete,
}: {
  onIntroComplete?: () => void;
}) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [START_CAM.x, START_CAM.y, START_CAM.z], fov: 32 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Rig onIntroComplete={() => onIntroComplete?.()} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
