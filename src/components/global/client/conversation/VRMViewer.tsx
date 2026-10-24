
// "use client";

// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

// export default function VRMViewer({
//   talking = false,
// }: {
//   talking?: boolean;
// }) {
//   const mountRef = useRef<HTMLDivElement>(null);
//   const talkingRef = useRef(talking);

//   useEffect(() => {
//     talkingRef.current = talking;
//   }, [talking]);

//   useEffect(() => {
//     const mount = mountRef.current;
//     if (!mount) return;

//     let disposed = false;
//     let vrm: any;
//     let frame = 0;

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color("#111827");

//     const camera = new THREE.PerspectiveCamera(
//       30,
//       mount.clientWidth / mount.clientHeight,
//       0.1,
//       100
//     );
//     camera.position.set(0, 1.35, 3.2);
//     camera.lookAt(0, 1.25, 0);

//     const renderer = new THREE.WebGLRenderer({
//       antialias: true,
//       alpha: false,
//     });

//     renderer.setPixelRatio(
//       Math.min(window.devicePixelRatio, 2)
//     );
//     renderer.setSize(mount.clientWidth, mount.clientHeight);
//     mount.appendChild(renderer.domElement);

//     scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 2));

//     const light = new THREE.DirectionalLight(0xffffff, 2);
//     light.position.set(1, 2, 3);
//     scene.add(light);

//     const loader = new GLTFLoader();
//     loader.register(
//       (parser) => new VRMLoaderPlugin(parser)
//     );

//     loader.load(
//       "/models/avatar.vrm",
//       (gltf) => {
//         if (disposed) {
//           VRMUtils.deepDispose(gltf.scene);
//           return;
//         }

//         vrm = gltf.userData.vrm;

//         // Center the model's feet at the origin.
//         const box = new THREE.Box3().setFromObject(vrm.scene);
//         vrm.scene.position.y = -box.min.y;

//         scene.add(vrm.scene);
//       },
//       undefined,
//       (error) => console.error("Failed to load VRM:", error)
//     );

//     const clock = new THREE.Clock();

//     function animate() {
//       frame = requestAnimationFrame(animate);

//       const delta = Math.min(clock.getDelta(), 0.05);

//       if (vrm) {
//         vrm.update(delta);

//         // Basic mouth movement while the AI speaks.
//         const mouth =
//           vrm.expressionManager?.getExpression("aa");

//         if (mouth) {
//           mouth.weight = THREE.MathUtils.damp(
//             mouth.weight,
//             talkingRef.current ? 0.65 : 0,
//             12,
//             delta
//           );
//         }

//         // Gentle idle movement.
//         vrm.scene.rotation.y =
//           Math.sin(clock.elapsedTime * 0.4) * 0.04;
//       }

//       renderer.render(scene, camera);
//     }

//     animate();

//     const resizeObserver = new ResizeObserver(() => {
//       if (!mount.clientWidth || !mount.clientHeight) return;

//       camera.aspect = mount.clientWidth / mount.clientHeight;
//       camera.updateProjectionMatrix();

//       renderer.setSize(mount.clientWidth, mount.clientHeight);
//     });

//     resizeObserver.observe(mount);

//     return () => {
//       disposed = true;
//       cancelAnimationFrame(frame);
//       resizeObserver.disconnect();

//       if (vrm) {
//         scene.remove(vrm.scene);
//         VRMUtils.deepDispose(vrm.scene);
//       }

//       renderer.dispose();
//       renderer.domElement.remove();
//     };
//   }, []);

//   return (
//     <div
//       ref={mountRef}
//       style={{
//         width: "100%",
//         height: "100%",
//         minHeight: 320,
//         overflow: "hidden",
//         borderRadius: 16,
//       }}
//     />
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

type VRMViewerProps = {
  talking?: boolean;
};

