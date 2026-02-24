"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const vehicles = [
  {
    name: "Titano",
    category: "Pickup",
    description: "Potencia y presencia imponente para conquistar cualquier terreno.",
    image: "/images/fiat-titano.png",
    specs: { motor: "2.0 Turbo Diesel", potencia: "170 CV", traccion: "4x4" },
  },
  {
    name: "Toro",
    category: "Pickup",
    description: "La pickup mediana que combina confort urbano con capacidad off-road.",
    image: "/images/fiat-toro.png",
    specs: { motor: "1.3 Turbo Flex", potencia: "185 CV", traccion: "4x2 / 4x4" },
  },
  {
    name: "Strada",
    category: "Pickup",
    description: "Versatilidad y estilo para el dia a dia con la robustez que necesitas.",
    image: "/images/fiat-strada.png",
    specs: { motor: "1.3 Firefly", potencia: "99 CV", traccion: "4x2" },
  },
  {
    name: "Argo",
    category: "Hatchback",
    description: "Diseno dinamico, tecnologia conectada y placer de conduccion.",
    image: "/images/fiat-argo.png",
    specs: { motor: "1.3 Firefly", potencia: "99 CV", traccion: "Delantera" },
  },
  {
    name: "Cronos",
    category: "Sedan",
    description: "Elegancia, espacio y eficiencia en un sedan pensado para vos.",
    image: "/images/fiat-cronos.png",
    specs: { motor: "1.3 Firefly", potencia: "99 CV", traccion: "Delantera" },
  },
];

function VehicleCard({
  vehicle,
  index,
}: {
  vehicle: (typeof vehicles)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.7, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: isHovered
          ? "rgba(255,255,255,0.06)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${isHovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, rgba(200,180,160,${isHovered ? 0.08 : 0.03}), transparent 70%)`,
          }}
        />
        <div
          className="relative z-10 transition-transform duration-700"
          style={{
            transform: isHovered ? "scale(1.05) translateY(-4px)" : "scale(1)",
          }}
        >
          <div className="relative w-[320px] h-[180px]">
            <Image
              src={vehicle.image}
              alt={`FIAT ${vehicle.name}`}
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] tracking-[0.2em] uppercase font-medium"
            style={{ color: "rgba(200, 170, 140, 0.6)" }}
          >
            {vehicle.category}
          </span>
        </div>
        <h3
          className="font-bebas text-2xl md:text-3xl tracking-wide mb-1.5"
          style={{ color: "rgba(245, 240, 235, 0.95)" }}
        >
          FIAT {vehicle.name}
        </h3>
        <p
          className="text-[13px] leading-relaxed mb-4"
          style={{ color: "rgba(200, 195, 190, 0.45)" }}
        >
          {vehicle.description}
        </p>

        {/* Specs row */}
        <div
          className="flex items-center gap-4 text-[11px] tracking-wide mb-4"
          style={{ color: "rgba(200, 195, 190, 0.35)" }}
        >
          <span>{vehicle.specs.motor}</span>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
          <span>{vehicle.specs.potencia}</span>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
          <span>{vehicle.specs.traccion}</span>
        </div>

        {/* CTA */}
        <div
          className="flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase font-medium transition-all duration-300"
          style={{
            color: isHovered
              ? "rgba(200, 180, 160, 0.9)"
              : "rgba(200, 180, 160, 0.5)",
            transform: isHovered ? "translateX(4px)" : "translateX(0)",
          }}
        >
          <span>Consultar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

export function VehicleShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="vehiculos" className="relative z-10 py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={ref} className="mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="block text-[11px] tracking-[0.4em] uppercase font-medium mb-4"
            style={{ color: "rgba(200, 170, 140, 0.5)" }}
          >
            Nuestra gama
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide text-balance"
            style={{ color: "rgba(245, 240, 235, 0.92)" }}
          >
            Encontra el FIAT que se
            <br className="hidden md:block" /> adapta a tu estilo
          </motion.h2>
        </div>

        {/* Vehicle grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle, i) => (
            <VehicleCard key={vehicle.name} vehicle={vehicle} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
