import { useEffect, useRef } from 'react';

export default function DustParticles({ 
  colors = ["#eca8d6", "#a78bfa", "#67e8f9", "#fbbf24", "#ffffff"],
  particleCount = 70
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles = [];

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    // Initial resize
    resize();
    
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset(true);
      }
      
      reset(randomizeY = false) {
        this.x = Math.random() * canvas.width;
        this.y = randomizeY ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 2 + 0.5; // Small dots (0.5px to 2.5px)
        this.speedY = -(Math.random() * 0.4 + 0.1); // Going up slowly
        this.speedX = (Math.random() - 0.5) * 0.3; // Slight horizontal drift
        
        // Randomly pick color and opacity
        const color = colors[Math.floor(Math.random() * colors.length)];
        // Convert hex to rgb string for easier opacity manipulation
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        this.rgb = `${r}, ${g}, ${b}`;
        
        this.maxOpacity = Math.random() * 0.6 + 0.2; // Max opacity between 0.2 and 0.8
        this.currentOpacity = 0; // Starts faded out
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Fade in as it enters the screen
        if (this.currentOpacity < this.maxOpacity) {
            this.currentOpacity += 0.01;
        }

        // Fade out near the top
        if (this.y < 50) {
            this.currentOpacity -= 0.02;
        }

        // Reset when it goes off screen top
        if (this.y < -10 || this.currentOpacity <= 0) {
          if (this.y < 100) { // Only reset if it actually reached the top
            this.reset(false);
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Using shadow for a slight "glowing dust" effect
        ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(${this.rgb}, ${Math.max(0, this.currentOpacity)})`;
        ctx.fillStyle = `rgba(${this.rgb}, ${Math.max(0, this.currentOpacity)})`;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, particleCount]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
