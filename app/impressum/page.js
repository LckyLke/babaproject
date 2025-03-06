'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSpring, animated, config } from '@react-spring/web';
import { 
  Text3D, 
  OrbitControls, 
  Float, 
  Sphere, 
  Box, 
  Torus, 
  Tetrahedron,
  Octahedron,
  Dodecahedron,
  Stars, 
  Trail,
  MeshDistortMaterial,
  MeshWobbleMaterial
} from '@react-three/drei';
import { useState, useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';

// Particle System
function ParticleSystem() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      temp.push({ position: [x, y, z], size: Math.random() * 0.5 + 0.1 });
    }
    return temp;
  }, []);

  return particles.map((particle, i) => (
    <Trail
      key={i}
      width={1}
      length={5}
      color={new THREE.Color(`hsl(${i % 360}, 100%, 75%)`)}
      attenuation={(t) => t * t}
    >
      <Sphere args={[particle.size, 8, 8]} position={particle.position}>
        <MeshDistortMaterial
          color={`hsl(${i % 360}, 100%, 75%)`}
          speed={2}
          distort={0.5}
          radius={1}
        />
      </Sphere>
    </Trail>
  ));
}

// Crazy Geometry Component
function CrazyGeometry({ position, scale, speed, color, type }) {
  const ref = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = Math.sin(t / 4) * 0.5;
    ref.current.rotation.y = t * 0.5;
    ref.current.rotation.z = Math.cos(t / 2) * 0.3;
    ref.current.position.y += Math.sin(t) * 0.01;
  });

  const Geometry = () => {
    switch(type) {
      case 'tetrahedron':
        return <Tetrahedron args={[scale, 0]} ref={ref} position={position}>
          <MeshWobbleMaterial color={color} factor={0.4} speed={2} metalness={0.8} roughness={0.2} />
        </Tetrahedron>;
      case 'octahedron':
        return <Octahedron args={[scale, 0]} ref={ref} position={position}>
          <MeshDistortMaterial color={color} speed={3} distort={0.4} radius={1} metalness={0.8} roughness={0.2} />
        </Octahedron>;
      case 'dodecahedron':
        return <Dodecahedron args={[scale, 0]} ref={ref} position={position}>
          <meshPhongMaterial color={color} shininess={100} specular="#ffffff" />
        </Dodecahedron>;
      case 'torus':
        return <Torus args={[scale, scale/3, 16, 32]} ref={ref} position={position}>
          <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} metalness={0.8} roughness={0.2} />
        </Torus>;
      case 'box':
        return <Box args={[scale, scale, scale]} ref={ref} position={position}>
          <MeshWobbleMaterial color={color} factor={0.4} speed={1} metalness={0.8} roughness={0.2} />
        </Box>;
      default:
        return <Sphere args={[scale, 16, 16]} ref={ref} position={position}>
          <MeshWobbleMaterial color={color} factor={0.4} speed={2} metalness={0.8} roughness={0.2} />
        </Sphere>;
    }
  };

  return <Geometry />;
}

// Enhanced Floating Objects
function FloatingObjects() {
  const objects = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: Math.random() * 0.8 + 0.3,
      speed: Math.random() * 3 + 1,
      type: ['sphere', 'box', 'torus', 'tetrahedron', 'octahedron', 'dodecahedron'][Math.floor(Math.random() * 6)],
      color: `hsl(${i * 5}, 70%, 50%)`
    }));
  }, []);

  return objects.map((obj, i) => (
    <Float 
      key={i}
      speed={obj.speed} 
      rotationIntensity={3} 
      floatIntensity={2}
      position={obj.position}
    >
      <CrazyGeometry 
        position={[0, 0, 0]}
        scale={obj.scale}
        speed={obj.speed}
        color={obj.color}
        type={obj.type}
      />
    </Float>
  ));
}

// 3D Text Component with more dynamic animation
function AnimatedText({ text, position, scale = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2;
    meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
  });

  return (
    <Text3D
      ref={meshRef}
      font="/fonts/helvetiker_regular.typeface.json"
      size={0.8 * scale}
      height={0.3 * scale}
      curveSegments={16}
      position={position}
      bevelEnabled
      bevelThickness={0.1}
      bevelSize={0.04}
      bevelSegments={8}
    >
      {text}
      <meshPhysicalMaterial 
        color="#6366f1"
        emissive="#4338ca"
        emissiveIntensity={0.5}
        metalness={0.7}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.2}
        reflectivity={1}
      />
    </Text3D>
  );
}

