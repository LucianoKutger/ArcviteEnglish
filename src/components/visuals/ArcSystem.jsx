import { useEffect, useRef } from "react";
import styles from "./ArcParticleSystem.module.scss"; // Pfad anpassen

const ArcParticleSystem = ({ 
  showLabels = true, 
  interactive = true,
  spreadMult = 1,
  countMult = 1
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let time = 0;

    const resize = () => {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.scale(dpr, dpr);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
        this.progress = Math.random();
      }
      
      reset() {
        this.progress = 0;
        this.baseSpeed = 0.0005 + Math.random() * 0.001;
        this.speed = this.baseSpeed;
        const baseSpread = 40;
        this.offset = (Math.random() - 0.5) * (baseSpread * spreadMult); 
        this.size = Math.random() * 2 + 0.5;
        this.alpha = 0;
        this.wobbleFreq = Math.random() * 0.05 + 0.02;
      }

      update(isHovered, scrollFactor = 0) {
        let targetSpeed = this.baseSpeed;
        if (interactive) {
          if (isHovered || scrollFactor > 0.1) {
            targetSpeed = this.baseSpeed * 4;
          }
        }
        this.speed += (targetSpeed - this.speed) * 0.05; 
        this.progress += this.speed;
        
        if (this.progress < 0.05) this.alpha = this.progress * (1/0.05);
        else if (this.progress > 0.85) this.alpha = (1 - this.progress) * (1/0.15);
        else this.alpha = 1;

        if (this.progress >= 1) this.reset();
      }

      draw(ctx, width, height, time, isHovered) {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = width / dpr;
        const logicalHeight = height / dpr;

        const p0 = { x: logicalWidth * 0.1, y: logicalHeight * 0.85 };
        const p1 = { x: logicalWidth * 0.5, y: logicalHeight * 0.85 }; 
        const p2 = { x: logicalWidth * 0.5, y: logicalHeight * 0.15 }; 
        const p3 = { x: logicalWidth * 0.9, y: logicalHeight * 0.15 }; 

        const t = this.progress;
        const cx = 3 * (p1.x - p0.x);
        const bx = 3 * (p2.x - p1.x) - cx;
        const ax = p3.x - p0.x - cx - bx;

        const cy = 3 * (p1.y - p0.y);
        const by = 3 * (p2.y - p1.y) - cy;
        const ay = p3.y - p0.y - cy - by;

        const x = (ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x);
        const y = (ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y);

        const breathY = Math.sin(time * 0.002 + this.progress * 5) * 5;
        const wobbleY = Math.sin(time * this.wobbleFreq) * this.offset * (1 - Math.abs(0.5 - t)); 

        ctx.beginPath();
        ctx.arc(x, y + breathY + wobbleY, this.size, 0, Math.PI * 2);
        
        const r = 23 + (229 - 23) * t;
        const g = 37 + (217 - 37) * t;
        const b = 84 + (182 - 84) * t;

        if (interactive && isHovered) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0; 
      }
    }

    const totalParticles = 200 * countMult;
    for(let i=0; i<totalParticles; i++) particles.push(new Particle());

    const render = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isHovered = canvas.dataset.hover === 'true';
      const scrollFactor = Math.min(window.scrollY / 500, 1); 
      particles.forEach(p => {
        p.update(isHovered, scrollFactor);
        p.draw(ctx, canvas.width, canvas.height, time, isHovered);
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactive, spreadMult, countMult]);

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas 
        ref={canvasRef} 
        className={styles.canvas}
        onMouseEnter={(e) => e.target.dataset.hover = 'true'}
        onMouseLeave={(e) => e.target.dataset.hover = 'false'}
      />
      {showLabels && (
        <>
          <div className={`${styles.labelBase} ${styles.labelStatusQuo}`}>
            Status Quo
          </div>
          <div className={`${styles.labelBase} ${styles.labelExcellence}`}>
            Excellence
          </div>
        </>
      )}
    </div>
  );
};

export default ArcParticleSystem;