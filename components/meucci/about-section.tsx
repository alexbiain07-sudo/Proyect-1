"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Users, Award, Wrench } from "lucide-react";

const stats = [
  { number: "25+", label: "Anos de experiencia" },
  { number: "15K+", label: "Vehiculos vendidos" },
  { number: "98%", label: "Clientes satisfechos" },
  { number: "50+", label: "Profesionales" },
];

const values = [
  {
    icon: Shield,
    title: "Confianza",
    description: "Transparencia en cada operacion. Sin letras chicas, sin sorpresas.",
  },
  {
    icon: Users,
    title: "Atencion personalizada",
    description: "Cada cliente es unico. Nos adaptamos a tus necesidades y tiempos.",
  },
  {
    icon: Award,
    title: "Calidad certificada",
    description: "Concesionario oficial FIAT con los estandares mas altos del mercado.",
  },
  {
    icon: Wrench,
    title: "Servicio integral",
    description: "Venta, posventa, repuestos y financiacion en un solo lugar.",
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  return (
    <section id="nosotros" className="relative z-10 py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-px mb-24 origin-left"
          style={{ background: "rgba(255,255,255,0.06)" }}
          ref={ref}
        />

        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="block text-[11px] tracking-[0.4em] uppercase font-medium mb-4"
              style={{ color: "rgba(200, 170, 140, 0.5)" }}
            >
              Nosotros
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide text-balance"
              style={{ color: "rgba(245, 240, 235, 0.92)" }}
            >
              Mas que un concesionario,
              <br /> una experiencia
            </motion.h2>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-sm md:text-base leading-relaxed"
              style={{ color: "rgba(200, 195, 190, 0.5)" }}
            >
              En Meucci Automotores creemos que comprar un vehiculo debe ser un
              momento memorable. Desde la primera consulta hasta la entrega de
              llaves, nuestro equipo te acompana con dedicacion, transparencia y
              la pasion que nos impulsa desde hace mas de dos decadas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex items-center gap-3"
            >
              <div
                className="h-px flex-1"
                style={{ background: "rgba(200,170,140,0.1)" }}
              />
              <span
                className="text-[10px] tracking-[0.2em] uppercase shrink-0"
                style={{ color: "rgba(200,170,140,0.3)" }}
              >
                Respaldados por Grupo Meucci
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "rgba(200,170,140,0.1)" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="text-center py-8 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="font-bebas text-4xl md:text-5xl tracking-wide mb-1"
                style={{ color: "rgba(200, 180, 160, 0.8)" }}
              >
                {stat.number}
              </div>
              <div
                className="text-[11px] tracking-[0.15em] uppercase"
                style={{ color: "rgba(200, 195, 190, 0.35)" }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.7 }}
              className="p-6 rounded-xl group transition-all duration-500"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
              }}
            >
              <value.icon
                className="w-5 h-5 mb-4"
                style={{ color: "rgba(200, 170, 140, 0.5)" }}
              />
              <h3
                className="font-bebas text-xl tracking-wide mb-2"
                style={{ color: "rgba(245, 240, 235, 0.9)" }}
              >
                {value.title}
              </h3>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "rgba(200, 195, 190, 0.4)" }}
              >
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
