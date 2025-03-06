'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  MeshWobbleMaterial,
  useGLTF,
  PerspectiveCamera,
  shaderMaterial,
  Ring
} from '@react-three/drei';
import { useState, useRef, useMemo, Suspense, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Portal/Vortex Shader Material
const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#4338ca'),
    uColorEnd: new THREE.Color('#a855f7')
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
      vUv = uv;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    varying vec2 vUv;
    
    vec4 permute(vec4 x) {
      return mod(((x*34.0)+1.0)*x, 289.0);
    }
    
    vec2 fade(vec2 t) {
      return t*t*t*(t*(t*6.0-15.0)+10.0);
    }
    
    float cnoise(vec2 P) {
      vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
      Pi = mod(Pi, 289.0);
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
      vec4 i = permute(permute(ix) + iy);
      vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
      vec4 gy = abs(gx) - 0.5;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
      vec2 g00 = vec2(gx.x,gy.x);
      vec2 g10 = vec2(gx.y,gy.y);
      vec2 g01 = vec2(gx.z,gy.z);
      vec2 g11 = vec2(gx.w,gy.w);
      vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
      g00 *= norm.x;
      g01 *= norm.y;
      g10 *= norm.z;
      g11 *= norm.w;
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
      return 2.3 * n_xy;
    }
    
    void main() {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = vUv;
      
      // Distance from center
      float dist = distance(uv, vec2(0.5));
      
      // Time-based animation
      float time = uTime * 0.5;
      
      // Create swirl effect
      float angle = atan(uv.y - 0.5, uv.x - 0.5);
      float swirl = sin(dist * 20.0 - time * 2.0 + angle * 5.0) * 0.5 + 0.5;
      
      // Add noise for texture
      float noise = cnoise(uv * 5.0 + time) * 0.5 + 0.5;
      
      // Create portal effect
      float strength = 1.0 - dist * 2.0;
      strength = pow(strength, 3.0);
      
      // Add glow and swirl
      float glow = smoothstep(0.0, 0.5, strength) + swirl * 0.3 * strength + noise * 0.1;
      
      // Mix colors based on distance and time
      vec3 color = mix(uColorStart, uColorEnd, sin(time + dist * 10.0) * 0.5 + 0.5);
      
      // Output final color
      gl_FragColor = vec4(color, glow);
      
      // Add transparency at the edges
      if (glow < 0.1) discard;
    }
  `
);

// Sun Shader Material
const SunMaterial = shaderMaterial(
  {
    uTime: 0
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Simplex 3D Noise
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      // First corner
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      // Permutations
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              
      // Gradients
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      // Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }
    
    void main() {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = vUv;
      
      // Time-based animation
      float time = uTime * 0.2;
      
      // Create sun surface effect
      float noise1 = snoise(vec3(vPosition.x * 2.0, vPosition.y * 2.0, vPosition.z * 2.0 + time)) * 0.5 + 0.5;
      float noise2 = snoise(vec3(vPosition.x * 4.0, vPosition.y * 4.0, vPosition.z * 4.0 + time * 2.0)) * 0.25 + 0.75;
      float combinedNoise = noise1 * noise2;
      
      // Create color gradient
      vec3 baseColor = vec3(1.0, 0.6, 0.1); // Orange
      vec3 hotColor = vec3(1.0, 0.9, 0.3);  // Yellow
      vec3 finalColor = mix(baseColor, hotColor, combinedNoise);
      
      // Add glow
      float glow = 1.0;
      
      // Output final color
      gl_FragColor = vec4(finalColor, glow);
    }
  `
);

// Extend Three.js with our custom shaders
extend({ PortalMaterial, SunMaterial });

// Portal Effect Component
function Portal({ position = [0, 0, -5], scale = 5 }) {
  const portalRef = useRef();
  const materialRef = useRef();
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
    }
  });
  
  return (
    <mesh ref={portalRef} position={position} rotation={[0, 0, 0]}>
      <planeGeometry args={[scale, scale, 32, 32]} />
      <portalMaterial ref={materialRef} transparent depthWrite={false} />
    </mesh>
  );
}

