import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import { EVOLUTION_LEVELS } from '../constants';
import { GameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RefreshCw, AlertTriangle, Hammer, Magnet } from 'lucide-react';

import confetti from 'canvas-confetti';

export interface GameCanvasHandle {
  useHammer: () => boolean;
  useMagnet: () => boolean;
}

const GameCanvas = forwardRef<GameCanvasHandle, { 
  onStateUpdate: (state: Partial<GameState>) => void;
  gameState: GameState;
}>(({ onStateUpdate, gameState }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  const [nextLevel, setNextLevel] = useState(1);
  const [dropping, setDropping] = useState(false);
  const [guidePosition, setGuidePosition] = useState(200);
  const [isNearDeath, setIsNearDeath] = useState(false);
  
  // Game dimensions
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const [hearts, setHearts] = useState<{ id: number, x: number, y: number }[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number, x: number, y: number, tx: number, ty: number }[]>([]);
  const [flashes, setFlashes] = useState<{ id: number, x: number, y: number, radius: number }[]>([]);
  const [popups, setPopups] = useState<{ id: number, x: number, y: number, text: string, color: string }[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const lastMergeTime = useRef<number>(0);
  const comboTimeout = useRef<NodeJS.Timeout | null>(null);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200);
  };

  const getDifficultySettings = useCallback(() => {
    switch (stateRef.current.difficulty) {
      case 'easy': return { gravity: 0.0008, friction: 0.8, maxDropLevel: 2 };
      case 'hard': return { gravity: 0.0012, friction: 0.3, maxDropLevel: 4 };
      case 'extreme': return { gravity: 0.0015, friction: 0.1, maxDropLevel: 5 };
      default: return { gravity: 0.001, friction: 0.5, maxDropLevel: 3 };
    }
  }, []);

  const spawnEffects = (x: number, y: number, radius: number, level: number, combo: number = 0) => {
    const timestamp = Date.now();

    // 1. Trigger Screen Shake (200ms)
    triggerShake();

    // 2. Spawn 5 Small Hearts flying up
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: timestamp + i,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20
    }));
    setHearts(prev => [...prev.slice(-20), ...newHearts]);

    // 3. Twinkling Sparkles Effect (Subtle Fireworks)
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: timestamp + 20 + i,
      x,
      y,
      tx: (Math.random() - 0.5) * 80,
      ty: (Math.random() - 0.5) * 80
    }));
    setSparkles(prev => [...prev.slice(-30), ...newSparkles]);

    // 4. Merge Popup Text with Combo info
    const texts = ['Good!', 'Great!', 'Perfect!', 'Amazing!', 'Magnificent!'];
    const colors = ['#4ade80', '#fbbf24', '#f472b6', '#60a5fa', '#FFD700'];
    const levelIdx = Math.min(texts.length - 1, Math.floor(level / 3));
    
    const popupId = timestamp + 100;
    const displayText = combo > 1 ? `${texts[levelIdx]} x${combo}` : texts[levelIdx];

    setPopups(prev => [...prev, { 
      id: popupId, 
      x: x - 40,
      y: y - 40, 
      text: displayText,
      color: colors[levelIdx]
    }]);

    // Clear effects
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
      setPopups(prev => prev.filter(p => p.id !== popupId));
    }, 1200);
  };

  const initGame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Clean up previous engine
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      Matter.Render.stop(renderRef.current!);
      Matter.Runner.stop(runnerRef.current!);
    }

    const settings = getDifficultySettings();

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: settings.gravity },
      positionIterations: 10,
      velocityIterations: 10
    });
    
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        wireframes: false,
        background: 'transparent',
      }
    });
    renderRef.current = render;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Walls
    const wallOptions = { isStatic: true, render: { visible: false }, friction: 0.5 };
    const ground = Matter.Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + 30, GAME_WIDTH, 60, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-30, GAME_HEIGHT / 2, 60, GAME_HEIGHT, wallOptions);
    const rightWall = Matter.Bodies.rectangle(GAME_WIDTH + 30, GAME_HEIGHT / 2, 60, GAME_HEIGHT, wallOptions);
    
    // Death line indicator
    const deathLineY = 80;

    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    // Collision Event
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA as any;
        const bodyB = pair.bodyB as any;

        if (bodyA.isMerging || bodyB.isMerging) return;

        if (bodyA.level && bodyB.level && bodyA.level === bodyB.level) {
          // Mark both as merging
          bodyA.isMerging = true;
          bodyB.isMerging = true;

          const newX = (bodyA.position.x + bodyB.position.x) / 2;
          const newY = (bodyA.position.y + bodyB.position.y) / 2;
          
          if (bodyA.level < 15) {
            const nextLevelData = EVOLUTION_LEVELS.find(l => l.level === bodyA.level + 1);
            if (nextLevelData) {
              const newBody = createCircle(newX, newY, nextLevelData.level);
              Matter.World.remove(engine.world, [bodyA, bodyB]);
              Matter.World.add(engine.world, newBody);
              
              // Calculate Combo
              const now = Date.now();
              const isCombo = now - lastMergeTime.current < 1500;
              const newComboCount = isCombo ? stateRef.current.comboCount + 1 : 1;
              lastMergeTime.current = now;
              
              if (comboTimeout.current) clearTimeout(comboTimeout.current);
              comboTimeout.current = setTimeout(() => {
                onStateUpdate({ comboCount: 0 });
              }, 2000);

              // Trigger visual effects
              spawnEffects(newX, newY, nextLevelData.radius, nextLevelData.level, newComboCount);
              
              const pointsGained = nextLevelData.points * (1 + (newComboCount - 1) * 0.5);
              const newPoints = stateRef.current.happinessPoints + Math.floor(pointsGained);
              const newHighScore = Math.max(stateRef.current.highScore, newPoints);

              onStateUpdate({ 
                happinessPoints: newPoints,
                highScore: newHighScore,
                highestLevelReached: Math.max(stateRef.current.highestLevelReached, nextLevelData.level),
                comboCount: newComboCount
              });
            }
          } else if (bodyA.level === 15) {
            // Level 15 + Level 15 = Only these two vanish!
            Matter.World.remove(engine.world, [bodyA, bodyB]);
            triggerShake();
            spawnEffects(newX, newY, 80, 15);
            
            // Celebration fireworks at collision point
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { x: newX / GAME_WIDTH, y: newY / GAME_HEIGHT },
              colors: ['#FFD700', '#FF4500', '#FF69B4', '#00FF00', '#00BFFF']
            });

            onStateUpdate({ 
              happinessPoints: stateRef.current.happinessPoints + 100000 
            });
          }
        }
      });
    });

    // Custom rendering for emojis
    Matter.Events.on(render, 'afterRender', () => {
      const context = canvasRef.current!.getContext('2d');
      if (!context) return;

      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach(body => {
        const level = (body as any).level;
        if (!level || (body as any).isMerging) return;

        const levelData = EVOLUTION_LEVELS[level - 1];
        const { x, y } = body.position;
        const angle = body.angle;

        context.save();
        context.translate(x, y);
        context.rotate(angle);
        
        // Draw Outer Circle (Frame with inner shadow effect)
        context.beginPath();
        context.arc(0, 0, levelData.radius, 0, Math.PI * 2);
        
        // 3D Polish: Realistic Radial Gradient
        const grad = context.createRadialGradient(
          -levelData.radius * 0.2, 
          -levelData.radius * 0.2, 
          levelData.radius * 0.1, 
          0, 0, levelData.radius
        );
        grad.addColorStop(0, '#FFFFFF'); // Highlight
        grad.addColorStop(0.2, levelData.color);
        grad.addColorStop(1, 'rgba(0,0,0,0.4)'); // Depth
        
        context.fillStyle = grad;
        context.fill();

        // Draw Imperial Golden Border
        context.lineWidth = levelData.radius < 8 ? 0.5 : 2;
        context.strokeStyle = '#D4AF37'; // Gold
        context.stroke();

        // Inner ring
        context.beginPath();
        context.arc(0, 0, levelData.radius * 0.9, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(255,255,255,0.3)';
        context.lineWidth = 1;
        context.stroke();

        // Draw Emoji
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const fontSize = levelData.radius * 1.2;
        context.font = `${fontSize}px serif`;
        context.fillText(levelData.emoji, 0, 2);

        context.restore();
      });
    });

    // Check Game Over & Critical Warning
    const checkGameOver = setInterval(() => {
      if (stateRef.current.gameOver) return;

      const bodies = Matter.Composite.allBodies(engine.world);
      let dangerFound = false;
      const isGameOver = bodies.some(body => {
        const b = body as any;
        if (!b.level || b.isStatic) return false;
        
        const age = Date.now() - (b.createdAt || 0);
        const inDangerZone = body.position.y < deathLineY + 40;
        if (inDangerZone && age > 1000) dangerFound = true;

        return body.position.y < deathLineY && age > 1500 && Math.abs(body.velocity.y) < 0.2;
      });

      setIsNearDeath(dangerFound);

      if (isGameOver) {
        onStateUpdate({ gameOver: true });
        clearInterval(checkGameOver);
      }
    }, 500);

    return () => clearInterval(checkGameOver);
  }, [onStateUpdate, gameState.difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useImperativeHandle(ref, () => ({
    useHammer: () => {
      if (!engineRef.current || gameState.gameOver) return false;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      // Remove all bodies with level 1, 2, or 3
      const toRemove = bodies.filter(b => (b as any).level && (b as any).level <= 3);
      if (toRemove.length === 0) return false;
      
      toRemove.forEach(b => {
        spawnEffects(b.position.x, b.position.y, 20, (b as any).level, 0);
      });
      Matter.World.remove(engineRef.current.world, toRemove);
      triggerShake();
      return true;
    },
    useMagnet: () => {
      if (!engineRef.current || gameState.gameOver) return false;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const levelCounts: Record<number, Matter.Body[]> = {};
      
      bodies.forEach(b => {
        const lvl = (b as any).level;
        if (lvl) {
          if (!levelCounts[lvl]) levelCounts[lvl] = [];
          levelCounts[lvl].push(b);
        }
      });

      // Find the level with most bodies to pull together
      let bestLevel = -1;
      let maxCount = 1;
      Object.entries(levelCounts).forEach(([lvl, bs]) => {
        if (bs.length > maxCount) {
          maxCount = bs.length;
          bestLevel = parseInt(lvl);
        }
      });

      if (bestLevel === -1) return false;

      const targets = levelCounts[bestLevel];
      const centerX = targets.reduce((sum, b) => sum + b.position.x, 0) / targets.length;
      
      targets.forEach(b => {
        const force = { x: (centerX - b.position.x) * 0.05, y: -0.02 };
        Matter.Body.applyForce(b, b.position, force);
      });

      triggerShake();
      return true;
    }
  }));

  const createCircle = (x: number, y: number, level: number) => {
    const levelData = EVOLUTION_LEVELS[level - 1];
    const settings = getDifficultySettings();

    const body = Matter.Bodies.circle(x, y, levelData.radius, {
      restitution: 0.2, // Lower bounciness
      friction: settings.friction, // Dynamic friction
      frictionAir: 0.01,
      density: 0.001 * level,
      render: { visible: false } 
    });
    (body as any).level = level;
    (body as any).createdAt = Date.now();
    (body as any).isMerging = false;
    return body;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState.gameOver || dropping) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    setGuidePosition(x);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState.gameOver || dropping) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.max(20, Math.min(GAME_WIDTH - 20, e.clientX - rect.left));
    setGuidePosition(x);
  };

  const handlePointerUp = () => {
    if (gameState.gameOver || dropping) return;
    
    dropCurrent();
  };

  const dropCurrent = () => {
    if (!engineRef.current) return;
    
    const settings = getDifficultySettings();
    
    setDropping(true);
    const body = createCircle(guidePosition, 30, nextLevel);
    Matter.World.add(engineRef.current.world, body);
    
    setTimeout(() => {
      setNextLevel(Math.floor(Math.random() * settings.maxDropLevel) + 1);
      setDropping(false);
    }, 600);
  };

  const nextLevelData = EVOLUTION_LEVELS[nextLevel - 1];

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full max-w-[400px] aspect-[2/3] mx-auto oriental-frame overflow-hidden touch-none transition-transform ${isShaking ? 'shake-active' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Decorative Corners */}
      <div className="corner-ornament top-0 left-0" />
      <div className="corner-ornament top-0 right-0 rotate-90" />
      <div className="corner-ornament bottom-0 left-0 -rotate-90" />
      <div className="corner-ornament bottom-0 right-0 rotate-180" />

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[#2C1810]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/oriental-tiles.png")' }} />
      
      {/* Canvas */}
      <canvas ref={canvasRef} className="relative z-10 w-full h-full" />
      
      {/* Visual Effects Layer */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {hearts.map(heart => (
          <div 
            key={heart.id}
            className="heart-particle flex items-center justify-center text-red-500"
            style={{ left: heart.x, top: heart.y }}
          >
            <Heart fill="currentColor" className="w-4 h-4" />
          </div>
        ))}

        {flashes.map(flash => (
          <div 
            key={flash.id}
            className="absolute rounded-full border-2 border-white/40 bg-white/10 animate-ping"
            style={{ 
              left: flash.x - flash.radius, 
              top: flash.y - flash.radius, 
              width: flash.radius * 2, 
              height: flash.radius * 2 
            }}
          />
        ))}

        {popups.map(popup => (
          <div 
            key={popup.id}
            className="merge-popup text-xl sm:text-2xl font-serif-royal italic"
            style={{ 
              left: popup.x, 
              top: popup.y, 
              color: popup.color,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))'
            }}
          >
            {popup.text}
          </div>
        ))}

        {sparkles.map(sparkle => (
          <div 
            key={sparkle.id}
            className="sparkle-particle"
            style={{ 
              left: sparkle.x, 
              top: sparkle.y, 
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              // @ts-ignore
              '--tx': `${sparkle.tx}px`,
              '--ty': `${sparkle.ty}px`
            }}
          />
        ))}
      </div>
      <div className={`absolute top-[80px] left-0 right-0 h-1 z-0 transition-colors duration-300 ${isNearDeath ? 'bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-red-400/30'}`} style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />

      {/* Guide & Next Item */}
      {!gameState.gameOver && (
        <div 
          className="absolute top-4 z-20 pointer-events-none transition-transform duration-75"
          style={{ transform: `translateX(${guidePosition}px)` }}
        >
          <div className="relative -translate-x-1/2 flex flex-col items-center">
             <div 
              className="rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce"
              style={{ 
                backgroundColor: nextLevelData.color,
                width: `${nextLevelData.radius * 2}px`,
                height: `${nextLevelData.radius * 2}px`,
                fontSize: `${nextLevelData.radius}px`
              }}
            >
              {nextLevelData.emoji}
            </div>
            <div className="w-px h-64 bg-stone-400/20 mt-2" />
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="glass-panel text-center w-full max-w-xs scale-110">
              <AlertTriangle className="w-12 h-12 text-warm-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Hết Chỗ Rồi!</h2>
              <p className="text-stone-600 mb-6">Gia đình chúng ta đã rất hạnh phúc với {gameState.happinessPoints} điểm!</p>
              <button 
                onClick={() => {
                  onStateUpdate({ happinessPoints: 0, gameOver: false, highestLevelReached: 1 });
                  initGame();
                }}
                className="w-full bg-wood-brown text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <RefreshCw className="w-5 h-5" />
                Chơi Lại
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GameCanvas;
