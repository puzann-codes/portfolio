"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

const START_CAM = new THREE.Vector3(0, 1.05, 2.35);
const END_CAM = new THREE.Vector3(0, 1.55, 7.4);
const LOOK_AT = new THREE.Vector3(0, 0.65, 0);
const START_ROT = 0; // front toward camera
const END_ROT = -Math.PI * 0.22; // settled 3/4 hero angle
const INTRO_DURATION = 3.2; // seconds

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const FRONT_WHEEL_NAMES = ["WheelFrontL", "WheelFrontR"];
const REAR_WHEEL_NAMES = ["WheelRearL", "WheelRearR"];
const PAINT_MATERIAL_NAMES = ["Paint 1 Carmine", "Paint 2 Carmine"];
const SMOKE_COUNT = 10;

// a soft radial-gradient sprite, generated once at runtime — the base
// texture for every smoke puff, no image asset needed
function createSmokeTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.4, "rgba(230,230,230,0.5)");
  gradient.addColorStop(1, "rgba(200,200,200,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function CarModel({
  frontWheelsRef,
  rearWheelsRef,
}: {
  frontWheelsRef: React.RefObject<THREE.Object3D[]>;
  rearWheelsRef: React.RefObject<THREE.Object3D[]>;
}) {
  const { scene } = useGLTF("/models/car.glb");
  const model = useMemo(() => scene.clone(true), [scene]);

  // the source model ships a metallic red — recolored to a deep gloss black
  // so it sits with the site's monochrome theme instead of fighting it
  useEffect(() => {
    model.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material?.name &&
        PAINT_MATERIAL_NAMES.includes(child.material.name)
      ) {
        const mat = (child.material as THREE.MeshStandardMaterial).clone();
        mat.color.setRGB(0.035, 0.035, 0.04);
        mat.metalness = 0.85;
        mat.roughness = 0.22;
        child.material = mat;
      }
    });

    frontWheelsRef.current = FRONT_WHEEL_NAMES.map((name) =>
      model.getObjectByName(name),
    ).filter((obj): obj is THREE.Object3D => Boolean(obj));
    rearWheelsRef.current = REAR_WHEEL_NAMES.map((name) =>
      model.getObjectByName(name),
    ).filter((obj): obj is THREE.Object3D => Boolean(obj));

    // the brake caliper/pad is modeled as a child of the wheel hub, but a
    // real caliper is mounted to the suspension and doesn't spin with the
    // wheel — left as a child, it ends up pointing in a random direction
    // after the intro's several full rotations, reading as a broken wheel.
    // attach() reparents it up to the (non-spinning) hub's parent while
    // preserving its current world transform, so it stays put visually.
    for (const name of [...FRONT_WHEEL_NAMES, ...REAR_WHEEL_NAMES]) {
      const wheelGroup = model.getObjectByName(name);
      const brakePad = model.getObjectByName(`${name}BrakePad`);
      if (wheelGroup?.parent && brakePad) {
        wheelGroup.parent.attach(brakePad);
      }
    }
  }, [model, frontWheelsRef, rearWheelsRef]);

  return <primitive object={model} />;
}