// Mouse tracker for scene interaction
function MouseTracker({ children }) {
  const [mousePosition, setMousePosition] = useState([0, 0]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition([x, y]);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return children(mousePosition);
}

// Interactive instructions overlay
function InteractionInstructions() {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Hide instructions after 10 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full z-50 flex items-center space-x-4 animate-pulse">
      <div className="flex flex-col items-center">
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="text-xs">Move Mouse</span>
      </div>
      <div className="flex flex-col items-center">
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
        </svg>
        <span className="text-xs">Click Objects</span>
      </div>
    </div>
  );
}

// Explosion effect when clicking
function ExplosionEffect() {
  const [explosions, setExplosions] = useState([]);
  const { camera, mouse, viewport } = useThree();
  
  const handleClick = useCallback(() => {
    // Convert mouse position to 3D space
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Add new explosion
    const newExplosion = {
      id: Date.now(),
      position: [pos.x, pos.y, pos.z],
      createdAt: Date.now()
    };
    
    setExplosions(prev => [...prev, newExplosion]);
    
    // Remove explosion after animation
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== newExplosion.id));
    }, 1000);
  }, [camera, mouse]);
  
  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);
  
  return (
    <>
      {explosions.map(explosion => (
        <ExplosionParticles 
          key={explosion.id} 
          position={explosion.position} 
          createdAt={explosion.createdAt} 
        />
      ))}
    </>
  );
}

// Explosion particles
function ExplosionParticles({ position, createdAt }) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      velocity: [
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ],
      size: Math.random() * 0.5 + 0.1,
      color: `hsl(${Math.random() * 360}, 100%, 75%)`
    }));
  }, []);
  
  const particlesRef = useRef([]);
  
  useFrame(() => {
    const elapsed = (Date.now() - createdAt) / 1000;
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        particle.position.x += particles[i].velocity[0] * 0.01;
        particle.position.y += particles[i].velocity[1] * 0.01;
        particle.position.z += particles[i].velocity[2] * 0.01;
        particle.scale.setScalar(Math.max(0, 1 - elapsed));
      }
    });
  });
  
  return (
    <>
      {particles.map((particle, i) => (
        <mesh
          key={i}
          ref={el => particlesRef.current[i] = el}
          position={position}
        >
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial 
            color={particle.color} 
            emissive={particle.color} 
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </>
  );
}

// Interactive Particle System with stronger mouse effect
function ParticleSystem() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      temp.push({ 
        position: [x, y, z], 
        size: Math.random() * 0.5 + 0.1,
        originalPosition: [x, y, z]
      });
    }
    return temp;
  }, []);
  
  const particlesRef = useRef([]);
  
  return (
    <MouseTracker>
      {(mousePosition) => (
        <>
          {particles.map((particle, i) => {
            // Calculate distance from mouse (in 3D space projected to 2D)
            const distX = particle.originalPosition[0] - mousePosition[0] * 15; // Increased effect
            const distY = particle.originalPosition[1] - mousePosition[1] * 15; // Increased effect
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            // Stronger repel effect
            const repelFactor = Math.max(0, 8 - distance) * 0.3; // Increased strength and range
            const newX = particle.originalPosition[0] + (distX / (distance || 1)) * repelFactor;
            const newY = particle.originalPosition[1] + (distY / (distance || 1)) * repelFactor;
            
            return (
              <Trail
                key={i}
                width={1}
                length={5}
                color={new THREE.Color(`hsl(${i % 360}, 100%, 75%)`)}
                attenuation={(t) => t * t}
              >
                <Sphere 
                  args={[particle.size, 8, 8]} 
                  position={[newX, newY, particle.originalPosition[2]]}
                  ref={el => particlesRef.current[i] = el}
                >
                  <MeshDistortMaterial
                    color={`hsl(${i % 360}, 100%, 75%)`}
                    speed={2}
                    distort={0.5}
                    radius={1}
                  />
                </Sphere>
              </Trail>
            );
          })}
        </>
      )}
    </MouseTracker>
  );
}

