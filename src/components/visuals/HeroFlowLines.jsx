import { useEffect, useRef, memo } from 'react';
import styles from './HeroFlowLines.module.scss';
import useViewportActivity from '../../hooks/useViewportActivity';
import { useReducedMotion } from 'framer-motion';

const DEFAULT_COLORS = ['#2DD4BF', '#38BDF8', '#5EEAD4'];
const MAX_CANVAS_DPR = 1.5;
const TARGET_FRAME_INTERVAL = 1000 / 60;
const MIN_FRAME_INTERVAL = TARGET_FRAME_INTERVAL - 1;
const MAX_FRAME_DELTA = 50;
const TIME_ADVANCE_PER_MILLISECOND = 0.008 / TARGET_FRAME_INTERVAL;

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '229, 217, 182';
};

const HeroFlowLines = ({
  // Standardmäßig ein Array, falls du nichts übergibst
  colors = DEFAULT_COLORS,
  direction = 'right',
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animateRef = useRef(null);
  const { targetRef, isActive } = useViewportActivity();
  const isActiveRef = useRef(isActive);
  const gradientClass =
    direction === 'right' ? styles.lpGradientXright : styles.lpGradientXleft;

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;
    let isDisposed = false;
    let width = 0;
    let height = 0;
    let lastFrameTime = null;

    const dirMultiplier = direction === 'right' ? 1 : -1;

    // Hilfsfunktion zum Umrechnen von Array oder Einzelstring
    const getColorRGB = (index) => {
      const color = Array.isArray(colors) ? colors[index] || colors[0] : colors;
      return hexToRgb(color);
    };

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    // Die Funktion akzeptiert nun colorRGB als Parameter
    const drawWave = (
      yOffsetRatio,
      frequency,
      amplitude,
      speed,
      opacity,
      thickness,
      colorRGB
    ) => {
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

      for (let x = 0; x <= width; x += 5) {
        const y =
          yBase +
          Math.sin(x * frequency + time * speed * dirMultiplier) * amplitude +
          Math.cos(
            x * (frequency * 0.5) + time * (speed * 0.8) * dirMultiplier
          ) *
            (amplitude * 0.5);

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      drawWave(0.55, 0.0015, 80, 1.0, 0.6, 2.5, getColorRGB(0));
      drawWave(0.55, 0.0015, 90, 1.2, 0.3, 2, getColorRGB(1));
      drawWave(0.55, 0.0008, 140, 0.5, 0.15, 4, getColorRGB(2));
    };

    const animate = (timestamp = 0) => {
      animationFrameRef.current = null;

      if (isDisposed || !isActiveRef.current) {
        return;
      }

      if (
        !shouldReduceMotion &&
        lastFrameTime !== null &&
        timestamp - lastFrameTime < MIN_FRAME_INTERVAL
      ) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!shouldReduceMotion) {
        const frameDelta =
          lastFrameTime === null
            ? TARGET_FRAME_INTERVAL
            : Math.min(timestamp - lastFrameTime, MAX_FRAME_DELTA);

        time += frameDelta * TIME_ADVANCE_PER_MILLISECOND;
        lastFrameTime = timestamp;
      }

      drawFrame();

      if (!shouldReduceMotion) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animateRef.current = animate;
    if (isActiveRef.current) animate(0);

    return () => {
      isDisposed = true;
      animateRef.current = null;
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [colors, direction, shouldReduceMotion]);

  useEffect(() => {
    isActiveRef.current = isActive;

    if (!isActive) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      return;
    }

    if (!animateRef.current || animationFrameRef.current !== null) {
      return;
    }

    if (shouldReduceMotion) {
      animateRef.current();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animateRef.current);
  }, [isActive, shouldReduceMotion]);

  return (
    <div ref={targetRef} className={styles.lpHeroBg}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={gradientClass} />
      <div className={styles.lpGradientY} />
    </div>
  );
};

export default memo(HeroFlowLines);
