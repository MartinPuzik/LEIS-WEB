"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import styles from "./realsim.module.css";

type FeedState = "LOADING" | "LIVE" | "SNAPSHOT" | "PARTIAL" | "STALE" | "UNAVAILABLE";

type WeatherSample = {
  lat: number;
  lon: number;
  temperature: number;
  cloud: number;
  precipitation: number;
  weatherCode: number;
  wind: number;
  windDirection: number;
  gust: number;
  jetWind: number;
  jetDirection: number;
  observedAt: string | null;
};

type SceneBridge = {
  updateWeather: (samples: WeatherSample[]) => void;
  focus: (lat: number, lon: number) => void;
  reset: () => void;
  setMotion: (active: boolean) => void;
  setLayers: (layers: LayerState) => void;
};

type LayerState = {
  clouds: boolean;
  surface: boolean;
  jet: boolean;
};

type ParticleFlow = {
  positions: THREE.BufferAttribute;
  starts: THREE.Vector3[];
  ends: THREE.Vector3[];
  phases: Float32Array;
  speeds: Float32Array;
  radius: number;
  base: number;
  rate: number;
};

type WeatherMeta = {
  providerLabel: string;
  providerUrl: string;
  gridCount: number;
  sourceCellCount: number;
  spatialMethod: string;
  jetAvailable: boolean;
};

type LeisInstance = {
  id: string;
  label: string;
  area: string;
  country: string;
  role: string;
  status: "ACTIVE";
  evidence: "SELF_DECLARED";
  approximate: true;
  lat: number;
  lon: number;
};

type SimLanguage = "cs" | "en" | "de" | "fr" | "es";

type StarshipSiteModel = {
  group: THREE.Group;
  engineGlow: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  engineLight: THREE.PointLight;
};

type CzechFlagModel = {
  group: THREE.Group;
  flagPositions: THREE.BufferAttribute;
  basePositions: Float32Array;
};

type LaunchSite = {
  id: string;
  rocket: string;
  agency: string;
  site: string;
  lat: number;
  lon: number;
};

const windLatitudes = [-70, -50, -30, -10, 10, 30, 50, 70];
const windLongitudes = Array.from({ length: 18 }, (_, index) => -170 + index * 20);
const windSites = windLatitudes.flatMap((lat) => windLongitudes.map((lon) => ({ lat, lon })));
const weatherUrl = "/api/realsim-weather";
const weatherCacheKey = "leis-realsim-weather-v1";
const defaultWeatherMeta: WeatherMeta = {
  providerLabel: "Weather snapshot waiting",
  providerUrl: "https://open-meteo.com/en/docs",
  gridCount: windSites.length,
  sourceCellCount: 0,
  spatialMethod: "waiting",
  jetAvailable: true,
};
const leisInstances: LeisInstance[] = [{
  id: "LEIS-CREATOR-CZ-001",
  label: "Martin Pužík",
  area: "Czechia",
  country: "CZ",
  role: "Creator node",
  status: "ACTIVE",
  evidence: "SELF_DECLARED",
  approximate: true,
  lat: 49.82,
  lon: 15.47,
}];
const starbaseSite = {
  label: "Starbase / Starship V3",
  area: "Cameron County, Texas",
  lat: 25.997,
  lon: -97.157,
  source: "https://www.spacex.com/launches/starship-flight-12",
};
const launchSites: LaunchSite[] = [
  { id: "SLS-KSC-39B", rocket: "SLS", agency: "NASA", site: "Kennedy LC-39B", lat: 28.627, lon: -80.621 },
  { id: "ELECTRON-MAHIA", rocket: "Electron", agency: "Rocket Lab", site: "Māhia LC-1", lat: -39.2615, lon: 177.8649 },
  { id: "VULCAN-SLC41", rocket: "Vulcan Centaur", agency: "ULA", site: "Cape Canaveral SLC-41", lat: 28.583, lon: -80.583 },
  { id: "SOYUZ-BAIKONUR", rocket: "Soyuz-2", agency: "Roscosmos", site: "Baikonur 31/6", lat: 45.996, lon: 63.564 },
  { id: "LONG-MARCH-JIUQUAN", rocket: "Long March", agency: "CASC", site: "Jiuquan", lat: 40.9606, lon: 100.2983 },
  { id: "H3-TANEGASHIMA", rocket: "H3", agency: "JAXA", site: "Tanegashima LA-Y2", lat: 30.4009, lon: 130.9763 },
  { id: "ISRO-SRIHARIKOTA", rocket: "LVM3 / PSLV", agency: "ISRO", site: "Sriharikota", lat: 13.733, lon: 80.235 },
  { id: "ESA-KOUROU", rocket: "Ariane 6 / Vega-C", agency: "ESA", site: "Kourou", lat: 5.236, lon: -52.775 },
];
const spaceportCopy: Record<SimLanguage, { eyebrow: string; status: string; description: string; boundary: string }> = {
  cs: {
    eyebrow: "SPACEPORT 01",
    status: "IDLE · BEZ STARTU",
    description: "Starship V3 a Super Heavy V3 stojí na schematické rampě; viditelný je pouze klidový motorový žár.",
    boundary: "SCHEMATIC · BEZ LIVE TELEMETRIE",
  },
  en: {
    eyebrow: "SPACEPORT 01",
    status: "IDLE · NO LAUNCH",
    description: "Starship V3 and Super Heavy V3 stand on a schematic pad; only an idle engine glow is shown.",
    boundary: "SCHEMATIC · NO LIVE TELEMETRY",
  },
  de: {
    eyebrow: "RAUMHAFEN 01",
    status: "LEERLAUF · KEIN START",
    description: "Starship V3 und Super Heavy V3 stehen auf einer schematischen Rampe; sichtbar ist nur ein ruhiges Triebwerksglühen.",
    boundary: "SCHEMATISCH · KEINE LIVE-TELEMETRIE",
  },
  fr: {
    eyebrow: "PORT SPATIAL 01",
    status: "VEILLE · AUCUN LANCEMENT",
    description: "Starship V3 et Super Heavy V3 reposent sur un pas de tir schématique; seule une faible lueur moteur est affichée.",
    boundary: "SCHÉMATIQUE · AUCUNE TÉLÉMÉTRIE EN DIRECT",
  },
  es: {
    eyebrow: "PUERTO ESPACIAL 01",
    status: "EN REPOSO · SIN LANZAMIENTO",
    description: "Starship V3 y Super Heavy V3 permanecen en una plataforma esquemática; solo se muestra un tenue brillo de motor.",
    boundary: "ESQUEMÁTICO · SIN TELEMETRÍA EN VIVO",
  },
};