// Crazy Geometry Component with more obvious interaction
function CrazyGeometry({ position, scale, speed, color, type }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Pulse effect when clicked
  const { pulseFactor } = useSpring({
    pulseFactor: clicked ? 1.8 : 1, // Stronger pulse
    config: { mass: 1, tension: 800, friction: 15 }
  });
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = Math.sin(t / 4) * 0.5;
    ref.current.rotation.y = t * 0.5;
    ref.current.rotation.z = Math.cos(t / 2) * 0.3;
    ref.current.position.y += Math.sin(t) * 0.01;
    
    // Apply pulse effect
    if (clicked) {
      ref.current.scale.setScalar(pulseFactor.get());
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(true);
    setTimeout(() => setClicked(false), 500); // Longer pulse
  };

  const Geometry = () => {
    // Enhanced material based on hover state - more obvious change
    const material = hovered ? (
      <meshPhongMaterial 
        color="#ffffff" 
        emissive={color} 
        emissiveIntensity={1} 
        shininess={100}
      />
    ) : type === 'tetrahedron' ? (
      <MeshWobbleMaterial color={color} factor={0.4} speed={2} metalness={0.8} roughness={0.2} />
    ) : type === 'octahedron' ? (
      <MeshDistortMaterial color={color} speed={3} distort={0.4} radius={1} metalness={0.8} roughness={0.2} />
    ) : type === 'dodecahedron' ? (
      <meshPhongMaterial color={color} shininess={100} specular="#ffffff" />
    ) : type === 'torus' ? (
      <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} metalness={0.8} roughness={0.2} />
    ) : type === 'box' ? (
      <MeshWobbleMaterial color={color} factor={0.4} speed={1} metalness={0.8} roughness={0.2} />
    ) : (
      <MeshWobbleMaterial color={color} factor={0.4} speed={2} metalness={0.8} roughness={0.2} />
    );

    // Use JSX directly instead of React.createElement
    if (type === 'tetrahedron') {
      return (
        <Tetrahedron 
          args={[scale, 0]} 
          ref={ref} 
          position={position} 
          onClick={handleClick} 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          cursor="pointer"
        >
          {material}
        </Tetrahedron>
      );
    } else if (type === 'octahedron') {
      return (
        <Octahedron 
          args={[scale, 0]} 
          ref={ref} 
          position={position} 
          onClick={handleClick} 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          cursor="pointer"
        >
          {material}
        </Octahedron>
      );
    } else if (type === 'dodecahedron') {
      return (
        <Dodecahedron 
          args={[scale, 0]} 
          ref={ref} 
          position={position} 
          onClick={handleClick} 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          cursor="pointer"
        >
          {material}
        </Dodecahedron>
      );
    } else if (type === 'torus') {
      return (
        <Torus 
          args={[scale, scale/3, 16, 32]} 
          ref={ref} 
          position={position} 
          onClick={handleClick} 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          cursor="pointer"
        >
          {material}
        </Torus>
      );
    } else if (type === 'box') {
      return (
        <Box 
          args={[scale, scale, scale]} 
          ref={ref} 
          position={position} 
          onClick={handleClick} 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          cursor="pointer"
        >
          {material}
        </Box>
      );
    } else {
      return (
        <Sphere 
          args={[scale, 16, 16]} 
          ref={ref} 
          position={position} 
          onClick={handleClick} 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          cursor="pointer"
        >
          {material}
        </Sphere>
      );
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

// Interactive 3D Text Component with more obvious interaction
function AnimatedText({ text, position, scale = 1 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Enhanced animation when interacted with
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2;
    
    if (hovered) {
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.8; // More dramatic rotation
      meshRef.current.scale.setScalar(1.1); // Scale up on hover
    } else {
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
      meshRef.current.scale.setScalar(1);
    }
    
    if (clicked) {
      meshRef.current.rotation.z = Math.sin(time * 5) * 0.2; // More dramatic rotation
    } else {
      meshRef.current.rotation.z = 0;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(!clicked);
    
    // Create ripple effect
    const rippleEvent = new CustomEvent('create-ripple', { 
      detail: { position: [position[0], position[1], position[2]] }
    });
    window.dispatchEvent(rippleEvent);
  };

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
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      cursor="pointer" // Add cursor style
    >
      {text}
      <meshPhysicalMaterial 
        color={hovered ? "#a855f7" : "#6366f1"} // More dramatic color change
        emissive={clicked ? "#e879f9" : "#4338ca"}
        emissiveIntensity={clicked ? 2 : 0.5} // Stronger emission
        metalness={0.7}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.2}
        reflectivity={1}
      />
    </Text3D>
  );
}

// Orthogonal Camera Controller with additional rotations
function OrthogonalCameraController() {
  const { camera } = useThree();
  const orbitRef = useRef({ angle: 0, verticalAngle: 0 });
  
  useFrame((state, delta) => {
    // Orbit around the sun orthogonally to the planets
    orbitRef.current.angle += delta * 0.1; // Horizontal orbit speed
    orbitRef.current.verticalAngle = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.3; // Vertical oscillation
    
    const radius = 40; // Orbit radius
    const baseHeight = 30; // Base height above the ecliptic plane
    const heightVariation = Math.sin(state.clock.getElapsedTime() * 0.1) * 5; // Height variation
    
    // Calculate position on the orbital path with vertical movement
    const x = Math.cos(orbitRef.current.angle) * radius;
    const y = baseHeight + heightVariation; // Varying height
    const z = Math.sin(orbitRef.current.angle) * radius;
    
    // Set camera position with slight tilt
    camera.position.set(x, y, z - 30); // -30 to center on sun
    
    // Look at the sun with slight offset based on time
    const lookAtX = Math.sin(state.clock.getElapsedTime() * 0.2) * 2;
    const lookAtY = Math.sin(state.clock.getElapsedTime() * 0.15) * 2;
    camera.lookAt(lookAtX, lookAtY, -30);
    
    // Add slight camera roll
    camera.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
  });
  
  return null;
}

// Solar System Scene
function Scene() {
  return (
    <group>
      <OrthogonalCameraController />
      <Portal position={[0, 0, -15]} scale={10} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <SolarSystem />
      <ambientLight intensity={0.2} />
    </group>
  );
}

// Sun Glow Effect
function SunGlow() {
  const glowRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      glowRef.current.scale.set(
        1 + Math.sin(t * 0.5) * 0.05,
        1 + Math.sin(t * 0.5) * 0.05,
        1 + Math.sin(t * 0.5) * 0.05
      );
    }
  });
  
  return (
    <mesh ref={glowRef}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshBasicMaterial 
        color="#FDB813" 
        transparent 
        opacity={0.2} 
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Asteroid Belt Component
function AsteroidBelt({ innerRadius, outerRadius, count = 200 }) {
  const asteroids = useMemo(() => {
    return Array.from({ length: count }, () => {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.5; // Slight vertical variation
      
      return {
        position: [x, y, z],
        scale: Math.random() * 0.2 + 0.05,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
      };
    });
  }, [innerRadius, outerRadius, count]);
  
  return (
    <group position={[0, 0, -30]}>
      {asteroids.map((asteroid, i) => (
        <mesh key={i} position={asteroid.position} rotation={asteroid.rotation}>
          <dodecahedronGeometry args={[asteroid.scale, 0]} />
          <meshStandardMaterial color="#aaa" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

// Solar System Component
function SolarSystem() {
  const sunRef = useRef();
  const materialRef = useRef();
  
  // Sun rotation and shader update
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002;
    }
    if (materialRef.current) {
      materialRef.current.uTime = t;
    }
  });
  
  return (
    <group>
      {/* Sun */}
      <group position={[0, 0, -30]}>
        <mesh ref={sunRef}>
          <sphereGeometry args={[4, 64, 64]} />
          <sunMaterial ref={materialRef} />
          <pointLight intensity={2} distance={100} color="#FDB813" />
          <SunGlow />
        </mesh>
      </group>
      
      {/* Asteroid Belts */}
      <AsteroidBelt innerRadius={27} outerRadius={32} count={300} />
      
      {/* Planets */}
      <Planet 
        name="Mercury" 
        distance={10} 
        size={0.4} 
        color="#A9A9A9" 
        orbitSpeed={0.01} 
        rotationSpeed={0.004}
      />
      <Planet 
        name="Venus" 
        distance={15} 
        size={0.9} 
        color="#E39E1C" 
        orbitSpeed={0.007} 
        rotationSpeed={0.002}
      />
      <Planet 
        name="Earth" 
        distance={20} 
        size={1} 
        color="#4B67DE" 
        orbitSpeed={0.005} 
        rotationSpeed={0.003}
        hasMoon={true}
      />
      <Planet 
        name="Mars" 
        distance={25} 
        size={0.6} 
        color="#C1440E" 
        orbitSpeed={0.004} 
        rotationSpeed={0.003}
      />
      <Planet 
        name="Jupiter" 
        distance={35} 
        size={2.2} 
        color="#E0A95E" 
        orbitSpeed={0.002} 
        rotationSpeed={0.005}
        hasRings={true}
      />
      <Planet 
        name="Saturn" 
        distance={45} 
        size={1.8} 
        color="#F4D4A9" 
        orbitSpeed={0.0015} 
        rotationSpeed={0.004}
        hasRings={true}
      />
      <Planet 
        name="Uranus" 
        distance={55} 
        size={1.4} 
        color="#D1E7E7" 
        orbitSpeed={0.001} 
        rotationSpeed={0.003}
        hasRings={true}
      />
      <Planet 
        name="Neptune" 
        distance={65} 
        size={1.3} 
        color="#5B5DDF" 
        orbitSpeed={0.0008} 
        rotationSpeed={0.004}
        hasRings={true}
      />
    </group>
  );
}

// Planet Component
function Planet({ name, distance, size, color, orbitSpeed, rotationSpeed, hasRings = false, hasMoon = false }) {
  const planetRef = useRef();
  const orbitRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Orbit around the sun
    if (orbitRef.current) {
      orbitRef.current.rotation.y = t * orbitSpeed;
    }
    
    // Planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
  });
  
  return (
    <group>
      {/* Orbit Path */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
        <ringGeometry args={[distance, distance + 0.05, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Planet Orbit Group */}
      <group ref={orbitRef} position={[0, 0, -30]}>
        <group position={[distance, 0, 0]}>
          {/* Planet */}
          <mesh ref={planetRef}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
          </mesh>
          
          {/* Rings (for gas giants) */}
          {hasRings && (
            <Ring args={[size * 1.5, size * 2.2, 64]} rotation={[Math.PI / 3, 0, 0]}>
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.7} 
                side={THREE.DoubleSide}
              />
            </Ring>
          )}
          
          {/* Moon (for Earth) */}
          {hasMoon && (
            <Moon planetSize={size} />
          )}
        </group>
      </group>
    </group>
  );
}

// Moon Component
function Moon({ planetSize }) {
  const moonRef = useRef();
  const moonOrbitRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Moon orbit
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y = t * 0.02;
    }
    
    // Moon rotation
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <group ref={moonOrbitRef}>
      <mesh 
        ref={moonRef} 
        position={[planetSize * 2, 0, 0]}
      >
        <sphereGeometry args={[planetSize * 0.27, 32, 32]} />
        <meshStandardMaterial color="#CFCFCF" metalness={0.1} roughness={0.9} />
      </mesh>
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
  const [showContent, setShowContent] = useState(true);
  const contentRef = useRef();
  
  // Animation for content visibility
  const contentAnimation = useSpring({
    opacity: showContent ? 1 : 0,
    transform: showContent 
      ? 'translateY(0px)' 
      : 'translateY(100vh)',
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Button animation
  const buttonAnimation = useSpring({
    scale: showContent ? 1 : 1.2,
    config: { tension: 300, friction: 10 }
  });
  
  return (
    <div className="h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900">
      {/* Instructions overlay */}
      <InteractionInstructions />
      
      {/* 3D Background - Full screen and fixed position */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 30, 10], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]} // Responsive pixel ratio for better performance
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Toggle Button */}
      <animated.button
        style={{
          scale: buttonAnimation.scale.to(s => `scale(${s})`)
        }}
        onClick={() => setShowContent(!showContent)}
        className="fixed top-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center"
        aria-label={showContent ? "Hide Content" : "Show Content"}
      >
        {showContent ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </animated.button>

      {/* Content overlay with animation */}
      <animated.main 
        ref={contentRef}
        style={contentAnimation}
        className="relative z-10 h-screen overflow-auto"
      >
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Title with initial animation */}
          <animated.h1 
            className="text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg"
            style={useSpring({
              from: { opacity: 0, transform: 'translateY(-50px) scale(0.9)' },
              to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
              config: { mass: 1, tension: 280, friction: 20 },
              delay: 300
            })}
          >
            Impressum
          </animated.h1>
          
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
      </animated.main>
    </div>
  );
};

export default Impressum;
