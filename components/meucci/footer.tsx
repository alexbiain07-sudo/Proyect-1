"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { GrupoMeucciLogo, MeucciNavLogo } from "@/components/ui/brand-logo";

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer
      id="grupo-meucci"
      className="relative z-10 px-6 md:px-12 pb-8 pt-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Grupo Meucci banner */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="rounded-2xl p-10 md:p-16 mb-16 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(200, 170, 140, 0.08) 0%, rgba(255,255,255,0.025) 50%, rgba(180, 160, 140, 0.06) 100%)",
            border: "1px solid rgba(200, 170, 140, 0.12)",
          }}
        >
          {/* Decorative radial glow behind logo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 40%, rgba(200,170,140,0.06) 0%, transparent 60%)",
            }}
          />
          <span
            className="relative block text-[11px] tracking-[0.5em] uppercase mb-6 font-medium"
            style={{ color: "rgba(200, 170, 140, 0.5)" }}
          >
            Empresa del
          </span>
          <div className="relative z-10 mx-auto mb-8">
            <GrupoMeucciLogo size="lg" style={{ opacity: 0.9 }} />
          </div>
          <div
            className="w-16 h-px mx-auto mb-5"
            style={{ background: "rgba(200, 170, 140, 0.2)" }}
          />
          <p
            className="text-[13px] leading-relaxed max-w-lg mx-auto mb-6"
            style={{ color: "rgba(200, 195, 190, 0.4)" }}
          >
            Grupo Meucci es un holding empresarial argentino con presencia en el
            sector automotriz, inmobiliario y de servicios. Mas de dos decadas
            construyendo confianza y excelencia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Meucci Automotores", "Meucci Inmobiliaria", "Meucci Servicios", "Scuderia"].map(
              (brand) => (
                <span
                  key={brand}
                  className="text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded-full"
                  style={{
                    border: "1px solid rgba(200,170,140,0.1)",
                    color: "rgba(200,195,190,0.4)",
                    background: "rgba(200,170,140,0.03)",
                  }}
                >
                  {brand}
                </span>
              )
            )}
          </div>
        </motion.div>

        {/* Divider */}
        <div
          className="h-px mb-10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />

        {/* Footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo col */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <MeucciNavLogo size="sm" style={{ maxHeight: "24px" }} />
            </div>
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "rgba(200, 195, 190, 0.3)" }}
            >
              Concesionario oficial FIAT.
              <br />
              Venta, posventa y repuestos.
            </p>
          </div>

          {/* Links */}
          <div>
            <span
              className="block text-[10px] tracking-[0.2em] uppercase mb-4 font-medium"
              style={{ color: "rgba(200, 195, 190, 0.4)" }}
            >
              Navegacion
            </span>
            {["Vehiculos", "Ranking", "Nosotros", "Contacto", "Drive Experience"].map(
              (link) => (
                <a
                  key={link}
                  href={
                    link === "Drive Experience"
                      ? "/game"
                      : `#${link.toLowerCase().replace(" ", "-")}`
                  }
                  className="block text-[13px] mb-2.5 transition-colors duration-300"
                  style={{ color: "rgba(200, 195, 190, 0.35)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(200, 195, 190, 0.7)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(200, 195, 190, 0.35)")
                  }
                >
                  {link}
                </a>
              )
            )}
          </div>

          <div>
            <span
              className="block text-[10px] tracking-[0.2em] uppercase mb-4 font-medium"
              style={{ color: "rgba(200, 195, 190, 0.4)" }}
            >
              Grupo Meucci
            </span>
            {["Meucci Automotores", "Meucci Inmobiliaria", "Meucci Servicios"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-[13px] mb-2.5 transition-colors duration-300"
                  style={{ color: "rgba(200, 195, 190, 0.35)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(200, 195, 190, 0.7)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(200, 195, 190, 0.35)")
                  }
                >
                  {link}
                </a>
              )
            )}
          </div>

          {/* Social */}
          <div>
            <span
              className="block text-[10px] tracking-[0.2em] uppercase mb-4 font-medium"
              style={{ color: "rgba(200, 195, 190, 0.4)" }}
            >
              Seguinos
            </span>
            <div className="flex gap-3">
              {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: "rgba(200, 195, 190, 0.5)" }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="h-px mb-6"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <span
            className="text-[11px]"
            style={{ color: "rgba(200, 195, 190, 0.2)" }}
          >
            2026 Meucci Automotores. Todos los derechos reservados.
          </span>
          <span
            className="text-[11px]"
            style={{ color: "rgba(200, 195, 190, 0.2)" }}
          >
            Una empresa del Grupo Meucci
          </span>
        </div>
      </div>
    </footer>
  );
}
