import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundEffects } from '../utils/audio';
import { Sparkles, Layers, Info } from 'lucide-react';

interface CrownCrust3DProps {
  isExploded?: boolean;
  onExplodeToggle?: () => void;
}

export const CrownCrust3D: React.FC<CrownCrust3DProps> = ({
  isExploded = false,
  onExplodeToggle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHighlight, setActiveHighlight] = useState<number>(0);

  const highlights = [
    {
      id: 0,
      title: '18 Cheese Crowns',
      badge: '👑',
      tag: 'Hand-Pinched',
      desc: 'Hand-crimped golden pockets stuffed with stretchy mozzarella & garlic cream dollops.',
    },
    {
      id: 1,
      title: '450°C Volcanic Deck',
      badge: '🔥',
      tag: 'Stone Oven',
      desc: 'Blistered in 90 seconds on volcanic stone deck for high-hydration leopard spots.',
    },
    {
      id: 2,
      title: 'Peshawari Spiced Meat',
      badge: '🍗',
      tag: 'Smoked Charcoal',
      desc: 'Tender chicken marinated in house roasted spices, black olives & bell capsicum.',
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

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

    // Responsive Camera Fitting:
    // If aspect < 1.2 (mobile phones & small boxes), pull camera back so the full 4.2-unit pizza fits with padding!
    const aspect = width / height;
    const baseDistance = aspect < 1.0 ? 5.8 / aspect : aspect < 1.3 ? 5.2 : 4.4;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 50);
    camera.position.set(0, baseDistance * 0.72, baseDistance);
    camera.lookAt(0, 0, 0);

    // Warm Appetizing Lighting
    const ambLight = new THREE.AmbientLight(0xFFF7EC, 1.4);
    scene.add(ambLight);

    const mainLight = new THREE.DirectionalLight(0xFFE8C2, 1.8);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const goldRimLight = new THREE.PointLight(0xF5C45E, 1.5, 12);
    goldRimLight.position.set(-2, 3, -2);
    scene.add(goldRimLight);

    // Root Pizza Group
    const pizzaRoot = new THREE.Group();
    scene.add(pizzaRoot);

    // Materials
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
    const baseGeo = new THREE.CylinderGeometry(1.85, 1.9, 0.1, 36);
    const baseMesh = new THREE.Mesh(baseGeo, crustMat);
    baseMesh.position.y = 0;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseLayer.add(baseMesh);

    // 2. Crown Crust Ring: 18 golden crust bumps with white cheese dollops
    const numBumps = 18;
    const ringRadius = 1.78;
    const bumpGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const dollopGeo = new THREE.ConeGeometry(0.11, 0.15, 12);

    for (let i = 0; i < numBumps; i++) {
      const angle = (i / numBumps) * Math.PI * 2;
      const bx = Math.cos(angle) * ringRadius;
      const bz = Math.sin(angle) * ringRadius;

      // Golden cheese pocket bump
      const bump = new THREE.Mesh(bumpGeo, crustMat);
      bump.scale.set(1.1, 0.85, 1.1);
      bump.position.set(bx, 0.1, bz);
      crownLayer.add(bump);

      // Garlic Cream Dollop
      const dollop = new THREE.Mesh(dollopGeo, dollopMat);
      dollop.position.set(bx * 0.94, 0.28, bz * 0.94);
      crownLayer.add(dollop);
    }

    // 3. Melted Mozzarella Cheese Disc
    const cheeseGeo = new THREE.CylinderGeometry(1.58, 1.62, 0.05, 32);
    const cheeseMesh = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheeseMesh.position.y = 0.06;
    sauceCheeseLayer.add(cheeseMesh);

    // 4. Center Toppings
    const oliveGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12);
    const capsicumGeo = new THREE.BoxGeometry(0.22, 0.05, 0.1);
    const chickenGeo = new THREE.BoxGeometry(0.25, 0.12, 0.2);

    // Procedural distribution across center
    for (let t = 0; t < 22; t++) {
      const r = 0.2 + Math.sqrt(Math.random()) * 1.25;
      const theta = Math.random() * Math.PI * 2;
      const tx = Math.cos(theta) * r;
      const tz = Math.sin(theta) * r;

      if (t % 3 === 0) {
        const chicken = new THREE.Mesh(chickenGeo, chickenMat);
        chicken.position.set(tx, 0.14, tz);
        chicken.rotation.y = Math.random() * Math.PI;
        chicken.rotation.z = (Math.random() - 0.5) * 0.2;
        toppingsLayer.add(chicken);
      } else if (t % 3 === 1) {
        const olive = new THREE.Mesh(oliveGeo, oliveMat);
        olive.position.set(tx, 0.12, tz);
        olive.rotation.x = Math.PI / 2;
        toppingsLayer.add(olive);
      } else {
        const capsicum = new THREE.Mesh(capsicumGeo, capsicumMat);
        capsicum.position.set(tx, 0.11, tz);
        capsicum.rotation.y = Math.random() * Math.PI;
        toppingsLayer.add(capsicum);
      }
    }

    // Interactive Drag Orbit & Auto-spin
    let isDragging = false;
    let prevMouseX = 0;
    let autoSpin = true;
    let rotationVelocity = 0.006;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      autoSpin = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseX = clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      prevMouseX = clientX;
      pizzaRoot.rotation.y += deltaX * 0.01;
    };

    const onPointerUp = () => {
      isDragging = false;
      setTimeout(() => {
        autoSpin = true;
      }, 3500);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();

      if (autoSpin) {
        pizzaRoot.rotation.y += rotationVelocity;
      }

      // Smooth Layer Explosion Lerp
      const targetBaseY = isExploded ? -0.7 : 0;
      const targetCrownY = isExploded ? 0.35 : 0;
      const targetCheeseY = isExploded ? 0.95 : 0;
      const targetToppingsY = isExploded ? 1.6 : 0;

      baseLayer.position.y = THREE.MathUtils.lerp(baseLayer.position.y, targetBaseY, 0.08);
      crownLayer.position.y = THREE.MathUtils.lerp(crownLayer.position.y, targetCrownY, 0.08);
      sauceCheeseLayer.position.y = THREE.MathUtils.lerp(sauceCheeseLayer.position.y, targetCheeseY, 0.08);
      toppingsLayer.position.y = THREE.MathUtils.lerp(toppingsLayer.position.y, targetToppingsY, 0.08);

      renderer.render(scene, camera);
    };

    renderLoop();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const newAspect = w / h;
      const newDistance = newAspect < 1.0 ? 5.8 / newAspect : newAspect < 1.3 ? 5.2 : 4.4;

      camera.aspect = newAspect;
      camera.position.set(0, newDistance * 0.72, newDistance);
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
    <div className="w-full flex flex-col items-center select-none">
      {/* 3D Canvas Container with Clean Aspect Ratio and No Clumsy Box Overflow */}
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[430px] rounded-2xl overflow-hidden bg-gradient-to-b from-stone-50/50 to-stone-100/30 dark:from-slate-900/40 dark:to-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Explode / Recombine Control Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              if (onExplodeToggle) onExplodeToggle();
            }}
            className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer hover:border-[#0189FE]"
          >
            <Layers className="w-4 h-4 text-[#0189FE]" />
            <span>{isExploded ? 'Recombine Crust' : 'Explode 5 Layers'}</span>
          </button>
        </div>

        {/* Clean Spin Instruction Footer */}
        <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs">
            Drag to rotate 360° · Scroll to zoom
          </span>
        </div>
      </div>

      {/* Touch-Friendly Ingredient Highlight Tabs (Replaces overlapping popups on mobile!) */}
      <div className="w-full mt-4 space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {highlights.map(h => {
            const isSelected = activeHighlight === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  setActiveHighlight(h.id);
                }}
                className={`min-h-[44px] p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'border-[#0189FE] bg-sky-50 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className="text-base leading-none mb-1">{h.badge}</span>
                <span className="text-[11px] font-bold truncate max-w-full">{h.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Highlight Detail Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#0189FE] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{highlights[activeHighlight].title}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-md bg-[#0189FE]/10 text-[#0189FE] dark:text-sky-300 font-bold uppercase tracking-wider">
                {highlights[activeHighlight].tag}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {highlights[activeHighlight].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
