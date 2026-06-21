import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type ViewerPaneProps = {
  model?: ArrayBuffer;
};

export default function ViewerPane({ model }: ViewerPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!model || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x555555);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.GridHelper(200, 20, 0x888888, 0x666666));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x333333, 1.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(80, 120, 100);
    scene.add(keyLight);

    const loader = new ThreeMFLoader();
    const object = loader.parse(model);

    // Convert OpenSCAD Z-up to Three.js Y-up
    object.rotation.x = -Math.PI / 2;    

    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);

    object.position.sub(center);
    scene.add(object);

    const radius = Math.max(size.x, size.y, size.z) || 20;
    const distance = radius * 2.5;

    camera.position.set(distance, distance, distance);
    camera.near = Math.max(distance / 1000, 0.01);
    camera.far = distance * 50;
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.update();

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth || 1;
      const nextHeight = container.clientHeight || 1;

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });

    resizeObserver.observe(container);

    let frameId = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();

          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      container.innerHTML = "";
    };
  }, [model]);

  return (
    <main className="relative min-w-0 flex-1 bg-neutral-700">
      {!model && (
        <div className="flex h-full items-center justify-center text-neutral-300">
          Generate a model to preview it.
        </div>
      )}

      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </main>
  );
}