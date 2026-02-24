"use client";

import { useCallback, useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface LightTrail {
  points: { x: number; y: number }[];
  speed: number;
  angle: number;
  opacity: number;
  width: number;
  hue: number;
  life: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<LightTrail[]>([]);
  const mouseRef = useRef({ x: -1, y: -1 });
  const timeRef = useRef(0);

  const createParticle = useCallback(
    (canvas: HTMLCanvasElement): Particle => {
      const colors = [
        "rgba(255,255,255,",
        "rgba(200,200,210,",
        "rgba(180,190,220,",
        "rgba(220,180,160,",
      ];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 400 + 200,
      };
    },
    []
  );

  const createTrail = useCallback((canvas: HTMLCanvasElement): LightTrail => {
    const side = Math.floor(Math.random() * 2);
    const x = side === 0 ? -50 : canvas.width + 50;
    const y = Math.random() * canvas.height * 0.6;
    const targetX = side === 0 ? canvas.width + 50 : -50;
    const targetY = y + (Math.random() - 0.5) * 200;
    const angle = Math.atan2(targetY - y, targetX - x);

    return {
      points: [{ x, y }],
      speed: Math.random() * 3 + 2,
      angle,
      opacity: Math.random() * 0.3 + 0.1,
      width: Math.random() * 1.5 + 0.5,
      hue: Math.random() > 0.5 ? 30 : 210,
      life: 0,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    for (let i = 0; i < 80; i++) {
      particlesRef.current.push(createParticle(canvas));
    }
    // Init trails
    for (let i = 0; i < 3; i++) {
      trailsRef.current.push(createTrail(canvas));
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      timeRef.current += 0.01;
      ctx.fillStyle = "rgba(8, 8, 12, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ambient gradient pulses
      const pulse = Math.sin(timeRef.current * 0.5) * 0.5 + 0.5;
      const grd = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.3,
        0,
        canvas.width * 0.3,
        canvas.height * 0.3,
        canvas.width * 0.5
      );
      grd.addColorStop(0, `rgba(30, 20, 50, ${0.02 * pulse})`);
      grd.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grd2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.6,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.4
      );
      grd2.addColorStop(0, `rgba(40, 25, 15, ${0.02 * (1 - pulse)})`);
      grd2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      particlesRef.current.forEach((p, i) => {
        p.life++;
        if (p.life > p.maxLife) {
          particlesRef.current[i] = createParticle(canvas);
          return;
        }

        // Mouse interaction
        if (mouseRef.current.x > 0) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx += (dx / dist) * force * 0.02;
            p.vy += (dy / dist) * force * 0.02;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const lifeRatio = p.life / p.maxLife;
        const fadeIn = Math.min(lifeRatio * 5, 1);
        const fadeOut = Math.max(1 - (lifeRatio - 0.8) * 5, 0);
        const alpha = p.opacity * fadeIn * (lifeRatio > 0.8 ? fadeOut : 1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();

        // Glow
        if (p.size > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alpha * 0.1})`;
          ctx.fill();
        }
      });

      // Draw connections between close particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = ((100 - dist) / 100) * 0.06;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(200, 200, 220, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Update & draw light trails
      trailsRef.current.forEach((trail, i) => {
        trail.life++;
        const head = trail.points[trail.points.length - 1];
        const newX = head.x + Math.cos(trail.angle) * trail.speed;
        const newY =
          head.y +
          Math.sin(trail.angle) * trail.speed +
          Math.sin(timeRef.current * 2 + i) * 0.5;
        trail.points.push({ x: newX, y: newY });

        if (trail.points.length > 60) trail.points.shift();

        // Draw trail
        if (trail.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(trail.points[0].x, trail.points[0].y);
          for (let j = 1; j < trail.points.length; j++) {
            ctx.lineTo(trail.points[j].x, trail.points[j].y);
          }
          const gradient = ctx.createLinearGradient(
            trail.points[0].x,
            trail.points[0].y,
            newX,
            newY
          );
          gradient.addColorStop(
            0,
            `hsla(${trail.hue}, 30%, 70%, 0)`
          );
          gradient.addColorStop(
            1,
            `hsla(${trail.hue}, 30%, 70%, ${trail.opacity})`
          );
          ctx.strokeStyle = gradient;
          ctx.lineWidth = trail.width;
          ctx.stroke();
        }

        // Replace if off-screen
        if (
          newX < -100 ||
          newX > canvas.width + 100 ||
          newY < -100 ||
          newY > canvas.height + 100
        ) {
          trailsRef.current[i] = createTrail(canvas);
        }
      });

      // Occasionally add a new trail
      if (Math.random() < 0.005 && trailsRef.current.length < 6) {
        trailsRef.current.push(createTrail(canvas));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Clear canvas once fully
    ctx.fillStyle = "rgb(8, 8, 12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [createParticle, createTrail]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
