import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { EVOLUTION_LEVELS, ICON_MAP } from '../constants';
import { GameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RefreshCw, AlertTriangle } from 'lucide-react';

const GameCanvas: React.FC<{ 
  onStateUpdate: (state: Partial<GameState>) => void;
  gameState: GameState;
}> = ({ onStateUpdate, gameState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  const [nextLevel, setNextLevel] = useState(1);
  const [dropping, setDropping] = useState(false);
  const [guidePosition, setGuidePosition] = useState(200);
  
  // Game dimensions
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;

  const initGame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Clean up previous engine
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      Matter.Render.stop(renderRef.current!);
      Matter.Runner.stop(runnerRef.current!);
    }

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 }
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
    const wallOptions = { isStatic: true, render: { visible: false } };
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

        if (bodyA.level && bodyB.level && bodyA.level === bodyB.level) {
          if (bodyA.level < 12) {
            const nextLevelData = EVOLUTION_LEVELS.find(l => l.level === bodyA.level + 1);
            if (nextLevelData) {
              const newX = (bodyA.position.x + bodyB.position.x) / 2;
              const newY = (bodyA.position.y + bodyB.position.y) / 2;
              
              const newBody = createCircle(newX, newY, nextLevelData.level);
              
              Matter.World.remove(engine.world, [bodyA, bodyB]);
              Matter.World.add(engine.world, newBody);
              
              onStateUpdate({ 
                happinessPoints: gameState.happinessPoints + nextLevelData.points,
                highestLevelReached: Math.max(gameState.highestLevelReached, nextLevelData.level)
              });
            }
          }
        }
      });
    });

    // Cache for images
    const imageCache: { [key: string]: HTMLImageElement } = {};
    EVOLUTION_LEVELS.forEach(level => {
      const img = new Image();
      img.src = level.image;
      imageCache[level.image] = img;
    });

    // Custom rendering for icons and images
    Matter.Events.on(render, 'afterRender', () => {
      const context = canvasRef.current!.getContext('2d');
      if (!context) return;

      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach(body => {
        const level = (body as any).level;
        if (!level) return;

        const levelData = EVOLUTION_LEVELS[level - 1];
        const { x, y } = body.position;
        const angle = body.angle;

        context.save();
        context.translate(x, y);
        context.rotate(angle);
        
        // Draw Shadow/Glow
        context.shadowBlur = 10;
        context.shadowColor = 'rgba(0,0,0,0.1)';
        
        // Mask for rounded image
        context.beginPath();
        context.arc(0, 0, levelData.radius, 0, Math.PI * 2);
        context.clip();

        const img = imageCache[levelData.image];
        if (img && img.complete && img.naturalWidth !== 0) {
          // Draw Image
          context.drawImage(img, -levelData.radius, -levelData.radius, levelData.radius * 2, levelData.radius * 2);
        } else {
          // Fallback to Icon Background
          context.beginPath();
          context.arc(0, 0, levelData.radius, 0, Math.PI * 2);
          context.fillStyle = levelData.color;
          context.fill();
          
          // Draw Icon identifier
          context.fillStyle = '#444';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          const fontSize = Math.max(12, levelData.radius / 1.2);
          context.font = `bold ${fontSize}px Quicksand`;
          context.fillText(levelData.level.toString(), 0, 0);
        }
        
        // Draw Inner Circle Border
        context.restore();
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.beginPath();
        context.arc(0, 0, levelData.radius, 0, Math.PI * 2);
        context.lineWidth = 3;
        context.strokeStyle = 'white';
        context.stroke();
        context.restore();
      });
    });

    // Check Game Over
    const checkGameOver = setInterval(() => {
      const bodies = Matter.Composite.allBodies(engine.world);
      const isGameOver = bodies.some(body => {
        return !(body as any).isStatic && (body as any).level && body.position.y < deathLineY && body.velocity.y < 0.1;
      });

      if (isGameOver && !gameState.gameOver) {
        onStateUpdate({ gameOver: true });
        clearInterval(checkGameOver);
      }
    }, 1000);

    return () => clearInterval(checkGameOver);
  }, [onStateUpdate, gameState]);

  useEffect(() => {
    initGame();
  }, []);

  const createCircle = (x: number, y: number, level: number) => {
    const levelData = EVOLUTION_LEVELS[level - 1];
    const body = Matter.Bodies.circle(x, y, levelData.radius, {
      restitution: 0.3,
      friction: 0.1,
      density: 0.001 * level,
      render: { visible: false } // We use custom rendering
    });
    (body as any).level = level;
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
    
    setDropping(true);
    const body = createCircle(guidePosition, 30, nextLevel);
    Matter.World.add(engineRef.current.world, body);
    
    setTimeout(() => {
      setNextLevel(Math.floor(Math.random() * 4) + 1);
      setDropping(false);
    }, 800);
  };

  const nextLevelData = EVOLUTION_LEVELS[nextLevel - 1];
  const NextIcon = ICON_MAP[nextLevelData.icon as keyof typeof ICON_MAP];

  return (
    <div 
      ref={containerRef} 
      className="relative w-full max-w-[400px] aspect-[2/3] mx-auto wood-frame overflow-hidden touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[#FFF5E6] opacity-30 pattern-dots" />
      
      {/* Canvas */}
      <canvas ref={canvasRef} className="relative z-10 w-full h-full" />
      
      {/* Death Line */}
      <div className="absolute top-[80px] left-0 right-0 h-px bg-red-400/30 dashed-line z-0" />

      {/* Guide & Next Item */}
      {!gameState.gameOver && (
        <div 
          className="absolute top-4 z-20 pointer-events-none transition-transform duration-75"
          style={{ transform: `translateX(${guidePosition}px)` }}
        >
          <div className="relative -translate-x-1/2 flex flex-col items-center">
             <div 
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce"
              style={{ backgroundColor: nextLevelData.color }}
            >
              <NextIcon className="w-6 h-6 text-stone-700" />
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
};

export default GameCanvas;
