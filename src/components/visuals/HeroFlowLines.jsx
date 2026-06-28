import { useEffect, useRef, memo } from "react";
import styles from "./HeroFlowLines.module.scss"; 

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '229, 217, 182';
};

const HeroFlowLines = ({ 
  // Standardmäßig ein Array, falls du nichts übergibst
  colors = ["#2DD4BF", "#38BDF8", "#5EEAD4"], 
  direction = "right" 
}) => {
  const canvasRef = useRef(null);
  const gradientClass = direction === "right" ? styles.lpGradientXright : styles.lpGradientXleft;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;
    let animationFrameId;
    let width = 0;
    let height = 0;

    const dirMultiplier = direction === "right" ? 1 : -1;

    // Hilfsfunktion zum Umrechnen von Array oder Einzelstring
    const getColorRGB = (index) => {
      const color = Array.isArray(colors) ? colors[index] || colors[0] : colors;
      return hexToRgb(color);
    };

    const resize = () => {
        if(!canvas.parentElement) return;
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    // Die Funktion akzeptiert nun colorRGB als Parameter
    const drawWave = (yOffsetRatio, frequency, amplitude, speed, opacity, thickness, colorRGB) => {
        ctx.beginPath();
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(${colorRGB}, 0)`);
        gradient.addColorStop(0.2, `rgba(${colorRGB}, ${opacity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(${colorRGB}, ${opacity})`);
        gradient.addColorStop(0.8, `rgba(${colorRGB}, ${opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${colorRGB}, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';

        const yBase = height * yOffsetRatio;
        let first = true;

        for(let x = 0; x <= width; x += 5) {
            const y = yBase + 
                     Math.sin(x * frequency + (time * speed * dirMultiplier)) * amplitude + 
                     Math.cos(x * (frequency * 0.5) + (time * (speed * 0.8) * dirMultiplier)) * (amplitude * 0.5);
            
            if (first) {
                ctx.moveTo(x, y);
                first = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    };

    const animate = () => {
        time += 0.008;
        ctx.clearRect(0, 0, width, height);
        
        // Hier rufen wir nun jede Welle mit einer eigenen Farbe aus dem Array ab:
        // 1. The Main Line (Farbe 0)
        drawWave(0.55, 0.0015, 80, 1.0, 0.6, 2.5, getColorRGB(0));
        
        // 2. Secondary Echo (Farbe 1)
        drawWave(0.55, 0.0015, 90, 1.2, 0.3, 2, getColorRGB(1));
        
        // 3. Deep Background Wave (Farbe 2)
        drawWave(0.55, 0.0008, 140, 0.5, 0.15, 4, getColorRGB(2));

        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
    };
  }, [colors, direction]); // Abhängigkeit auf colors geändert

  return (
    <div className={styles.lpHeroBg}>
        <canvas ref={canvasRef} className={styles.canvas} style={{ mixBlendMode: 'screen' }} />
        <div className={gradientClass} />
        <div className={styles.lpGradientY} />
    </div>
  );
};

export default memo(HeroFlowLines);