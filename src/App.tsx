import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Shield, 
  Star, 
  Target, 
  Sparkles, 
  Sword, 
  Trophy,
  Coins,
  Gem,
  ShoppingCart,
  Users,
  Play,
  X,
  Plus,
  ArrowLeft,
  Settings,
  Flame,
  LayoutDashboard,
  ChevronRight,
  Palette,
  Info,
  Monitor,
  CheckCircle2,
  ListTodo,
  LayoutGrid,
  Newspaper,
  Smile,
  ClipboardList,
  Skull,
  Menu,
  Crosshair,
  Package,
  Trash2
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Box, 
  Sphere, 
  Plane, 
  Sky, 
  Stars, 
  Environment, 
  KeyboardControls, 
  useKeyboardControls, 
  Float,
  Text
} from '@react-three/drei';
import * as THREE from 'three';

// --- Types ---
interface Skin {
  id: string;
  name: string;
  rarity: "Común" | "Superraro" | "Épico" | "Mítico" | "Legendario" | "Secreto";
  price: number;
  priceGurbi?: number;
  unlocked: boolean;
}

interface UserAccount {
  username: string;
  password: string;
  coins: number;
  gems: number;
  gurbis: number;
  trophies: number;
  credits: number;
  bling: number;
  xp: number;
  unlockedBrawlers: string[];
  isBanned?: boolean;
  banUntil?: string | null; // ISO Date string
}

interface Ability {
  name: string;
  description: string;
  cooldown: number; // segundos
  damage?: number;
}

interface Brawler {
  id: string;
  name: string;
  rarity: "Common" | "Rare" | "Super Rare" | "Epic" | "Mythic" | "Legendary" | "Común" | "Raro" | "Superraro" | "Épico" | "Mítico" | "Legendario";
  role: string;
  hp: number;
  attack: number;
  unlocked: boolean;
  price: number;
  color: string;
  level: number;
  masteryXP: number;
  masteryLevel: number;
  description: string;
  renderColor: string;
  skins?: Skin[];
  activeSkinId?: string;
  specialAbility?: Ability;
  hasHypercharge?: boolean;
}

interface Mission {
  id: string;
  title: string;
  rewardXP: number;
  rewardCurrency?: 'coins' | 'gems' | 'bling' | 'credits';
  rewardAmount?: number;
  completed: boolean;
  type: 'win' | 'damage' | 'kill' | 'upgrade';
  target: number;
  current: number;
}

const INITIAL_BRAWLERS: Brawler[] = [
  { 
    id: 'shelly', 
    name: 'Shelly', 
    rarity: 'Común', 
    role: 'Destructora', 
    hp: 5000, 
    attack: 1500, 
    unlocked: true, 
    price: 0, 
    color: 'bg-blue-500', 
    renderColor: '#3b82f6', 
    level: 1, 
    masteryXP: 0,
    masteryLevel: 1,
    description: 'Su escopeta de perdigones es devastadora a corta distancia.',
    specialAbility: { name: 'Super Balas', description: 'Dispara una ráfaga masiva que empuja.', cooldown: 5, damage: 2500 },
    activeSkinId: 'default',
    skins: [
      { id: 'default', name: 'Default', rarity: 'Común', price: 0, unlocked: true },
      { id: 'witch_shelly', name: 'Hoot Hoot Shelly', rarity: 'Superraro', price: 99, unlocked: false, priceGurbi: 2500 },
      { id: 'princess_shelly', name: 'Princess Shelly', rarity: 'Superraro', price: 149, unlocked: false, priceGurbi: 3800 },
    ]
  },
  { 
    id: 'colt', 
    name: 'Colt', 
    rarity: 'Raro', 
    role: 'Destructor', 
    hp: 4200, 
    attack: 2000, 
    unlocked: true, 
    price: 0, 
    color: 'bg-green-500', 
    renderColor: '#f472b6', 
    level: 1, 
    masteryXP: 0,
    masteryLevel: 1,
    description: 'Dispara ráfagas precisas de largo alcance con sus revólveres.',
    specialAbility: { name: 'Tormenta de Balas', description: 'Una ráfaga de balas que atraviesa obstáculos.', cooldown: 8, damage: 3500 },
    activeSkinId: 'default',
    skins: [
      { id: 'default', name: 'Default', rarity: 'Común', price: 0, unlocked: true },
      { id: 'challenger_colt', name: 'Challenger Colt', rarity: 'Épico', price: 149, unlocked: false, priceGurbi: 4500 },
    ]
  },
  { 
    id: 'spike', 
    name: 'Spike', 
    rarity: 'Legendario', 
    role: 'Destructor', 
    hp: 3600, 
    attack: 2400, 
    unlocked: false, 
    price: 2000, 
    color: 'bg-yellow-500', 
    renderColor: '#eab308', 
    level: 1, 
    masteryXP: 0,
    masteryLevel: 1,
    description: 'Lanza granadas de cactus que disparan espinas.',
    specialAbility: { name: 'Cactus Cohete', description: 'Lanza un cactus gigante que explota en área.', cooldown: 10, damage: 4000 },
    activeSkinId: 'default',
    skins: [
      { id: 'default', name: 'Default', rarity: 'Común', price: 0, unlocked: true },
      { id: 'angry_spike', name: 'Spike Enojado', rarity: 'Mítico', price: 210, unlocked: false, priceGurbi: 7200 },
      { id: 'baby_spike', name: 'Spike Bebé', rarity: 'Legendario', price: 210, unlocked: false, priceGurbi: 8500 },
    ]
  },
  { 
    id: 'crow', 
    name: 'Crow', 
    rarity: 'Legendario', 
    role: 'Asesino', 
    hp: 3000, 
    attack: 1800, 
    unlocked: false, 
    price: 3000, 
    color: 'bg-indigo-600', 
    renderColor: '#4f46e5', 
    level: 1, 
    masteryXP: 0,
    masteryLevel: 1,
    description: 'Arroja tres dagas envenenadas que dañan a los enemigos con el tiempo.',
    specialAbility: { name: 'Vuelo del Cuervo', description: 'Salta y lanza dagas envenenadas en todas direcciones.', cooldown: 7, damage: 2200 },
    activeSkinId: 'default',
    skins: [
      { id: 'default', name: 'Default', rarity: 'Común', price: 0, unlocked: true },
      { id: 'mecha_crow', name: 'Mecha Crow', rarity: 'Legendario', price: 299, unlocked: false, priceGurbi: 9800 },
    ]
  },
  { 
    id: 'mortis', 
    name: 'Mortis', 
    rarity: 'Mítico', 
    role: 'Asesino', 
    hp: 5600, 
    attack: 1600, 
    unlocked: false, 
    price: 1500, 
    color: 'bg-purple-600', 
    renderColor: '#9333ea', 
    level: 1, 
    masteryXP: 0,
    masteryLevel: 1,
    description: 'Se abalanza hacia adelante con su pala.',
    specialAbility: { name: 'Transfusión', description: 'Invoca murciélagos que roban vida.', cooldown: 6, damage: 1800 },
    activeSkinId: 'default',
    skins: [
      { id: 'default', name: 'Default', rarity: 'Común', price: 0, unlocked: true },
      { id: 'rogue_mortis', name: 'Rogue Mortis', rarity: 'Mítico', price: 149, unlocked: false, priceGurbi: 6800 },
    ]
  },
  {
    id: 'kenji',
    name: 'Kenji',
    rarity: 'Legendario',
    role: 'Asesino',
    hp: 4200,
    attack: 1900,
    unlocked: false,
    price: 3800,
    color: 'bg-red-500',
    renderColor: '#ef4444',
    level: 1,
    masteryXP: 0,
    masteryLevel: 1,
    description: 'Maestro del sushi y la katana. Kenji corta a sus enemigos con precisión quirúrgica.',
    specialAbility: { name: 'Corte Supremo', description: 'Un tajo rápido que atraviesa enemigos y cura.', cooldown: 5, damage: 2100 },
    activeSkinId: 'default',
    skins: [
      { id: 'default', name: 'Default', rarity: 'Común', price: 0, unlocked: true },
      { id: 'samurai_kenji', name: 'Samurai Kenji', rarity: 'Mítico', price: 299, unlocked: false, priceGurbi: 6563 },
    ]
  },
  {
    id: 'ninchill',
    name: 'Ninchill',
    rarity: 'Legendario',
    role: 'Asesino',
    hp: 4400,
    attack: 2100,
    unlocked: false,
    price: 3800,
    color: 'bg-red-600',
    renderColor: '#dc2626',
    level: 1,
    masteryXP: 0,
    masteryLevel: 1,
    description: 'Un ninja relajado que colecciona bolsas de chicle. ¡Cuidado con sus pegajosos ataques!',
    specialAbility: { name: 'Explosión de Chicle', description: 'Lanza una súper burbuja que rebota y ralentiza.', cooldown: 6, damage: 2500 },
    activeSkinId: 'default',
    skins: [
      { id: 'default', name: 'Default', rarity: 'Común', price: 0, unlocked: true },
      { id: 'secret_ninchill', name: 'Hyper Ninchill', rarity: 'Secreto', price: 499, unlocked: false, priceGurbi: 12500 },
    ]
  },
];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Gana 3 partidas', rewardXP: 200, rewardCurrency: 'coins', rewardAmount: 500, completed: false, type: 'win', target: 3, current: 0 },
  { id: 'm2', title: 'Inflige 10,000 de daño', rewardXP: 150, rewardCurrency: 'credits', rewardAmount: 100, completed: false, type: 'damage', target: 10000, current: 0 },
  { id: 'm3', title: 'Mejora un Brawler', rewardXP: 50, rewardCurrency: 'bling', rewardAmount: 50, completed: false, type: 'upgrade', target: 1, current: 0 },
  { id: 'm4', title: 'Elimina 5 enemigos', rewardXP: 300, rewardCurrency: 'gems', rewardAmount: 10, completed: false, type: 'kill', target: 5, current: 0 },
];

const BOT_NAMES = ['amiraaa', 'pablo67', 'cakos88', 'mimi', 'GamerPro', 'BrawlMaster', 'LeonKing', 'ShellyPro', 'SuperBot', 'TheGrefg', 'Ibai', 'Auron'];

// --- Constants & Map ---
const MAP_DIM = 40;
const MAP_LAYOUT = [
  ...Array(40).fill(0).map(() => Array(40).fill(0))
];

// Fill borders with walls
for(let i=0; i<40; i++) {
  MAP_LAYOUT[0][i] = 1; MAP_LAYOUT[39][i] = 1;
  MAP_LAYOUT[i][0] = 1; MAP_LAYOUT[i][39] = 1;
}

// Add some representative 'Rockwall Brawl' patterns
const addBlock = (x: number, z: number, w: number, h: number, type: number) => {
  for(let i=x; i<x+w; i++) {
    for(let j=z; j<z+h; j++) {
      if(i>=0 && i<40 && j>=0 && j<40) MAP_LAYOUT[j][i] = type;
    }
  }
};

// Walls (1), Bushes (2), Water (3)
addBlock(5, 5, 4, 4, 1); addBlock(31, 5, 4, 4, 1);
addBlock(5, 31, 4, 4, 1); addBlock(31, 31, 4, 4, 1);
addBlock(18, 18, 4, 4, 3); // Center water
addBlock(19, 19, 2, 2, 1); // Center wall
addBlock(10, 10, 8, 2, 2); addBlock(22, 10, 8, 2, 2); // Side bushes
addBlock(10, 28, 8, 2, 2); addBlock(22, 28, 8, 2, 2);

function RockwallMap() {
  return (
    <group position={[-20, -0.5, -20]}>
      {MAP_LAYOUT.map((row, z) => row.map((cell, x) => {
        if (cell === 0) return null;
        return (
          <mesh key={`${x}-${z}`} position={[x, cell === 1 ? 0.5 : cell === 3 ? -0.1 : 0.25, z]} rotation={cell === 3 ? [-Math.PI/2, 0, 0] : [0, 0, 0]}>
            {cell === 1 ? (
              <>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#92400e" />
              </>
            ) : cell === 2 ? (
              <>
                <boxGeometry args={[0.95, 0.4, 0.95]} />
                <meshStandardMaterial color="#fbbf24" />
              </>
            ) : (
              <>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
              </>
            )}
          </mesh>
        );
      }))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, -0.01, 20]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>
    </group>
  );
}

// --- 3D Components ---

function MuzzleFlash({ position }: { position: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.2);
    }
    if (lightRef.current) {
      lightRef.current.intensity = Math.max(0, lightRef.current.intensity - 50 * delta);
    }
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} color="#fbbf24" intensity={10} distance={5} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={5} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Projectile({ position, direction, onHit, color = "#fbbf24", isDart = false, isSword = false }: { position: [number, number, number], direction: THREE.Vector3, onHit: () => void, color?: string, isDart?: boolean, isSword?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.addScaledVector(direction, 20 * delta);
    
    // Simple distance check for bounds
    if (meshRef.current.position.length() > 30) {
      onHit(); 
    }

    if (isDart || isSword) {
       meshRef.current.lookAt(meshRef.current.position.clone().add(direction));
       if (isSword) {
         meshRef.current.rotateX(Math.PI / 2);
       }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {isDart ? (
        <coneGeometry args={[0.08, 0.45, 8]} />
      ) : isSword ? (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.3, 0]}>
             <boxGeometry args={[0.05, 0.6, 0.02]} />
             <meshStandardMaterial color="#cbd5e1" emissive="#94a3b8" />
          </mesh>
          <mesh position={[0, 0, 0]}>
             <boxGeometry args={[0.2, 0.02, 0.05]} />
             <meshStandardMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
             <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
             <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ) : (
        <sphereGeometry args={[0.2, 8, 8]} />
      )}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={color === "#fbbf24" ? 3 : 1} />
      <pointLight ref={lightRef} color={color} intensity={2} distance={3} />
    </mesh>
  );
}