// Enhanced 3D Scene
function Scene() {
  const groupRef = useRef();
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  
  // Much more pronounced multi-axis rotation
  useFrame((state, delta) => {
    // Primary continuous rotations on all axes
    rotationRef.current.y += delta * 0.2; // Faster primary Y rotation
    rotationRef.current.x += delta * 0.15; // Continuous X rotation
    rotationRef.current.z += delta * 0.1; // Continuous Z rotation
    
    // Add oscillation for more dynamic movement
    const time = state.clock.getElapsedTime();
    const xOscillation = Math.sin(time * 0.3) * 0.2; // Stronger X oscillation
    const yOscillation = Math.cos(time * 0.2) * 0.15; // Y oscillation
    const zOscillation = Math.sin(time * 0.4) * 0.25; // Stronger Z oscillation
    
    // Apply combined rotation (continuous + oscillation)
    groupRef.current.rotation.x = rotationRef.current.x + xOscillation;
    groupRef.current.rotation.y = rotationRef.current.y + yOscillation;
    groupRef.current.rotation.z = rotationRef.current.z + zOscillation;
  });

  return (
    <group ref={groupRef}>
      <AnimatedText text="Impressum" position={[-2.5, 0, 0]} scale={1.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ParticleSystem />
      <FloatingObjects />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#4f46e5" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0066" />
      <pointLight position={[0, 0, 10]} intensity={1.2} color="#00ffff" />
      <ambientLight intensity={0.6} />
    </group>
  );
}

// Enhanced Content Card with faster animations
const ContentCard = ({ title, children, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { scale, y, rotate } = useSpring({
    scale: isHovered ? 1.05 : 1,
    y: isHovered ? -10 : 0,
    rotate: isHovered ? 3 : 0,
    config: { mass: 1, tension: 500, friction: 12 }
  });

  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: delay * 30, // Even faster delay
    config: { duration: 200 } // Even faster duration
  });

  return (
    <animated.div
      style={{
        opacity,
        transform: scale.to((s) => `perspective(1000px) scale(${s}) translateY(${y.get()}px) rotate(${rotate.get()}deg)`)
      }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20 hover:border-indigo-500/50 transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-2xl font-semibold mb-4 text-indigo-400">{title}</h2>
      <div className="text-slate-300 space-y-4">
        {children}
      </div>
    </animated.div>
  );
};

// Main Component
const Impressum = () => {
  return (
    <div className="h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
      {/* 3D Background - Full screen and fixed position */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]} // Responsive pixel ratio for better performance
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            enableRotate={false} // Disable manual rotation to prevent interference
          />
        </Canvas>
      </div>

      {/* Content overlay */}
      <main className="relative z-10 h-screen overflow-auto">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Title */}
          <h1 className="text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg">
            Impressum
          </h1>
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Content */}
            <div className="space-y-6">
              <ContentCard title="Angaben" delay={1}>
                <p>Luke Friedrichs</p>
                <p>Leibnizstraße 2</p>
                <p>48565 Steinfurt</p>
                <p>Deutschland</p>
              </ContentCard>

              <ContentCard title="Haftungsausschluss" delay={2}>
                <p>Die auf dieser Website zur Verfügung gestellten Berechnungen und Analysen dienen ausschließlich zu Informationszwecken. Trotz sorgfältiger Programmierung und regelmäßiger Kontrolle übernehmen wir keine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der durchgeführten Berechnungen.</p>
              </ContentCard>

              <ContentCard title="Urheberrecht" delay={3}>
                <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
              </ContentCard>
            </div>

            {/* Contact Section */}
            <div className="space-y-6">
              <ContentCard title="Kontakt" delay={4}>
                <div className="space-y-4">
                  {[
                    { href: "mailto:lukefriedrichs@gmail.com", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "lukefriedrichs@gmail.com" },
                    { href: "tel:+4915736763420", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", text: "+49 157 3676 3420" },
                    { href: "https://www.linkedin.com/in/luke-friedrichs-b40a391aa/", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z", text: "LinkedIn Profil" }
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-indigo-400 hover:text-indigo-300 transition-all duration-200 hover:translate-x-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span>{item.text}</span>
                    </a>
                  ))}
                </div>
              </ContentCard>

              <ContentCard title="Haftung" delay={5}>
                <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
              </ContentCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Impressum;
