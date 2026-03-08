"use client";

import { useGameStore } from "@/lib/game-store";
import { locations } from "@/lib/locations";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Unlock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { GrupoMeucciLogo } from "@/components/ui/brand-logo";

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface FormData {
  telefono: string;
  province: string;
  city: string;
  interest: "plan_ahorro" | "convencional" | "solo_jugar" | "";
  isAdult: boolean;
  consent: boolean;
}

export function FormScreen() {
  const {
    selectedVehicle,
    currentScore,
    driverProfile,
    setScreen,
    submitForm,
    formSubmitted,
    user,
    selectedCompany,
  } = useGameStore();

  const [formData, setFormData] = useState<FormData>({
    telefono: "",
    province: "",
    city: "",
    interest: "",
    isAdult: false,
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const accentColor = selectedVehicle?.accentColor || "#FF7800";

  useEffect(() => {
    if (formSubmitted) {
      const timer = setTimeout(() => {
        setScreen("game");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formSubmitted, setScreen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.isAdult) {
      newErrors.isAdult = "Debes confirmar que eres mayor de 18 años";
    }

    if (!formData.province) {
      newErrors.province = "Selecciona tu provincia";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Ingresa tu localidad o ciudad";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "Ingresa tu WhatsApp";
    } else if (!/^\+?[0-9\s-]{8,20}$/.test(formData.telefono)) {
      newErrors.telefono = "Ingresa un numero de WhatsApp valido";
    }

    if (!formData.interest) {
      newErrors.interest = "Selecciona una opcion";
    }

    if (!formData.consent) {
      newErrors.consent = "Debes aceptar el uso de tus datos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ref_share_id = getCookie("meucci_ref");
    const ref_channel = getCookie("meucci_ref_channel");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let session_id = localStorage.getItem("game_session_id") || "";
      let session_started_at = localStorage.getItem("game_session_started_at") || "";

      if (!session_id) {
        session_id = crypto.randomUUID();
        session_started_at = new Date().toISOString();
        localStorage.setItem("game_session_id", session_id);
        localStorage.setItem("game_session_started_at", session_started_at);
      }

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id,
          session_started_at,
          company: selectedCompany,

          ref_share_id: ref_share_id ?? "",
          ref_channel: ref_channel ?? "",

          telefono: formData.telefono,
          province: formData.province,
          city: formData.city,
          interest: formData.interest,
          isAdult: formData.isAdult,
          consent: formData.consent,

          nombre: user?.name || "",
          email: user?.email || "",
          googleId: user?.id || "",
          avatar: user?.avatar || "",
          vehiculoInteres: selectedVehicle?.name || "",
          vehiculoId: selectedVehicle?.id || "",
          puntajeJuego: currentScore,
          nivelConductor: driverProfile?.title || "",
        }),
      });

      if (!res.ok) {
        throw new Error("Lead submission failed");
      }
    } catch {
      // Silently handle - form still transitions to success
    }

    submitForm();

    localStorage.removeItem("game_session_id");
    localStorage.removeItem("game_session_started_at");

    setIsSubmitting(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({ ...prev, [name]: checked }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (formSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
        style={{
          background:
            "linear-gradient(170deg, #080808 0%, #0e0e0e 35%, #140a0a 60%, #0a0a0a 100%)",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5 mx-auto"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`,
              border: `2px solid ${accentColor}30`,
            }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: accentColor }} />
          </div>

          <h2
            className="font-bebas text-3xl tracking-[0.15em] mb-2"
            style={{ color: "#ece6e1" }}
          >
            +3 VIDAS DESBLOQUEADAS
          </h2>

          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Volviendo al juego...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(170deg, #080808 0%, #0e0e0e 35%, #140a0a 60%, #0a0a0a 100%)",
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${accentColor}08 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex items-center mb-6">
        <button
          onClick={() => setScreen("unlock")}
          className="p-2 rounded-full transition-colors touch-manipulation"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
          }}
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
          style={{
            background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <Unlock className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-xs tracking-[0.15em]" style={{ color: accentColor }}>
            +3 VIDAS EXTRA
          </span>
        </motion.div>

        <h1
          className="font-bebas text-3xl tracking-[0.1em] mb-1"
          style={{ color: "#ece6e1" }}
        >
          DESBLOQUEA 3 VIDAS
        </h1>
        <h2
          className="font-bebas text-3xl tracking-[0.1em]"
          style={{ color: accentColor }}
        >
          Y SEGUI COMPITIENDO
        </h2>

        {selectedVehicle && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="relative w-14 h-9">
              <Image
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs max-w-[220px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Activa 3 vidas mas y segui acumulando puntaje con tu perfil{" "}
              <span style={{ color: accentColor }}>{driverProfile?.title}</span>
            </p>
          </div>
        )}
      </motion.div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="relative z-10 flex-1 flex flex-col"
      >
        <div className="space-y-4 flex-1">
          <div>
            <label
              className="flex items-start gap-3 text-sm"
              style={{ color: "#ece6e1" }}
            >
              <input
                type="checkbox"
                name="isAdult"
                checked={formData.isAdult}
                onChange={handleCheckboxChange}
                className="mt-1"
              />
              <span>Soy mayor de 18 años</span>
            </label>
            {errors.isAdult && (
              <p className="text-xs mt-1" style={{ color: "#E63946" }}>
                {errors.isAdult}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-2 tracking-wider uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Provincia
            </label>
            <select
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className="w-full px-4 py-3.5 rounded-xl transition-all focus:outline-none text-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  errors.province
                    ? "#E63946"
                    : formData.province
                    ? `${accentColor}40`
                    : "rgba(255,255,255,0.08)"
                }`,
                color: "#ece6e1",
              }}
            >
              <option value="">Seleccionar provincia</option>
              {Object.keys(locations).map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-xs mt-1" style={{ color: "#E63946" }}>
                {errors.province}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-2 tracking-wider uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Localidad / Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Tu ciudad o localidad"
              className="w-full px-4 py-3.5 rounded-xl transition-all focus:outline-none text-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  errors.city
                    ? "#E63946"
                    : formData.city
                    ? `${accentColor}40`
                    : "rgba(255,255,255,0.08)"
                }`,
                color: "#ece6e1",
              }}
            />
            {errors.city && (
              <p className="text-xs mt-1" style={{ color: "#E63946" }}>
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-2 tracking-wider uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              WhatsApp de contacto
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="+54 3794 123456"
              className="w-full px-4 py-3.5 rounded-xl transition-all focus:outline-none text-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  errors.telefono
                    ? "#E63946"
                    : formData.telefono
                    ? `${accentColor}40`
                    : "rgba(255,255,255,0.08)"
                }`,
                color: "#ece6e1",
              }}
            />
            {errors.telefono && (
              <p className="text-xs mt-1" style={{ color: "#E63946" }}>
                {errors.telefono}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-2 tracking-wider uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ¿Que te interesa?
            </label>
            <select
              name="interest"
              value={formData.interest}
              onChange={handleInputChange}
              className="w-full px-4 py-3.5 rounded-xl transition-all focus:outline-none text-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  errors.interest
                    ? "#E63946"
                    : formData.interest
                    ? `${accentColor}40`
                    : "rgba(255,255,255,0.08)"
                }`,
                color: "#ece6e1",
              }}
            >
              <option value="">Seleccionar opcion</option>
              <option value="plan_ahorro">Plan de ahorro</option>
              <option value="convencional">Compra convencional</option>
              <option value="solo_jugar">Solo quiero seguir jugando</option>
            </select>
            {errors.interest && (
              <p className="text-xs mt-1" style={{ color: "#E63946" }}>
                {errors.interest}
              </p>
            )}
          </div>

          <div>
            <label
              className="flex items-start gap-3 text-sm leading-relaxed"
              style={{ color: "#ece6e1" }}
            >
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleCheckboxChange}
                className="mt-1"
              />
              <span>
                Acepto que Grupo Meucci utilice mis datos para contactarme sobre mi
                interes comercial, administrar mi participacion en esta experiencia y
                mejorar la campaña.
              </span>
            </label>
            {errors.consent && (
              <p className="text-xs mt-1" style={{ color: "#E63946" }}>
                {errors.consent}
              </p>
            )}
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-bebas text-base tracking-[0.15em] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 touch-manipulation relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              color: "#fff",
              boxShadow: `0 0 25px ${accentColor}25`,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>DESBLOQUEANDO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>DESBLOQUEAR 3 VIDAS</span>
              </>
            )}
          </button>

          <p
            className="text-center text-[11px] mt-4"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Desbloquea 3 vidas extra y sigue sumando puntos con tu mismo puntaje.
          </p>

          <p
            className="text-center text-[10px] tracking-wider mt-3"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            Mas de 1.200 jugadores ya desbloquearon sus vidas extra.
          </p>

          <div className="flex flex-col items-center gap-1.5 mt-5">
            <span
              className="text-[8px] tracking-[0.3em] uppercase font-medium"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Una empresa del
            </span>
            <GrupoMeucciLogo size="sm" style={{ opacity: 0.75 }} />
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
