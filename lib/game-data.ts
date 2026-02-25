export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  image: string;
  speed: number;
  handling: number;
  boost: number;
  accentColor: string;
  category: string;
  features: string[];
}

export const vehicles: Vehicle[] = [
  {
    id: "titano",
    name: "TITANO",
    brand: "FIAT",
    tagline: "Fuerza que impone",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TITANO%20FIAT-BAUPBpy6Q3son7aL1ZIu867tpe2T6Y.png",
    speed: 4,
    handling: 4,
    boost: 5,
    accentColor: "#FF7800",
    category: "Pickup",
    features: [
      "Motor Turbo Diesel",
      "Traccion 4x4",
      "Caja Automatica 6AT",
      "Pantalla 10.1\"",
      "Asistente de partida",
      "Control de traccion",
    ],
  },
  {
    id: "toro",
    name: "TORO",
    brand: "FIAT",
    tagline: "Potencia sin limites",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TORO%20FIAT-lbx90RELR4GHRdOGwbUYXuGIz2m53T.png",
    speed: 4,
    handling: 4,
    boost: 4,
    accentColor: "#00B4D8",
    category: "Pickup",
    features: [
      "Motor Turbo Diesel 2.0",
      "Traccion 4x4",
      "Caja Automatica 9AT",
      "Pantalla 10.1\"",
      "Frenado autonomo",
      "Carga util 1 tonelada",
    ],
  },
  {
    id: "strada",
    name: "STRADA",
    brand: "FIAT",
    tagline: "Versatilidad total",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Strada-Freedom-CD-NegroVulcano-Jd34xWhJB74HgR0y5oCshsc38lGXfV.png",
    speed: 3,
    handling: 4,
    boost: 3,
    accentColor: "#E63946",
    category: "Pickup Compacta",
    features: [
      "Motor Firefly 1.3",
      "Cabina doble",
      "Caja util mas grande",
      "Pantalla 7\"",
      "Aire acondicionado",
      "Direccion asistida",
    ],
  },
  {
    id: "argo",
    name: "ARGO",
    brand: "FIAT",
    tagline: "Energia en movimiento",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARGO%20FIAT-TDe55TOfMxKaOp3hqCeXuuNQIvVlpM.png",
    speed: 3,
    handling: 5,
    boost: 3,
    accentColor: "#7B2D8E",
    category: "Hatchback",
    features: [
      "Motor Firefly 1.3",
      "Pantalla 7\"",
      "Conectividad wireless",
      "6 airbags",
      "Control de estabilidad",
      "Sensor de estacionamiento",
    ],
  },
  {
    id: "cronos",
    name: "CRONOS",
    brand: "FIAT",
    tagline: "Elegancia urbana",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CRONOS%20FIAT-JIPPX60NApAANqdyt9D0VHqBKD06Yf.png",
    speed: 3,
    handling: 4,
    boost: 3,
    accentColor: "#2D6A4F",
    category: "Sedan",
    features: [
      "Motor Firefly 1.3",
      "Baul 525 litros",
      "Pantalla 7\"",
      "Conectividad wireless",
      "4 airbags",
      "Alarma perimetral",
    ],
  },
];

/* ---- Grupo Meucci companies ---- */
export type CompanyId = "scuderia" | "dallas" | "alliance";

export interface Company {
  id: CompanyId;
  name: string;
  logo: string;          // black on white / transparent
  brands: string[];
  tagline: string;
  accentColor: string;
}

export const companies: Company[] = [
  {
    id: "scuderia",
    name: "Scuderia",
    logo: "", // TODO: Add logo image when available
    brands: ["FIAT"],
    tagline: "Concesionario oficial FIAT",
    accentColor: "#AA2222",
  },
  {
    id: "dallas",
    name: "Dallas",
    logo: "", // TODO: Add logo image when available
    brands: ["JEEP", "RAM"],
    tagline: "Concesionario oficial JEEP & RAM",
    accentColor: "#1B6B3A",
  },
  {
    id: "alliance",
    name: "Alliance",
    logo: "", // TODO: Add logo image when available
    brands: ["CITROEN"],
    tagline: "Concesionario oficial CITROEN",
    accentColor: "#1A3C8A",
  },
];

