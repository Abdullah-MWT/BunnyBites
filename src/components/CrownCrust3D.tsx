import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundEffects } from '../utils/audio';

interface CrownCrust3DProps {
  isExploded?: boolean;
  onExplodeToggle?: () => void;
}

export const CrownCrust3D: React.FC<CrownCrust3DProps> = ({
  isExploded = false,
  onExplodeToggle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 3.2, 4.2);
    camera.lookAt(0, 0, 0);

    // Warm appetizing lighting
    const ambLight = new THREE.AmbientLight(0xFFF7EC, 1.3);
    scene.add(ambLight);

    const mainLight = new THREE.DirectionalLight(0xFFE8C2, 1.8);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const goldRimLight = new THREE.PointLight(0xF5C45E, 1.6, 10);
    goldRimLight.position.set(-2, 2, -2);
    scene.add(goldRimLight);

    // Root Pizza Group
    const pizzaRoot = new THREE.Group();
    scene.add(pizzaRoot);

    // Pizza Materials
    const crustMat = new THREE.MeshStandardMaterial({
      color: 0xE29B4A, // Golden baked dough
      roughness: 0.8,
      metalness: 0.05,
    });
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xFFF0A0, // Melted golden mozzarella
      roughness: 0.35,
      metalness: 0.15,
    });
    const dollopMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF, // White garlic cream cheese dollop
      roughness: 0.4,
    });
    const oliveMat = new THREE.MeshStandardMaterial({
      color: 0x1B1E24, // Glossy black olive
      roughness: 0.25,
    });
    const capsicumMat = new THREE.MeshStandardMaterial({
      color: 0x2A8C4A, // Emerald fresh capsicum
      roughness: 0.3,
    });
    const chickenMat = new THREE.MeshStandardMaterial({
      color: 0xB85C26, // Spiced tandoori chicken chunk
      roughness: 0.7,
    });

    // Layer Groups for Explode View
    const baseLayer = new THREE.Group();
    const crownLayer = new THREE.Group();
    const sauceCheeseLayer = new THREE.Group();
    const toppingsLayer = new THREE.Group();

    pizzaRoot.add(baseLayer);
    pizzaRoot.add(crownLayer);
    pizzaRoot.add(sauceCheeseLayer);
    pizzaRoot.add(toppingsLayer);

    // 1. Base Dough Disc
    const baseGeo = new THREE.CylinderGeometry(1.9, 1.95, 0.1, 36);
    const baseMesh = new THREE.Mesh(baseGeo, crustMat);
    baseMesh.position.y = 0;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseLayer.add(baseMesh);

    // 2. Crown Crust Ring: ~18 golden crust bumps with white cheese dollops
    const numBumps = 18;
    const ringRadius = 1.82;
    const bumpGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const dollopGeo = new THREE.ConeGeometry(0.12, 0.16, 12);

    for (let i = 0; i < numBumps; i++) {
      const angle = (i / numBumps) * Math.PI * 2;
      const bx = Math.cos(angle) * ringRadius;
      const bz = Math.sin(angle) * ringRadius;

      // Golden cheese pocket bump
      const bump = new THREE.Mesh(bumpGeo, crustMat);
      bump.scale.set(1.1, 0.85, 1.1);
      bump.position.set(bx, 0.1, bz);
      crownLayer.add(bump);

      // White cheese dollop on top
      const dollop = new THREE.Mesh(dollopGeo, dollopMat);
      dollop.position.set(bx, 0.3, bz);
      dollop.rotation.y = angle;
      crownLayer.add(dollop);
    }

    // 3. Cheese & Marinara Layer
    const cheeseDiscGeo = new THREE.CylinderGeometry(1.65, 1.68, 0.08, 36);
    const cheeseMesh = new THREE.Mesh(cheeseDiscGeo, cheeseMat);
    cheeseMesh.position.y = 0.08;
    sauceCheeseLayer.add(cheeseMesh);

    // 4. Loaded Toppings Layer: Olives, Capsicum strips, Spiced Chicken chunks
    // Olives (dark tori)
    const oliveGeo = new THREE.TorusGeometry(0.08, 0.038, 8, 16);
    for (let o = 0; o < 14; o++) {
      const r = 0.4 + Math.random() * 1.05;
      const theta = Math.random() * Math.PI * 2;
      const olive = new THREE.Mesh(oliveGeo, oliveMat);
      olive.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      olive.rotation.y = Math.random() * Math.PI;
      olive.position.set(Math.cos(theta) * r, 0.15, Math.sin(theta) * r);
      toppingsLayer.add(olive);
    }

    // Capsicum strips
    const capsicumGeo = new THREE.BoxGeometry(0.32, 0.045, 0.07);
    for (let c = 0; c < 12; c++) {
      const r = 0.35 + Math.random() * 1.1;
      const theta = Math.random() * Math.PI * 2;
      const cap = new THREE.Mesh(capsicumGeo, capsicumMat);
      cap.rotation.y = Math.random() * Math.PI;
      cap.rotation.x = (Math.random() - 0.5) * 0.2;
      cap.position.set(Math.cos(theta) * r, 0.16, Math.sin(theta) * r);
      toppingsLayer.add(cap);
    }

    // Chicken Chunks
    const chickenGeo = new THREE.DodecahedronGeometry(0.11);
    for (let k = 0; k < 15; k++) {
      const r = 0.3 + Math.random() * 1.15;
      const theta = Math.random() * Math.PI * 2;
      const chick = new THREE.Mesh(chickenGeo, chickenMat);
      chick.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      chick.position.set(Math.cos(theta) * r, 0.17, Math.sin(theta) * r);
      toppingsLayer.add(chick);
    }

    // Steam particles drifting up
    const steamGeo = new THREE.BufferGeometry();
    const steamCount = 18;
    const steamPos = new Float32Array(steamCount * 3);
    for (let s = 0; s < steamCount * 3; s += 3) {
      steamPos[s] = (Math.random() - 0.5) * 1.2;
      steamPos[s + 1] = 0.3 + Math.random() * 1.4;
      steamPos[s + 2] = (Math.random() - 0.5) * 1.2;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.14,
      transparent: true,
      opacity: 0.35,
    });
    const steamParticles = new THREE.Points(steamGeo, steamMat);
    scene.add(steamParticles);

    // Interactive Drag to Spin with Inertia
    let isDragging = false;
    let prevMouseX = 0;
    let spinVelocity = 0.008;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevMouseX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      spinVelocity = deltaX * 0.006;
      pizzaRoot.rotation.y += spinVelocity;
      prevMouseX = clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    let animId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();

      // Inertia spin
      if (!isDragging) {
        pizzaRoot.rotation.y += spinVelocity;
        spinVelocity *= 0.96;
        if (Math.abs(spinVelocity) < 0.004) {
          spinVelocity = 0.004; // Continuous gentle rotation
        }
      }

      // Explode layer heights
      const targetBaseY = isExploded ? -0.4 : 0;
      const targetCrownY = isExploded ? 0.3 : 0;
      const targetCheeseY = isExploded ? 0.8 : 0;
      const targetToppingsY = isExploded ? 1.35 : 0;

      baseLayer.position.y = THREE.MathUtils.lerp(baseLayer.position.y, targetBaseY, 0.08);
      crownLayer.position.y = THREE.MathUtils.lerp(crownLayer.position.y, targetCrownY, 0.08);
      sauceCheeseLayer.position.y = THREE.MathUtils.lerp(sauceCheeseLayer.position.y, targetCheeseY, 0.08);
      toppingsLayer.position.y = THREE.MathUtils.lerp(toppingsLayer.position.y, targetToppingsY, 0.08);

      // Steam animation
      const spos = steamGeo.attributes.position.array as Float32Array;
      for (let s = 1; s < spos.length; s += 3) {
        spos[s] += delta * 0.4;
        if (spos[s] > 2.0) spos[s] = 0.3;
      }
      steamGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    renderLoop();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isExploded]);

  return (
    <div className="relative w-full h-[360px] md:h-[450px] flex items-center justify-center select-none">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Explode Layers Interactive Button */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            soundEffects.playPop();
            if (onExplodeToggle) onExplodeToggle();
          }}
          className="px-4 py-2 rounded-full font-bold text-xs tracking-wide bg-white/90 hover:bg-[#648BC3] hover:text-white text-[#2F5E9E] border border-[#8DBCE8] shadow-md transition-all flex items-center gap-1.5 backdrop-blur-sm"
        >
          <span>{isExploded ? 'Recombine Crust' : 'Explode 5 Layers'}</span>
          <span className="text-base">{isExploded ? '✨' : '💥'}</span>
        </button>
      </div>

      {/* Ingredient Hotspots floating around */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        {/* Hotspot 1: Crown Bumps */}
        <div className="flex justify-start">
          <div
            onMouseEnter={() => setActiveHotspot('crown')}
            onMouseLeave={() => setActiveHotspot(null)}
            className="pointer-events-auto group relative cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#F5C45E] text-[#1F2430] font-black text-xs flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#F5C45E]/40 animate-pulse">
              1
            </div>
            <div className={`absolute left-10 top-0 w-52 p-3 rounded-xl bg-white/95 text-[#2F5E9E] shadow-xl text-xs font-semibold border border-[#8DBCE8] backdrop-blur-md transition-opacity duration-200 ${activeHotspot === 'crown' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <strong className="block text-sm text-[#0189FE] mb-1">👑 18 Cheese Crowns</strong>
              Hand-pinched dough pockets filled with stringy mozzarella & a dollop of rich white garlic cream.
            </div>
          </div>
        </div>

        {/* Hotspot 2: Spiced Grilled Chicken */}
        <div className="flex justify-end">
          <div
            onMouseEnter={() => setActiveHotspot('chicken')}
            onMouseLeave={() => setActiveHotspot(null)}
            className="pointer-events-auto group relative cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#0189FE] text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#0189FE]/40 animate-pulse">
              2
            </div>
            <div className={`absolute right-10 top-0 w-52 p-3 rounded-xl bg-white/95 text-[#2F5E9E] shadow-xl text-xs font-semibold border border-[#8DBCE8] backdrop-blur-md transition-opacity duration-200 ${activeHotspot === 'chicken' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <strong className="block text-sm text-[#0189FE] mb-1">🍗 Spiced Chicken Chunks</strong>
              Marinated in local Peshawari charcoal spices, grilled juicy and placed generously across the center.
            </div>
          </div>
        </div>

        {/* Hotspot 3: Stone Oven Baked */}
        <div className="flex justify-center">
          <div
            onMouseEnter={() => setActiveHotspot('dough')}
            onMouseLeave={() => setActiveHotspot(null)}
            className="pointer-events-auto group relative cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#2F5E9E] text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#2F5E9E]/40 animate-pulse">
              3
            </div>
            <div className={`absolute bottom-10 -left-20 w-52 p-3 rounded-xl bg-white/95 text-[#2F5E9E] shadow-xl text-xs font-semibold border border-[#8DBCE8] backdrop-blur-md transition-opacity duration-200 ${activeHotspot === 'dough' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <strong className="block text-sm text-[#0189FE] mb-1">🔥 450° Stone Oven Crust</strong>
              Slow-fermented for 24 hours to achieve an ultra-crisp exterior and fluffy pillow interior.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 left-4 text-[11px] text-[#2F5E9E]/70 font-bold bg-white/70 px-2.5 py-1 rounded-full backdrop-blur-xs">
        🖱️ Drag to spin 360° | Hover numbered badges for secrets
      </div>
    </div>
  );
};