function SuperVFX({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.scale.addScalar(20 * delta);
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = Math.max(0, meshRef.current.material.opacity - 2 * delta);
    }
  });

  return (
    <mesh position={position} ref={meshRef}>
      <ringGeometry args={[0.5, 0.7, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ShellyModel({ skinId = 'default', isFlying = false }: { skinId?: string, isFlying?: boolean }) {
  const isWitch = skinId === 'witch_shelly';
  const broomRotation = isFlying ? [Math.PI / 2, 0, 0] : [Math.PI / 2.5, 0, 0.2];
  const broomPosition = isFlying ? [0, -0.6, 0.5] : [0.4, -0.4, 0];

  return (
    <group position={isFlying ? [0, 0.5, 0] : [0, 0, 0]}>
      {/* Broom (if witch) */}
      {isWitch && (
        <group position={broomPosition as any} rotation={broomRotation as any}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 2.5, 8]} />
            <meshStandardMaterial color="#3f2b1d" />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
             <coneGeometry args={[0.25, 0.8, 12]} />
             <meshStandardMaterial color="#fcd34d" />
          </mesh>
        </group>
      )}

      {/* Head */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#c0a080" />
      </mesh>
      
      {/* Witch Hat */}
      {isWitch && (
        <group position={[0, 0.75, 0]}>
          <mesh rotation={[Math.PI / 10, 0, 0]}>
            <coneGeometry args={[0.6, 0.8, 16]} />
            <meshStandardMaterial color="#701a75" />
          </mesh>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
            <meshStandardMaterial color="#701a75" />
          </mesh>
          {/* Owl on hat */}
          <group position={[0.3, 0.2, 0]} rotation={[0, 0, 0.2]}>
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <mesh position={[0, 0.05, 0.12]}>
               <sphereGeometry args={[0.04, 8, 8]} />
               <meshStandardMaterial color="white" />
            </mesh>
          </group>
        </group>
      )}

      {/* Hair (Purple, spikes) */}
      <group position={[0, 0.45, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh 
            key={i} 
            position={[
              Math.sin(i * 1.2) * 0.25, 
              Math.cos(i * 1.2) * 0.15 + 0.2, 
              -0.1
            ]} 
            rotation={[Math.PI / 4, i, 0]}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color={isWitch ? "#0ea5e9" : "#a855f7"} />
          </mesh>
        ))}
        {/* Top hair spikes */}
        {!isWitch && (
          <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 4, 0, 0]}>
            <coneGeometry args={[0.2, 0.5, 8]} />
            <meshStandardMaterial color="#a855f7" />
          </mesh>
        )}
      </group>

      {/* Scarf (Bandana or Cape collar for witch) */}
      {isWitch ? (
        <mesh position={[0, 0.35, -0.2]} rotation={[Math.PI / 10, 0, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.1]} />
          <meshStandardMaterial color="#4c1d95" />
        </mesh>
      ) : (
        <mesh position={[0, 0.2, 0.2]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.3, 0.4, 3, 1, true]} />
          <meshStandardMaterial color="#fbbf24" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Body (Shirt) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.6, 12]} />
        <meshStandardMaterial color={isWitch ? "#2e1065" : "#8b5cf6"} />
      </mesh>

      {/* Belt (Brown/Leather) */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.1, 12]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Belt Buckle */}
      <mesh position={[0, -0.3, 0.35]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>

      {/* Legs (Blue Pants/Jeans) */}
      <group position={[0, -0.4, 0]}>
        <mesh position={[0.15, -0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[-0.15, -0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>

      {/* Boots (Black/Blue) */}
      <group position={[0, -0.9, 0]}>
        <mesh position={[0.15, 0, 0.05]}>
          <boxGeometry args={[0.2, 0.2, 0.3]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[-0.15, 0, 0.05]}>
          <boxGeometry args={[0.2, 0.2, 0.3]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      {/* Arms */}
      <group>
        {/* Left Arm (holding gun holder) */}
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <meshStandardMaterial color="#c0a080" />
        </mesh>
        {/* Right Arm (up holding gun) */}
        <mesh position={[0.45, 0.2, 0.1]} rotation={[-Math.PI / 4, 0, -Math.PI / 6]}>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <meshStandardMaterial color="#c0a080" />
        </mesh>
        {/* Bandage on arm */}
        <mesh position={[0.48, 0.1, 0.1]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.11, 0.11, 0.15, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>

      {/* Shotgun */}
      <group position={[0.4, 0.4, 0.4]} rotation={[0, -Math.PI / 2, 0.5]}>
        {/* Barrel */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        {/* Body */}
        <mesh position={[-0.2, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.2, 0.2, 0.15]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        {/* Grip (Brown) */}
        <mesh position={[-0.35, -0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 0.2, 0.08]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      </group>

      {/* Eyes */}
      <group position={[0, 0.45, 0.3]}>
        <mesh position={[0.12, 0, 0.05]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.12, 0, 0.05]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
}

function StoreBuildingIcon({ className }: { className?: string }) {
  return (
    <div className={`relative w-12 h-12 ${className}`}>
      {/* Building Body */}
      <div className="absolute bottom-0 left-1 right-1 h-3/5 bg-sky-400 border-2 border-black rounded-sm" />
      {/* Windows */}
      <div className="absolute bottom-1 left-2 w-2 h-2 bg-sky-200 border border-black/20" />
      <div className="absolute bottom-1 right-2 w-2 h-2 bg-sky-200 border border-black/20" />
      {/* Awning */}
      <div className="absolute top-1 left-0 right-0 h-2/5 flex border-2 border-black rounded-t-sm overflow-hidden">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-red-600" />
      </div>
    </div>
  );
}

function ColtModel() {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#c0a080" />
      </mesh>
      
      {/* Hair (Pompadour - Bright Pink/Red) */}
      <group position={[0, 0.62, -0.05]}>
        <mesh position={[0, 0.15, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.18, 0.4, 8, 8]} />
          <meshStandardMaterial color="#f472b6" /> {/* Pink/Cherry Red */}
        </mesh>
        <mesh position={[0.2, 0.05, 0]} rotation={[0.2, 0, -0.4]}>
           <sphereGeometry args={[0.18, 8, 8]} />
           <meshStandardMaterial color="#db2777" />
        </mesh>
        <mesh position={[-0.2, 0.05, 0]} rotation={[0.2, 0, 0.4]}>
           <sphereGeometry args={[0.18, 8, 8]} />
           <meshStandardMaterial color="#db2777" />
        </mesh>
      </group>

      {/* Body (Shirt + Vest) */}
      <group>
        {/* Blue Shirt */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.6, 12]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        {/* Purple Vest Over Shirt */}
        <mesh position={[0.18, 0, 0.05]} rotation={[0, -0.1, 0]}>
           <boxGeometry args={[0.1, 0.58, 0.25]} />
           <meshStandardMaterial color="#4c1d95" />
        </mesh>
        <mesh position={[-0.18, 0, 0.05]} rotation={[0, 0.1, 0]}>
           <boxGeometry args={[0.1, 0.58, 0.25]} />
           <meshStandardMaterial color="#4c1d95" />
        </mesh>
        <mesh position={[0, 0, -0.12]}>
           <boxGeometry args={[0.45, 0.58, 0.1]} />
           <meshStandardMaterial color="#4c1d95" />
        </mesh>
      </group>
      
      {/* Belt (Brown) */}
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.1, 12]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Belt Buckle (Grey) */}
      <mesh position={[0, -0.32, 0.32]}>
         <boxGeometry args={[0.1, 0.08, 0.05]} />
         <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Legs (Indigo Pants) */}
      <group position={[0, -0.4, 0]}>
        <mesh position={[0.15, -0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 8]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[-0.15, -0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 8]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
      </group>
      
      {/* Boots */}
      <group position={[0, -0.85, 0]}>
        <mesh position={[0.15, 0, 0.05]}>
           <boxGeometry args={[0.2, 0.15, 0.3]} />
           <meshStandardMaterial color="#4c1d95" />
        </mesh>
        <mesh position={[-0.15, 0, 0.05]}>
           <boxGeometry args={[0.2, 0.15, 0.3]} />
           <meshStandardMaterial color="#4c1d95" />
        </mesh>
      </group>

      {/* Twin Revolvers */}
      <group>
        {/* Right Gun */}
        <group position={[0.45, 0.15, 0.2]} rotation={[0, -0.2, 0]}>
           <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
              <meshStandardMaterial color="#4b5563" />
           </mesh>
           <mesh position={[0, -0.08, -0.1]}>
              <boxGeometry args={[0.08, 0.18, 0.1]} />
              <meshStandardMaterial color="#1f2937" />
           </mesh>
        </group>
        {/* Left Gun */}
        <group position={[-0.45, 0.15, 0.2]} rotation={[0, 0.2, 0]}>
           <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
              <meshStandardMaterial color="#4b5563" />
           </mesh>
           <mesh position={[0, -0.08, -0.1]}>
              <boxGeometry args={[0.08, 0.18, 0.1]} />
              <meshStandardMaterial color="#1f2937" />
           </mesh>
        </group>
      </group>

      {/* Face details */}
      <group position={[0, 0.45, 0.28]}>
        {/* Eyes */}
        <mesh position={[0.1, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.05, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#b08d6d" />
        </mesh>
      </group>
    </group>
  );
}

function MortisModel() {
  return (
    <group>
      {/* Cape */}
      <mesh position={[0, -0.1, -0.2]} rotation={[0.1, 0, 0]}>
         <boxGeometry args={[0.8, 1.2, 0.05]} />
         <meshStandardMaterial color="#1e1b4b" side={THREE.DoubleSide} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#f1f5f9" /> {/* Pale skin */}
      </mesh>
      
      {/* Hair (Purple Pompadour) */}
      <group position={[0, 0.65, 0.05]}>
        <mesh position={[0, 0.1, 0]} rotation={[0.2, 0, 0]}>
           <capsuleGeometry args={[0.18, 0.4, 8, 8]} />
           <meshStandardMaterial color="#a855f7" />
        </mesh>
        <mesh position={[0.22, -0.1, -0.1]} rotation={[0, 0, -0.3]}>
           <sphereGeometry args={[0.15, 8, 8]} />
           <meshStandardMaterial color="#a855f7" />
        </mesh>
        <mesh position={[-0.22, -0.1, -0.1]} rotation={[0, 0, 0.3]}>
           <sphereGeometry args={[0.15, 8, 8]} />
           <meshStandardMaterial color="#a855f7" />
        </mesh>
      </group>

      {/* Bat Bow Tie */}
      <group position={[0, 0.25, 0.2]} scale={0.5}>
         <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#db2777" />
         </mesh>
         <mesh position={[0.2, 0, -0.05]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.3, 0.15, 0.02]} />
            <meshStandardMaterial color="#db2777" />
         </mesh>
         <mesh position={[-0.2, 0, -0.05]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.3, 0.15, 0.02]} />
            <meshStandardMaterial color="#db2777" />
         </mesh>
      </group>

      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.6, 12]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>

      {/* Shovel/Weapon (He throws swords but carries this) */}
      <group position={[-0.45, 0.3, 0.1]} rotation={[0, 0.5, 0.8]}>
         <mesh>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshStandardMaterial color="#78350f" />
         </mesh>
         {/* Lantern hook */}
         <mesh position={[0, -0.65, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 16]} />
            <meshStandardMaterial color="#334155" />
         </mesh>
         <mesh position={[0, -0.85, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
         </mesh>
      </group>

      {/* Eyes (Yellowish) */}
      <group position={[0, 0.45, 0.25]}>
         <mesh position={[0.1, 0.05, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#fef08a" />
         </mesh>
         <mesh position={[-0.1, 0.05, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#fef08a" />
         </mesh>
      </group>
    </group>
  );
}

function KenjiModel() {
  return (
    <group>
      {/* Body with Kimono style */}
      <mesh>
        <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
        <meshStandardMaterial color="#ef4444" /> {/* Red top */}
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.4, 16]} />
        <meshStandardMaterial color="#1f2937" /> {/* Dark pants */}
      </mesh>
      
      {/* Head + Bandana */}
      <group position={[0, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.1, 16]} />
          <meshStandardMaterial color="#4d7c0f" /> {/* Green headband */}
        </mesh>
      </group>

      {/* Sword (Katana) */}
      <group position={[0.4, 0.2, -0.2]} rotation={[0.5, 0, 0.2]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.05, 0.8, 0.02]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.06, 0.2, 0.06]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
}

function NinchillModel() {
  return (
    <group>
      {/* Body / Jacket (Blue) */}
      <mesh>
        <capsuleGeometry args={[0.38, 0.7, 8, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.4, 16]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* Hood (Red) */}
      <group position={[0, 0.45, 0]}>
        <mesh position={[0, 0.25, -0.1]}>
          <sphereGeometry args={[0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
          <meshStandardMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
        {/* Buttons on Hood */}
        <mesh position={[0.25, 0.4, 0.2]} rotation={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#3b82f6" />
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.12]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </mesh>
        <mesh position={[-0.25, 0.4, 0.2]} rotation={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#3b82f6" />
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.12]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </mesh>
      </group>

      {/* Face (Tanned skin) */}
      <group position={[0, 0.45, 0.2]}>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#8b5e34" />
        </mesh>
        {/* Lolipop/Gum Stick */}
        <mesh position={[0.15, -0.1, 0.25]} rotation={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        </mesh>
      </group>

      {/* Bag of Gum in right hand area */}
      <group position={[0.45, -0.1, 0.2]} rotation={[0, -0.5, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.25, 0.1]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12, 0.1, 4]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
      </group>
    </group>
  );
}

function CrowModel() {
  return (
    <group>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      {/* Beak */}
      <mesh position={[0, 0.4, 0.3]} rotation={[Math.PI / 6, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.15, 0.5, 0.25]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.15, 0.5, 0.25]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Wings/Arms */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
    </group>
  );
}

function SpikeModel({ skinId = 'default' }: { skinId?: string }) {
  const isBaby = skinId === 'baby_spike';

  return (
    <group>
      {/* Main Cactus Body - TALLER and more oval */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.65, 32, 24]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.65, 32, 24]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>
      
      {/* Brown Shorts */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.62, 0.58, 0.35, 16]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.22, -0.7, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.32, 12]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>
      <mesh position={[-0.22, -0.7, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.32, 12]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>

      {/* Purple Vest (Abrigo) - More structured */}
      <group position={[0, 0.15, 0]}>
        {/* Left Shoulder/Strap */}
        <mesh position={[-0.52, 0.22, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.22, 0.65, 0.48]} />
          <meshStandardMaterial color="#9333ea" />
        </mesh>
        {/* Right Shoulder/Strap */}
        <mesh position={[0.52, 0.22, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.22, 0.65, 0.48]} />
          <meshStandardMaterial color="#9333ea" />
        </mesh>
        {/* Back piece connecting them */}
        <mesh position={[0, 0.15, -0.32]}>
          <boxGeometry args={[0.95, 0.75, 0.12]} />
          <meshStandardMaterial color="#9333ea" />
        </mesh>
        {/* Yellow Button on the vest */}
        <mesh position={[0.58, 0.05, 0.22]} rotation={[0, 0.3, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* Arms */}
      <mesh position={[0.75, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <capsuleGeometry args={[0.15, 0.35, 8, 8]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>
      <mesh position={[-0.75, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <capsuleGeometry args={[0.15, 0.35, 8, 8]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>

      {/* Happy Face - Iconic Spike Look */}
      <group position={[0, 0.2, 0.58]}>
        {/* Eyes - Large, round, happy black holes (using spheres for depth) */}
        <mesh position={[0.22, 0.2, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="black" roughness={0.1} />
        </mesh>
        <mesh position={[-0.22, 0.2, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="black" roughness={0.1} />
        </mesh>

        {/* Happy Mouth - Perfectly circular "o" shape */}
        <mesh position={[0, -0.15, 0]}>
           <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI/2]} rotation-x={-Math.PI/2}/>
           <meshStandardMaterial color="black" />
        </mesh>
      </group>

      {/* Red Flower on Head */}
      <group position={[0, 0.9, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI * 2) / 4, 0.4]} position={[Math.sin((i * Math.PI * 2) / 4) * 0.15, 0.06, Math.cos((i * Math.PI * 2) / 4) * 0.15]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        ))}
        {/* Center of flower */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Spines - Dark Green */}
      {[...Array(15)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(i * 1.5) * 0.62, 
            Math.cos(i * 2.2) * 0.7 + 0.1, 
            Math.sin(i * 3.1) * 0.62
          ]}
          rotation={[Math.random(), Math.random(), Math.random()]}
        >
          <coneGeometry args={[0.025, 0.12, 4]} />
          <meshStandardMaterial color="#14532d" />
        </mesh>
      ))}
    </group>
  );
}

function Joystick({ onMove }: { onMove: (data: { x: number, y: number } | null) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);

  const handleStart = () => setIsDragging(true);
  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(null);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2;

    if (distance > maxRadius) {
      dx *= maxRadius / distance;
      dy *= maxRadius / distance;
    }

    setPosition({ x: dx, y: dy });
    onMove({ x: dx / maxRadius, y: -dy / maxRadius });
  };

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e: MouseEvent) => handleMove(e as any);
      const endHandler = () => handleEnd();
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', endHandler);
      return () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
      };
    }
  }, [isDragging]);

  return (
    <div 
      ref={joystickRef}
      className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center touch-none select-none"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div 
        className="w-16 h-16 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-4 border-blue-400 pointer-events-none"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
    </div>
  );
}

function CreditsIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Card Shape */}
        <path d="M4 12C4 9.79086 5.79086 8 8 8H40C42.2091 8 44 9.79086 44 12V36C44 38.2091 42.2091 40 40 40H8C5.79086 40 4 38.2091 4 36V12Z" fill="#00C1F5" stroke="black" strokeWidth="3"/>
        {/* Top Accent Bar */}
        <path d="M4 12C4 9.79086 5.79086 8 8 8H16L12 16H4V12Z" fill="#7CF0FF"/>
        {/* Right Shadow/Accent lines */}
        <path d="M44 14L38 14V34L44 34" stroke="black" strokeWidth="2" strokeOpacity="0.2"/>
        
        {/* White Skull Icon */}
        <g transform="translate(14, 16) scale(0.4)">
           <path d="M25 0C11.2 0 0 11.2 0 25C0 35.6 6.6 44.6 15.8 48.2L15.8 50L34.2 50L34.2 48.2C43.4 44.6 50 35.6 50 25C50 11.2 38.8 0 25 0Z" fill="white" stroke="black" strokeWidth="4"/>
           <circle cx="15" cy="22" r="6" fill="black"/>
           <circle cx="35" cy="22" r="6" fill="black"/>
           <path d="M22 35L28 35L25 31Z" fill="black"/>
           <path d="M15 42L35 42" stroke="black" strokeWidth="3" strokeLinecap="round"/>
        </g>
        
        {/* Bottom Deco Line */}
        <rect x="12" y="34" width="24" height="2" rx="1" fill="black" fillOpacity="0.2"/>
      </svg>
    </div>
  );
}

function PlayerModel({ brawler, onShoot, onSuper, onSpecial, onHyper, onMove, joystickData, mobileShootRequested, onMobileShootHandled }: { 
  brawler: Brawler, 
  onShoot: (pos: THREE.Vector3, dir: THREE.Vector3) => void, 
  onSuper: (pos: THREE.Vector3) => void,
  onSpecial: (pos: THREE.Vector3) => void,
  onHyper: (pos: THREE.Vector3) => void,
  onMove: (pos: THREE.Vector3) => void,
  joystickData: { x: number, y: number } | null,
  mobileShootRequested?: boolean,
  onMobileShootHandled?: () => void
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [lastShootTime, setLastShootTime] = useState(0);
  const [lastSuperTime, setLastSuperTime] = useState(0);
  const [lastSpecialTime, setLastSpecialTime] = useState(0);
  const [lastHyperTime, setLastHyperTime] = useState(0);
  const [muzzleFlashes, setMuzzleFlashes] = useState<{ id: number, pos: THREE.Vector3 }[]>([]);
  const [isFlying, setIsFlying] = useState(false);

  useEffect(() => {
    if (isFlying) {
      const timer = setTimeout(() => setIsFlying(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isFlying]);

  const [, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    const { forward, backward, left, right, attack, super: superKey, special, hipercarga } = getKeys();
    let speed = brawler.id === 'mortis' ? 10 : 7;
    if (isFlying) speed = 15;
    
    const moveDir = new THREE.Vector3(0, 0, 0);

    // Keyboard Movement
    if (forward) moveDir.z -= 1;
    if (backward) moveDir.z += 1;
    if (left) moveDir.x -= 1;
    if (right) moveDir.x += 1;

    // Joystick Movement override
    if (joystickData) {
      moveDir.x = joystickData.x;
      moveDir.z = -joystickData.y;
    }

    if (moveDir.length() > 0) {
      moveDir.normalize();
      groupRef.current.position.addScaledVector(moveDir, speed * delta);
      onMove(groupRef.current.position.clone());
      // Look in movement direction
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation, 0.2);
    }

    // Firing Logic
    if ((attack || mobileShootRequested) && state.clock.elapsedTime - lastShootTime > 0.4) {
      setLastShootTime(state.clock.elapsedTime);
      if (mobileShootRequested && onMobileShootHandled) {
        onMobileShootHandled();
      }
      
      // Animation Effect: recoil
      meshRef.current.scale.set(1.4, 0.8, 1.4);
      
      const shootPos = groupRef.current.position.clone().add(new THREE.Vector3(0, 0.5, 0));
      const shootDir = new THREE.Vector3(0, 0, 1).applyQuaternion(meshRef.current.quaternion);
      
      // Add a muzzle flash local position
      const flashPos = new THREE.Vector3(0, 0.5, 1).applyQuaternion(meshRef.current.quaternion);
      setMuzzleFlashes(prev => [...prev, { id: Date.now() + Math.random(), pos: flashPos }]);
      setTimeout(() => setMuzzleFlashes(prev => prev.slice(1)), 200);

      onShoot(shootPos, shootDir);
    }

    // Super Logic
    if (superKey && state.clock.elapsedTime - lastSuperTime > 1) {
      setLastSuperTime(state.clock.elapsedTime);
      onSuper(groupRef.current.position.clone());
      if (brawler.id === 'shelly' && brawler.activeSkinId === 'witch_shelly') {
        setIsFlying(true);
      }
    }

    // Special Ability Logic
    if (special && state.clock.elapsedTime - lastSpecialTime > (brawler.specialAbility?.cooldown || 5)) {
       setLastSpecialTime(state.clock.elapsedTime);
       onSpecial(groupRef.current.position.clone());
    }

    // Hypercharge Logic
    if (hipercarga && brawler.level >= 11 && state.clock.elapsedTime - lastHyperTime > 30) {
       setLastHyperTime(state.clock.elapsedTime);
       onHyper(groupRef.current.position.clone());
    }

    // Recover scale smoothly
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.15);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1, 0.15);
    meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1, 0.15);

    // Boundary check (Map is 40x40, centered at 0,0)
    groupRef.current.position.x = Math.max(-19, Math.min(19, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-19, Math.min(19, groupRef.current.position.z));
  });

  return (
    <group ref={groupRef} position={[0, 0, 5]}>
      <group ref={meshRef}>
        {brawler.id === 'spike' ? (
          <SpikeModel skinId={brawler.activeSkinId} />
        ) : brawler.id === 'crow' ? (
          <CrowModel />
        ) : brawler.id === 'ninchill' ? (
          <NinchillModel />
        ) : brawler.id === 'kenji' ? (
          <KenjiModel />
        ) : brawler.id === 'mortis' ? (
          <MortisModel />
        ) : brawler.id === 'colt' ? (
          <ColtModel />
        ) : brawler.id === 'shelly' ? (
          <ShellyModel skinId={brawler.activeSkinId} isFlying={isFlying} />
        ) : (
          <mesh>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color={brawler.renderColor} />
            <mesh position={[0.2, 0.5, 0.4]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.2, 0.5, 0.4]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </mesh>
        )}
        {muzzleFlashes.map(flash => (
          <MuzzleFlash key={flash.id} position={flash.pos} />
        ))}
      </group>
    </group>
  );
}

function BotEnemy({ id, position, hp, maxHp, name, brawlerType, playerPos, onShoot, onMove }: { 
  id: number, 
  position: [number, number, number], 
  hp: number, 
  maxHp: number,
  name: string, 
  brawlerType: string,
  playerPos: THREE.Vector3,
  onShoot: (pos: THREE.Vector3, dir: THREE.Vector3, botId: number) => void,
  onMove: (id: number, pos: [number, number, number]) => void
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [lastShot, setLastShot] = useState(0);
  const [targetPos, setTargetPos] = useState(new THREE.Vector3(...position));

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current || hp <= 0) return;

    const currentPos = groupRef.current.position;
    const distToPlayer = currentPos.distanceTo(playerPos);
    
    // Movement AI
    if (distToPlayer > 12) {
      // Move towards player
      const dir = playerPos.clone().sub(currentPos).normalize();
      currentPos.addScaledVector(dir, 3 * delta);
      onMove(id, [currentPos.x, currentPos.y, currentPos.z]);
      
      const targetRotation = Math.atan2(dir.x, dir.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation, 0.1);
    } else if (distToPlayer < 6) {
      // Move away from player (too close!)
      const dir = currentPos.clone().sub(playerPos).normalize();
      currentPos.addScaledVector(dir, 4 * delta);
      onMove(id, [currentPos.x, currentPos.y, currentPos.z]);
      
      const targetRotation = Math.atan2(dir.x, dir.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation, 0.1);
    }

    // Shooting AI
    if (distToPlayer < 15 && state.clock.elapsedTime - lastShot > 1.5 + Math.random()) {
      setLastShot(state.clock.elapsedTime);
      const shootDir = playerPos.clone().sub(currentPos).normalize();
      onShoot(currentPos.clone().add(new THREE.Vector3(0, 0.5, 0)), shootDir, id);
    }

    // Hover effect
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + id) * 0.1;
  });

  if (hp <= 0) return null;

  return (
    <group ref={groupRef} position={position}>
      <group ref={meshRef}>
        <mesh castShadow>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color={brawlerType === 'shelly' ? '#3b82f6' : brawlerType === 'colt' ? '#f472b6' : '#991b1b'} />
        </mesh>
        {/* Simple Eyes to see where they look */}
        <mesh position={[0.2, 0.5, 0.4]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-0.2, 0.5, 0.4]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
      {/* Name Tag */}
      <group position={[0, 2.5, 0]}>
         <Text position={[0, 0, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.ttf">
           {name}
         </Text>
         <mesh position={[0, -0.4, 0]}>
            <planeGeometry args={[1.5, 0.1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.5} />
         </mesh>
         <mesh position={[-0.75 + (hp / maxHp) * 0.75, -0.4, 0.01]}>
            <planeGeometry args={[(hp / maxHp) * 1.5, 0.1]} />
            <meshBasicMaterial color="#ef4444" />
         </mesh>
      </group>
    </group>
  );
}

function Arena() {
  return (
    <>
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <meshStandardMaterial color="#3f6212" />
      </Plane>
      <gridHelper args={[100, 100, 0xffffff, 0x000000]} position={[0, -0.59, 0]} />
      {/* Boundaries */}
      <Box position={[0, 0, 25]} args={[50, 4, 1]}><meshStandardMaterial color="#1e3a1e" /></Box>
      <Box position={[0, 0, -25]} args={[50, 4, 1]}><meshStandardMaterial color="#1e3a1e" /></Box>
      <Box position={[25, 0, 0]} args={[1, 4, 50]}><meshStandardMaterial color="#1e3a1e" /></Box>
      <Box position={[-25, 0, 0]} args={[1, 4, 50]}><meshStandardMaterial color="#1e3a1e" /></Box>
    </>
  );
}

function CameraController({ shake, playerPos }: { shake: boolean, playerPos: THREE.Vector3 }) {
  const { camera } = useThree();
  const offset = new THREE.Vector3(0, 12, 10);

  useFrame((state) => {
    const desiredPos = playerPos.clone().add(offset);
    camera.position.lerp(desiredPos, 0.1);
    camera.lookAt(playerPos);

    if (shake) {
      camera.position.x += (Math.random() - 0.5) * 0.4;
      camera.position.y += (Math.random() - 0.5) * 0.4;
    }
  });

  return null;
}

function LobbyWorld({ brawler }: { brawler: Brawler }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Crystals */}
      <group position={[0, 0, -5]}>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[
            (i - 2.5) * 4,
            Math.abs(i - 2.5) * 0.5,
            -2 - i * 0.5
          ]} rotation={[0, 0, (i - 2.5) * 0.2]}>
            <coneGeometry args={[2, 12, 4]} />
            <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      
      {/* Clouds / Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.6} />
      </mesh>

      {/* The Brawler */}
      <group position={[0, -1, 0]} rotation={[0, -Math.PI / 8, 0]} scale={1.8}>
        {brawler.id === 'spike' ? <SpikeModel skinId={brawler.activeSkinId} /> : 
         brawler.id === 'crow' ? <CrowModel /> :
         brawler.id === 'ninchill' ? <NinchillModel /> :
         brawler.id === 'mortis' ? <MortisModel /> :
         brawler.id === 'kenji' ? <KenjiModel /> :
         brawler.id === 'colt' ? <ColtModel /> :
         brawler.id === 'shelly' ? <ShellyModel skinId={brawler.activeSkinId} /> : (
          <mesh>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color={brawler.renderColor} />
          </mesh>
        )}
      </group>
      
      <ambientLight intensity={1} />
      <pointLight position={[5, 5, 5]} intensity={2} />
      <spotLight position={[0, 5, 2]} intensity={2} angle={0.5} />
    </group>
  );
}

// Actualizar la sección de Lobby en App()

export default function App() {
  const [view, setView] = useState<'age_check' | 'auth' | 'lobby' | 'brawlers' | 'details' | 'shop' | 'battle' | 'missions' | 'skins' | 'starr-road' | 'admin'>('age_check');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLogged, setIsLogged] = useState(false);
  const [coins, setCoins] = useState(1200);
  const [gems, setGems] = useState(50);
  const [xp, setXp] = useState(0);
  const [gurbis, setGurbis] = useState(25000); // New currency: Gurbi
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [freeDrops, setFreeDrops] = useState(10);
  const [openingDrop, setOpeningDrop] = useState<{ active: boolean; rarity: string; clicks: number; reward: any | null }>({ active: false, rarity: 'Especial', clicks: 0, reward: null });
  const [brawlers, setBrawlers] = useState(INITIAL_BRAWLERS);
  const [selectedBrawler, setSelectedBrawler] = useState(INITIAL_BRAWLERS[0]);
  const [viewingBrawler, setViewingBrawler] = useState<Brawler | null>(null);
  const [missions, setMissions] = useState(INITIAL_MISSIONS);
  const [superCharge, setSuperCharge] = useState(0);
  const [isSuperActive, setIsSuperActive] = useState(false);
  const [bling, setBling] = useState(1000);
  const [trophies, setTrophies] = useState(4);
  const [credits, setCredits] = useState(825);
  const [wins, setWins] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const UNLOCK_COST = 1900;
  const GEM_UNLOCK_COST = 1000;
  const [enemies, setEnemies] = useState<{id: number, pos: [number, number, number], hp: number, maxHp: number, name: string, lastShotTime: number, brawlerType: string}[]>([
    { id: 1, pos: [0, 0, -10], hp: 3000, maxHp: 3000, name: 'amiraaa', lastShotTime: 0, brawlerType: 'shelly' },
    { id: 2, pos: [8, 0, -15], hp: 2000, maxHp: 2000, name: 'pablo67', lastShotTime: 0, brawlerType: 'colt' },
    { id: 3, pos: [-8, 0, -5], hp: 2000, maxHp: 2000, name: 'cakos88', lastShotTime: 0, brawlerType: 'spike' },
    { id: 4, pos: [12, 0, 5], hp: 1500, maxHp: 1500, name: 'mimi', lastShotTime: 0, brawlerType: 'crow' },
  ]);
  const [projectiles, setProjectiles] = useState<{id: number, pos: [number, number, number], dir: THREE.Vector3, color?: string, isDart?: boolean, isSword?: boolean}[]>([]);
  const [superVFXs, setSuperVFXs] = useState<{id: number, pos: [number, number, number], color: string}[]>([]);
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 5));
  const [battleShake, setBattleShake] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [chaoticStarrDropClaimed, setChaoticStarrDropClaimed] = useState(false);
  const [showChaoticOpening, setShowChaoticOpening] = useState(false);
  const [activeChaoticDrops, setActiveChaoticDrops] = useState<{id: string, price: number, currency: 'gold' | 'gems' | 'free'}[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [celebrationBrawler, setCelebrationBrawler] = useState<Brawler | null>(null);
  
  const isAdmin = username.toLowerCase() === 'aymanhacke7' && password === 'ayman2017';

  const isSaturdayToday = () => {
    return new Date().getDay() === 6;
  };

  const saveUserToRegistry = (user: UserAccount) => {
    setAllUsers(prev => {
      const existing = prev.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
      let newRegistry;
      if (existing >= 0) {
        newRegistry = [...prev];
        newRegistry[existing] = { ...newRegistry[existing], ...user };
      } else {
        newRegistry = [...prev, user];
      }
      localStorage.setItem('brawl_stars_v3_user_registry', JSON.stringify(newRegistry));
      return newRegistry;
    });
  };

  useEffect(() => {
    const savedRegistry = localStorage.getItem('brawl_stars_v3_user_registry');
    if (savedRegistry) {
      try {
        setAllUsers(JSON.parse(savedRegistry));
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleChaoticReward = (reward: any) => {
    if (reward.type === 'gold') setCoins(prev => prev + reward.amount);
    if (reward.type === 'gems') setGems(prev => prev + reward.amount);
    if (reward.type === 'credits') setCredits(prev => prev + reward.amount);
    if (reward.type === 'brawlers') {
      const targetBrawlers = brawlers.filter(b => !b.unlocked && (b.rarity === 'Legendario' || b.rarity === 'Mítico'));
      if (targetBrawlers.length > 0) {
        const toUnlock = targetBrawlers[0];
        setBrawlers(prev => prev.map(b => b.id === toUnlock.id ? { ...b, unlocked: true } : b));
        setCelebrationBrawler(toUnlock);
      } else {
        setGems(prev => prev + 50);
      }
    }
    if (reward.type === 'skin') {
      setGems(prev => prev + 30);
    }
    setShowChaoticOpening(false);
    setChaoticStarrDropClaimed(true);
    updateMissionProgress('win', 1); // Opening the drop counts as a win for demo purposes or missions? No, better keep it clean.
  };

  const applyDamage = (enemyId: number, damage: number) => {
    updateMissionProgress('damage', damage);
    setEnemies(prev => prev.map(e => {
      if (e.id === enemyId) {
        const newHp = Math.max(0, e.hp - damage);
        if (e.hp > 0 && newHp === 0) {
          updateMissionProgress('kill', 1);
        }
        return { ...e, hp: newHp };
      }
      return e;
    }));
  };

  const ChaoticOpening = ({ onRewardClaimed }: { onRewardClaimed: (reward: any) => void }) => {
    const [level, setLevel] = useState(0); // 0: Rare, 1: Super Rare, 2: Epic, 3: Mythic, 4: Legendary, 5: Ultra
    const [isFinished, setIsFinished] = useState(false);
    const [reward, setReward] = useState<any>(null);
    const [clicks, setClicks] = useState(0);

    const levels = [
      { id: 'rare', name: 'RARO', color: 'bg-green-500', shadow: 'shadow-[0_0_40px_rgba(34,197,94,0.6)]', chance: 1 },
      { id: 'super_rare', name: 'SUPER RARO', color: 'bg-blue-500', shadow: 'shadow-[0_0_40px_rgba(59,130,246,0.6)]', chance: 0.8 },
      { id: 'epic', name: 'ÉPICO', color: 'bg-purple-600', shadow: 'shadow-[0_0_40px_rgba(168,85,247,0.6)]', chance: 0.6 },
      { id: 'mythic', name: 'MÍTICO', color: 'bg-red-600', shadow: 'shadow-[0_0_40px_rgba(239,68,68,0.6)]', chance: 0.4 },
      { id: 'legendary', name: 'LEGENDARIO', color: 'bg-yellow-500', shadow: 'shadow-[0_0_40px_rgba(234,179,8,0.6)]', chance: 0.2 },
      { id: 'ultra', name: 'ULTRA', color: 'bg-white', shadow: 'shadow-[0_0_60px_rgba(255,255,255,0.8)]', chance: 0.05 },
    ];

    const handleTap = () => {
      if (isFinished) return;
      
      const nextLevel = level + 1;
      if (nextLevel < levels.length) {
        if (Math.random() < levels[nextLevel].chance) {
          setLevel(nextLevel);
        } else {
          finishOpening(level);
        }
      } else {
        finishOpening(level);
      }
      setClicks(prev => prev + 1);
    };

    const finishOpening = (finalLevel: number) => {
      setIsFinished(true);
      const levelId = levels[finalLevel].id;
      
      // Generate Reward
      let rewardObj: any = {};
      const rand = Math.random();

      if (levelId === 'ultra') {
        if (rand < 0.2) rewardObj = { type: 'gold', amount: Math.floor(Math.random() * 100000) };
        else if (rand < 0.4) rewardObj = { type: 'gems', amount: Math.floor(Math.random() * 100) };
        else rewardObj = { type: 'brawlers', amount: 1 }; // Secret/Legendary
      } else if (levelId === 'legendary') {
        if (rand < 0.3) rewardObj = { type: 'gold', amount: Math.floor(Math.random() * 80000) };
        else if (rand < 0.5) rewardObj = { type: 'gems', amount: Math.floor(Math.random() * 80) };
        else rewardObj = { type: 'skin', brawlerId: 'spike', skinId: 'angry_spike' };
      } else if (levelId === 'mythic') {
        if (rand < 0.4) rewardObj = { type: 'gold', amount: Math.floor(Math.random() * 60000) };
        else if (rand < 0.6) rewardObj = { type: 'gems', amount: Math.floor(Math.random() * 60) };
        else rewardObj = { type: 'credits', amount: 500 };
      } else if (levelId === 'epic') {
        if (rand < 0.5) rewardObj = { type: 'gold', amount: Math.floor(Math.random() * 5000) };
        else if (rand < 0.7) rewardObj = { type: 'gems', amount: Math.floor(Math.random() * 40) };
        else rewardObj = { type: 'credits', amount: 200 };
      } else { // super_rare or rare
        if (rand < 0.6) rewardObj = { type: 'gold', amount: Math.floor(Math.random() * 2000) };
        else if (rand < 0.8) rewardObj = { type: 'gems', amount: Math.floor(Math.random() * 15) };
        else rewardObj = { type: 'credits', amount: 100 };
      }

      setReward(rewardObj);
    };

    return (
      <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-3xl">
        {!isFinished ? (
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={handleTap}
            className={`cursor-pointer w-72 h-72 rounded-full ${level === 5 ? 'bg-gradient-to-tr from-white via-cyan-200 to-pink-200' : levels[level].color} ${levels[level].shadow} border-8 border-black flex items-center justify-center relative group`}
          >
             {level === 5 && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-yellow-400 opacity-30 animate-pulse" />
             )}
             <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute -top-12 inset-x-0 text-center">
                <span className={`text-5xl font-black italic uppercase tracking-tighter ${level === 5 ? 'text-black' : 'text-white'} drop-shadow-[0_4px_black]`}>
                  {levels[level].name}
                </span>
             </div>
             <Star className={`w-32 h-32 ${level === 5 ? 'text-indigo-600' : 'text-black'} animate-spin-slow`} />
             <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-black/40 to-transparent" />
             </div>
             <motion.p 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 1 }}
               className="absolute -bottom-20 text-2xl font-black italic text-yellow-400 uppercase tracking-widest whitespace-nowrap"
             >
               ¡TOCA PARA MEJORAR!
             </motion.p>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <h2 className="text-6xl font-black italic uppercase italic tracking-tighter text-white mb-12 drop-shadow-2xl">¡RECOMPENSA!</h2>
            <div className="bg-white/10 p-12 rounded-[4rem] border-4 border-white/20 flex flex-col items-center shadow-2xl relative overflow-hidden min-w-[300px]">
               <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
               {reward.type === 'gold' && <Coins className="w-40 h-40 text-yellow-400 mb-6" />}
               {reward.type === 'gems' && <Gem className="w-40 h-40 text-emerald-400 mb-6" />}
               {reward.type === 'credits' && <Target className="w-40 h-40 text-cyan-400 mb-6" />}
               {reward.type === 'brawlers' && <Users className="w-40 h-40 text-yellow-400 mb-6" />}
               {reward.type === 'skin' && <Palette className="w-40 h-40 text-purple-400 mb-6" />}
               
               <p className="text-4xl font-black italic uppercase tracking-tighter text-white">
                 {reward.type === 'gold' && `+${reward.amount} ORO`}
                 {reward.type === 'gems' && `+${reward.amount} DIAMANTES`}
                 {reward.type === 'credits' && `+${reward.amount} CRÉDITOS`}
                 {reward.type === 'brawlers' && `NUEVO BRAWLER`}
                 {reward.type === 'skin' && `NUEVO ASPECTO`}
               </p>
               
               <button 
                onClick={() => onRewardClaimed(reward)}
                className="mt-12 bg-green-500 px-16 py-6 rounded-3xl border-b-8 border-green-800 text-3xl font-black uppercase italic active:border-b-0 active:translate-y-2 transition-all text-white"
               >
                 RECOGER
               </button>
            </div>
          </motion.div>
        )}

        <style>{`
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .animate-shimmer { animation: shimmer 2s infinite; }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        `}</style>
      </div>
    );
  };

  // --- Admin Panel ---
  const AdminPanel = () => {
    const [adminActiveTab, setAdminActiveTab] = useState<'drops' | 'gifts' | 'brawler' | 'shop' | 'users'>('drops');
    const [newBrawler, setNewBrawler] = useState<Partial<Brawler>>({
      name: '',
      role: 'Destructor',
      hp: 4000,
      attack: 1500,
      rarity: 'Común',
      description: '',
      price: 10
    });
    const [giftData, setGiftData] = useState({ type: 'coins', amount: 0, targetUser: '' });
    const [dropData, setDropData] = useState({ price: 0, currency: 'free' as 'free' | 'gold' | 'gems' });

    const handleCreateBrawler = () => {
      if (!newBrawler.name) return;
      const b: Brawler = {
        id: newBrawler.name.toLowerCase().replace(/\s/g, '_'),
        name: newBrawler.name,
        rarity: newBrawler.rarity as any,
        role: newBrawler.role || 'Destructor',
        hp: newBrawler.hp || 4000,
        attack: newBrawler.attack || 1500,
        unlocked: false,
        price: newBrawler.price || 0,
        color: 'bg-gray-500',
        renderColor: '#6b7280',
        level: 1,
        masteryXP: 0,
        masteryLevel: 1,
        description: newBrawler.description || '',
      };
      setBrawlers(prev => [...prev, b]);
      alert(`Brawler ${b.name} creado y enviado al juego!`);
    };

    const handleGift = () => {
      const user = allUsers.find(u => u.username.toLowerCase() === giftData.targetUser.toLowerCase());
      if (user) {
        const updatedUser = { ...user };
        if (giftData.type === 'coins') updatedUser.coins += giftData.amount;
        if (giftData.type === 'gems') updatedUser.gems += giftData.amount;
        if (giftData.type === 'gurbis') updatedUser.gurbis += giftData.amount;
        
        saveUserToRegistry(updatedUser);
        
        // If it's the currently logged user, update local state too
        if (username.toLowerCase() === giftData.targetUser.toLowerCase()) {
           if (giftData.type === 'coins') setCoins(prev => prev + giftData.amount);
           if (giftData.type === 'gems') setGems(prev => prev + giftData.amount);
           if (giftData.type === 'gurbis') setGurbis(prev => prev + giftData.amount);
        }
        alert(`Regalo enviado a ${giftData.targetUser}`);
      } else {
        alert("Usuario no encontrado");
      }
    };

    const handleAddDrop = () => {
      const newDrop = { id: Date.now().toString(), price: dropData.price, currency: dropData.currency };
      setActiveChaoticDrops(prev => [...prev, newDrop]);
      alert("Drop chaotic añadido");
    };

    const handleBan = (user: UserAccount, duration: string) => {
      let banUntil: string | null = null;
      const now = new Date();
      if (duration === '10d') banUntil = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
      if (duration === '1m') banUntil = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      if (duration === '1y') banUntil = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
      if (duration === 'forever') banUntil = 'forever';

      const updatedUser = { ...user, isBanned: true, banUntil };
      saveUserToRegistry(updatedUser);
      alert(`Usuario ${user.username} baneado.`);
    };

    return (
      <div className="fixed inset-0 z-[60] bg-[#0a0f1e] overflow-y-auto p-4 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black italic uppercase text-white tracking-widest drop-shadow-[0_2px_black]">ADMIN PANEL</h2>
            <button onClick={() => setView('lobby')} className="p-3 bg-red-600 border-4 border-black rounded-xl hover:scale-110 active:scale-95 transition-transform">
              <X className="w-8 h-8 text-white" />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            {(['drops', 'gifts', 'brawler', 'shop', 'users'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setAdminActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-black italic uppercase border-4 border-black transition-all ${adminActiveTab === tab ? 'bg-yellow-400 scale-105' : 'bg-white/10 text-white'}`}
              >
                {tab === 'drops' ? 'Drops' : tab === 'gifts' ? 'Regalos' : tab === 'brawler' ? 'Crear Brawler' : tab === 'shop' ? 'Tienda' : 'Usuarios'}
              </button>
            ))}
          </div>

          <div className="bg-black/40 border-8 border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            {adminActiveTab === 'drops' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-blue-400">CONFIGURAR DROPS CAOTICOS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-white font-bold">PRECIO</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border-4 border-white/20 rounded-xl p-4 text-white" 
                      value={dropData.price}
                      onChange={e => setDropData({...dropData, price: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-white font-bold">MONEDA</label>
                    <select 
                      className="w-full bg-white/5 border-4 border-white/20 rounded-xl p-4 text-white"
                      value={dropData.currency}
                      onChange={e => setDropData({...dropData, currency: e.target.value as any})}
                    >
                      <option value="free" className="bg-slate-900">Gratis</option>
                      <option value="gold" className="bg-slate-900">Monedas de Oro</option>
                      <option value="gems" className="bg-slate-900">Diamantes</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleAddDrop} className="w-full py-4 bg-green-500 font-black text-2xl rounded-2xl border-4 border-black mb-8">AÑADIR DROP</button>

                <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm opacity-50">Drops Activos</h4>
                  {activeChaoticDrops.length === 0 ? (
                    <p className="text-white/30 italic">No hay drops personalizados configurados.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                       {activeChaoticDrops.map(d => (
                         <div key={d.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-4">
                               <Star className="w-6 h-6 text-yellow-400" />
                               <span className="text-white font-black uppercase italic">
                                 {d.currency === 'free' ? 'GRATIS' : `${d.price} ${d.currency === 'gold' ? 'ORO' : 'DIAMANTES'}`}
                               </span>
                            </div>
                            <button 
                              onClick={() => setActiveChaoticDrops(prev => prev.filter(item => item.id !== d.id))}
                              className="p-2 bg-red-600 rounded-lg hover:scale-110 active:scale-95 transition-transform"
                            >
                               <Trash2 className="w-5 h-5 text-white" />
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {adminActiveTab === 'gifts' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-pink-400">REGALAR DINERO</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-4">
                    <label className="block text-white font-bold">TIPO</label>
                    <select 
                      className="w-full bg-white/5 border-4 border-white/20 rounded-xl p-4 text-white"
                      value={giftData.type}
                      onChange={e => setGiftData({...giftData, type: e.target.value})}
                    >
                      <option value="coins">Monedas de Oro</option>
                      <option value="gems">Diamantes</option>
                      <option value="gurbis">Gurbis</option>
                    </select>
                   </div>
                   <div className="space-y-4">
                    <label className="block text-white font-bold">USUARIO</label>
                    <input 
                      type="text" 
                      placeholder="Ej: aymanhacke7"
                      className="w-full bg-white/5 border-4 border-white/20 rounded-xl p-4 text-white" 
                      value={giftData.targetUser}
                      onChange={e => setGiftData({...giftData, targetUser: e.target.value})}
                    />
                   </div>
                   <div className="space-y-4">
                    <label className="block text-white font-bold">CANTIDAD</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border-4 border-white/20 rounded-xl p-4 text-white" 
                      value={giftData.amount}
                      onChange={e => setGiftData({...giftData, amount: parseInt(e.target.value)})}
                    />
                   </div>
                </div>
                <button onClick={handleGift} className="w-full py-4 bg-pink-500 font-black text-2xl rounded-2xl border-4 border-black uppercase italic">ENVIAR REGALO</button>
              </div>
            )}

            {adminActiveTab === 'brawler' && (
              <div className="space-y-6">
                 <h3 className="text-2xl font-black text-red-500">CREAR NUEVO BRAWLER</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="Nombre del Brawler" className="bg-white/5 border-4 border-white/10 p-4 rounded-xl text-white" onChange={e => setNewBrawler({...newBrawler, name: e.target.value})} />
                    <input type="text" placeholder="Arma (Ej: Chicles)" className="bg-white/5 border-4 border-white/10 p-4 rounded-xl text-white" />
                    <input type="text" placeholder="Lo que tira (Ej: Chicles)" className="bg-white/5 border-4 border-white/10 p-4 rounded-xl text-white" />
                    <select className="bg-white/5 border-4 border-white/10 p-4 rounded-xl text-white" onChange={e => setNewBrawler({...newBrawler, rarity: e.target.value as any})}>
                      <option value="Común" className="bg-slate-900">Común</option>
                      <option value="Secreto" className="bg-slate-900">Secreto</option>
                      <option value="Legendario" className="bg-slate-900">Legendario</option>
                    </select>
                    <input type="number" placeholder="Precio (Diamantes/Oro)" className="bg-white/5 border-4 border-white/10 p-4 rounded-xl text-white" onChange={e => setNewBrawler({...newBrawler, price: parseInt(e.target.value)})} />
                 </div>
                 <div className="p-8 border-4 border-dashed border-white/20 rounded-3xl text-center bg-white/5">
                   <Monitor className="w-16 h-16 text-white mx-auto mb-4 opacity-50" />
                   <p className="text-white font-bold opacity-50">Dibuja o arrastra una imagen aquí</p>
                 </div>
                 <button onClick={handleCreateBrawler} className="w-full py-4 bg-red-600 font-black text-2xl rounded-2xl border-4 border-black">ENVIAR AL JUEGO</button>
              </div>
            )}

            {adminActiveTab === 'shop' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-cyan-400">GESTIÓN DE TIENDA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-white/5 border-4 border-white/10 rounded-2xl">
                    <p className="text-xl font-bold text-white mb-4">Añadir Brawler Gratis</p>
                    <select className="w-full bg-black/40 p-4 rounded-xl text-white border-2 border-white/10 mb-4">
                      {brawlers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <button className="w-full py-3 bg-cyan-500 rounded-xl font-bold border-2 border-black" onClick={() => alert("Brawler añadido gratis a la tienda")}>PONER GRATIS</button>
                  </div>
                  <div className="p-6 bg-white/5 border-4 border-white/10 rounded-2xl">
                    <p className="text-xl font-bold text-white mb-4">Añadir Ropa/Skin</p>
                    <input type="text" placeholder="Nombre Skin" className="w-full bg-black/40 p-4 rounded-xl text-white border-2 border-white/10 mb-4" />
                    <div className="flex gap-4">
                       <button className="flex-1 py-3 bg-green-500 rounded-xl font-bold border-2 border-black">GRATIS</button>
                       <button className="flex-1 py-3 bg-yellow-500 rounded-xl font-bold border-2 border-black">10 DIAMANTES</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminActiveTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-indigo-400">LISTA DE USUARIOS</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-white border-collapse">
                    <thead>
                      <tr className="border-b-4 border-white/10">
                        <th className="p-4 uppercase italic">Usuario</th>
                        <th className="p-4 uppercase italic">Contraseña</th>
                        <th className="p-4 uppercase italic">Estado</th>
                        <th className="p-4 uppercase italic text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map(user => (
                        <tr key={user.username} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold">{user.username}</td>
                          <td className="p-4 font-mono opacity-60">{user.password}</td>
                          <td className="p-4">
                            {user.isBanned ? (
                              <span className="text-red-500 font-bold">BANEADO ({user.banUntil === 'forever' ? 'Perpetuo' : new Date(user.banUntil!).toLocaleDateString()})</span>
                            ) : (
                              <span className="text-green-500 font-bold">ACTIVO</span>
                            )}
                          </td>
                          <td className="p-4 flex gap-2 justify-center">
                            <button onClick={() => handleBan(user, '10d')} className="px-3 py-1 bg-orange-600 rounded-lg text-xs font-bold border-2 border-black">10 Días</button>
                            <button onClick={() => handleBan(user, '1m')} className="px-3 py-1 bg-red-500 rounded-lg text-xs font-bold border-2 border-black">1 Mes</button>
                            <button onClick={() => handleBan(user, '1y')} className="px-3 py-1 bg-red-700 rounded-lg text-xs font-bold border-2 border-black">1 Año</button>
                            <button onClick={() => handleBan(user, 'forever')} className="px-3 py-1 bg-black rounded-lg text-xs font-bold border-2 border-white/20">SIEMPRE</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Persistence
  const loadAccountData = (name: string) => {
    const saved = localStorage.getItem(`brawl_stars_v3_user_${name.toLowerCase()}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCoins(data.coins ?? 1200);
        setGems(data.gems ?? 50);
        setXp(data.xp ?? 0);
        setBrawlers(data.brawlers ?? INITIAL_BRAWLERS);
        setMissions(data.missions ?? INITIAL_MISSIONS);
        setTrophies(data.trophies ?? 0);
        setBling(data.bling ?? 0);
        setCredits(data.credits ?? 0);
        setWins(data.wins ?? 0);
        setChaoticStarrDropClaimed(data.chaoticStarrDropClaimed ?? false);
        setGurbis(data.gurbis ?? 25000);
        if (data.password) setPassword(data.password);
        const currentSelected = (data.brawlers ?? INITIAL_BRAWLERS).find((b: Brawler) => b.id === data.selectedId);
        if (currentSelected) setSelectedBrawler(currentSelected);
      } catch (e) { 
        console.error("Error loading account data:", e);
      }
    } else {
      // Reset to defaults for new account
      setCoins(1200);
      setGems(50);
      setXp(0);
      setBrawlers(INITIAL_BRAWLERS);
      setMissions(INITIAL_MISSIONS);
      setTrophies(0);
      setBling(0);
      setCredits(0);
      setWins(0);
      setChaoticStarrDropClaimed(false);
      setSelectedBrawler(INITIAL_BRAWLERS[0]);
    }
  };

  useEffect(() => {
    const lastSession = localStorage.getItem('brawl_stars_v3_last_session');
    if (lastSession) {
      try {
        const session = JSON.parse(lastSession);
        if (session.username && session.isLogged) {
          setUsername(session.username);
          setIsLogged(true);
          loadAccountData(session.username);
          setView('lobby');
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsLoading(false), 500);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    const globalConfig = localStorage.getItem('brawl_stars_v3_global_config');
    if (globalConfig) {
      try {
        const config = JSON.parse(globalConfig);
        if (config.activeChaoticDrops) setActiveChaoticDrops(config.activeChaoticDrops);
      } catch(e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('brawl_stars_v3_global_config', JSON.stringify({ activeChaoticDrops }));
  }, [activeChaoticDrops]);

  useEffect(() => {
    if (isLogged && username) {
      const data = { 
        coins, gems, xp, brawlers, missions, selectedId: selectedBrawler.id, 
        trophies, bling, username, isLogged, credits, wins,
        chaoticStarrDropClaimed, gurbis, password // Inclusion of gurbis and password
      };
      localStorage.setItem(`brawl_stars_v3_user_${username.toLowerCase()}`, JSON.stringify(data));
      // Save last session as well
      localStorage.setItem('brawl_stars_v3_last_session', JSON.stringify({ username, isLogged }));
      
      // Update global registry for Admin
      const userAcc: UserAccount = {
        username,
        password,
        coins,
        gems,
        gurbis,
        trophies,
        bling,
        credits,
        xp,
        unlockedBrawlers: brawlers.filter(b => b.unlocked).map(b => b.id)
      };
      saveUserToRegistry(userAcc);
    }
  }, [coins, gems, xp, brawlers, missions, selectedBrawler, trophies, bling, username, isLogged, credits, wins, chaoticStarrDropClaimed, gurbis, password]);

  useEffect(() => {
    const current = brawlers.find(b => b.id === selectedBrawler.id);
    if (current) setSelectedBrawler(current);
  }, [brawlers]);

  // XP Reward Logic
  useEffect(() => {
    if (xp >= 250) {
      setXp(prev => prev - 250);
      setGems(prev => prev + 10);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    }
  }, [xp]);

  const handleShoot = (pos: THREE.Vector3, dir: THREE.Vector3) => {
    const isColt = selectedBrawler.id === 'colt';
    const isMortis = selectedBrawler.id === 'mortis';
    const shootColor = selectedBrawler.id === 'ninchill' ? '#f472b6' : (isColt ? '#fcd34d' : '#fbbf24');
    setProjectiles(prev => [...prev, { id: Date.now() + Math.random(), pos: [pos.x, pos.y, pos.z], dir, color: shootColor, isDart: isColt, isSword: isMortis }]);
    
    // Camera shake
    setBattleShake(true);
    setTimeout(() => setBattleShake(false), 100);

    // Check hit against enemies
    let hitSomething = false;
    enemies.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const enemyPos = new THREE.Vector3(...enemy.pos);
      const toEnemy = enemyPos.clone().sub(pos);
      const angle = dir.angleTo(toEnemy);
      
      if (angle < 0.35 && toEnemy.length() < 18) {
        applyDamage(enemy.id, selectedBrawler.attack);
        hitSomething = true;
      }
    });

    if (hitSomething) {
      setSuperCharge(prev => Math.min(100, prev + 25));
    }
  };

  const handleBotShoot = (pos: THREE.Vector3, dir: THREE.Vector3, botId: number) => {
    const bot = enemies.find(e => e.id === botId);
    if (!bot) return;

    setProjectiles(prev => [...prev, { id: Date.now() + Math.random(), pos: [pos.x, pos.y, pos.z], dir, color: '#ef4444' }]);

    // Check hit against player
    const toPlayer = playerPosition.clone().sub(pos);
    const angle = dir.angleTo(toPlayer);
    
    if (angle < 0.45 && toPlayer.length() < 15) {
      setPlayerHp(prev => Math.max(0, prev - (selectedBrawler.hp * 0.08))); // 8% of max hp per hit
      setBattleShake(true);
      setTimeout(() => setBattleShake(false), 100);
    }
  };

  const buyBrawler = (b: Brawler) => {
    if (coins >= b.price && !b.unlocked) {
      setCoins(prev => prev - b.price);
      setBrawlers(prev => prev.map(item => item.id === b.id ? { ...item, unlocked: true } : item));
      setCelebrationBrawler(b);
    }
  };

  const openChaoticDrop = () => {
    if (freeDrops <= 0) return;
    setFreeDrops(prev => prev - 1);
    setOpeningDrop({ active: true, rarity: 'Especial', clicks: 0, reward: null });
  };

  const tapDrop = () => {
    if (openingDrop.reward || !openingDrop.active) return;

    const rarities = ['Especial', 'Superraro', 'Épico', 'Mítico', 'Legendario'];
    const currentIndex = rarities.indexOf(openingDrop.rarity);
    
    // Chance to upgrade rarity (decreases as we go higher)
    const upgradeChances = [0.6, 0.4, 0.25, 0.15];
    const canUpgrade = currentIndex < rarities.length - 1;
    const shouldUpgrade = canUpgrade && Math.random() < upgradeChances[currentIndex];
    
    if (shouldUpgrade) {
      setOpeningDrop(prev => ({ ...prev, rarity: rarities[currentIndex + 1], clicks: prev.clicks + 1 }));
      // Small screen shake or vibe could go here
    } else if (openingDrop.clicks >= 2 || !canUpgrade || Math.random() > 0.5) {
      // Reveal reward
      revealReward(openingDrop.rarity);
    } else {
      // Just a click without progress
      setOpeningDrop(prev => ({ ...prev, clicks: prev.clicks + 1 }));
    }
  };

  const revealReward = (finalRarity: string) => {
    let reward;
    const mult = finalRarity === 'Especial' ? 1 : 
                 finalRarity === 'Superraro' ? 2 : 
                 finalRarity === 'Épico' ? 4 : 
                 finalRarity === 'Mítico' ? 8 : 15;

    const rand = Math.random();
    if (rand < 0.7) {
      const amount = (Math.floor(Math.random() * 200) + 100) * mult;
      setCoins(c => c + amount);
      reward = { type: 'Monedas', amount, icon: <img src="input_file_1.png" className="w-32 h-32" /> };
    } else if (rand < 0.93) {
      const amount = (Math.floor(Math.random() * 100) + 50) * mult;
      setGurbis(g => g + amount);
      reward = { type: 'Gurbis', amount, icon: <img src="input_file_0.png" className="w-32 h-32" /> };
    } else {
      const amount = (Math.floor(Math.random() * 10) + 5) * mult;
      setGems(g => g + amount);
      reward = { type: 'Gemas', amount, icon: <Gem className="w-32 h-32 text-emerald-400" /> };
    }
    
    setOpeningDrop(prev => ({ ...prev, reward }));
  };
  const upgradeBrawler = (b: Brawler) => {
    const cost = b.level * 200;
    if (coins >= cost && b.level < 11) {
      setCoins(prev => prev - cost);
      const updated = brawlers.map(item => item.id === b.id ? { ...item, level: item.level + 1, hp: item.hp + 200, attack: item.attack + 100 } : item);
      setBrawlers(updated);
      const newB = updated.find(item => item.id === b.id);
      if (newB) {
        setViewingBrawler(newB);
        if (selectedBrawler.id === newB.id) setSelectedBrawler(newB);
      }
      updateMissionProgress('upgrade', 1);
    }
  };

  const updateMissionProgress = (type: Mission['type'], amount: number = 1) => {
    setMissions(prev => prev.map(m => {
      if (!m.completed && m.type === type) {
        const newCurrent = m.current + amount;
        if (newCurrent >= m.target) {
          // Mission just completed
          setXp(x => x + m.rewardXP);
          if (m.rewardCurrency && m.rewardAmount) {
            if (m.rewardCurrency === 'coins') setCoins(c => c + m.rewardAmount!);
            if (m.rewardCurrency === 'gems') setGems(g => g + m.rewardAmount!);
            if (m.rewardCurrency === 'bling') setBling(b => b + m.rewardAmount!);
            if (m.rewardCurrency === 'credits') setCredits(cr => cr + m.rewardAmount!);
          }
          return { ...m, current: m.target, completed: true };
        }
        return { ...m, current: newCurrent };
      }
      return m;
    }));
  };

  const completeMission = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && !m.completed) {
        setXp(x => x + m.rewardXP);
        if (m.rewardCurrency && m.rewardAmount) {
          if (m.rewardCurrency === 'coins') setCoins(c => c + m.rewardAmount!);
          if (m.rewardCurrency === 'gems') setGems(g => g + m.rewardAmount!);
          if (m.rewardCurrency === 'bling') setBling(b => b + m.rewardAmount!);
          if (m.rewardCurrency === 'credits') setCredits(cr => cr + m.rewardAmount!);
        }
        return { ...m, current: m.target, completed: true };
      }
      return m;
    }));
  };

  const toggleSkin = (brawlerId: string, skinId: string) => {
    setBrawlers(prev => prev.map(b => {
      if (b.id === brawlerId) {
        const skin = b.skins?.find(s => s.id === skinId);
        if (skin) {
          if (skin.unlocked) {
            return { ...b, activeSkinId: skinId };
          } else if (gems >= skin.price) {
            setGems(g => g - skin.price);
            const updatedSkins = b.skins?.map(s => s.id === skinId ? { ...s, unlocked: true } : s);
            return { ...b, skins: updatedSkins, activeSkinId: skinId };
          }
        }
      }
      return b;
    }));
  };

  const handleSuper = (playerPos: THREE.Vector3) => {
    if (superCharge < 100) return;
    setSuperCharge(0);
    setBattleShake(true);
    setTimeout(() => setBattleShake(false), 500);

    // Add VFX
    setSuperVFXs(prev => [...prev, { id: Date.now() + Math.random(), pos: [playerPos.x, 0.1, playerPos.z], color: selectedBrawler.renderColor }]);
    setTimeout(() => setSuperVFXs(prev => prev.slice(1)), 1500);

    // Powerful Area Effect
    enemies.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const enemyPos = new THREE.Vector3(...enemy.pos);
      // Distance check from player position
      if (enemyPos.distanceTo(playerPos) < 15) {
        applyDamage(enemy.id, selectedBrawler.attack * 4);
      }
    });
  };

  const [hipercargaCharge, setHipercargaCharge] = useState(0);
  const [specialCooldown, setSpecialCooldown] = useState(0);
  const [hyperDuration, setHyperDuration] = useState(0);

  const handleSpecial = (pos: THREE.Vector3) => {
    if (!selectedBrawler.specialAbility || specialCooldown > 0) return;
    
    setSpecialCooldown(selectedBrawler.specialAbility.cooldown);
    setSuperVFXs(prev => [...prev, { id: Date.now(), pos: [pos.x, pos.y, pos.z], color: '#34d399' }]);
    setBattleShake(true);
    setTimeout(() => setBattleShake(false), 300);

    // Apply damage to nearby enemies
    enemies.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const enemyPos = new THREE.Vector3(...enemy.pos);
      const dist = pos.distanceTo(enemyPos);
      if (dist < 5) {
        applyDamage(enemy.id, selectedBrawler.specialAbility?.damage || 2000);
      }
    });
  };

  const handleHypercharge = (pos: THREE.Vector3) => {
    if (selectedBrawler.level < 11 || hyperDuration > 0) return;
    
    setHyperDuration(10); // 10 seconds of hypercharge
    setSuperVFXs(prev => [...prev, { id: Date.now(), pos: [pos.x, pos.y, pos.z], color: '#f472b6' }]);
    setBattleShake(true);
    setTimeout(() => setBattleShake(false), 500);
  };

  // Cooldown and Duration Tickers
  useEffect(() => {
    if (view !== 'battle') return;
    const interval = setInterval(() => {
      setSpecialCooldown(prev => Math.max(0, prev - 1));
      setHyperDuration(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  const [joystickData, setJoystickData] = useState<{ x: number, y: number } | null>(null);
  const [mobileShootRequested, setMobileShootRequested] = useState(false);

  const handleJoystickMove = (data: { x: number, y: number } | null) => {
    setJoystickData(data);
  };

  const finishBattle = (victory: boolean) => {
    if (victory) {
      setCoins(prev => prev + 200);
      setXp(prev => prev + 100);
      updateMissionProgress('win', 1);
      
      const newWins = wins + 1;
      setWins(newWins);
      if (newWins % 10 === 0) {
        setCredits(prev => prev + 100);
      }
    }
    setView('lobby');
  };

  useEffect(() => {
    if (view !== 'battle') return;
    
    if (enemies.every(e => e.hp <= 0)) {
      setTimeout(() => finishBattle(true), 1500);
    }
    
    if (playerHp <= 0) {
      setTimeout(() => finishBattle(false), 1000);
    }
  }, [enemies, playerHp, view]);

  const handleMoveBot = (id: number, pos: [number, number, number]) => {
    setEnemies(prev => prev.map(e => e.id === id ? { ...e, pos } : e));
  };

  const StarrRoad = () => {
    // Find the first locked brawler in a sequence (Spike -> Crow -> Kenji -> etc)
    const starrRoadIds = ['spike', 'crow', 'kenji', 'ninchill', 'mortis'];
    const brawlerToUnlock = brawlers.find(b => starrRoadIds.includes(b.id) && !b.unlocked) || brawlers.find(b => !b.unlocked);
    
    // Dynamic UNLOCK_COST
    let currentUnlockCost = 1500;
    if (brawlerToUnlock?.id === 'spike') currentUnlockCost = 2000;
    else if (brawlerToUnlock?.rarity === 'Legendario') currentUnlockCost = 3800;

    const getRarityColor = (rarity: string) => {
       switch(rarity.toLowerCase()) {
          case 'legendario': return '#ffcb05'; // Amarillo
          case 'mítico': return '#ef4444';    // Rojo
          case 'épico': return '#a855f7';      // Morado
          case 'superraro': return '#1e3a8a'; // Azul Oscuro
          case 'raro': return '#3b82f6';      // Azul
          case 'común': return '#3b82f6';     // Azul (default for common)
          case 'secreto': return 'linear-gradient(135deg, #000000 0%, #4b5563 100%)'; // Negro/Gris
          default: return '#3b82f6';
       }
    };

    if (!brawlerToUnlock) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[80] bg-[#ffcb05] flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
          <button onClick={() => setView('lobby')} className="absolute top-8 left-8 bg-[#00000066] p-4 rounded-full border-4 border-black hover:scale-110 transition-transform z-10 text-white"><ArrowLeft className="w-10 h-10" /></button>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-2 drop-shadow-[0_8px_black] text-white">¡Todos desbloqueados!</h1>
        </motion.div>
      );
    }

    const bgColor = getRarityColor(brawlerToUnlock.rarity);

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        style={{ 
          background: bgColor.includes('gradient') ? bgColor : bgColor,
          backgroundColor: bgColor.includes('gradient') ? 'transparent' : bgColor
        }}
        className="absolute inset-0 z-[80] flex flex-col items-center justify-center p-8 overflow-hidden font-sans"
      >
        <button onClick={() => setView('lobby')} className="absolute top-8 left-8 bg-[#00000066] p-4 rounded-full border-4 border-black hover:scale-110 transition-transform z-10 text-white">
          <ArrowLeft className="w-10 h-10" />
        </button>

        <button onClick={() => setView('lobby')} className="absolute top-8 right-8 bg-red-600 p-4 rounded-full border-4 border-black hover:scale-110 transition-transform z-10 text-white shadow-lg">
          <X className="w-10 h-10" />
        </button>

        {/* Diagonal background stripes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-40 w-[200%] bg-black -rotate-12 -translate-x-1/4 mb-20" />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center gap-12">
          {/* Left Side: Model */}
          <div className="flex-1 flex justify-center items-center h-[500px]">
             <div className="w-full h-full relative">
                <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                  <ambientLight intensity={1.5} />
                  <pointLight position={[5, 5, 5]} />
                  <group position={[0, -1, 0]} scale={2.2}>
                    {brawlerToUnlock.id === 'spike' ? <SpikeModel skinId={brawlerToUnlock.activeSkinId} /> : 
                     brawlerToUnlock.id === 'crow' ? <CrowModel /> : 
                     (
                        <mesh>
                          <capsuleGeometry args={[0.5, 1, 4, 8]} />
                          <meshStandardMaterial color={brawlerToUnlock.renderColor} />
                        </mesh>
                     )}
                  </group>
                </Canvas>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-12 bg-black/20 blur-xl rounded-full" />
             </div>
          </div>

          {/* Right Side: Info */}
          <div className="flex-1 flex flex-col items-start text-white">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1 drop-shadow-md">DESBLOQUEANDO ACTUALMENTE</h2>
             <h1 className="text-9xl font-black italic uppercase tracking-tighter leading-none mb-2 drop-shadow-[0_8px_black]">{brawlerToUnlock.name}</h1>
             <div className="flex items-center gap-4 mb-12">
                <span className="text-3xl font-black italic text-black/80">{brawlerToUnlock.role}</span>
                <div className="bg-yellow-400 text-black px-6 py-1 rounded-lg border-4 border-black font-black text-xl shadow-lg">{brawlerToUnlock.rarity.toUpperCase()}</div>
             </div>

             <div className="w-full max-w-md">
                <p className="text-xl font-black italic text-black mb-4 drop-shadow-sm">Consigue Créditos para desbloquear este Brawler:</p>
                
                {/* Progress Bar Container */}
                <div className="w-full h-20 bg-[#00a6e5] rounded-2xl border-4 border-black flex items-center p-2 gap-4 shadow-[0_8px_0_rgba(0,0,0,0.3)] relative group">
                   <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-4 border-black shadow-inner">
                      <CreditsIcon className="w-12 h-12" />
                   </div>
                   
                   <div className="flex-1 h-10 bg-black/40 rounded-full border-2 border-black overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(credits / UNLOCK_COST) * 100}%` }}
                        className="h-full bg-white relative transition-all duration-1000"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                      </motion.div>
                   </div>
                   
                   <span className="text-3xl font-black italic pr-4 drop-shadow-md">{credits}/{UNLOCK_COST}</span>
                </div>

                {/* Unlock Action Buttons */}
                <div className="mt-8 flex flex-col gap-4 w-full">
                  <button 
                    onClick={() => {
                      if (credits >= UNLOCK_COST) {
                        setBrawlers(prev => prev.map(b => b.id === brawlerToUnlock.id ? { ...b, unlocked: true } : b));
                        setCredits(prev => Math.max(0, prev - UNLOCK_COST));
                        setCelebrationBrawler(brawlerToUnlock);
                        // Stay in Starr Road to see next or go to lobby
                        if (credits - UNLOCK_COST < UNLOCK_COST) setView('lobby');
                      }
                    }}
                    disabled={credits < UNLOCK_COST}
                    className="w-full bg-green-500 hover:bg-green-400 text-white p-6 rounded-2xl border-b-8 border-green-800 font-black text-2xl uppercase italic active:border-b-0 active:translate-y-2 transition-all disabled:opacity-50"
                  >
                    CONSEGUIR BRAWLER
                  </button>

                  <div className="flex justify-end w-full">
                    <button 
                      onClick={() => {
                        let cost = brawlerToUnlock.rarity === 'Legendary' || brawlerToUnlock.rarity === 'Legendario' ? 199 : 99;
                        if (brawlerToUnlock.id === 'ninchill') cost = 390;
                        
                        if (gems >= cost) {
                          setGems(prev => prev - cost);
                          setBrawlers(prev => prev.map(b => b.id === brawlerToUnlock.id ? { ...b, unlocked: true } : b));
                          setCredits(0); // Reset credits when buying directly
                          setCelebrationBrawler(brawlerToUnlock);
                          setView('lobby');
                        }
                      }}
                      className="bg-[#00f7ff] hover:bg-cyan-200 p-6 rounded-2xl border-4 border-black shadow-[0_8px_0_rgba(0,0,0,0.3)] group active:shadow-none active:translate-y-2 transition-all flex flex-col items-center min-w-[240px]"
                    >
                       <span className="text-black text-sm font-black italic uppercase mb-1">DESBLOQUEAR YA:</span>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-b from-green-300 to-green-600 rounded-full border-2 border-black flex items-center justify-center">
                             <Gem className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-4xl font-black italic text-black">
                            {brawlerToUnlock.id === 'ninchill' ? 390 : (brawlerToUnlock.rarity === 'Legendary' || brawlerToUnlock.rarity === 'Legendario' ? 199 : 99)}
                          </span>
                       </div>
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    );
  };


  const TopBar = () => (
    <div className="flex justify-between items-center p-3 bg-black/40 backdrop-blur-md border-b-2 border-white/5 shrink-0 z-[60]">
      <div className="flex items-center gap-4">
        {/* Profile Section */}
        <div className="flex items-center gap-3 bg-indigo-900/50 pr-6 rounded-r-full border-r-4 border-yellow-400">
           <div className="w-14 h-14 bg-blue-500 rounded-lg flex items-center justify-center border-2 border-black overflow-hidden relative group cursor-pointer">
              <Users className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black italic tracking-tighter">{username}</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('brawl_stars_v3_last_session');
                    setIsLogged(false);
                    setView('auth');
                  }}
                  className="text-[9px] bg-red-600 px-1 py-0.5 rounded font-black text-white hover:bg-red-500 uppercase italic tracking-tighter"
                >
                  Salir
                </button>
              </div>
              <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full mt-0.5">
                <Trophy className="w-3 h-3 text-orange-400 fill-current" />
                <span className="text-xs font-black text-orange-400">{trophies}</span>
              </div>
           </div>
        </div>
        
        {/* Pass Icon */}
        <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:scale-110 transition-transform cursor-pointer relative overflow-hidden group">
           <Sparkles className="w-8 h-8 text-black" />
           <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <button 
            onClick={() => setView('admin')}
            className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center border-2 border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-all group shrink-0"
            title="Panel de Control Admin"
          >
            <Settings className="w-6 h-6 text-white animate-spin-slow" />
          </button>
        )}
        <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border-b-4 border-black/40 group hover:scale-105 transition-transform">
          <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center border border-black transform rotate-45">
             <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          <span className="text-lg font-black italic leading-none">{bling}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border-b-4 border-black/40 group hover:scale-105 transition-transform">
          <img src="input_file_1.png" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
          <span className="text-lg font-black italic leading-none">{coins}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border-b-4 border-black/40 group hover:scale-105 transition-transform">
          <img src="input_file_0.png" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
          <span className="text-lg font-black italic leading-none text-white drop-shadow-[0_1px_black]">{gurbis}</span>
        </div>
        <button className="bg-blue-900/80 p-2 rounded-lg border-b-4 border-black/40 active:border-b-0 active:translate-y-1 transition-all">
          <Menu className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "KeyW"] },
        { name: "backward", keys: ["ArrowDown", "KeyS"] },
        { name: "left", keys: ["ArrowLeft", "KeyA"] },
        { name: "right", keys: ["ArrowRight", "KeyD"] },
        { name: "attack", keys: ["Space", "Enter", "KeyF"] },
        { name: "special", keys: ["KeyQ"] },
        { name: "super", keys: ["KeyE"] },
        { name: "hipercarga", keys: ["KeyR"] },
      ]}
    >
      <div className="absolute inset-0 bg-[#1a1a2e] overflow-hidden font-sans text-white select-none flex flex-col">
        
        {/* STARR ROAD OVERLAY */}
        <AnimatePresence>
          {view === 'starr-road' && <StarrRoad />}
        </AnimatePresence>


        {/* AGE CHECK SCREEN */}
        {view === 'age_check' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-blue-600 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="bg-white/10 p-12 rounded-3xl border-4 border-black shadow-2xl max-w-md w-full">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-8 leading-none">¿CUÁNTOS AÑOS TIENES?</h1>
              <input 
                type="number" 
                placeholder="Tu edad..."
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full bg-black/40 border-4 border-black p-6 rounded-2xl text-4xl text-center font-black italic mb-8 focus:outline-none focus:ring-4 ring-yellow-400"
              />
              <button 
                onClick={() => age && age > 0 ? setView('auth') : null}
                disabled={!age || age <= 0}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black p-6 rounded-2xl border-b-8 border-yellow-700 font-black text-3xl uppercase italic active:border-b-0 active:translate-y-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONFIRMAR
              </button>
            </div>
          </motion.div>
        )}

        {/* AUTH SCREEN (LOGIN/REGISTER) */}
        {view === 'auth' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-indigo-900 flex flex-col items-center justify-center p-8"
          >
            <div className="bg-white/10 p-10 rounded-3xl border-4 border-black shadow-2xl max-w-md w-full">
              <div className="flex gap-2 mb-8 bg-black/40 p-2 rounded-2xl border-2 border-black">
                <button 
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-4 rounded-xl font-black uppercase italic transition-all ${authMode === 'register' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/10'}`}
                >
                  REGISTRO
                </button>
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-4 rounded-xl font-black uppercase italic transition-all ${authMode === 'login' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/10'}`}
                >
                  LOGIN
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 block mb-2">Usuario</label>
                  <input 
                    type="text" 
                    placeholder="Escribe tu nombre..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border-2 border-black p-4 rounded-xl text-xl font-black italic focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 block mb-2">Contraseña</label>
                  <input 
                    type="password" 
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-2 border-black p-4 rounded-xl text-xl font-black focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <button 
                  onClick={() => {
                    const isValidUsername = username.trim().length >= 3;
                    const isValidPassword = password.length >= 4;
                    
                    if(!isValidUsername || !isValidPassword) {
                      alert("El usuario debe tener al menos 3 caracteres y la contraseña 4.");
                      return;
                    }

                    const existingUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

                    if (authMode === 'register') {
                      if (existingUser) {
                        alert("El usuario ya existe. Prueba a entrar.");
                        return;
                      }
                      const newUser: UserAccount = {
                        username,
                        password,
                        coins: 1200,
                        gems: 50,
                        gurbis: 25000,
                        trophies: 0,
                        credits: 0,
                        bling: 0,
                        xp: 0,
                        unlockedBrawlers: ['shelly', 'colt'],
                      };
                      saveUserToRegistry(newUser);
                      setIsLogged(true);
                      setView('lobby');
                    } else {
                      if (!existingUser) {
                        alert("Usuario no encontrado.");
                        return;
                      }
                      
                      if (existingUser.password && existingUser.password !== password) {
                        alert("Contraseña incorrecta.");
                        return;
                      }

                      // Se cuenta como login exitoso. Si no tenia password, se le asigna la que ha puesto.
                      if (!existingUser.password) {
                        existingUser.password = password;
                        saveUserToRegistry(existingUser);
                      }

                      // Check for bans
                      if (existingUser.isBanned) {
                        if (existingUser.banUntil === 'forever') {
                          alert("LO SIENTO, ESTÁS BANEADO PARA SIEMPRE.");
                          return;
                        }
                        const banDate = new Date(existingUser.banUntil!);
                        if (banDate > new Date()) {
                          alert(`Estás baneado hasta el ${banDate.toLocaleDateString()}.`);
                          return;
                        }
                      }

                      setIsLogged(true);
                      loadAccountData(username);
                      setView('lobby');
                    }
                  }}
                  className="w-full bg-green-500 hover:bg-green-400 text-white p-6 rounded-2xl border-b-8 border-green-800 font-black text-2xl uppercase italic active:border-b-0 active:translate-y-2 transition-all mt-4"
                >
                  {authMode === 'register' ? 'CREAR CUENTA' : 'ENTRAR AL JUEGO'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* XP REWARD OVERLAY */}
        <AnimatePresence>
          {showReward && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
              <div className="bg-white text-black p-12 rounded-[4rem] flex flex-col items-center shadow-[0_0_100px_rgba(255,255,255,0.5)] border-8 border-yellow-400">
                 <Gem className="w-24 h-24 text-emerald-500 mb-4" />
                 <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">¡RECOMPENSA XP!</h2>
                 <p className="text-2xl font-black">+10 GEMAS</p>
              </div>
            </motion.div>
          )}
          {showChaoticOpening && <ChaoticOpening onRewardClaimed={handleChaoticReward} />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          
          {/* LOBBY */}
          {view === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-cyan-400 to-blue-600">
              <TopBar />
              
              {/* 3D Background & Brawler */}
              <div className="absolute inset-0 z-0">
                <Canvas shadows camera={{ position: [0, 1.5, 6], fov: 40 }}>
                   <LobbyWorld brawler={selectedBrawler} />
                </Canvas>
              </div>

              {/* Skins / Hanger Button */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-1/3 z-20 pointer-events-auto">
                 <button 
                  onClick={() => setView('skins')}
                  className="bg-gray-800/80 p-4 rounded-xl border-4 border-black shadow-xl hover:scale-110 transition-transform active:translate-y-1"
                 >
                    <Palette className="w-8 h-8 text-white" />
                 </button>
              </div>

              {/* Side Bars Layout */}
              <div className="absolute inset-0 flex pointer-events-none z-10 p-4 pt-20 pb-28">
                {/* Left Icons */}
                <div className="flex flex-col gap-4 pointer-events-auto h-full">
                   <div onClick={() => setView('shop')} className="flex flex-col items-center group cursor-pointer">
                      <div className="w-24 h-20 bg-[#2d3246] rounded-2xl border-4 border-black shadow-xl flex flex-col items-center justify-center relative hover:scale-110 transition-transform">
                         <div className="absolute -top-7">
                           <StoreBuildingIcon className="scale-125" />
                         </div>
                         <span className="mt-4 text-white font-black text-2xl italic tracking-tighter uppercase drop-shadow-[0_2px_black]">SHOP</span>
                         <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-black uppercase italic animate-bounce">GRATIS</div>
                      </div>
                   </div>
                   <div onClick={() => setView('brawlers')} className="flex flex-col items-center group cursor-pointer">
                      <div className="w-20 h-20 bg-blue-500 rounded-2xl border-4 border-black shadow-xl flex items-center justify-center relative hover:scale-110 transition-transform">
                         <LayoutGrid className="w-10 h-10 text-white" />
                         <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-black italic">!</div>
                      </div>
                      <span className="text-lg font-black italic uppercase tracking-tighter drop-shadow-[0_2px_black]">BRAWLERS</span>
                   </div>
                   <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-20 h-20 bg-gray-600 rounded-2xl border-4 border-black shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                         <Sword className="w-10 h-10 text-white/50" />
                      </div>
                      <span className="text-lg font-black italic uppercase tracking-tighter drop-shadow-[0_2px_black] text-gray-400">CLUB</span>
                   </div>

                   {/* Starr Road Preview */}
                   <div onClick={() => setView('starr-road')} className="mt-2 group cursor-pointer">
                      {(() => {
                         const starrRoadIds = ['spike', 'crow', 'kenji', 'ninchill', 'mortis'];
                         const brawlerToUnlock = brawlers.find(b => starrRoadIds.includes(b.id) && !b.unlocked) || brawlers.find(b => !b.unlocked);
                         if (!brawlerToUnlock) return null;
                         
                         let currentUnlockCost = 1500;
                         if (brawlerToUnlock.id === 'spike') currentUnlockCost = 2000;
                         else if (brawlerToUnlock.rarity === 'Legendario') currentUnlockCost = 3800;

                         return (
                            <div className="bg-black/60 p-2 rounded-2xl border-4 border-black flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl">
                               <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center border-2 border-black">
                                  <CreditsIcon className="w-10 h-10" />
                               </div>
                               <div className="flex flex-col pr-4">
                                  <div className="flex justify-between items-center text-[10px] font-black italic text-cyan-400 gap-4">
                                     <span>CAMINO STARR: {brawlerToUnlock.name.toUpperCase()}</span>
                                     <span>{credits}/{currentUnlockCost}</span>
                                  </div>
                                  <div className="w-32 h-2 bg-black/40 rounded-full border border-black overflow-hidden mt-1">
                                     <motion.div animate={{ width: `${Math.min(100, (credits / currentUnlockCost) * 100)}%` }} className="h-full bg-cyan-400" />
                                  </div>
                                </div>
                            </div>
                         );
                      })()}
                   </div>
                </div>

                <div className="flex-1" />

                {/* Right Icons Removed */}
              </div>

              {/* Bottom Interface */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6 z-20 pointer-events-none">
                {/* Brawl Pass Progress */}
                <div className="flex flex-col pointer-events-auto cursor-pointer group">
                   <div className="w-64 h-16 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 rounded-2xl border-4 border-black flex items-center p-3 gap-3 relative shadow-2xl group-hover:scale-105 transition-transform">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center border-2 border-black shadow-inner">
                         <Sparkles className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                         <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-black/20">
                            <motion.div initial={{ width: 0 }} animate={{ width: "40%" }} className="h-full bg-white relative">
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                            </motion.div>
                         </div>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] font-black text-black/60 uppercase">NIVEL 1</span>
                            <span className="text-xs font-black italic text-black">40/100</span>
                         </div>
                      </div>
                   </div>
                </div>

                 {/* Missions/Quests Icon */}
                 <div className="flex gap-4">
                  {isAdmin && (
                    <div onClick={() => setView('admin')} className="w-16 h-16 bg-red-600 rounded-2xl border-4 border-black flex items-center justify-center shadow-xl hover:scale-110 transition-all cursor-pointer pointer-events-auto">
                      <Settings className="w-10 h-10 text-white animate-spin-slow" />
                    </div>
                  )}
                  <div onClick={() => setView('missions')} className="w-16 h-16 bg-indigo-600 rounded-2xl border-4 border-black flex items-center justify-center shadow-xl hover:scale-110 transition-all cursor-pointer pointer-events-auto">
                    <ClipboardList className="w-10 h-10 text-white" />
                  </div>
                 </div>

                {/* Mode Selector & Play Button */}
                <div className="flex-1 flex justify-center pb-2">
                   <div className="flex items-center gap-3 pointer-events-auto">
                      {/* Game Mode Selector */}
                      <div className="bg-black/80 backdrop-blur-md p-4 rounded-3xl border-4 border-black flex flex-col items-center w-80 h-28 justify-center relative overflow-hidden group cursor-pointer hover:bg-black transition-colors shadow-2xl">
                         <div className="absolute -left-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CreditsIcon className="w-24 h-24" />
                         </div>
                         <span className="text-[10px] font-black italic tracking-widest text-orange-400 mb-1">NUEVO EVENTO EN: 17h 34m</span>
                         <h3 className="text-4xl font-black italic text-white leading-none uppercase tracking-tighter">SUPERVIVENCIA</h3>
                         <div className="flex items-center gap-2 mt-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black uppercase text-green-500">PRADERA VERDE</span>
                         </div>
                      </div>

                      {/* Large Yellow PLAY Button */}
                      <button 
                        onClick={() => { 
                          const newEnemies = [
                            { id: 1, pos: [0, 0, -10], hp: 3000, maxHp: 3000, name: 'amiraaa', lastShotTime: 0, brawlerType: 'shelly' },
                            { id: 2, pos: [8, 0, -15], hp: 2000, maxHp: 2000, name: 'pablo67', lastShotTime: 0, brawlerType: 'colt' },
                            { id: 3, pos: [-8, 0, -5], hp: 2000, maxHp: 2000, name: 'cakos88', lastShotTime: 0, brawlerType: 'spike' },
                            { id: 4, pos: [15, 0, 10], hp: 1500, maxHp: 1500, name: 'mimi', lastShotTime: 0, brawlerType: 'crow' },
                            { id: 5, pos: [-15, 0, 15], hp: 2500, maxHp: 2500, name: 'GamerPro99', lastShotTime: 0, brawlerType: 'shelly' },
                            { id: 6, pos: [10, 0, 20], hp: 1800, maxHp: 1800, name: 'LeonGod', lastShotTime: 0, brawlerType: 'colt' },
                          ];
                          setEnemies(newEnemies as any);
                          setPlayerHp(selectedBrawler.hp);
                          setPlayerMaxHp(selectedBrawler.hp);
                          setProjectiles([]); // Clear projectiles from previous battle
                          setPlayerPosition(new THREE.Vector3(0, 0, 5));
                          setLoadingProgress(0); // Reset for transition effect
                          setView('battle'); 
                        }} 
                        className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 px-20 h-32 rounded-[2.5rem] border-4 border-black shadow-[0_12px_0_rgba(150,100,0,1)] active:shadow-none active:translate-y-3 active:border-b-4 transition-all relative overflow-hidden group"
                      >
                        <span className="text-6xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_4px_black] group-hover:scale-110 transition-transform block">
                          JUGAR
                        </span>
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                      </button>
                   </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* MISSIONS */}
          {view === 'missions' && (
             <motion.div key="missions" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="absolute inset-0 bg-black/90 z-[60] backdrop-blur-3xl flex items-center justify-center p-8">
                <div className="w-full max-w-2xl bg-gray-900 rounded-[3rem] border-4 border-white/10 p-10 flex flex-col">
                   <div className="flex justify-between items-center mb-10">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter text-purple-400">MISIONES</h2>
                      <button onClick={() => setView('lobby')} className="p-4 bg-red-600 rounded-2xl border-b-6 border-red-900 active:border-b-0 active:translate-y-2 transition-all"><X /></button>
                   </div>
                   <div className="space-y-4 flex-1">
                      {missions.map(m => (
                         <div key={m.id} className={`flex flex-col p-6 rounded-3xl border-2 transition-all ${m.completed ? 'bg-green-500/10 border-green-500/50 opacity-60' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-5">
                                  {m.completed ? <CheckCircle2 className="w-10 h-10 text-green-500" /> : <Star className="w-10 h-10 text-purple-500" />}
                                  <div>
                                     <p className="text-xl font-black uppercase italic tracking-tighter">{m.title}</p>
                                     <div className="flex gap-4">
                                        <p className="text-sm font-bold text-orange-400">+{m.rewardXP} XP</p>
                                        {m.rewardCurrency && (
                                           <div className="flex items-center gap-1">
                                              {m.rewardCurrency === 'coins' && <img src="input_file_1.png" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />}
                                              {m.rewardCurrency === 'gems' && <Gem className="w-4 h-4 text-emerald-400" />}
                                              {m.rewardCurrency === 'credits' && <Target className="w-4 h-4 text-cyan-400" />}
                                              {m.rewardCurrency === 'bling' && <Sparkles className="w-4 h-4 text-pink-400" />}
                                              <span className="text-sm font-black text-white/60">+{m.rewardAmount}</span>
                                           </div>
                                        )}
                                     </div>
                                  </div>
                               </div>
                               {m.completed && <span className="text-xs font-black text-green-500 uppercase tracking-widest italic">COMPLETADA</span>}
                            </div>
                            
                            {!m.completed && (
                               <div className="w-full">
                                  <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest mb-1 text-white/40">
                                     <span>Progreso</span>
                                     <span>{Math.floor(m.current)} / {m.target}</span>
                                  </div>
                                  <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                                       className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                     />
                                  </div>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                </div>
             </motion.div>
          )}

          {/* BRAWLERS CATALOGUE */}
          {view === 'brawlers' && (
            <motion.div key="brawlers" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-[#0a0f1e] z-50 flex flex-col">
              <div className="p-8 flex items-center justify-between bg-black/60 border-b-6 border-white/10">
                <button onClick={() => setView('lobby')} className="p-4 bg-red-600 rounded-2xl"><ArrowLeft className="w-8 h-8" /></button>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">BRAWLERS ({brawlers.filter(b => b.unlocked).length})</h2>
                <div className="w-16 h-16" />
              </div>
              <div className="flex-1 overflow-y-auto p-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 content-start">
                {brawlers.map(b => (
                  <div key={b.id} onClick={() => b.unlocked && (setViewingBrawler(b), setView('details'))} className={`relative ${b.unlocked ? 'cursor-pointer' : 'grayscale opacity-60'}`}>
                    <div className={`${b.color} aspect-[3/4.5] rounded-[3rem] p-6 flex flex-col items-center justify-between border-4 border-white/10 shadow-xl group hover:scale-105 transition-transform`}>
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        {b.id === 'prizmo' ? <Sparkles className="w-14 h-14" /> : <Users className="w-14 h-14" />}
                      </div>
                      <div className="text-center">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{b.name}</h3>
                        <div className="bg-black/40 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">FUERZA {b.level}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* BRAWLER DETAILS */}
          {view === 'details' && viewingBrawler && (
            <motion.div key="details" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="absolute inset-0 bg-black/95 z-[60] flex flex-col md:flex-row">
              <div className={`md:w-1/2 h-1/2 md:h-full ${viewingBrawler.color} flex flex-col items-center justify-center relative p-12 overflow-hidden`}>
                 <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 to-transparent" />
                 <button onClick={() => setView('brawlers')} className="absolute top-10 left-10 p-5 bg-black/40 rounded-2xl"><ArrowLeft className="w-10 h-10" /></button>
                 <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center mb-10 relative shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                     {viewingBrawler.id === 'prizmo' ? <Sparkles className="w-40 h-40" /> : <Users className="w-40 h-40" />}
                 </div>
                 <h2 className="text-8xl font-black italic uppercase tracking-tighter mb-4 drop-shadow-2xl">{viewingBrawler.name}</h2>
              </div>
              <div className="flex-1 p-16 space-y-10 overflow-y-auto">
                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                   <p className="text-2xl font-bold leading-relaxed">{viewingBrawler.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-green-500/10 p-8 rounded-[2.5rem] border-2 border-green-500/30">
                     <Shield className="w-10 h-10 text-green-400 mb-4"/>
                     <p className="text-[12px] font-black uppercase opacity-60">Salud</p>
                     <p className="text-5xl font-black text-green-400">{viewingBrawler.hp}</p>
                  </div>
                  <div className="bg-red-500/10 p-8 rounded-[2.5rem] border-2 border-red-500/30">
                     <Sword className="w-10 h-10 text-red-400 mb-4"/>
                     <p className="text-[12px] font-black uppercase opacity-60">Daño</p>
                     <p className="text-5xl font-black text-red-400">{viewingBrawler.attack}</p>
                  </div>
                </div>

                {viewingBrawler.specialAbility && (
                  <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border-2 border-emerald-500/30 mt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Sparkles className="w-10 h-10 text-emerald-400"/>
                      <h3 className="text-3xl font-black italic uppercase text-emerald-400">Habilidad: {viewingBrawler.specialAbility.name}</h3>
                    </div>
                    <p className="text-xl text-white/80">{viewingBrawler.specialAbility.description}</p>
                    <p className="text-sm font-black text-emerald-500 mt-2 uppercase tracking-widest">Enfriamiento: {viewingBrawler.specialAbility.cooldown}s</p>
                  </div>
                )}

                {viewingBrawler.level >= 11 && (
                  <div className="bg-pink-500/20 p-8 rounded-[2.5rem] border-4 border-pink-500 animate-pulse mt-6">
                    <div className="flex items-center gap-4 mb-2">
                      <Zap className="w-10 h-10 text-pink-400"/>
                      <h3 className="text-4xl font-black italic uppercase text-pink-400 tracking-tighter">HIPERCARGA DESBLOQUEADA</h3>
                    </div>
                    <p className="text-lg text-white font-bold">¡Poder máximo activado! Pulsa R en batalla para desatar el caos.</p>
                  </div>
                )}

                <div className="pt-10 flex flex-col gap-6">
                  {viewingBrawler.skins && viewingBrawler.skins.length > 0 && (
                    <button 
                      onClick={() => setView('skins')} 
                      className="w-full py-8 bg-pink-600 text-white font-black uppercase text-4xl italic tracking-tighter rounded-[2.5rem] border-b-[16px] border-pink-900 active:border-b-0 active:translate-y-4 transition-all shadow-2xl flex items-center justify-center gap-4 group"
                    >
                      <Palette className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                      ASPECTOS
                    </button>
                  )}
                  
                  <button onClick={() => { setSelectedBrawler(viewingBrawler); setView('lobby'); }} className="w-full py-8 bg-blue-600 text-white font-black uppercase text-4xl italic tracking-tighter rounded-[2.5rem] border-b-[16px] border-blue-900 active:border-b-0 active:translate-y-4 transition-all shadow-2xl">SELECCIONAR</button>
                  {viewingBrawler.level < 11 && (
                    <button onClick={() => upgradeBrawler(viewingBrawler)} disabled={coins < viewingBrawler.level * 200} className={`w-full py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-6 transition-all border-b-[12px] ${coins >= viewingBrawler.level * 200 ? 'bg-yellow-500 text-black border-yellow-700 active:border-b-0 active:translate-y-4' : 'bg-gray-800 text-white/20 border-gray-950'}`}>
                      <span className="text-3xl italic tracking-tighter uppercase italic">MEJORAR</span>
                      <div className="flex items-center gap-4 bg-black/20 px-6 py-2 rounded-2xl"><img src="input_file_1.png" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" /><span className="text-3xl">{viewingBrawler.level * 200}</span></div>
                    </button>
                  )}
                  {viewingBrawler.level === 11 && (
                    <div className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase text-3xl italic tracking-tighter rounded-[2.5rem] border-4 border-white/20 text-center shadow-lg">
                      NIVEL MÁXIMO
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SHOP */}
          {view === 'shop' && (
            <motion.div key="shop" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="absolute inset-0 bg-[#0f1020] z-50 flex flex-col">
              <div className="p-8 flex items-center justify-between border-b-6 border-white/10 bg-black/60">
                <button onClick={() => setView('lobby')} className="p-4 bg-red-600 rounded-2xl active:translate-y-2 transition-transform"><ArrowLeft className="w-8 h-8" /></button>
                <div className="flex gap-4">
                  <div className="bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black flex items-center gap-3 shadow-lg border-b-6 border-yellow-700"><Coins className="w-8 h-8" /> {coins}</div>
                  <div className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 shadow-lg border-b-6 border-emerald-700"><Gem className="w-8 h-8" /> {gems}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-16">
                {isSaturdayToday() && !chaoticStarrDropClaimed && (
                  <div className="mb-20">
                    <h3 className="text-6xl font-black italic uppercase tracking-tighter text-green-400 mb-8">¡STARR DROP CAÓTICO SEMANAL!</h3>
                    <div 
                      onClick={() => setShowChaoticOpening(true)}
                      className="bg-gradient-to-br from-green-600 to-emerald-900 p-12 rounded-[5rem] border-4 border-white/20 flex flex-col md:flex-row items-center gap-12 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 group shadow-2xl relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-white/5 opacity-10" />
                       <div className="w-64 h-64 bg-green-500 rounded-full flex items-center justify-center border-8 border-black shadow-[0_0_50px_rgba(34,197,94,0.4)] group-hover:rotate-12 transition-transform">
                          <Star className="w-40 h-40 text-black animate-pulse" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <h4 className="text-5xl font-black italic uppercase tracking-tighter text-white">RECLAMA TU PREMIO GRATIS</h4>
                          <p className="text-xl font-bold text-white/60 mt-2 uppercase tracking-widest italic">Solo disponible hoy sábado</p>
                          <button className="mt-8 bg-yellow-400 text-black px-12 py-4 rounded-2xl font-black text-2xl uppercase italic border-b-6 border-yellow-700 pointer-events-none">ABRIR AHORA</button>
                       </div>
                    </div>
                  </div>
                )}
                <h3 className="text-6xl font-black italic uppercase tracking-tighter text-yellow-400 mb-12">Ofertas del Día</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                   {brawlers.filter(b => !b.unlocked).map(b => (
                     <div key={b.id} className="bg-white/5 p-12 rounded-[5rem] border-4 border-white/10 flex flex-col items-center group relative overflow-hidden">
                       <div className={`${b.color} w-56 h-56 rounded-[3.5rem] mb-10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative`}>
                          {b.id === 'prizmo' ? <Sparkles className="w-32 h-32" /> : <Users className="w-32 h-32" />}
                           <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
                       </div>
                       <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-10">{b.name}</h3>
                       <button onClick={() => buyBrawler(b)} disabled={coins < b.price} className={`w-full py-8 rounded-[2rem] font-black flex items-center justify-center gap-4 transition-all border-b-[12px] ${coins >= b.price ? 'bg-yellow-500 text-black border-yellow-700 active:border-b-0 active:translate-y-4' : 'bg-gray-800 text-white/5 border-gray-950'}`}>
                          <img src="input_file_1.png" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" /><span className="text-4xl italic tracking-tighter">{b.price}</span>
                       </button>
                     </div>
                   ))}
                   <div className="bg-gradient-to-br from-purple-800 to-indigo-950 p-12 rounded-[5rem] flex flex-col items-center justify-center border-4 border-white/20">
                      <Sparkles className="w-40 h-40 mb-10 text-yellow-300 animate-bounce" />
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter text-center mb-10">MEGA CAJA</h3>
                      <button className="bg-emerald-500 px-16 py-6 rounded-[2.5rem] font-black border-b-[14px] border-emerald-800 text-5xl italic tracking-tighter flex items-center gap-6 transition-all active:border-b-0 active:translate-y-2 shadow-2xl">
                         <Gem className="w-12 h-12" /> 80
                      </button>
                   </div>
                </div>

                {/* Special Offers Section */}
                <div className="mb-16">
                  <h3 className="text-6xl font-black italic uppercase tracking-tighter text-yellow-400 mb-10 drop-shadow-[0_4px_rgba(0,0,0,0.5)]">OFERTAS DEL DÍA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {freeDrops > 0 && (
                      <div className="bg-gradient-to-b from-purple-600 via-indigo-700 to-indigo-900 p-1 rounded-[3.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] group overflow-hidden relative pointer-events-auto">
                         <div className="bg-[#0a0f1e] rounded-[3.3rem] p-10 flex flex-col items-center h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            
                            <div className="relative mb-8 group-hover:scale-110 transition-transform">
                              <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-bounce">
                                <Star className="w-20 h-20 text-yellow-400 fill-yellow-400" />
                              </div>
                              <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black italic px-4 py-2 rounded-2xl border-4 border-black text-2xl rotate-12">x{freeDrops}</div>
                            </div>
                            
                            <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 text-center">DROP CAÓTICO</h4>
                            <p className="text-purple-300 font-bold italic uppercase tracking-widest text-sm mb-10">¡CONTENIDO ALEATORIO!</p>
                            
                            <button 
                              onClick={openChaoticDrop}
                              className="mt-auto w-full py-6 bg-green-500 hover:bg-green-400 text-white font-black uppercase text-3xl italic tracking-tighter rounded-3xl border-b-[12px] border-green-800 active:border-b-0 active:translate-y-3 transition-all relative overflow-hidden"
                            >
                               <span className="relative z-10">GRATIS</span>
                               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </button>
                         </div>
                      </div>
                    )}

                    {/* Admin Created Drops */}
                    {activeChaoticDrops.map(drop => (
                      <div key={drop.id} className="bg-gradient-to-b from-blue-600 via-indigo-700 to-indigo-900 p-1 rounded-[3.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] group overflow-hidden relative pointer-events-auto">
                         <div className="bg-[#0a0f1e] rounded-[3.3rem] p-10 flex flex-col items-center h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="relative mb-8 group-hover:scale-110 transition-transform">
                              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-pulse">
                                <Star className="w-20 h-20 text-blue-400 fill-blue-400" />
                              </div>
                            </div>
                            <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 text-center">CHAOTIC DROP</h4>
                            <p className="text-blue-300 font-bold italic uppercase tracking-widest text-sm mb-10">OFERTA ADMIN</p>
                            
                            <button 
                              onClick={() => {
                                if (drop.currency === 'free') openChaoticDrop();
                                else if (drop.currency === 'gold' && coins >= drop.price) {
                                   setCoins(prev => prev - drop.price);
                                   openChaoticDrop();
                                } else if (drop.currency === 'gems' && gems >= drop.price) {
                                   setGems(prev => prev - drop.price);
                                   openChaoticDrop();
                                } else {
                                  alert("No tienes suficiente dinero");
                                }
                              }}
                              className="mt-auto w-full py-6 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase text-3xl italic tracking-tighter rounded-3xl border-b-[12px] border-blue-800 active:border-b-0 active:translate-y-3 transition-all relative overflow-hidden flex items-center justify-center gap-2"
                            >
                               {drop.currency === 'free' ? 'GRATIS' : (
                                 <>
                                   {drop.currency === 'gold' ? <img src="input_file_1.png" className="w-8 h-8 object-contain" /> : <Gem className="w-8 h-8 text-white" />}
                                   {drop.price}
                                 </>
                               )}
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-24">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-6xl font-black italic uppercase tracking-tighter text-pink-500">Tienda de Ropa</h3>
                    <div className="flex items-center gap-2 bg-black/60 px-6 py-3 rounded-full border-2 border-pink-500/50">
                      <img src="input_file_0.png" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                      <span className="text-2xl font-black italic text-white drop-shadow-[0_2px_black]">{gurbis}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {brawlers.filter(b => b.unlocked).flatMap(b => (b.skins || []).filter(s => !s.unlocked).map(skin => ({ brawler: b, skin }))).length === 0 ? (
                      <div className="col-span-full h-64 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/10 flex items-center justify-center">
                        <p className="text-2xl font-black italic text-white/40 uppercase tracking-widest">No hay ropa nueva disponible por ahora</p>
                      </div>
                    ) : (
                      brawlers.filter(b => b.unlocked).flatMap(b => (b.skins || []).filter(s => !s.unlocked).map(skin => ({ brawler: b, skin }))).map(({ brawler, skin }) => (
                        <div key={`${brawler.id}-${skin.id}`} className="bg-white/5 p-10 rounded-[3rem] border-4 border-white/10 flex flex-col items-center group relative overflow-hidden">
                          {/* Rarity Tag */}
                          <div className={`absolute top-6 left-6 px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest text-white border-2 border-black/40 z-10 ${
                            skin.rarity === 'Común' ? 'bg-blue-500' :
                            skin.rarity === 'Superraro' ? 'bg-green-500' :
                            skin.rarity === 'Épico' ? 'bg-purple-500' :
                            skin.rarity === 'Mítico' ? 'bg-red-500' :
                            skin.rarity === 'Legendario' ? 'bg-yellow-500 text-black' :
                            'bg-cyan-400 text-black'
                          }`}>
                            {skin.rarity}
                          </div>

                          <div className="w-48 h-48 bg-white/10 rounded-full mb-8 flex items-center justify-center relative group-hover:scale-110 transition-transform">
                             <Palette className="w-24 h-24 text-white/20" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-6xl">👕</span>
                             </div>
                          </div>

                          <div className="text-center mb-8">
                             <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{skin.name}</h4>
                             <p className="text-sm font-bold text-white/40 italic uppercase">{brawler.name}</p>
                          </div>

                          <button 
                            onClick={() => {
                              if (gurbis >= (skin.priceGurbi || 0)) {
                                setGurbis(prev => prev - (skin.priceGurbi || 0));
                                setBrawlers(prev => prev.map(item => {
                                  if (item.id === brawler.id) {
                                    return {
                                      ...item,
                                      skins: item.skins?.map(s => s.id === skin.id ? { ...s, unlocked: true } : s)
                                    };
                                  }
                                  return item;
                                }));
                              }
                            }}
                            disabled={gurbis < (skin.priceGurbi || 0)}
                            className="w-full bg-[#faea05] hover:bg-yellow-400 text-black py-5 rounded-2xl border-b-8 border-yellow-800 font-black uppercase text-2xl italic tracking-tighter active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale shadow-lg"
                          >
                            <img src="input_file_0.png" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                            {skin.priceGurbi}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADMIN PANEL VIEW */}
          {view === 'admin' && isAdmin && (
            <AdminPanel />
          )}

          {/* SKINS VIEW */}
          {view === 'skins' && viewingBrawler && (
            <motion.div key="skins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0f1e] z-[70] flex flex-col font-sans">
               <div className="p-8 flex items-center justify-between bg-black/60 border-b-6 border-white/10">
                 <button onClick={() => setView('details')} className="p-4 bg-red-600 rounded-2xl active:translate-y-2 transition-transform"><ArrowLeft className="w-8 h-8" /></button>
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">ROPA PARA {viewingBrawler.name}</h2>
                 <div className="flex items-center gap-2 bg-black/60 px-6 py-3 rounded-full border-2 border-pink-500/50">
                    <img src="input_file_0.png" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-2xl font-black italic text-white drop-shadow-[0_2px_black]">{gurbis}</span>
                 </div>
               </div>

               <div className="flex-1 p-12 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {viewingBrawler.skins?.map(skin => {
                      const isEquipped = viewingBrawler.activeSkinId === skin.id;
                      return (
                        <div key={skin.id} className={`bg-white/5 rounded-[3rem] p-10 border-4 border-white/10 flex flex-col items-center gap-8 ${isEquipped ? 'border-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.3)]' : ''}`}>
                          <div className={`w-64 h-64 rounded-full flex items-center justify-center relative overflow-hidden ${isEquipped ? 'bg-pink-500/20' : 'bg-white/10'}`}>
                             {viewingBrawler.id === 'prizmo' ? <Sparkles className="w-32 h-32 text-white" /> : <Users className="w-32 h-32 text-white" />}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>

                          <div className="text-center text-white">
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{skin.name}</h3>
                            {isEquipped && <span className="bg-green-500 text-white px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest italic animate-bounce block w-fit mx-auto">EQUIPADA</span>}
                          </div>

                          {skin.unlocked ? (
                            <button 
                              onClick={() => {
                                setBrawlers(prev => prev.map(b => b.id === viewingBrawler.id ? { ...b, activeSkinId: skin.id } : b));
                                setViewingBrawler(v => v ? { ...v, activeSkinId: skin.id } : null);
                              }}
                              disabled={isEquipped}
                              className={`w-full py-6 rounded-2xl font-black uppercase text-2xl italic tracking-tighter border-b-8 transition-all ${isEquipped ? 'bg-gray-600 border-gray-800 opacity-50 cursor-default shadow-none' : 'bg-green-500 hover:bg-green-400 border-green-800 active:border-b-0 active:translate-y-2 text-white shadow-lg'}`}
                            >
                              {isEquipped ? 'EQUIPADA' : 'EQUIPAR'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                if (gurbis >= (skin.priceGurbi || 0)) {
                                  setGurbis(prev => prev - (skin.priceGurbi || 0));
                                  setBrawlers(prev => prev.map(b => {
                                    if (b.id === viewingBrawler.id) {
                                      return {
                                        ...b,
                                        skins: b.skins?.map(s => s.id === skin.id ? { ...s, unlocked: true } : s)
                                      };
                                    }
                                    return b;
                                  }));
                                  setViewingBrawler(v => v ? {
                                    ...v,
                                    skins: v.skins?.map(s => s.id === skin.id ? { ...s, unlocked: true } : s)
                                  } : null);
                                }
                              }}
                              disabled={gurbis < (skin.priceGurbi || 0)}
                              className="w-full bg-[#faea05] hover:bg-yellow-400 text-black py-6 rounded-2xl border-b-8 border-yellow-800 font-black uppercase text-3xl italic tracking-tighter active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-lg"
                            >
                              <img src="input_file_0.png" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                              {skin.priceGurbi}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
               </div>
            </motion.div>
          )}

          {/* BRAWLER UNLOCK CELEBRATION */}
          <AnimatePresence>
            {celebrationBrawler && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[5000] bg-[#0a0f1e] flex flex-col items-center justify-center overflow-hidden"
              >
                {/* Background Rays */}
                <motion.div 
                  className="absolute inset-0 z-0 opacity-40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2000px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent rotate-0" />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2000px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent rotate-45" />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2000px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent rotate-90" />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2000px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent rotate-135" />
                </motion.div>

                <div className="relative z-10 flex flex-col items-center max-w-4xl w-full p-8 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="mb-8"
                  >
                    <span className={`inline-block px-10 py-3 rounded-2xl text-2xl font-black italic uppercase tracking-widest border-b-8 shadow-xl ${
                      celebrationBrawler.rarity === 'Legendario' || celebrationBrawler.rarity === 'Legendary' ? 'bg-yellow-400 text-black border-yellow-600' :
                      celebrationBrawler.rarity === 'Mítico' || celebrationBrawler.rarity === 'Mythic' ? 'bg-red-600 text-white border-red-800' :
                      celebrationBrawler.rarity === 'Épico' || celebrationBrawler.rarity === 'Epic' ? 'bg-purple-600 text-white border-purple-800' :
                      celebrationBrawler.rarity === 'Superraro' || celebrationBrawler.rarity === 'Super Rare' ? 'bg-blue-600 text-white border-blue-800' :
                      'bg-green-500 text-white border-green-700'
                    }`}>
                      {celebrationBrawler.rarity}
                    </span>
                  </motion.div>

                  <motion.h2
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-9xl font-black italic uppercase text-white tracking-tighter drop-shadow-[0_8px_0_rgba(0,0,0,0.5)] mb-12"
                  >
                    {celebrationBrawler.name}
                  </motion.h2>

                  {/* Character Visuals */}
                  <motion.div
                    initial={{ y: 300, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, type: "spring", damping: 15 }}
                    className="relative w-80 h-80 flex items-center justify-center mb-16"
                  >
                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse" />
                    <div className={`w-64 h-64 ${celebrationBrawler.color} rounded-[3rem] border-8 border-black flex items-center justify-center relative shadow-2xl overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
                        <Users className="w-40 h-40 text-white drop-shadow-lg" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mb-12"
                  >
                    <p className="text-3xl font-bold italic text-white/80 uppercase tracking-widest">{celebrationBrawler.role}</p>
                    <div className="flex gap-8 justify-center mt-6">
                        <div className="flex items-center gap-2">
                            <Zap className="w-8 h-8 text-yellow-400" />
                            <span className="text-3xl font-black italic text-white">{celebrationBrawler.attack}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-green-400" />
                            <span className="text-3xl font-black italic text-white">{celebrationBrawler.hp}</span>
                        </div>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    onClick={() => setCelebrationBrawler(null)}
                    className="px-16 py-6 bg-gradient-to-b from-yellow-300 to-yellow-500 text-black text-3xl font-black uppercase italic rounded-3xl border-b-[12px] border-yellow-700 active:border-b-0 active:translate-y-2 transition-all shadow-2xl hover:scale-105"
                  >
                    ¡INCREÍBLE!
                  </motion.button>
                </div>

                {/* Celebration Particles */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * window.innerWidth - window.innerWidth / 2, 
                      y: window.innerHeight + 100,
                      rotate: 0 
                    }}
                    animate={{ 
                      y: -100,
                      rotate: 360,
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 3, 
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                    className={`absolute w-3 h-3 rounded-sm z-[5] ${
                      ['bg-yellow-400', 'bg-blue-400', 'bg-red-400', 'bg-purple-400', 'bg-green-400', 'bg-cyan-400'][Math.floor(Math.random() * 6)]
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* DROP OPENING OVERLAY */}
          <AnimatePresence>
            {openingDrop.active && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-10 backdrop-blur-xl"
              >
                {!openingDrop.reward ? (
                  <div className="flex flex-col items-center">
                    <motion.div 
                      key={openingDrop.rarity}
                      initial={{ scale: 0.8, rotate: -5 }}
                      animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
                      transition={{ scale: { repeat: Infinity, duration: 2 }, rotate: { repeat: Infinity, duration: 1.5 } }}
                      onClick={tapDrop}
                      className={`w-80 h-80 rounded-full border-[12px] border-black flex items-center justify-center cursor-pointer relative shadow-2xl transition-all duration-300 ${
                        openingDrop.rarity === 'Especial' ? 'bg-green-500 shadow-green-500/40' :
                        openingDrop.rarity === 'Superraro' ? 'bg-blue-500 shadow-blue-500/40' :
                        openingDrop.rarity === 'Épico' ? 'bg-purple-600 shadow-purple-600/40' :
                        openingDrop.rarity === 'Mítico' ? 'bg-red-600 shadow-red-600/40' :
                        'bg-yellow-400 shadow-yellow-400/60'
                      }`}
                    >
                      <div className="absolute inset-x-0 -top-16 text-center">
                         <span className={`text-6xl font-black italic uppercase tracking-tighter drop-shadow-[0_4px_black] ${openingDrop.rarity === 'Legendario' ? 'text-yellow-100' : 'text-white'}`}>
                           {openingDrop.rarity}
                         </span>
                      </div>
                      
                      <Star className={`w-48 h-48 drop-shadow-lg ${openingDrop.rarity === 'Legendario' ? 'text-white fill-white' : 'text-black/80 fill-black/20'}`} />
                      
                      <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                    </motion.div>
                    
                    <motion.p 
                      animate={{ y: [0, -10, 0] }} 
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-3xl font-black italic text-yellow-400 uppercase tracking-widest mt-24 drop-shadow-md"
                    >
                      ¡TOCA PARA MEJORAR!
                    </motion.p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="max-w-2xl w-full text-center"
                  >
                    <div className="mb-12 flex flex-col items-center">
                       <div className="relative mb-10">
                          <div className={`absolute inset-0 blur-[100px] opacity-40 animate-pulse ${
                            openingDrop.rarity === 'Legendario' ? 'bg-yellow-400' : 
                            openingDrop.rarity === 'Mítico' ? 'bg-red-500' : 
                            'bg-blue-400'
                          }`} />
                          <div className="relative z-10 flex items-center justify-center p-12 bg-white/10 rounded-[4rem] border-4 border-white/20">
                             {openingDrop.reward.icon}
                          </div>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-8 py-2 rounded-full border-2 border-white/20">
                             <span className="text-xl font-black italic text-white uppercase tracking-tighter">{openingDrop.rarity}</span>
                          </div>
                       </div>

                       <motion.h2 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-8xl font-black italic uppercase text-white tracking-tighter drop-shadow-2xl"
                       >
                         +{openingDrop.reward.amount}
                       </motion.h2>
                       <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl font-black italic uppercase text-yellow-400 tracking-widest mt-2"
                       >
                         {openingDrop.reward.type}
                       </motion.p>
                    </div>

                    <button 
                      onClick={() => setOpeningDrop({ active: false, rarity: 'Especial', clicks: 0, reward: null })}
                      className="px-24 py-8 bg-blue-600 text-white font-black uppercase text-4xl italic tracking-tighter rounded-[2.5rem] border-b-[16px] border-blue-900 active:border-b-0 active:translate-y-4 transition-all shadow-2xl"
                    >
                      CONTINUAR
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* BATTLE 3D */}
          {view === 'battle' && (
             <motion.div 
               key="battle" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-[#0a0f1e] z-[9999] flex flex-col h-screen w-screen overflow-hidden"
             >
                {/* 3D UI Overlay */}
                <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-[10001] pointer-events-none">
                   <button onClick={() => finishBattle(false)} className="px-10 py-3 bg-red-600 text-white text-xl font-black uppercase italic tracking-tighter rounded-3xl border-b-[10px] border-red-800 active:border-b-0 active:translate-y-2 transition-all pointer-events-auto shadow-xl">SALIR</button>
                   <div className="bg-black/60 px-10 py-4 rounded-[2rem] border-2 border-white/20 text-center shadow-2xl backdrop-blur-md">
                      <p className="text-[10px] font-black uppercase opacity-60 text-orange-400 tracking-widest">Objetivo</p>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{enemies.filter(e => e.hp > 0).length} BOTS RESTANTES</h2>
                   </div>
                   <div className="w-32" />
                </div>

                <div className="flex-1 w-full h-full relative bg-gray-950 overflow-hidden">
                    <Canvas 
                      camera={{ position: [0, 20, 20], fov: 45 }}
                      gl={{ antialias: true }}
                    >
                      <CameraController shake={battleShake} playerPos={playerPosition || new THREE.Vector3(0,0,5)} />
                      
                      <ambientLight intensity={1.5} />
                      <directionalLight position={[10, 20, 10]} intensity={2} />
                      
                      <Sky sunPosition={[100, 20, 100]} />
                      
                      <Suspense fallback={<mesh><boxGeometry args={[2, 2, 2]} /><meshStandardMaterial color="yellow" /></mesh>}>
                        <RockwallMap />
                        <PlayerModel 
                          brawler={selectedBrawler} 
                          onShoot={handleShoot} 
                          onSuper={handleSuper} 
                          onSpecial={handleSpecial}
                          onHyper={handleHypercharge}
                          onMove={(pos) => setPlayerPosition(pos)}
                          joystickData={joystickData}
                          mobileShootRequested={mobileShootRequested}
                          onMobileShootHandled={() => setMobileShootRequested(false)}
                        />
                        {enemies.map(bot => (
                          <BotEnemy 
                            key={bot.id} 
                            id={bot.id}
                            position={bot.pos} 
                            hp={bot.hp} 
                            maxHp={bot.maxHp}
                            name={bot.name}
                            brawlerType={bot.brawlerType}
                            playerPos={playerPosition || new THREE.Vector3(0,0,5)}
                            onShoot={handleBotShoot}
                            onMove={handleMoveBot}
                          />
                        ))}
                        {projectiles.map(p => (
                          <Projectile key={p.id} position={p.pos} direction={p.dir} color={p.color} isDart={p.isDart} isSword={p.isSword} onHit={() => setProjectiles(prev => prev.filter(x => x.id !== p.id))} />
                        ))}
                        {superVFXs.map(vfx => (
                          <SuperVFX key={vfx.id} position={vfx.pos} color={vfx.color} />
                        ))}
                      </Suspense>
                    </Canvas>

                    {/* Player HP Bar Overlay */}
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 h-6 bg-black/60 rounded-full border-2 border-black p-0.5 overflow-hidden pointer-events-none">
                       <motion.div 
                         initial={{ width: "100%" }}
                         animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                         className={`h-full rounded-full transition-colors ${playerHp < playerMaxHp * 0.3 ? 'bg-red-500' : 'bg-green-500'}`}
                       />
                       <div className="absolute inset-x-0 top-0 text-[10px] font-black text-center text-white drop-shadow-[0_1px_black]">
                         {Math.floor(playerHp)} / {playerMaxHp}
                       </div>
                    </div>

                   {/* Combat Controls Overlay */}
                   <div className="absolute bottom-12 right-12 flex gap-10 items-end pointer-events-none">
                      <div className="bg-black/40 p-5 rounded-2xl border-2 border-white/10 hidden md:block">
                         <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest text-center">Controles</p>
                         <p className="text-sm font-bold text-white/80">WASD: Moverse</p>
                         <p className="text-sm font-bold text-white/80 italic font-black">F para DISPARAR</p>
                         <p className="text-sm font-bold text-white/80 italic font-black">Q para HABILIDAD</p>
                         <p className="text-sm font-bold text-white/80 italic font-black">E para SUPER</p>
                         <p className="text-sm font-bold text-white/80 italic font-black">R para HIPERCARGA (Nivel 11)</p>
                      </div>
                      
                      <div className="flex flex-col gap-4 pointer-events-auto">
                         {/* Hypercharge Button */}
                         {selectedBrawler.level >= 11 && (
                           <button 
                             onClick={() => handleHypercharge(playerPosition)}
                             disabled={hyperDuration > 0}
                             className={`w-20 h-20 rounded-full border-b-[10px] flex items-center justify-center transition-all ${
                               hyperDuration > 0 ? "bg-pink-900/40 border-pink-950 opacity-40" : "bg-pink-500 border-pink-800 shadow-[0_0_20px_#ec4899] animate-pulse"
                             }`}
                           >
                              <Zap className="w-10 h-10 text-white" />
                              <span className="absolute -top-2 -right-2 bg-pink-600 text-[10px] px-2 py-1 rounded-full font-black">R</span>
                           </button>
                         )}

                         {/* Special Ability Button */}
                         <button 
                           onClick={() => handleSpecial(playerPosition)}
                           disabled={specialCooldown > 0}
                           className={`w-24 h-24 rounded-full border-b-[12px] flex items-center justify-center transition-all ${
                             specialCooldown > 0 ? "bg-emerald-900/40 border-emerald-950 opacity-40" : "bg-emerald-500 border-emerald-800 shadow-[0_0_20px_#10b981]"
                           }`}
                         >
                            <Sparkles className="w-12 h-12 text-white" />
                            <span className="absolute -top-2 -right-2 bg-emerald-600 text-[10px] px-2 py-1 rounded-full font-black">Q</span>
                            {specialCooldown > 0 && <span className="absolute inset-0 flex items-center justify-center font-black text-2xl">{specialCooldown}</span>}
                         </button>
                      </div>

                      <div className="flex flex-col gap-4 items-center">
                         <button 
                           onClick={() => setMobileShootRequested(true)}
                           className="w-40 h-40 bg-red-600 rounded-full border-b-[20px] border-red-950 active:border-b-0 active:translate-y-4 transition-all shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center group pointer-events-auto"
                         >
                            <Crosshair className="w-16 h-16 text-white group-active:scale-90 transition-transform" />
                            <span className="absolute -top-4 -right-4 bg-red-700 text-xs px-3 py-1 rounded-full font-black border-2 border-black">SHOT</span>
                         </button>
                         
                         <button 
                            onClick={() => handleSuper(playerPosition)}
                            className="w-28 h-28 bg-yellow-500 rounded-full border-b-[12px] border-yellow-800 shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center pointer-events-auto active:translate-y-2 active:border-b-0 transition-all"
                         >
                            <Skull className="w-14 h-14 text-white" />
                            <span className="absolute -top-2 -right-2 bg-yellow-600 text-[10px] px-2 py-0.5 rounded-full font-black">SUPER</span>
                         </button>
                      </div>
                   </div>

                   <div className="absolute bottom-12 left-12 z-50 pointer-events-auto md:hidden">
                      <Joystick onMove={handleJoystickMove} />
                   </div>
                </div>
             </motion.div>
          )}

        </AnimatePresence>

        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-[#0a0f1e] flex flex-col items-center justify-center p-12"
            >
              <div className="flex flex-col items-center max-w-xl w-full">
                {/* Custom Game Logo Placeholder */}
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="mb-16 relative"
                >
                  <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-40 animate-pulse" />
                  <div className="relative z-10 w-48 h-48 bg-blue-600 rounded-[2.5rem] border-8 border-white flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                    <Star className="w-24 h-24 text-yellow-400 fill-yellow-400" />
                    <div className="bg-black/60 px-4 py-1 rounded-full border-2 border-white -mt-4 relative z-20">
                       <span className="text-xl font-black italic uppercase tracking-tighter">BOOM</span>
                    </div>
                  </div>
                </motion.div>

                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-16 drop-shadow-[0_4px_black]">
                  BOOM STAR
                </h1>

                <div className="w-full h-12 bg-black/40 rounded-full border-4 border-white/20 p-2 overflow-hidden relative mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[slide_1s_linear_infinite]" />
                  </motion.div>
                </div>

                <div className="flex justify-between w-full px-2">
                   <p className="text-xl font-black italic text-blue-400 uppercase tracking-widest animate-pulse">CARGANDO...</p>
                   <p className="text-xl font-black italic text-white uppercase tracking-tighter">{Math.floor(loadingProgress)}%</p>
                </div>
              </div>

              <style>{`
                @keyframes slide {
                  from { background-position: 0 0; }
                  to { background-position: 40px 0; }
                }
              `}</style>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          ::-webkit-scrollbar { width: 10px; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
          * { -webkit-tap-highlight-color: transparent; }
          body { background: #000; overflow: hidden; }
        `}</style>
      </div>
    </KeyboardControls>
  );
}