/* Dallas vehicles (JEEP + RAM) */
export const dallasVehicles: Vehicle[] = [
  {
    id: "compass",
    name: "COMPASS",
    brand: "JEEP",
    tagline: "Aventura sin limites",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COMPASS%20JEEP-gkV9IltXdxkumZurwvENqxmproGTQe.png",
    speed: 4,
    handling: 4,
    boost: 4,
    accentColor: "#1B6B3A",
    category: "SUV",
    features: [
      "Motor Turbo Flex 1.3",
      "Traccion 4x4",
      "Pantalla 10.1\"",
      "Caja automatica 6AT",
      "Frenado autonomo",
      "Alerta de punto ciego",
    ],
  },
  {
    id: "renegade",
    name: "RENEGADE",
    brand: "JEEP",
    tagline: "Espiritu libre",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/renegade%20JEEP-bmUEDrmwOfFq8QH9GxavdUZGpVkZqK.png",
    speed: 3,
    handling: 5,
    boost: 3,
    accentColor: "#2D8B5A",
    category: "SUV Compacto",
    features: [
      "Motor Firefly 1.3",
      "Diseno iconico",
      "Pantalla 7\"",
      "Conectividad Uconnect",
      "6 airbags",
      "Control de estabilidad",
    ],
  },
  {
    id: "dakota",
    name: "DAKOTA",
    brand: "RAM",
    tagline: "Poder y presencia",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DAKOTA%20IMAGEN-MInHWYoS7XRBmau4wtRtZjie9eKN7b.png",
    speed: 5,
    handling: 3,
    boost: 5,
    accentColor: "#B91C1C",
    category: "Pickup Full-Size",
    features: [
      "Motor Turbo Diesel 2.0",
      "Traccion 4x4",
      "Caja automatica 9AT",
      "Pantalla 10.1\"",
      "Carga util 1.1 ton",
      "Suspension reforzada",
    ],
  },
];

/* Alliance vehicles (CITROEN) */
export const allianceVehicles: Vehicle[] = [
  {
    id: "c3",
    name: "C3",
    brand: "CITROEN",
    tagline: "Diseno que inspira",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/C3%20CITROEN-5YYPqgzhIUjipgkJPgGzXrVFNZ0iAy.png",
    speed: 3,
    handling: 4,
    boost: 3,
    accentColor: "#1A3C8A",
    category: "Hatchback",
    features: [
      "Motor 1.2 PureTech",
      "Pantalla tactil 10\"",
      "Conectividad inalambrica",
      "6 airbags",
      "Suspension Comfort",
      "Diseno bicolor",
    ],
  },
  {
    id: "basalt",
    name: "BASALT",
    brand: "CITROEN",
    tagline: "Elegancia SUV",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BASALT%20CITROEN-GcmoRTBJqf6uxFHRLIk34PfD1QNlB4.png",
    speed: 3,
    handling: 4,
    boost: 4,
    accentColor: "#2C5FC2",
    category: "SUV Coupe",
    features: [
      "Motor 1.0 Turbo",
      "Diseno coupe",
      "Pantalla 10.25\"",
      "Control crucero adaptativo",
      "Camara 360",
      "Caja automatica CVT",
    ],
  },
];

export function getVehiclesByCompany(companyId: CompanyId): Vehicle[] {
  switch (companyId) {
    case "scuderia": return vehicles;
    case "dallas": return dallasVehicles;
    case "alliance": return allianceVehicles;
    default: return vehicles;
  }
}

// Keep backward compat - default vehicle
export const vehicle = vehicles[0];
