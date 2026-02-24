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
    image: "/images/fiat-titano.png",
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
    image: "/images/fiat-toro.png",
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
    image: "/images/fiat-strada.png",
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
    image: "/images/fiat-argo.png",
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
    image: "/images/fiat-cronos.png",
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
    logo: "/images/scuderia-header-blanco.png",
    brands: ["FIAT"],
    tagline: "Concesionario oficial FIAT",
    accentColor: "#AA2222",
  },
  {
    id: "dallas",
    name: "Dallas",
    logo: "/images/dallas-logo.png",
    brands: ["JEEP", "RAM"],
    tagline: "Concesionario oficial JEEP & RAM",
    accentColor: "#1B6B3A",
  },
  {
    id: "alliance",
    name: "Alliance",
    logo: "/images/alliance-logo.png",
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
    image: "/images/jeep-compass.png",
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
    image: "/images/jeep-renegade.png",
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
    image: "/images/ram-dakota.png",
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
    image: "/images/citroen-c3.png",
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
    image: "/images/citroen-basalt.png",
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