function vectorAt(lat: number, lon: number, radius = 1) {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.sin(lambda),
  );
}

function destination(lat: number, lon: number, sourceDirection: number, distanceDegrees: number) {
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lon * Math.PI) / 180;
  const bearing = (((sourceDirection + 180) % 360) * Math.PI) / 180;
  const delta = (distanceDegrees * Math.PI) / 180;
  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(bearing),
  );
  const lambda2 = lambda1 + Math.atan2(
    Math.sin(bearing) * Math.sin(delta) * Math.cos(phi1),
    Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2),
  );
  return { lat: (phi2 * 180) / Math.PI, lon: ((((lambda2 * 180) / Math.PI) + 540) % 360) - 180 };
}

function windColour(speed: number) {
  if (speed >= 60) return new THREE.Color(0xff7b64);
  if (speed >= 40) return new THREE.Color(0xffd166);
  if (speed >= 20) return new THREE.Color(0x76f0ad);
  return new THREE.Color(0x6cdcf5);
}

function weatherColour(sample: WeatherSample) {
  if (sample.weatherCode >= 95 || sample.gust >= 85) return new THREE.Color(0xd58aff);
  if (sample.precipitation > 0 || sample.weatherCode >= 51) return new THREE.Color(0x69aef8);
  if (sample.cloud >= 70) return new THREE.Color(0xd3e8ed);
  if (sample.temperature >= 30) return new THREE.Color(0xffb06e);
  return new THREE.Color(0x89cfd7);
}

function pointTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,.92)");
    gradient.addColorStop(0.55, "rgba(255,255,255,.26)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function czechFlagTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 240;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height / 2);
    context.fillStyle = "#d7141a";
    context.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    context.fillStyle = "#11457e";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width * 0.5, canvas.height / 2);
    context.lineTo(0, canvas.height);
    context.closePath();
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function labelTexture(title: string, subtitle: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(2, 15, 24, .88)";
    context.beginPath();
    context.roundRect(4, 4, 504, 120, 20);
    context.fill();
    context.strokeStyle = "rgba(103, 238, 234, .55)";
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = "#f4fbff";
    context.font = "600 30px Arial";
    context.fillText(title, 24, 52);
    context.fillStyle = "#83cbd3";
    context.font = "22px Arial";
    context.fillText(subtitle, 24, 91);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCzechFlagMarker(): CzechFlagModel {
  const group = new THREE.Group();
  group.name = "LEIS_CZ_Flag_Pole";
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.004, 0.19, 12),
    new THREE.MeshStandardMaterial({ color: 0xb9c6ca, metalness: 0.8, roughness: 0.3 }),
  );
  pole.position.y = 0.095;
  group.add(pole);
  const geometry = new THREE.PlaneGeometry(0.115, 0.068, 14, 4);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const basePositions = new Float32Array(position.array as ArrayLike<number>);
  const flag = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    map: czechFlagTexture(),
    side: THREE.DoubleSide,
    roughness: 0.64,
    metalness: 0.02,
  }));
  flag.position.set(0.058, 0.151, 0);
  group.add(flag);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: labelTexture("CZ · LEIS", "Martin Pužík · creator node"),
    transparent: true,
    depthTest: true,
    depthWrite: false,
  }));
  label.position.set(0.09, 0.225, 0);
  label.scale.set(0.24, 0.06, 1);
  group.add(label);
  return { group, flagPositions: position, basePositions };
}

function createLaunchMarker(site: LaunchSite) {
  const group = new THREE.Group();
  group.name = `Launch_${site.id}`;
  group.userData = { site, evidence: "SCHEMATIC_CATALOGUE", telemetry: false };
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.021, 0.005, 18),
    new THREE.MeshStandardMaterial({ color: 0x28343c, metalness: 0.58, roughness: 0.6 }),
  );
  pad.position.y = 0.0025;
  group.add(pad);
  const rocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.006, 0.06, 14),
    new THREE.MeshStandardMaterial({ color: 0xdce6ea, metalness: 0.62, roughness: 0.34 }),
  );
  rocket.position.y = 0.034;
  group.add(rocket);
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.0045, 0.018, 14),
    new THREE.MeshStandardMaterial({ color: 0xf0f5f7, metalness: 0.45, roughness: 0.36 }),
  );
  nose.position.y = 0.073;
  group.add(nose);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: labelTexture(site.rocket, site.site),
    transparent: true,
    depthTest: true,
    depthWrite: false,
  }));
  label.position.set(0.07, 0.11, 0);
  label.scale.set(0.19, 0.0475, 1);
  group.add(label);
  return group;
}

