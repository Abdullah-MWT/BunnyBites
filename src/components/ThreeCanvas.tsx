import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { soundEffects } from '../utils/audio';

interface ThreeCanvasProps {
  isVoiceSpeaking?: boolean;
  bunnyActionTrigger?: string | null;
  onBunnyActionHandled?: () => void;
  lookTarget?: { x: number; y: number } | null;
  activeSection?: string;
  themeNight?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  isVoiceSpeaking = false,
  bunnyActionTrigger = null,
  onBunnyActionHandled,
  lookTarget = null,
  activeSection = 'hero',
  themeNight = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const [showZzz, setShowZzz] = useState<boolean>(false);
  const [bunnyClickCount, setBunnyClickCount] = useState<number>(0);
  const bubbleTimeoutRef = useRef<any>(null);

  // References for animation state
  const mousePosRef = useRef<{ x: number; y: number; vx: number; vy: number }>({ x: 0, y: 0, vx: 0, vy: 0 });
  const scrollPosRef = useRef<{ y: number; vy: number; lastY: number }>({ y: 0, vy: 0, lastY: 0 });
  const idleTimerRef = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(isVoiceSpeaking);
  isSpeakingRef.current = isVoiceSpeaking;

  // Show a cheerful bunny speech bubble
  const triggerBubble = useCallback((text: string, durationMs: number = 3200) => {
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    setSpeechBubbleText(text);
    bubbleTimeoutRef.current = setTimeout(() => {
      setSpeechBubbleText(null);
    }, durationMs);
  }, []);

