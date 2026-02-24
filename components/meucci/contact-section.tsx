"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="relative z-10 py-24 md:py-32 px-6 md:px-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left column */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="block text-[11px] tracking-[0.4em] uppercase font-medium mb-4"
              style={{ color: "rgba(200, 170, 140, 0.5)" }}
            >
              Contacto
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide mb-8 text-balance"
              style={{ color: "rgba(245, 240, 235, 0.92)" }}
            >
              Estamos para
              <br /> ayudarte
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-sm leading-relaxed mb-10 max-w-md"
              style={{ color: "rgba(200, 195, 190, 0.45)" }}
            >
              Dejanos tus datos y un asesor se pondra en contacto con vos a la
              brevedad. O visitanos en nuestro salon de ventas.
            </motion.p>

            {/* Contact info */}
            <div className="flex flex-col gap-5">
              {[
                { icon: MapPin, text: "Av. Cordoba 3200, Cordoba, Argentina" },
                { icon: Phone, text: "+54 351 456 7890" },
                { icon: Mail, text: "ventas@meucciautomotores.com" },
                { icon: Clock, text: "Lun - Vie: 9:00 - 19:00 | Sab: 9:00 - 13:00" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <item.icon
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: "rgba(200, 170, 140, 0.45)" }}
                  />
                  <span
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(200, 195, 190, 0.5)" }}
                  >
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column - form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {submitted ? (
              <div
                className="flex flex-col items-center justify-center h-full rounded-2xl p-12 text-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <CheckCircle
                  className="w-12 h-12 mb-4"
                  style={{ color: "rgba(120, 180, 120, 0.7)" }}
                />
                <h3
                  className="font-bebas text-2xl tracking-wide mb-2"
                  style={{ color: "rgba(245, 240, 235, 0.9)" }}
                >
                  Mensaje enviado
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "rgba(200, 195, 190, 0.45)" }}
                >
                  Un asesor se pondra en contacto con vos en las proximas horas.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 p-8 md:p-10 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  { name: "nombre" as const, label: "Nombre completo", type: "text" },
                  { name: "email" as const, label: "Email", type: "email" },
                  { name: "telefono" as const, label: "Telefono", type: "tel" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label
                      className="text-[11px] tracking-[0.15em] uppercase"
                      style={{ color: "rgba(200, 195, 190, 0.4)" }}
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      required
                      className="bg-transparent text-sm py-3 px-0 outline-none transition-colors duration-300"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(245, 240, 235, 0.85)",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderBottomColor = "rgba(200, 170, 140, 0.4)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.08)")
                      }
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[11px] tracking-[0.15em] uppercase"
                    style={{ color: "rgba(200, 195, 190, 0.4)" }}
                  >
                    Mensaje (opcional)
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mensaje: e.target.value }))
                    }
                    rows={3}
                    className="bg-transparent text-sm py-3 px-0 outline-none resize-none transition-colors duration-300"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(245, 240, 235, 0.85)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderBottomColor = "rgba(200, 170, 140, 0.4)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.08)")
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 flex items-center justify-center gap-2 py-3.5 rounded-full text-[13px] tracking-[0.15em] uppercase font-medium transition-all duration-500"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    color: "rgb(15, 15, 15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,1)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar consulta
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