function createStarshipSite(): StarshipSiteModel {
  const group = new THREE.Group();
  group.name = "Starbase_Starship_V3_Schematic";
  group.userData = { evidence: "SCHEMATIC", telemetry: false, launchState: "IDLE" };

  const steel = new THREE.MeshStandardMaterial({ color: 0xc5cbd0, metalness: 0.88, roughness: 0.29 });
  const heatShield = new THREE.MeshStandardMaterial({ color: 0x171b20, metalness: 0.2, roughness: 0.72 });
  const towerMaterial = new THREE.MeshStandardMaterial({ color: 0x59636c, metalness: 0.72, roughness: 0.5 });
  const padMaterial = new THREE.MeshStandardMaterial({ color: 0x20262b, metalness: 0.45, roughness: 0.75 });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.052, 0.012, 32), padMaterial);
  pad.position.y = 0.006;
  group.add(pad);

  const padRing = new THREE.Mesh(
    new THREE.RingGeometry(0.054, 0.061, 40),
    new THREE.MeshBasicMaterial({ color: 0x58dce8, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.y = 0.004;
  group.add(padRing);

  const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0145, 0.105, 24), steel);
  booster.position.y = 0.068;
  group.add(booster);

  const hotStage = new THREE.Mesh(new THREE.CylinderGeometry(0.0132, 0.0132, 0.011, 24), heatShield);
  hotStage.position.y = 0.126;
  group.add(hotStage);

  const ship = new THREE.Mesh(new THREE.CylinderGeometry(0.0117, 0.0124, 0.061, 24), steel);
  ship.position.y = 0.162;
  group.add(ship);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.0117, 0.035, 24), steel);
  nose.position.y = 0.21;
  group.add(nose);

  [-1, 1].forEach((side) => {
    const boosterFin = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.024, 0.003), heatShield);
    boosterFin.position.set(side * 0.015, 0.031, 0);
    boosterFin.rotation.z = side * 0.18;
    group.add(boosterFin);
    const shipFlap = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.024, 0.0025), heatShield);
    shipFlap.position.set(side * 0.013, 0.151, 0);
    shipFlap.rotation.z = side * 0.2;
    group.add(shipFlap);
  });

  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.205, 0.014), towerMaterial);
  tower.position.set(-0.052, 0.108, 0);
  group.add(tower);
  [0.065, 0.112, 0.158, 0.202].forEach((height) => {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.004, 0.006), towerMaterial);
    brace.position.set(-0.03, height, 0);
    group.add(brace);
  });

  const engineGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.017, 20, 14),
    new THREE.MeshBasicMaterial({ color: 0xff9c52, transparent: true, opacity: 0.36, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  engineGlow.position.y = 0.018;
  engineGlow.scale.set(1, 0.35, 1);
  group.add(engineGlow);
  const engineLight = new THREE.PointLight(0xff7a38, 0.34, 0.18, 2);
  engineLight.position.y = 0.022;
  group.add(engineLight);

  return { group, engineGlow, engineLight };
}

function cloudFieldTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 768;
  const context = canvas.getContext("2d", { alpha: true });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const smoothstep = (edge0: number, edge1: number, value: number) => {
    const unit = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return unit * unit * (3 - 2 * unit);
  };

  const update = (samples: WeatherSample[]) => {
    if (!context || !samples.length) return;
    const byCoordinate = new Map(samples.map((sample) => [`${sample.lat}:${sample.lon}`, sample]));
    const image = context.createImageData(canvas.width, canvas.height);

    const sampleAt = (row: number, column: number) => byCoordinate.get(
      `${windLatitudes[Math.max(0, Math.min(windLatitudes.length - 1, row))]}:${windLongitudes[((column % windLongitudes.length) + windLongitudes.length) % windLongitudes.length]}`,
    ) ?? samples[0];

    for (let y = 0; y < canvas.height; y += 1) {
      const lat = 90 - (y / (canvas.height - 1)) * 180;
      const latPosition = THREE.MathUtils.clamp((lat + 70) / 20, 0, windLatitudes.length - 1);
      const row0 = Math.floor(latPosition);
      const row1 = Math.min(windLatitudes.length - 1, row0 + 1);
      const latBlend = latPosition - row0;
      const poleFade = smoothstep(0, 18, 90 - Math.abs(lat));

      for (let x = 0; x < canvas.width - 1; x += 1) {
        const lon = -180 + (x / (canvas.width - 1)) * 360;
        const longitudePosition = (((lon + 170) / 20) % windLongitudes.length + windLongitudes.length) % windLongitudes.length;
        const column0 = Math.floor(longitudePosition);
        const column1 = (column0 + 1) % windLongitudes.length;
        const lonBlend = longitudePosition - column0;

        const s00 = sampleAt(row0, column0);
        const s10 = sampleAt(row0, column1);
        const s01 = sampleAt(row1, column0);
        const s11 = sampleAt(row1, column1);
        const interpolate = (key: "cloud" | "precipitation") => {
          const lower = THREE.MathUtils.lerp(s00[key], s10[key], lonBlend);
          const upper = THREE.MathUtils.lerp(s01[key], s11[key], lonBlend);
          return THREE.MathUtils.lerp(lower, upper, latBlend);
        };

        const cover = interpolate("cloud") / 100;
        const precipitation = interpolate("precipitation");
        // A deterministic multi-scale mask gives the coarse 20-degree model
        // field cloud-like edges without pretending to add measured detail.
        const theta = (lon * Math.PI) / 180;
        const phi = (lat * Math.PI) / 180;
        // Integer longitudinal harmonics meet exactly at -180/+180 and
        // preserve a seamless wrap. Detail remains a deterministic visual
        // interpretation of the coarse model field, not measured cloud shape.
        const waveA = Math.sin(theta * 3 + Math.sin(phi * 2) * 2.4);
        const waveB = Math.sin(theta * 7 - phi * 4 + Math.sin(theta * 2) * 1.7);
        const waveC = Math.cos(theta * 11 + phi * 6 + Math.sin(phi * 3));
        const waveD = Math.sin(theta * 19 - phi * 9 + Math.cos(theta * 5));
        const structure = 0.5 + waveA * 0.19 + waveB * 0.15 + waveC * 0.1 + waveD * 0.06;
        const density = cover * 1.3 + (structure - 0.5) * 1.05 - 0.47;
        const opacity = Math.pow(smoothstep(0.025, 0.57, density), 0.82) * poleFade;
        const edgeSoftness = 0.74 + opacity * 0.26;
        const stormShade = Math.min(32, precipitation * 18);
        const offset = (y * canvas.width + x) * 4;
        image.data[offset] = Math.round((225 - stormShade) * edgeSoftness);
        image.data[offset + 1] = Math.round((239 - stormShade * 0.65) * edgeSoftness);
        image.data[offset + 2] = Math.round((246 - stormShade * 0.35) * edgeSoftness);
        image.data[offset + 3] = Math.round(opacity * 238);
      }
      const first = (y * canvas.width) * 4;
      const last = (y * canvas.width + canvas.width - 1) * 4;
      image.data[last] = image.data[first];
      image.data[last + 1] = image.data[first + 1];
      image.data[last + 2] = image.data[first + 2];
      image.data[last + 3] = image.data[first + 3];
    }

    context.putImageData(image, 0, 0);
    texture.needsUpdate = true;
  };

  return { texture, update };
}

function compass(direction: number) {
  const names = ["S", "SV", "V", "JV", "J", "JZ", "Z", "SZ"];
  return names[Math.round((((direction % 360) + 360) % 360) / 45) % 8];
}

function sampleDistance(a: WeatherSample, lat: number, lon: number) {
  const lonGap = Math.min(Math.abs(a.lon - lon), 360 - Math.abs(a.lon - lon));
  return Math.hypot(a.lat - lat, lonGap * Math.cos((lat * Math.PI) / 180));
}