function SmokePuffs({ spritesRef }: { spritesRef: React.RefObject<THREE.Sprite[]> }) {
  const smokeTexture = useMemo(() => createSmokeTexture(), []);
  return (
    <>
      {Array.from({ length: SMOKE_COUNT }).map((_, i) => (
        <sprite
          key={i}
          ref={(el) => {
            if (el) spritesRef.current[i] = el;
          }}
          visible={false}
        >
          <spriteMaterial map={smokeTexture} transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </>
  );
}

function Rig({
  onIntroComplete,
  playTick,
}: {
  onIntroComplete: () => void;
  playTick?: () => void;
}) {
  const { camera } = useThree();
  const lastHoverTickRef = useRef(0);
  const carGroupRef = useRef<THREE.Group>(null);
  const frontWheelsRef = useRef<THREE.Object3D[]>([]);
  const rearWheelsRef = useRef<THREE.Object3D[]>([]);
  const elapsedRef = useRef(0);
  const prevEasedRef = useRef(0);
  const doneRef = useRef(false);

  const scrollVelocityRef = useRef(0);
  const smokeSpritesRef = useRef<THREE.Sprite[]>([]);
  const smokeLifeRef = useRef<number[]>(new Array(SMOKE_COUNT).fill(-1));
  const smokeSeedRef = useRef<number[]>(new Array(SMOKE_COUNT).fill(0));
  const smokeIndexRef = useRef(0);
  const nextSmokeAtRef = useRef(0);
  // rear-wheel anchor points in carGroup-local space, derived from the
  // wheels' actual world transforms the first time they're needed (rather
  // than hand-guessed coordinates, which don't transfer across models)
  const rearWheelLocalRef = useRef<[THREE.Vector3, THREE.Vector3] | null>(null);

  const getRearWheelLocals = () => {
    if (rearWheelLocalRef.current) return rearWheelLocalRef.current;
    if (rearWheelsRef.current.length < 2 || !carGroupRef.current) return null;
    const locals = rearWheelsRef.current.slice(0, 2).map((wheel) => {
      const world = new THREE.Vector3();
      wheel.getWorldPosition(world);
      return carGroupRef.current!.worldToLocal(world);
    }) as [THREE.Vector3, THREE.Vector3];
    rearWheelLocalRef.current = locals;
    return locals;
  };

  useEffect(() => {
    camera.position.copy(START_CAM);
    camera.lookAt(LOOK_AT);
  }, [camera]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      scrollVelocityRef.current += e.deltaY * 0.02;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame((frameState, delta) => {
    const dt = Math.min(delta, 0.05);

    if (!doneRef.current) {
      // the first frame after Suspense resolves reports a delta covering the
      // whole asset-load time (seconds), which would otherwise snap the
      // intro straight to its end pose in one frame — clamp it like normal
      elapsedRef.current += dt;
      const t = Math.min(1, elapsedRef.current / INTRO_DURATION);
      const eased = easeInOutCubic(t);

      camera.position.lerpVectors(START_CAM, END_CAM, eased);
      camera.lookAt(LOOK_AT);

      if (carGroupRef.current) {
        carGroupRef.current.rotation.y = THREE.MathUtils.lerp(START_ROT, END_ROT, eased);
      }

      // wheels spin fastest mid-reveal (camera moving fastest) and settle
      // to a stop as the intro eases in — derived from the same eased curve
      // so the "deceleration" reads as connected to the car coming to rest
      const spin = (eased - prevEasedRef.current) * 46;
      prevEasedRef.current = eased;
      for (const wheel of [...frontWheelsRef.current, ...rearWheelsRef.current]) {
        wheel.rotation.x -= spin;
      }

      if (t >= 1) {
        doneRef.current = true;
        onIntroComplete();
      }
      return;
    }

    // post-intro: only the rear wheels answer to scroll, like a
    // rear-wheel-drive car doing a standing burnout — front wheels stay put
    scrollVelocityRef.current *= 0.9;
    const speed = scrollVelocityRef.current;
    for (const wheel of rearWheelsRef.current) {
      wheel.rotation.x -= speed;
    }

    // smoke: spawn rate scales with rear-wheel speed
    const intensity = Math.min(1, Math.abs(speed) / 4);
    if (intensity > 0.03) {
      const interval = 0.5 - intensity * 0.4;
      if (frameState.clock.elapsedTime >= nextSmokeAtRef.current) {
        const i = smokeIndexRef.current;
        smokeIndexRef.current = (smokeIndexRef.current + 1) % SMOKE_COUNT;
        smokeLifeRef.current[i] = 0;
        smokeSeedRef.current[i] = Math.random();
        nextSmokeAtRef.current = frameState.clock.elapsedTime + interval;
      }
    }

    const rearWheelLocals = getRearWheelLocals();
    smokeSpritesRef.current.forEach((sprite, i) => {
      const life = smokeLifeRef.current[i];
      if (life < 0 || !rearWheelLocals) {
        sprite.visible = false;
        return;
      }
      const duration = 1.1;
      const nextLife = life + dt / duration;
      if (nextLife > 1) {
        smokeLifeRef.current[i] = -1;
        sprite.visible = false;
        return;
      }
      smokeLifeRef.current[i] = nextLife;
      sprite.visible = true;
      const seed = smokeSeedRef.current[i];
      const wheelBase = rearWheelLocals[i % 2];
      const drift = nextLife * 0.6;
      sprite.position.set(
        wheelBase.x + (seed - 0.5) * 0.4,
        wheelBase.y + drift * 0.8,
        wheelBase.z - drift * (0.6 + intensity * 0.6),
      );
      sprite.scale.setScalar(0.3 + nextLife * (0.65 + intensity * 0.4));
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = (1 - nextLife) * 0.65 * (0.5 + intensity);
    });
  });

  return (
    <group
      ref={carGroupRef}
      rotation={[0, START_ROT, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!doneRef.current || !playTick) return;
        // sub-meshes fire their own over/out as the ray crosses the car's
        // surface — a short cooldown keeps this one soft tick on entry
        // instead of a machine-gun of clicks while the mouse wanders it
        const now = performance.now();
        if (now - lastHoverTickRef.current > 500) {
          lastHoverTickRef.current = now;
          playTick();
        }
      }}
    >
      <CarModel frontWheelsRef={frontWheelsRef} rearWheelsRef={rearWheelsRef} />
      <SmokePuffs spritesRef={smokeSpritesRef} />
    </group>
  );
}

export default function HeroCar3D({
  onIntroComplete,
  playTick,
}: {
  onIntroComplete?: () => void;
  playTick?: () => void;
}) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [START_CAM.x, START_CAM.y, START_CAM.z], fov: 32 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Rig onIntroComplete={() => onIntroComplete?.()} playTick={playTick} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