export default function VRMViewer({
  talking = false,
}: VRMViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const talkingRef = useRef(talking);

  // Update speaking state without rebuilding the Three.js scene.
  useEffect(() => {
    talkingRef.current = talking;
  }, [talking]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let vrm: any = null;
    let animationFrame = 0;
    let lastFrameTime = 0;

    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111827");

    const camera = new THREE.PerspectiveCamera(
      24,
      1,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });

    // Limit rendering resolution to reduce GPU workload.
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.setSize(
      Math.max(mount.clientWidth, 1),
      Math.max(mount.clientHeight, 1)
    );

    mount.appendChild(renderer.domElement);

    // Soft lighting for a conversational appearance.
    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff,
      0x444466,
      2
    );

    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      2
    );

    keyLight.position.set(1, 2, 3);
    scene.add(keyLight);

    // Keep references to bones for lightweight procedural animation.
    let headBone: THREE.Object3D | null = null;
    let leftUpperArm: THREE.Object3D | null = null;
    let rightUpperArm: THREE.Object3D | null = null;
    let leftLowerArm: THREE.Object3D | null = null;
    let rightLowerArm: THREE.Object3D | null = null;

    let originalHeadRotation: THREE.Euler | null = null;

    let mouthWeight = 0;
    let lastMouthUpdate = 0;

    const clock = new THREE.Clock();

    function setMouthExpression(weight: number) {
      const manager = vrm?.expressionManager;

      if (!manager) return;

      // setValue is supported by current three-vrm versions.
      manager.setValue("aa", THREE.MathUtils.clamp(weight, 0, 1));
    }

    function applyRestingPose(model: any) {
      const humanoid = model.humanoid;

      if (!humanoid) return;

      headBone = humanoid.getNormalizedBoneNode("head") ?? null;

      const neckBone =
        humanoid.getNormalizedBoneNode("neck") ?? null;

      leftUpperArm =
        humanoid.getNormalizedBoneNode("leftUpperArm") ?? null;

      rightUpperArm =
        humanoid.getNormalizedBoneNode("rightUpperArm") ?? null;

      leftLowerArm =
        humanoid.getNormalizedBoneNode("leftLowerArm") ?? null;

      rightLowerArm =
        humanoid.getNormalizedBoneNode("rightLowerArm") ?? null;

      if (headBone) {
        originalHeadRotation = headBone.rotation.clone();
      }

      /*
      * Relax the arms down from a T-pose.
      *
      * These rotations are model-dependent. If an arm rotates
      * the wrong way, reverse the sign for that arm.
      */
      if (leftUpperArm) {
        leftUpperArm.rotation.z -= 1.15;
        leftUpperArm.rotation.x += 0.08;
      }

      if (rightUpperArm) {
        rightUpperArm.rotation.z += 1.15;
        rightUpperArm.rotation.x -= 0.08;
      }

      // Slightly bend the elbows for a more relaxed resting pose.
      if (leftLowerArm) {
        leftLowerArm.rotation.z -= 0.15;
        leftLowerArm.rotation.x += 0.08;
      }

      if (rightLowerArm) {
        rightLowerArm.rotation.z += 0.15;
        rightLowerArm.rotation.x -= 0.08;
      }

      // Keep the head and neck near their default rotations.
      if (neckBone) {
        neckBone.rotation.x -= 0.025;
      }
    }

    const loader = new GLTFLoader();

    loader.register(
      (parser) => new VRMLoaderPlugin(parser)
    );

    loader.load(
      "/models/avatar.vrm",
      (gltf) => {
        if (disposed) {
          VRMUtils.deepDispose(gltf.scene);
          return;
        }

        vrm = gltf.userData.vrm;

        if (!vrm) {
          console.error("The loaded file has no VRM model.");
          return;
        }

        // Align the feet with the world origin.
        const bounds = new THREE.Box3().setFromObject(vrm.scene);
        const size = bounds.getSize(new THREE.Vector3());

        vrm.scene.position.y = -bounds.min.y;

        scene.add(vrm.scene);

        // Apply a more relaxed conversational resting pose.
        applyRestingPose(vrm);

        /*
         * Frame the head and shoulders instead of the full body.
         * The target and distance adapt to the model's height.
         */
        const modelHeight = Math.max(size.y, 1);

        // Aim around the upper chest and shoulders.
        const targetY = modelHeight * 0.82;

        // Smaller value = tighter zoom.
        // This should crop out most of the torso and legs.
        const visibleHeight = modelHeight * 0.28;

        const fovRadians = THREE.MathUtils.degToRad(
          camera.fov
        );

        const distance =
          visibleHeight / (2 * Math.tan(fovRadians / 2));

        camera.position.set(
          0,
          targetY + modelHeight * 0.015,
          distance * 1.12
        );

        camera.lookAt(0, targetY, 0);
        camera.updateProjectionMatrix();

        // Render the loaded model immediately.
        renderer.render(scene, camera);
      },
      undefined,
      (error) => {
        if (!disposed) {
          console.error("Failed to load VRM:", error);
        }
      }
    );

    function animate(timestamp: number) {
      if (disposed || document.hidden) return;

      animationFrame = requestAnimationFrame(animate);

      // Cap rendering at approximately 30 FPS.
      if (timestamp - lastFrameTime < frameInterval) return;

      lastFrameTime = timestamp;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (vrm) {
        vrm.update(delta);

        /*
         * Lightweight mouth animation.
         * Speech is approximated from the talking flag rather
         * than measured from the actual audio waveform.
         */
        const isTalking = talkingRef.current;

        const syllable =
          Math.abs(
            Math.sin(elapsed * 11) *
              0.65 +
              Math.sin(elapsed * 17.3) * 0.35
          );

        const targetMouth = isTalking
          ? 0.12 + syllable * 0.55
          : 0;

        mouthWeight = THREE.MathUtils.damp(
          mouthWeight,
          targetMouth,
          isTalking ? 18 : 12,
          delta
        );

        // Avoid redundant expression updates at higher frequencies.
        if (timestamp - lastMouthUpdate >= 33) {
          setMouthExpression(mouthWeight);
          lastMouthUpdate = timestamp;
        }

        // Subtle idle motion and small head movements while speaking.
        if (headBone && originalHeadRotation) {
          const talkingMotion = isTalking ? 1 : 0.25;

          headBone.rotation.x =
            originalHeadRotation.x +
            Math.sin(elapsed * 2.4) * 0.025 * talkingMotion;

          headBone.rotation.y =
            originalHeadRotation.y +
            Math.sin(elapsed * 1.3) * 0.035;
        }

        // Very subtle body sway.
        vrm.scene.rotation.y =
          Math.sin(elapsed * 0.65) * 0.025;
      }

      renderer.render(scene, camera);
    }

    function startAnimation() {
      if (disposed || document.hidden || animationFrame) return;

      clock.start();
      lastFrameTime = 0;
      animationFrame = requestAnimationFrame(animate);
    }

    function stopAnimation() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    const resizeObserver = new ResizeObserver(() => {
      if (disposed) return;

      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });

    resizeObserver.observe(mount);

    startAnimation();

    return () => {
      disposed = true;

      stopAnimation();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      resizeObserver.disconnect();

      if (vrm) {
        scene.remove(vrm.scene);
        VRMUtils.deepDispose(vrm.scene);
      }

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="h-full w-full overflow-hidden rounded-2xl"
      style={{
        minHeight: 320,
      }}
    />
  );
}