export default function RealSimEarth() {
  const mountRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<SceneBridge | null>(null);
  const samplesRef = useRef<WeatherSample[]>([]);
  const motionRef = useRef(true);
  const [feedState, setFeedState] = useState<FeedState>("LOADING");
  const [samples, setSamples] = useState<WeatherSample[]>([]);
  const [selected, setSelected] = useState<WeatherSample | null>(null);
  const [motion, setMotion] = useState(true);
  const [layers, setLayers] = useState<LayerState>({ clouds: true, surface: true, jet: true });
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [weatherMeta, setWeatherMeta] = useState<WeatherMeta>(defaultWeatherMeta);
  const [language, setLanguage] = useState<SimLanguage>("cs");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang")?.toLowerCase();
    if (requested === "en" || requested === "de" || requested === "fr" || requested === "es" || requested === "cs") {
      setLanguage(requested);
    }
  }, []);

  const refreshWeather = useCallback(async () => {
    setFeedState((current) => samplesRef.current.length ? "STALE" : current === "UNAVAILABLE" ? "LOADING" : current);
    const accept = (next: WeatherSample[], state: FeedState, refreshed: string, meta: WeatherMeta) => {
      samplesRef.current = next;
      setSamples(next);
      setFeedState(state);
      setRefreshedAt(refreshed);
      setWeatherMeta(meta);
      if (!meta.jetAvailable) {
        setLayers((current) => {
          const nextLayers = { ...current, jet: false };
          bridgeRef.current?.setLayers(nextLayers);
          return nextLayers;
        });
      }
      bridgeRef.current?.updateWeather(next);
      setSelected((current) => current
        ? [...next].sort((a, b) => sampleDistance(a, current.lat, current.lon) - sampleDistance(b, current.lat, current.lon))[0]
        : [...next].sort((a, b) => b.gust - a.gust)[0]);
    };
    try {
      const response = await fetch(weatherUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Weather snapshot ${response.status}`);
      const payload = await response.json();
      const next = Array.isArray(payload?.samples) ? payload.samples as WeatherSample[] : [];
      if (!next.length) throw new Error("Weather snapshot returned no samples");
      const headerState = response.headers.get("X-LEIS-Weather") || payload.delivery_state;
      const state: FeedState = ["LIVE", "SNAPSHOT", "PARTIAL", "STALE"].includes(headerState) ? headerState : "PARTIAL";
      const refreshed = String(payload.refreshed_at || new Date().toISOString());
      const meta: WeatherMeta = {
        providerLabel: String(payload.provider_label || "Weather snapshot"),
        providerUrl: String(payload.provider_url || "https://open-meteo.com/en/docs"),
        gridCount: Number(payload.grid_count || next.length),
        sourceCellCount: Number(payload.source_cell_count || next.length),
        spatialMethod: String(payload.spatial_method || "unknown"),
        jetAvailable: payload.jet_available !== false,
      };
      window.localStorage.setItem(weatherCacheKey, JSON.stringify({ savedAt: refreshed, samples: next, meta }));
      accept(next, state, refreshed, meta);
    } catch {
      if (samplesRef.current.length) {
        setFeedState("STALE");
        return;
      }
      try {
        const stored = JSON.parse(window.localStorage.getItem(weatherCacheKey) || "null") as { savedAt?: string; samples?: WeatherSample[]; meta?: WeatherMeta } | null;
        const cached = Array.isArray(stored?.samples)
          ? stored.samples.filter((sample) => Number.isFinite(sample.lat) && Number.isFinite(sample.lon) && Number.isFinite(sample.wind))
          : [];
        if (cached.length) {
          accept(cached, "STALE", stored?.savedAt || new Date().toISOString(), stored?.meta || defaultWeatherMeta);
          return;
        }
      } catch {
        // A malformed browser cache is ignored; no fabricated weather is substituted.
      }
      setFeedState("UNAVAILABLE");
    }
  }, []);

  useEffect(() => {
    if (!samples.length || !refreshedAt) return;
    window.localStorage.setItem(weatherCacheKey, JSON.stringify({ savedAt: refreshedAt, samples, meta: weatherMeta }));
  }, [samples, refreshedAt, weatherMeta]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02070d, 0.035);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 60);
    camera.position.set(0.05, 0.2, 3.22);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-label", "Interaktivní 3D Země s animovaným modelovým prouděním počasí");
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 1.65;
    controls.maxDistance = 5.2;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.38;
    controls.rotateSpeed = 0.42;
    controls.zoomSpeed = 0.72;

    const earthGroup = new THREE.Group();
    earthGroup.rotation.y = -0.23;
    scene.add(earthGroup);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load("/earth-blue-marble-august.jpg");
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;
    earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
    earthTexture.magFilter = THREE.LinearFilter;
    earthTexture.offset.x = 0.5 / 21600;
    earthTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const earthGeometry = new THREE.SphereGeometry(1, 96, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.91,
      metalness: 0.02,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    const instanceGroup = new THREE.Group();
    earthGroup.add(instanceGroup);
    const czechFlag = createCzechFlagMarker();
    leisInstances.forEach((instance) => {
      const surface = vectorAt(instance.lat, instance.lon, 1.006);
      czechFlag.group.position.copy(surface);
      czechFlag.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surface.clone().normalize());
      czechFlag.group.scale.setScalar(0.72);
      czechFlag.group.userData.instanceId = instance.id;
      instanceGroup.add(czechFlag.group);
    });

    const starshipSite = createStarshipSite();
    const starbaseSurface = vectorAt(starbaseSite.lat, starbaseSite.lon, 1.006);
    starshipSite.group.position.copy(starbaseSurface);
    starshipSite.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), starbaseSurface.clone().normalize());
    starshipSite.group.scale.setScalar(0.82);
    starshipSite.group.renderOrder = 9;
    earthGroup.add(starshipSite.group);

    const launchSiteGroup = new THREE.Group();
    launchSiteGroup.name = "Launch_Site_Catalogue";
    launchSiteGroup.userData = { evidence: "SCHEMATIC_CATALOGUE", telemetry: false };
    launchSites.forEach((site) => {
      const marker = createLaunchMarker(site);
      const surface = vectorAt(site.lat, site.lon, 1.006);
      marker.position.copy(surface);
      marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surface.clone().normalize());
      marker.scale.setScalar(0.72);
      launchSiteGroup.add(marker);
    });
    earthGroup.add(launchSiteGroup);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.075, 96, 64),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            float rim = pow(0.72 - dot(vNormal, normalize(-vPositionNormal)), 2.35);
            gl_FragColor = vec4(0.12, 0.66, 1.0, rim * 0.92);
          }
        `,
      }),
    );
    earthGroup.add(atmosphere);

    scene.add(new THREE.HemisphereLight(0x88bfe2, 0x06111f, 0.72));
    const sun = new THREE.DirectionalLight(0xfff3db, 2.45);
    sun.position.set(-3.8, 1.9, 4.2);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x55bff5, 0.9);
    rim.position.set(3, -1, -3);
    scene.add(rim);

    const glowTexture = pointTexture();
    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffb35c,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sunSprite.position.set(-4.2, 2.15, 2.2);
    sunSprite.scale.set(1.2, 1.2, 1.2);
    scene.add(sunSprite);

    const starPositions: number[] = [];
    for (let index = 0; index < 900; index += 1) {
      const radius = 6 + ((index * 17) % 100) / 8;
      const theta = index * 2.399963;
      const y = 1 - (2 * (index + 0.5)) / 900;
      const ring = Math.sqrt(1 - y * y);
      starPositions.push(Math.cos(theta) * ring * radius, y * radius, Math.sin(theta) * ring * radius);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: 0xb9d9f5,
      size: 0.012,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }));
    scene.add(stars);

    const cloudField = cloudFieldTexture();
    const cloudShadowMaterial = new THREE.MeshBasicMaterial({
      map: cloudField.texture,
      color: 0x5b7585,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      alphaTest: 0.008,
    });
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudField.texture,
      color: 0xf4fbff,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
      alphaTest: 0.006,
      shininess: 8,
    });
    const cloudVeilMaterial = new THREE.MeshBasicMaterial({
      map: cloudField.texture,
      color: 0xcfe8f2,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
      alphaTest: 0.012,
    });
    const cloudShadow = new THREE.Mesh(new THREE.SphereGeometry(1.009, 96, 64), cloudShadowMaterial);
    const cloudShell = new THREE.Mesh(new THREE.SphereGeometry(1.026, 96, 64), cloudMaterial);
    const cloudVeil = new THREE.Mesh(new THREE.SphereGeometry(1.034, 96, 64), cloudVeilMaterial);
    cloudShadow.renderOrder = 1;
    cloudShell.renderOrder = 2;
    cloudVeil.renderOrder = 3;
    earthGroup.add(cloudShadow, cloudShell, cloudVeil);

    const weatherGroup = new THREE.Group();
    earthGroup.add(weatherGroup);
    let windPoints: THREE.Points | null = null;
    let windLines: THREE.LineSegments | null = null;
    let jetPoints: THREE.Points | null = null;
    let jetLines: THREE.LineSegments | null = null;
    let weatherPoints: THREE.Points | null = null;
    let surfaceFlow: ParticleFlow | null = null;
    let jetFlow: ParticleFlow | null = null;
    let dominantFlowMeshes: THREE.Mesh[] = [];
    let dominantFlowMaterials: THREE.MeshBasicMaterial[] = [];
    let layerState: LayerState = { clouds: true, surface: true, jet: true };

    const applyLayerVisibility = () => {
      cloudShadow.visible = layerState.clouds;
      cloudShell.visible = layerState.clouds;
      cloudVeil.visible = layerState.clouds;
      [windPoints, windLines, weatherPoints].forEach((object) => {
        if (object) object.visible = layerState.surface;
      });
      [jetPoints, jetLines].forEach((object) => {
        if (object) object.visible = layerState.jet;
      });
      dominantFlowMeshes.forEach((mesh) => {
        mesh.visible = layerState.jet;
      });
    };

    const clearWeather = () => {
      [windPoints, windLines, jetPoints, jetLines, weatherPoints].forEach((object) => {
        if (!object) return;
        weatherGroup.remove(object);
        object.geometry.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material.dispose();
      });
      dominantFlowMeshes.forEach((mesh) => {
        weatherGroup.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      windPoints = null;
      windLines = null;
      jetPoints = null;
      jetLines = null;
      weatherPoints = null;
      surfaceFlow = null;
      jetFlow = null;
      dominantFlowMeshes = [];
      dominantFlowMaterials = [];
    };

    const updateWeather = (next: WeatherSample[]) => {
      clearWeather();
      cloudField.update(next);
      const trailPositions: number[] = [];
      const trailColours: number[] = [];
      const jetTrailPositions: number[] = [];
      const jetTrailColours: number[] = [];
      const markerPositions: number[] = [];
      const markerColours: number[] = [];
      const surfaceStarts: THREE.Vector3[] = [];
      const surfaceEnds: THREE.Vector3[] = [];
      const jetStarts: THREE.Vector3[] = [];
      const jetEnds: THREE.Vector3[] = [];
      // Dense, tiny moving particles replace the old coarse helper vectors.
      // Their paths are advected along the sampled wind direction; no static
      // arrows, giant tubes or cell markers are exposed to visitors.
      const surfaceParticlesPerSample = 34;
      const jetParticlesPerSample = 22;
      const surfacePhases = new Float32Array(next.length * surfaceParticlesPerSample);
      const surfaceSpeeds = new Float32Array(next.length * surfaceParticlesPerSample);
      const surfaceParticlePositions = new Float32Array(next.length * surfaceParticlesPerSample * 3);
      const surfaceParticleColours = new Float32Array(next.length * surfaceParticlesPerSample * 3);
      const jetPhases = new Float32Array(next.length * jetParticlesPerSample);
      const jetSpeeds = new Float32Array(next.length * jetParticlesPerSample);
      const jetParticlePositions = new Float32Array(next.length * jetParticlesPerSample * 3);
      const jetParticleColours = new Float32Array(next.length * jetParticlesPerSample * 3);
      const appendArc = (
        targetPositions: number[],
        targetColours: number[],
        start: THREE.Vector3,
        end: THREE.Vector3,
        radius: number,
        colour: THREE.Color,
        steps: number,
      ) => {
        let previousPoint = start.clone().normalize().multiplyScalar(radius);
        for (let step = 1; step <= steps; step += 1) {
          const point = start.clone().lerp(end, step / steps).normalize().multiplyScalar(radius);
          targetPositions.push(previousPoint.x, previousPoint.y, previousPoint.z, point.x, point.y, point.z);
          targetColours.push(colour.r, colour.g, colour.b, colour.r, colour.g, colour.b);
          previousPoint = point;
        }
      };

      next.forEach((sample, sampleIndex) => {
        const endpoint = destination(sample.lat, sample.lon, sample.windDirection, 6 + Math.min(16, sample.wind * 0.2));
        const start = vectorAt(sample.lat, sample.lon, 1.029);
        const end = vectorAt(endpoint.lat, endpoint.lon, 1.029);
        const colour = windColour(sample.wind);
        appendArc(trailPositions, trailColours, start, end, 1.029, colour, 6);
        const marker = vectorAt(sample.lat, sample.lon, 1.014);
        const markerColour = weatherColour(sample);
        markerPositions.push(marker.x, marker.y, marker.z);
        markerColours.push(markerColour.r, markerColour.g, markerColour.b);
        for (let particle = 0; particle < surfaceParticlesPerSample; particle += 1) {
          const index = sampleIndex * surfaceParticlesPerSample + particle;
          surfaceStarts.push(start);
          surfaceEnds.push(end);
          surfacePhases[index] = (particle / surfaceParticlesPerSample + ((sampleIndex * 37) % 100) / 100) % 1;
          surfaceSpeeds[index] = sample.wind;
          const offset = index * 3;
          surfaceParticlePositions[offset] = start.x;
          surfaceParticlePositions[offset + 1] = start.y;
          surfaceParticlePositions[offset + 2] = start.z;
          surfaceParticleColours[offset] = colour.r;
          surfaceParticleColours[offset + 1] = colour.g;
          surfaceParticleColours[offset + 2] = colour.b;
        }

        const jetEndpoint = destination(sample.lat, sample.lon, sample.jetDirection, 12 + Math.min(34, sample.jetWind * 0.11));
        const jetStart = vectorAt(sample.lat, sample.lon, 1.069);
        const jetEnd = vectorAt(jetEndpoint.lat, jetEndpoint.lon, 1.069);
        const jetStrength = Math.min(1, sample.jetWind / 220);
        const jetColour = new THREE.Color().setHSL(0.52 + jetStrength * 0.2, 0.86, 0.62 + jetStrength * 0.12);
        appendArc(jetTrailPositions, jetTrailColours, jetStart, jetEnd, 1.069, jetColour, 10);
        for (let particle = 0; particle < jetParticlesPerSample; particle += 1) {
          const index = sampleIndex * jetParticlesPerSample + particle;
          jetStarts.push(jetStart);
          jetEnds.push(jetEnd);
          jetPhases[index] = (particle / jetParticlesPerSample + ((sampleIndex * 19) % 100) / 100) % 1;
          jetSpeeds[index] = sample.jetWind;
          const offset = index * 3;
          jetParticlePositions[offset] = jetStart.x;
          jetParticlePositions[offset + 1] = jetStart.y;
          jetParticlePositions[offset + 2] = jetStart.z;
          jetParticleColours[offset] = jetColour.r;
          jetParticleColours[offset + 1] = jetColour.g;
          jetParticleColours[offset + 2] = jetColour.b;
        }

      });

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(trailPositions, 3));
      lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(trailColours, 3));
      windLines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      windLines.visible = false;

      const particleGeometry = new THREE.BufferGeometry();
      const positionAttribute = new THREE.BufferAttribute(surfaceParticlePositions, 3);
      particleGeometry.setAttribute("position", positionAttribute);
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(surfaceParticleColours, 3));
      windPoints = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
        map: glowTexture,
        vertexColors: true,
        size: 0.0085,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.82,
        alphaTest: 0.015,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      windPoints.renderOrder = 5;
      weatherGroup.add(windPoints);
      surfaceFlow = {
        positions: positionAttribute,
        starts: surfaceStarts,
        ends: surfaceEnds,
        phases: surfacePhases,
        speeds: surfaceSpeeds,
        radius: 1.029,
        base: 0.045,
        rate: 0.00215,
      };

      const jetLineGeometry = new THREE.BufferGeometry();
      jetLineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(jetTrailPositions, 3));
      jetLineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(jetTrailColours, 3));
      jetLines = new THREE.LineSegments(jetLineGeometry, new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      jetLines.renderOrder = 4;
      jetLines.visible = false;

      const jetParticleGeometry = new THREE.BufferGeometry();
      const jetPositionAttribute = new THREE.BufferAttribute(jetParticlePositions, 3);
      jetParticleGeometry.setAttribute("position", jetPositionAttribute);
      jetParticleGeometry.setAttribute("color", new THREE.BufferAttribute(jetParticleColours, 3));
      jetPoints = new THREE.Points(jetParticleGeometry, new THREE.PointsMaterial({
        map: glowTexture,
        vertexColors: true,
        size: 0.0095,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.76,
        alphaTest: 0.012,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      jetPoints.renderOrder = 6;
      weatherGroup.add(jetPoints);
      jetFlow = {
        positions: jetPositionAttribute,
        starts: jetStarts,
        ends: jetEnds,
        phases: jetPhases,
        speeds: jetSpeeds,
        radius: 1.069,
        base: 0.035,
        rate: 0.00092,
      };

      const dominant = [...next]
        .sort((a, b) => b.jetWind - a.jetWind)
        .slice(0, 0);
      dominant.forEach((sample, index) => {
        const endCoordinate = destination(sample.lat, sample.lon, sample.jetDirection, 24 + Math.min(46, sample.jetWind * 0.16));
        const start = vectorAt(sample.lat, sample.lon, 1.072);
        const end = vectorAt(endCoordinate.lat, endCoordinate.lon, 1.072);
        const curvePoints = Array.from({ length: 17 }, (_, step) => start.clone().lerp(end, step / 16).normalize().multiplyScalar(1.072));
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const geometry = new THREE.TubeGeometry(curve, 32, 0.0018 + Math.min(0.0022, sample.jetWind * 0.000008), 5, false);
        const strength = Math.min(1, sample.jetWind / 240);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.53 + strength * 0.18, 0.9, 0.62 + strength * 0.13),
          transparent: true,
          opacity: 0.18 + strength * 0.22,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 3 + index * 0.001;
        weatherGroup.add(mesh);
        dominantFlowMeshes.push(mesh);
        dominantFlowMaterials.push(material);
      });

      const weatherGeometry = new THREE.BufferGeometry();
      weatherGeometry.setAttribute("position", new THREE.Float32BufferAttribute(markerPositions, 3));
      weatherGeometry.setAttribute("color", new THREE.Float32BufferAttribute(markerColours, 3));
      weatherPoints = new THREE.Points(weatherGeometry, new THREE.PointsMaterial({
        map: glowTexture,
        vertexColors: true,
        size: 0.021,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
      }));
      weatherPoints.renderOrder = 7;
      weatherPoints.visible = false;
      applyLayerVisibility();
    };

    let pointerStart = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(earth, false)[0];
      if (!hit || !samplesRef.current.length) return;
      const local = earth.worldToLocal(hit.point.clone()).normalize();
      const lat = (Math.asin(local.y) * 180) / Math.PI;
      const lon = (Math.atan2(local.z, -local.x) * 180) / Math.PI;
      const nearest = [...samplesRef.current].sort((a, b) => sampleDistance(a, lat, lon) - sampleDistance(b, lat, lon))[0];
      setSelected(nearest);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const focus = (lat: number, lon: number) => {
      const direction = vectorAt(lat, lon, 1)
        .applyQuaternion(earthGroup.quaternion)
        .normalize();
      camera.position.copy(direction.multiplyScalar(2.65));
      controls.target.set(0, 0, 0);
      controls.update();
    };
    const reset = () => {
      camera.position.set(0.05, 0.2, 3.22);
      controls.target.set(0, 0, 0);
      controls.update();
    };
    const setMotionState = (active: boolean) => {
      controls.autoRotate = active && !reducedMotion;
    };
    const setLayersState = (next: LayerState) => {
      layerState = next;
      applyLayerVisibility();
    };
    bridgeRef.current = { updateWeather, focus, reset, setMotion: setMotionState, setLayers: setLayersState };
    if (samplesRef.current.length) updateWeather(samplesRef.current);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frame = 0;
    let previous = performance.now();
    const temporary = new THREE.Vector3();
    const advance = (activeFlow: ParticleFlow, delta: number) => {
      for (let index = 0; index < activeFlow.phases.length; index += 1) {
        activeFlow.phases[index] = (
          activeFlow.phases[index]
          + delta * (activeFlow.base + activeFlow.speeds[index] * activeFlow.rate)
        ) % 1;
        temporary
          .copy(activeFlow.starts[index])
          .lerp(activeFlow.ends[index], activeFlow.phases[index])
          .normalize()
          .multiplyScalar(activeFlow.radius);
        activeFlow.positions.setXYZ(index, temporary.x, temporary.y, temporary.z);
      }
      activeFlow.positions.needsUpdate = true;
    };
    const animate = (now: number) => {
      const delta = Math.min(0.05, Math.max(0, (now - previous) / 1000));
      previous = now;
      if (motionRef.current && !reducedMotion) {
        if (surfaceFlow) advance(surfaceFlow, delta);
        if (jetFlow) advance(jetFlow, delta);
        for (let index = 0; index < czechFlag.flagPositions.count; index += 1) {
          const offset = index * 3;
          const x = czechFlag.basePositions[offset];
          const flex = THREE.MathUtils.clamp((x + 0.0575) / 0.115, 0, 1);
          czechFlag.flagPositions.setZ(index, czechFlag.basePositions[offset + 2] + Math.sin(now * 0.0044 + flex * 7.2) * 0.006 * flex);
        }
        czechFlag.flagPositions.needsUpdate = true;
        cloudShell.rotation.y += delta * 0.004;
        cloudVeil.rotation.y -= delta * 0.0015;
        const idleFlicker = 0.72 + Math.sin(now * 0.011) * 0.13 + Math.sin(now * 0.023) * 0.06;
        starshipSite.engineGlow.scale.set(0.92 + idleFlicker * 0.18, 0.24 + idleFlicker * 0.18, 0.92 + idleFlicker * 0.18);
        starshipSite.engineGlow.material.opacity = 0.19 + idleFlicker * 0.2;
        starshipSite.engineLight.intensity = 0.18 + idleFlicker * 0.24;
      }
      controls.update();
      stars.rotation.y += delta * 0.0015;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    void refreshWeather();
    const weatherTimer = window.setInterval(() => { void refreshWeather(); }, 30 * 60 * 1000);

    return () => {
      window.clearInterval(weatherTimer);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      clearWeather();
      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      instanceGroup.children.forEach((child) => {
        if (child instanceof THREE.Sprite) child.material.dispose();
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      const siteGeometries = new Set<THREE.BufferGeometry>();
      const siteMaterials = new Set<THREE.Material>();
      starshipSite.group.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        siteGeometries.add(child.geometry);
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => siteMaterials.add(material));
      });
      siteGeometries.forEach((geometry) => geometry.dispose());
      siteMaterials.forEach((material) => material.dispose());
      launchSiteGroup.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose());
        }
      });
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      starGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      glowTexture.dispose();
      cloudField.texture.dispose();
      cloudShadow.geometry.dispose();
      cloudMaterial.dispose();
      cloudShell.geometry.dispose();
      cloudVeilMaterial.dispose();
      cloudVeil.geometry.dispose();
      cloudShadowMaterial.dispose();
      (sunSprite.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
      bridgeRef.current = null;
    };
  }, [refreshWeather]);

  const peakWind = samples.reduce((peak, sample) => Math.max(peak, sample.wind), 0);
  const peakGust = samples.reduce((peak, sample) => Math.max(peak, sample.gust), 0);
  const wetCells = samples.filter((sample) => sample.precipitation > 0 || sample.weatherCode >= 51).length;
  const peakJet = samples.reduce((peak, sample) => Math.max(peak, sample.jetWind), 0);
  const averageCloud = samples.length
    ? samples.reduce((total, sample) => total + sample.cloud, 0) / samples.length
    : 0;
  const topSystems = [...samples].sort((a, b) => b.gust - a.gust).slice(0, 4);

  const toggleMotion = () => {
    setMotion((current) => {
      motionRef.current = !current;
      bridgeRef.current?.setMotion(!current);
      return !current;
    });
  };

  const toggleLayer = (layer: keyof LayerState) => {
    setLayers((current) => {
      const next = { ...current, [layer]: !current[layer] };
      bridgeRef.current?.setLayers(next);
      return next;
    });
  };

  return (
    <div className={styles.simulator}>
      <div ref={mountRef} className={styles.canvas} />

      <header className={styles.identity}>
        <small>LEIS / REALITY CONTACT</small>
        <strong>4D realSIM Earth</strong>
        <span>SPACE + RELATION + TIME + LINEAGE</span>
      </header>

      <aside className={styles.telemetry} aria-label="Stav živé vrstvy počasí">
        <header>
          <div><small>WEATHER 01</small><h1>Atmosférické pole</h1></div>
          <b className={styles[`state${feedState}`]}><i />{feedState}</b>
        </header>
        <p>Modelový snímek počasí se sdílí všem návštěvníkům; pohyb mezi obnoveními je vizualizace posledního dostupného pole.</p>
        <div className={styles.metrics}>
          <span><b>{samples.length}</b><small>/ {weatherMeta.gridCount} buněk</small></span>
          <span><b>{peakWind.toFixed(0)}</b><small>km/h · 10 m</small></span>
          <span><b>{peakJet.toFixed(0)}</b><small>km/h · 250 hPa</small></span>
          <span><b>{averageCloud.toFixed(0)}%</b><small>prům. oblačnost</small></span>
        </div>
        <div className={styles.layers} aria-label="Viditelné vrstvy modelu">
          <button type="button" aria-pressed={layers.clouds} onClick={() => toggleLayer("clouds")}><i className={styles.cloudLayer} />Mraky</button>
          <button type="button" aria-pressed={layers.surface} onClick={() => toggleLayer("surface")}><i className={styles.surfaceWind} />Vítr 10 m</button>
          <button type="button" disabled={!weatherMeta.jetAvailable} aria-pressed={layers.jet && weatherMeta.jetAvailable} onClick={() => toggleLayer("jet")}><i className={styles.jetWind} />{weatherMeta.jetAvailable ? "Proudy 250 hPa" : "250 hPa nedostupné"}</button>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => void refreshWeather()}>Obnovit data</button>
          <button type="button" onClick={toggleMotion}>{motion ? "Pozastavit pohyb" : "Spustit pohyb"}</button>
          <button type="button" onClick={() => bridgeRef.current?.reset()}>Výchozí pohled</button>
        </div>
        <dl>
          <div><dt>Modelový čas</dt><dd>{samples[0]?.observedAt?.replace("T", " ") ?? "čekám"} UTC</dd></div>
          <div><dt>Poslední kontakt</dt><dd>{refreshedAt ? new Date(refreshedAt).toLocaleTimeString("cs-CZ") : "čekám"}</dd></div>
          <div><dt>Zdroj</dt><dd><a href={weatherMeta.providerUrl} target="_blank" rel="noreferrer">{weatherMeta.providerLabel}</a></dd></div>
          <div><dt>Metoda</dt><dd>{weatherMeta.sourceCellCount} zdrojových buněk · {weatherMeta.spatialMethod}</dd></div>
        </dl>
      </aside>

      <aside className={styles.inspector} aria-label="Vybraná modelová buňka">
        <small>NEJBLIŽŠÍ MODELOVÁ BUŇKA</small>
        {selected ? <>
          <button type="button" className={styles.coordinate} onClick={() => bridgeRef.current?.focus(selected.lat, selected.lon)}>
            {Math.abs(selected.lat).toFixed(0)}°{selected.lat >= 0 ? "N" : "S"} · {Math.abs(selected.lon).toFixed(0)}°{selected.lon >= 0 ? "E" : "W"}
          </button>
          <strong>{selected.temperature.toFixed(1)} °C</strong>
          <div className={styles.inspectorGrid}>
            <span><b>{selected.wind.toFixed(1)}</b>km/h vítr</span>
            <span><b>{selected.gust.toFixed(1)}</b>km/h náraz</span>
            <span><b>{weatherMeta.jetAvailable ? selected.jetWind.toFixed(1) : "—"}</b>{weatherMeta.jetAvailable ? "km/h · 250 hPa" : "výšková data nejsou"}</span>
            <span><b>{selected.cloud.toFixed(0)}%</b>oblačnost</span>
            <span><b>{selected.precipitation.toFixed(1)}</b>mm srážky</span>
          </div>
          <p>Vítr 10 m z {compass(selected.windDirection)} · {selected.windDirection.toFixed(0)}°{weatherMeta.jetAvailable ? `; 250 hPa z ${compass(selected.jetDirection)} · ${selected.jetDirection.toFixed(0)}°` : ""}. V poli je {wetCells} srážkových buněk.</p>
        </> : <p>Čekám na první modelovou odpověď.</p>}
      </aside>

      <aside className={styles.systems} aria-label="Nejsilnější aktuální nárazy">
        <small>NEJSILNĚJŠÍ NÁRAZY V ODEBRANÉM POLI</small>
        {topSystems.map((sample) => <button type="button" key={`${sample.lat}-${sample.lon}`} onClick={() => { setSelected(sample); bridgeRef.current?.focus(sample.lat, sample.lon); }}>
          <span>{sample.lat}°, {sample.lon}°</span><b>{sample.gust.toFixed(0)} km/h</b>
        </button>)}
      </aside>

      <aside className={styles.instances} aria-label="Dobrovolně přihlášené LEIS instance">
        <header><small>LEIS INSTANCE MAP</small><b>{leisInstances.length} ACTIVE</b></header>
        {leisInstances.map((instance) => <button type="button" key={instance.id} onClick={() => bridgeRef.current?.focus(instance.lat, instance.lon)}>
          <span className={styles.flag} aria-hidden="true">🇨🇿</span>
          <span><strong>{instance.label}</strong><small>{instance.area} · {instance.role}</small></span>
          <i />
        </button>)}
        <p>SELF_DECLARED · přibližná poloha · žádné automatické sledování polohy.</p>
      </aside>

      <aside className={styles.spaceport} aria-label="Starbase Starship V3 staging visualization">
        <header><small>{spaceportCopy[language].eyebrow}</small><b>{spaceportCopy[language].status}</b></header>
        <button type="button" onClick={() => bridgeRef.current?.focus(starbaseSite.lat, starbaseSite.lon)}>
          <span><strong>{starbaseSite.label}</strong><small>{starbaseSite.area}</small></span>
          <i aria-hidden="true" />
        </button>
        <p>{spaceportCopy[language].description}</p>
        <a href={starbaseSite.source} target="_blank" rel="noreferrer">{spaceportCopy[language].boundary}</a>
      </aside>

      <div className={styles.legend} aria-label="Barevná legenda rychlosti větru">
        <span><i className={styles.cloudLayer} />modelové oblaky</span>
        <span><i className={styles.surfaceWind} />vítr · 10 m</span>
        <span><i className={styles.jetWind} />výškové proudy · 250 hPa</span>
      </div>

      <footer className={styles.boundary}>
        <span>Tažením otáčíte · kolečkem přibližujete · kliknutím vybíráte buňku</span>
        <span><a href="https://visibleearth.nasa.gov/images/73776/august-blue-marble-next-generation-w-topography-and-bathymetry" target="_blank" rel="noreferrer">NASA Blue Marble</a> = statický povrch (08/2004) · {weatherMeta.providerLabel} = poslední modelový snímek · pohyb není nové měření · piny jsou dobrovolné přibližné deklarace, nikoli live tracking</span>
      </footer>
    </div>
  );
}