  // Time-of-day greeting bubble on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const h = new Date().getHours();
      let greeting = 'Hey there! Bunny here! Welcome to Bunny Bites! 🐰✨';
      if (h >= 5 && h < 12) {
        greeting = 'Good morning! Prepping fresh dough & cheese crowns for 12 PM! 🐰☕';
      } else if (h >= 12 && h < 17) {
        greeting = 'Good afternoon! Fresh hot Crown Crust pizzas coming right up! 🍕🐰';
      } else if (h >= 17 && h < 22) {
        greeting = 'Good evening Peshawar! Time for a cheesy Crown Crust feast! 🍕✨';
      } else {
        greeting = 'Late night cravings in Hayatabad? We are open until 3:00 AM! 🌙🐰';
      }
      triggerBubble(greeting, 4500);
    }, 1200);

    return () => clearTimeout(timer);
  }, [triggerBubble]);

  // Handle external bunny action triggers (e.g. cart add hop, order placed cheer)
  useEffect(() => {
    if (!bunnyActionTrigger) return;
    if (bunnyActionTrigger === 'cart_add') {
      triggerBubble('Yum! Added to your cart! 🥕🍕', 2500);
    } else if (bunnyActionTrigger === 'order_placed') {
      triggerBubble('Woohoo! Your order is placed! Baking with love! 🎉🐰', 4500);
    } else if (bunnyActionTrigger === 'cloche_lift') {
      triggerBubble('Ta-da! Behold Peshawar’s Signature Crown Crust! 👑✨', 3500);
    }
    if (onBunnyActionHandled) onBunnyActionHandled();
  }, [bunnyActionTrigger, triggerBubble, onBunnyActionHandled]);

  // Main Three.js Scene Setup & Animation Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'default',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(themeNight ? 0x121A26 : 0xEBF4FC, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(themeNight ? 0x5D7EA8 : 0xFFFAF0, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(themeNight ? 0x8DBCE8 : 0xFFF5E6, 1.4);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const goldPointLight = new THREE.PointLight(0xF5C45E, 1.8, 12);
    goldPointLight.position.set(-2, 3, 2);
    scene.add(goldPointLight);

    // Drifting Sparkles (Points)
    const sparkleCount = isMobile ? 45 : 90;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      sparklePos[i] = (Math.random() - 0.5) * 16;
      sparklePos[i + 1] = Math.random() * 8 - 1;
      sparklePos[i + 2] = (Math.random() - 0.5) * 10;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xF5C45E,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // Background Cloud Spheres
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.9,
      transparent: true,
      opacity: 0.75,
    });
    const cloudGeos = [
      new THREE.SphereGeometry(0.9, 16, 16),
      new THREE.SphereGeometry(1.3, 16, 16),
      new THREE.SphereGeometry(0.8, 16, 16),
    ];
    for (let c = 0; c < (isMobile ? 3 : 6); c++) {
      const cluster = new THREE.Group();
      for (let s = 0; s < 3; s++) {
        const mesh = new THREE.Mesh(cloudGeos[s % 3], cloudMat);
        mesh.position.set((s - 1) * 0.9, (Math.random() - 0.5) * 0.4, 0);
        cluster.add(mesh);
      }
      cluster.position.set((Math.random() - 0.5) * 18, 2.5 + Math.random() * 3, -4 - Math.random() * 4);
      cloudsGroup.add(cluster);
    }
    scene.add(cloudsGroup);

    // ==========================================
    // RIGGED 3D BUNNY MASCOT WITH OBJECT3D PIVOTS
    // ==========================================
    const bunnyRoot = new THREE.Group();
    bunnyRoot.position.set(isMobile ? 0.8 : 1.9, -0.4, 0.5);
    bunnyRoot.scale.set(0.9, 0.9, 0.9);
    scene.add(bunnyRoot);

    // Shadow blob
    const shadowGeo = new THREE.CircleGeometry(0.75, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x2A3E5C,
      transparent: true,
      opacity: 0.22,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.0;
    bunnyRoot.add(shadowMesh);

    // Materials
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xFDFDFD,
      roughness: 0.75,
      metalness: 0.05,
    });
    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xF4A9B8,
      roughness: 0.6,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x0189FE,
      roughness: 0.1,
      metalness: 0.3,
    });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0F1B29 });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xF294A6, roughness: 0.5 });
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xF4A9B8, transparent: true, opacity: 0.6 });
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
    const overallMat = new THREE.MeshStandardMaterial({ color: 0x2F5E9E, roughness: 0.7 });
    const chefHatMat = new THREE.MeshStandardMaterial({ color: 0x648BC3, roughness: 0.65 });
    const chefBandMat = new THREE.MeshStandardMaterial({ color: 0x2F5E9E, roughness: 0.5 });
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x8DBCE8, roughness: 0.5 });
    const clocheMat = new THREE.MeshStandardMaterial({
      color: 0xDCE4EC,
      metalness: 0.92,
      roughness: 0.18,
    });

    // Body
    const bodyPivot = new THREE.Group();
    bunnyRoot.add(bodyPivot);

    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), furMat);
    bodyMesh.scale.set(0.9, 1.05, 0.85);
    bodyMesh.position.y = -0.15;
    bodyPivot.add(bodyMesh);

    // Blue Overalls bib
    const overallsMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.72, 0.7, 24), overallMat);
    overallsMesh.position.set(0, -0.3, 0.02);
    bodyPivot.add(overallsMesh);

    // Bib pocket & golden button
    const pocketGeo = new THREE.PlaneGeometry(0.24, 0.2);
    const pocketMesh = new THREE.Mesh(pocketGeo, new THREE.MeshStandardMaterial({ color: 0x23497C }));
    pocketMesh.position.set(0, -0.22, 0.66);
    bodyPivot.add(pocketMesh);

    // Cute fluffy round tail
    const tailMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), furMat);
    tailMesh.position.set(0, -0.45, -0.72);
    bodyPivot.add(tailMesh);

    // Head Pivot
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.65, 0.05);
    bodyPivot.add(headPivot);

    // Chunky head sphere (chunky cartoon proportions)
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 28, 28), furMat);
    headMesh.scale.set(1.08, 0.98, 1.0);
    headPivot.add(headMesh);

    // Pink Rosy Cheeks
    const leftCheek = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), cheekMat);
    leftCheek.position.set(-0.52, -0.14, 0.75);
    leftCheek.rotation.y = -0.45;
    headPivot.add(leftCheek);

    const rightCheek = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), cheekMat);
    rightCheek.position.set(0.52, -0.14, 0.75);
    rightCheek.rotation.y = 0.45;
    headPivot.add(rightCheek);

    // Eyes
    const eyesGroup = new THREE.Group();
    eyesGroup.position.set(0, 0.08, 0.72);
    headPivot.add(eyesGroup);

    const leftEyePivot = new THREE.Group();
    leftEyePivot.position.set(-0.32, 0, 0);
    eyesGroup.add(leftEyePivot);

    const rightEyePivot = new THREE.Group();
    rightEyePivot.position.set(0.32, 0, 0);
    eyesGroup.add(rightEyePivot);

    const eyeGeo = new THREE.SphereGeometry(0.19, 20, 20);
    const leftEyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    leftEyeMesh.scale.set(1, 1.15, 0.6);
    leftEyePivot.add(leftEyeMesh);

    const rightEyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    rightEyeMesh.scale.set(1, 1.15, 0.6);
    rightEyePivot.add(rightEyeMesh);

    // Pupils and glossy highlights
    const pupilGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.12);
    leftPupil.scale.set(1, 1, 0.4);
    leftEyePivot.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.12);
    rightPupil.scale.set(1, 1, 0.4);
    rightEyePivot.add(rightPupil);

    const shineGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const leftShine = new THREE.Mesh(shineGeo, eyeHighlightMat);
    leftShine.position.set(0.06, 0.06, 0.17);
    leftEyePivot.add(leftShine);

    const rightShine = new THREE.Mesh(shineGeo, eyeHighlightMat);
    rightShine.position.set(0.06, 0.06, 0.17);
    rightEyePivot.add(rightShine);

    // Nose & Buck Teeth
    const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 16), noseMat);
    noseMesh.rotation.x = Math.PI / 2;
    noseMesh.position.set(0, -0.06, 0.88);
    headPivot.add(noseMesh);

    // Mouth Pivot (can open and close for speech!)
    const mouthPivot = new THREE.Group();
    mouthPivot.position.set(0, -0.22, 0.78);
    headPivot.add(mouthPivot);

    const toothGeo = new THREE.BoxGeometry(0.075, 0.11, 0.04);
    const leftTooth = new THREE.Mesh(toothGeo, teethMat);
    leftTooth.position.set(-0.045, 0, 0.02);
    mouthPivot.add(leftTooth);

    const rightTooth = new THREE.Mesh(toothGeo, teethMat);
    rightTooth.position.set(0.045, 0, 0.02);
    mouthPivot.add(rightTooth);

    // Bendable Ear Pivots with Secondary Spring Physics
    const leftEarPivot = new THREE.Group();
    leftEarPivot.position.set(-0.4, 0.72, -0.08);
    headPivot.add(leftEarPivot);

    const rightEarPivot = new THREE.Group();
    rightEarPivot.position.set(0.4, 0.72, -0.08);
    headPivot.add(rightEarPivot);

    const earGeo = new THREE.CylinderGeometry(0.08, 0.22, 1.25, 16);
    earGeo.scale(1, 1, 0.45);

    const leftEarMesh = new THREE.Mesh(earGeo, furMat);
    leftEarMesh.position.set(0, 0.6, 0);
    leftEarPivot.add(leftEarMesh);

    const leftInnerEarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.15, 1.05, 16), innerEarMat);
    leftInnerEarMesh.scale.set(1, 1, 0.25);
    leftInnerEarMesh.position.set(0, 0.58, 0.06);
    leftEarPivot.add(leftInnerEarMesh);

    const rightEarMesh = new THREE.Mesh(earGeo, furMat);
    rightEarMesh.position.set(0, 0.6, 0);
    rightEarPivot.add(rightEarMesh);

    const rightInnerEarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.15, 1.05, 16), innerEarMat);
    rightInnerEarMesh.scale.set(1, 1, 0.25);
    rightInnerEarMesh.position.set(0, 0.58, 0.06);
    rightEarPivot.add(rightInnerEarMesh);

    // Blue Chef Hat
    const chefHatGroup = new THREE.Group();
    chefHatGroup.position.set(0, 0.78, 0.05);
    headPivot.add(chefHatGroup);

    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.2, 24), chefBandMat);
    hatBand.position.y = 0.05;
    chefHatGroup.add(hatBand);

    const hatPuff = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 20), chefHatMat);
    hatPuff.scale.set(1.15, 0.85, 1.15);
    hatPuff.position.y = 0.42;
    chefHatGroup.add(hatPuff);

    // Light-Blue Bow Tie
    const bowPivot = new THREE.Group();
    bowPivot.position.set(0, 0.12, 0.72);
    bodyPivot.add(bowPivot);

    const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bowMat);
    bowPivot.add(bowCenter);
    const bowWingL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 12), bowMat);
    bowWingL.rotation.z = Math.PI / 2;
    bowWingL.position.x = -0.16;
    bowPivot.add(bowWingL);
    const bowWingR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 12), bowMat);
    bowWingR.rotation.z = -Math.PI / 2;
    bowWingR.position.x = 0.16;
    bowPivot.add(bowWingR);

    // Left Arm Holding the Silver Cloche
    const armPivot = new THREE.Group();
    armPivot.position.set(-0.62, 0.1, 0.15);
    bodyPivot.add(armPivot);

    const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 16), furMat);
    armMesh.rotation.z = 0.55;
    armMesh.position.set(-0.2, -0.15, 0.1);
    armPivot.add(armMesh);

    // Silver Cloche (Serving Dome) created with LatheGeometry
    const clochePoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 14; i++) {
      const angle = (i / 14) * (Math.PI / 2);
      clochePoints.push(new THREE.Vector2(Math.cos(angle) * 0.48, Math.sin(angle) * 0.38));
    }
    const clocheGeo = new THREE.LatheGeometry(clochePoints, 28);
    const clocheMesh = new THREE.Mesh(clocheGeo, clocheMat);
    clocheMesh.position.set(-0.5, -0.1, 0.45);
    clocheMesh.castShadow = true;
    armPivot.add(clocheMesh);

    // Cloche knob
    const knobMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), clocheMat);
    knobMesh.position.set(-0.5, 0.32, 0.45);
    armPivot.add(knobMesh);

    // Silver Tray Platter beneath Cloche
    const trayGeo = new THREE.CylinderGeometry(0.56, 0.58, 0.04, 28);
    const trayMesh = new THREE.Mesh(trayGeo, clocheMat);
    trayMesh.position.set(-0.5, -0.12, 0.45);
    armPivot.add(trayMesh);

    // Spring physics state for ears
    let earAngleL = -0.1;
    let earAngleR = 0.1;
    let earVelL = 0;
    let earVelR = 0;

    // Interaction Raycaster for Bunny clicking
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      idleTimerRef.current = 0;
      setShowZzz(false);

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = (clientX / window.innerWidth) * 2 - 1;
      const normY = -(clientY / window.innerHeight) * 2 + 1;

      mousePosRef.current.vx = normX - mousePosRef.current.x;
      mousePosRef.current.vy = normY - mousePosRef.current.y;
      mousePosRef.current.x = normX;
      mousePosRef.current.y = normY;
    };

    const handleScroll = () => {
      idleTimerRef.current = 0;
      const currentY = window.scrollY;
      scrollPosRef.current.vy = (currentY - scrollPosRef.current.lastY) * 0.005;
      scrollPosRef.current.lastY = currentY;
      scrollPosRef.current.y = currentY;
    };

    // Nose Boop / Bunny Click Handler
    const handlePointerDown = (e: MouseEvent) => {
      mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObjects([headMesh, bodyMesh, noseMesh]);
      if (intersects.length > 0) {
        soundEffects.playBoop();

        // Squash and stretch bounce
        bunnyRoot.scale.set(1.15, 0.72, 1.15);
        setTimeout(() => bunnyRoot.scale.set(0.9, 0.9, 0.9), 220);

        setBunnyClickCount(c => {
          const next = c + 1;
          if (next >= 5) {
            triggerBubble('Whoa, dizzy! Spinny carrot storm! 🥕💫', 4000);
            return 0;
          }
          const sounds = ['*Boop!* Hehe! 🐰💕', 'You found my nose! 👃✨', 'Hop hop! Hungry yet? 🍕', 'Ready to take your order! 👑'];
          triggerBubble(sounds[next % sounds.length], 2400);
          return next;
        });
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousedown', handlePointerDown);

    // Animation variables
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlinkInterval = 3.5;
    let isBlinking = false;
    let hopTimer = 0;
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Idle timer (sleepy zzz after 25s)
      idleTimerRef.current += delta;
      if (idleTimerRef.current > 25 && !showZzz) {
        setShowZzz(true);
      }

      // Breathing subtle scale
      const breath = Math.sin(elapsed * 2.2) * 0.02;
      bodyMesh.scale.y = 1.05 + breath;

      // Tail subtle wiggle
      tailMesh.rotation.y = Math.sin(elapsed * 4.5) * 0.25;

      // Small hop every ~8 seconds
      hopTimer += delta;
      if (hopTimer > 8.0) {
        const hopProgress = (hopTimer - 8.0) * 4;
        if (hopProgress < Math.PI) {
          bunnyRoot.position.y = -0.4 + Math.sin(hopProgress) * 0.28;
        } else {
          bunnyRoot.position.y = -0.4;
          hopTimer = 0;
        }
      }

      // Blinking logic (every 2-6s)
      blinkTimer += delta;
      if (blinkTimer > nextBlinkInterval) {
        isBlinking = true;
        leftEyeMesh.scale.y = 0.05;
        rightEyeMesh.scale.y = 0.05;
        if (blinkTimer > nextBlinkInterval + 0.14) {
          isBlinking = false;
          leftEyeMesh.scale.y = 1.15;
          rightEyeMesh.scale.y = 1.15;
          blinkTimer = 0;
          nextBlinkInterval = 2.0 + Math.random() * 4.0;
        }
      }

      // Voice Speaking Mouth Sync
      if (isSpeakingRef.current) {
        mouthPivot.position.y = -0.22 - Math.abs(Math.sin(elapsed * 18)) * 0.09;
        headPivot.rotation.z = Math.sin(elapsed * 12) * 0.04;
      } else {
        mouthPivot.position.y = -0.22;
      }

      // Head & Eyes Cursor Follow with damping and clamping
      const targetLookX = THREE.MathUtils.clamp(mousePosRef.current.x * 0.65, -0.7, 0.7);
      const targetLookY = THREE.MathUtils.clamp(mousePosRef.current.y * 0.5, -0.45, 0.45);

      headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, targetLookX, 0.08);
      headPivot.rotation.x = THREE.MathUtils.lerp(headPivot.rotation.x, -targetLookY, 0.08);

      eyesGroup.position.x = THREE.MathUtils.lerp(eyesGroup.position.x, targetLookX * 0.12, 0.1);
      eyesGroup.position.y = THREE.MathUtils.lerp(eyesGroup.position.y, 0.08 + targetLookY * 0.08, 0.1);

      // Spring physics for ears with cursor flick whip
      const targetEarL = -0.15 - mousePosRef.current.vx * 2.2 - scrollPosRef.current.vy * 0.8;
      const targetEarR = 0.15 - mousePosRef.current.vx * 2.2 - scrollPosRef.current.vy * 0.8;

      const springK = 35;
      const damping = 7;

      const forceL = (targetEarL - earAngleL) * springK - earVelL * damping;
      earVelL += forceL * delta;
      earAngleL += earVelL * delta;
      leftEarPivot.rotation.z = earAngleL;

      const forceR = (targetEarR - earAngleR) * springK - earVelR * damping;
      earVelR += forceR * delta;
      earAngleR += earVelR * delta;
      rightEarPivot.rotation.z = earAngleR;

      // Section-based bunny posing and camera positioning
      let targetBunnyX = isMobile ? 0.7 : 1.9;
      let targetBunnyY = -0.4;
      let targetCamY = 1.2;

      if (activeSection === 'crown-crust') {
        targetBunnyX = isMobile ? 1.4 : 2.4;
        targetBunnyY = -0.1;
      } else if (activeSection === 'menu') {
        targetBunnyX = isMobile ? 1.5 : 2.5;
        targetBunnyY = -0.3;
      } else if (activeSection === 'our-space') {
        targetBunnyX = isMobile ? -0.8 : -1.8;
      }

      bunnyRoot.position.x = THREE.MathUtils.lerp(bunnyRoot.position.x, targetBunnyX, 0.05);
      bunnyRoot.position.y = THREE.MathUtils.lerp(bunnyRoot.position.y, targetBunnyY, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.05);

      // Sparkles drift
      const positions = sparkleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += delta * 0.25;
        if (positions[i] > 6) positions[i] = -2;
      }
      sparkleGeo.attributes.position.needsUpdate = true;

      // Slow cloud drift
      cloudsGroup.children.forEach((c, idx) => {
        c.position.x += delta * (0.08 + idx * 0.02);
        if (c.position.x > 12) c.position.x = -12;
      });

      // Decay scroll velocity
      scrollPosRef.current.vy *= 0.92;
      mousePosRef.current.vx *= 0.9;
      mousePosRef.current.vy *= 0.9;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [themeNight, activeSection]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Three.js canvas container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Interactive Bunny Speech Bubble Floating in 3D Screen Space */}
      {speechBubbleText && (
        <div
          role="status"
          aria-live="polite"
          className="absolute top-28 md:top-20 right-3 sm:right-6 md:right-28 pointer-events-auto max-w-[280px] sm:max-w-xs md:max-w-sm px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-white/95 text-[#2F5E9E] font-bold text-xs sm:text-sm shadow-xl border-2 border-[#8DBCE8] animate-bounce transition-all z-20 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">🐰</span>
            <p className="leading-snug">{speechBubbleText}</p>
          </div>
          <div className="absolute -bottom-2 right-8 sm:right-12 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-[#8DBCE8] transform rotate-45" />
        </div>
      )}

      {/* Sleepy ZZZ Sprites when idle */}
      {showZzz && (
        <div className="absolute top-28 right-24 text-blue-400 font-extrabold text-2xl animate-pulse flex flex-col items-center">
          <span className="text-sm">z</span>
          <span className="text-lg">Z</span>
          <span className="text-2xl">Z...</span>
        </div>
      )}

      {/* WebGL Fallback if device does not support WebGL */}
      {!webglSupported && (
        <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white/90 border border-sky-300 shadow-lg text-center">
          <div className="text-6xl animate-bounce">🐰</div>
          <p className="text-xs font-bold text-sky-800 mt-1">Bunny Bites 2D Mode</p>
        </div>
      )}
    </div>
  );
};
