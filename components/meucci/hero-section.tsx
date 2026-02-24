"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
      {/* Top bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/images/meucci-logo.jpg"
            alt="Meucci Automotores"
            width={140}
            height={40}
            style={{ width: "auto", height: "28px" }}
            className="brightness-0 invert"
          />
          <span
            className="hidden md:block h-4 w-px"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
          <Image
            src="/images/grupo-meucci-logo.png"
            alt="Grupo Meucci"
            width={100}
            height={34}
            style={{ width: "auto", height: "20px", opacity: 0.55 }}
            className="hidden md:block brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Vehiculos", "Ranking", "Nosotros", "Grupo Meucci", "Contacto"].map(
            (item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                className="text-[13px] tracking-[0.15em] uppercase transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                }
              >
                {item}
              </motion.a>
            )
          )}
        </div>
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          href="#contacto"
          className="hidden md:block text-[12px] tracking-[0.15em] uppercase px-5 py-2.5 rounded-full transition-all duration-300"
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
            e.currentTarget.style.color = "rgba(255,255,255,1)";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Agendar visita
        </motion.a>
      </motion.nav>

      {/* Center content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
          className="mb-8"
        >
          <Image
            src="/images/meucci-logo.jpg"
            alt="Meucci Automotores"
            width={500}
            height={140}
            style={{ width: "auto", height: "auto" }}
            className="brightness-0 invert mx-auto max-h-[80px] md:max-h-[110px]"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-4"
        >
          <span
            className="text-[11px] md:text-[13px] tracking-[0.4em] uppercase font-medium"
            style={{ color: "rgba(200, 180, 160, 0.6)" }}
          >
            Concesionario oficial FIAT
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.9 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bebas tracking-wide leading-[0.95] mb-6 text-balance"
          style={{ color: "rgba(245, 240, 235, 0.95)" }}
        >
          Tu proximo vehiculo
          <br />
          te esta esperando
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-6"
          style={{ color: "rgba(200, 195, 190, 0.5)" }}
        >
          Descubri la gama completa de FIAT con atencion personalizada,
          financiacion a medida y el respaldo del Grupo Meucci.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.7 }}
          className="flex items-center justify-center gap-3 mb-10 px-5 py-2.5 rounded-full mx-auto w-fit"
          style={{
            background: "rgba(200, 170, 140, 0.04)",
            border: "1px solid rgba(200, 170, 140, 0.1)",
          }}
        >
          <span
            className="text-[10px] tracking-[0.15em] uppercase"
            style={{ color: "rgba(200, 180, 160, 0.45)" }}
          >
            Una empresa del
          </span>
          <Image
            src="/images/grupo-meucci-logo.png"
            alt="Grupo Meucci"
            width={120}
            height={40}
            style={{ width: "auto", height: "18px", opacity: 0.7 }}
            className="brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.12)]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#vehiculos"
            className="group relative px-8 py-3.5 rounded-full text-[13px] tracking-[0.15em] uppercase font-medium overflow-hidden transition-all duration-500"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "rgb(15, 15, 15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,1)";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.95)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Ver vehiculos
          </a>
          <a
            href="/game"
            className="px-8 py-3.5 rounded-full text-[13px] tracking-[0.15em] uppercase font-medium transition-all duration-500"
            style={{
              border: "1px solid rgba(200, 170, 140, 0.3)",
              color: "rgba(200, 180, 160, 0.8)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(200, 170, 140, 0.6)";
              e.currentTarget.style.color = "rgba(230, 210, 190, 1)";
              e.currentTarget.style.background = "rgba(200, 170, 140, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(200, 170, 140, 0.3)";
              e.currentTarget.style.color = "rgba(200, 180, 160, 0.8)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Drive Experience
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown
            className="w-4 h-4"
            style={{ color: "rgba(255,255,255,0.2)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
