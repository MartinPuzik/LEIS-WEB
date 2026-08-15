"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import styles from "./realsim.module.css";

type FeedState = "LOADING" | "LIVE" | "PARTIAL" | "STALE" | "UNAVAILABLE";

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

const windLatitudes = [-70, -50, -30, -10, 10, 30, 50, 70];
const windLongitudes = Array.from({ length: 18 }, (_, index) => -170 + index * 20);
const windSites = windLatitudes.flatMap((lat) => windLongitudes.map((lon) => ({ lat, lon })));
const weatherUrl = "/api/realsim-weather";
const weatherCacheKey = "leis-realsim-weather-v1";

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

function cloudFieldTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
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

      for (let x = 0; x < canvas.width; x += 1) {
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
        const waveA = Math.sin(lon * 0.105 + Math.sin(lat * 0.047) * 2.2);
        const waveB = Math.sin(lon * 0.247 - lat * 0.173 + Math.sin(lon * 0.031) * 1.8);
        const waveC = Math.cos(lon * 0.059 + lat * 0.286);
        const structure = 0.5 + waveA * 0.22 + waveB * 0.17 + waveC * 0.11;
        const density = cover * 1.05 + (structure - 0.5) * 0.9 - 0.32;
        const opacity = smoothstep(0.08, 0.74, density) * poleFade;
        const edgeSoftness = 0.78 + opacity * 0.22;
        const stormShade = Math.min(32, precipitation * 18);
        const offset = (y * canvas.width + x) * 4;
        image.data[offset] = Math.round((225 - stormShade) * edgeSoftness);
        image.data[offset + 1] = Math.round((239 - stormShade * 0.65) * edgeSoftness);
        image.data[offset + 2] = Math.round((246 - stormShade * 0.35) * edgeSoftness);
        image.data[offset + 3] = Math.round(opacity * 205);
      }
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

  const refreshWeather = useCallback(async () => {
    setFeedState((current) => samplesRef.current.length ? "STALE" : current === "UNAVAILABLE" ? "LOADING" : current);
    const accept = (next: WeatherSample[], state: FeedState, refreshed: string) => {
      samplesRef.current = next;
      setSamples(next);
      setFeedState(state);
      setRefreshedAt(refreshed);
      bridgeRef.current?.updateWeather(next);
      setSelected((current) => current
        ? [...next].sort((a, b) => sampleDistance(a, current.lat, current.lon) - sampleDistance(b, current.lat, current.lon))[0]
        : [...next].sort((a, b) => b.gust - a.gust)[0]);
    };
    try {
      const response = await fetch(weatherUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : [payload];
      const next = rows.slice(0, windSites.length).map((row: any, index: number) => {
        const current = row?.current ?? {};
        return {
          ...windSites[index],
          temperature: Number(current.temperature_2m ?? 0),
          cloud: Math.max(0, Math.min(100, Number(current.cloud_cover ?? 0))),
          precipitation: Math.max(0, Number(current.precipitation ?? 0)),
          weatherCode: Number(current.weather_code ?? 0),
          wind: Math.max(0, Number(current.wind_speed_10m ?? 0)),
          windDirection: Number(current.wind_direction_10m ?? 0),
          gust: Math.max(0, Number(current.wind_gusts_10m ?? 0)),
          jetWind: Math.max(0, Number(current.wind_speed_250hPa ?? 0)),
          jetDirection: Number(current.wind_direction_250hPa ?? 0),
          observedAt: typeof current.time === "string" ? current.time : null,
        } satisfies WeatherSample;
      });
      if (!next.length) throw new Error("Open-Meteo returned no current samples");
      const refreshed = new Date().toISOString();
      window.localStorage.setItem(weatherCacheKey, JSON.stringify({ savedAt: refreshed, samples: next }));
      accept(next, next.length === windSites.length ? "LIVE" : "PARTIAL", refreshed);
    } catch {
      if (samplesRef.current.length) {
        setFeedState("STALE");
        return;
      }
      try {
        const stored = JSON.parse(window.localStorage.getItem(weatherCacheKey) || "null") as { savedAt?: string; samples?: WeatherSample[] } | null;
        const cached = Array.isArray(stored?.samples)
          ? stored.samples.filter((sample) => Number.isFinite(sample.lat) && Number.isFinite(sample.lon) && Number.isFinite(sample.wind))
          : [];
        if (cached.length) {
          accept(cached, "STALE", stored?.savedAt || new Date().toISOString());
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
    window.localStorage.setItem(weatherCacheKey, JSON.stringify({ savedAt: refreshedAt, samples }));
  }, [samples, refreshedAt]);

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
    renderer.domElement.setAttribute("aria-label", "Interaktivní 3D Země s živými modelovými vektory počasí");
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 1.65;
    controls.maxDistance = 5.2;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.22;
    controls.rotateSpeed = 0.42;
    controls.zoomSpeed = 0.72;

    const earthGroup = new THREE.Group();
    earthGroup.rotation.y = -0.23;
    scene.add(earthGroup);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load("/earth-blue-marble-august.jpg");
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const earthGeometry = new THREE.SphereGeometry(1, 96, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.91,
      metalness: 0.02,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

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
      const surfaceParticlesPerSample = 18;
      const jetParticlesPerSample = 16;
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
      weatherGroup.add(windLines);

      const particleGeometry = new THREE.BufferGeometry();
      const positionAttribute = new THREE.BufferAttribute(surfaceParticlePositions, 3);
      particleGeometry.setAttribute("position", positionAttribute);
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(surfaceParticleColours, 3));
      windPoints = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
        map: glowTexture,
        vertexColors: true,
        size: 0.031,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1,
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
      weatherGroup.add(jetLines);

      const jetParticleGeometry = new THREE.BufferGeometry();
      const jetPositionAttribute = new THREE.BufferAttribute(jetParticlePositions, 3);
      jetParticleGeometry.setAttribute("position", jetPositionAttribute);
      jetParticleGeometry.setAttribute("color", new THREE.BufferAttribute(jetParticleColours, 3));
      jetPoints = new THREE.Points(jetParticleGeometry, new THREE.PointsMaterial({
        map: glowTexture,
        vertexColors: true,
        size: 0.038,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.96,
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
        .slice(0, 16);
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
      weatherGroup.add(weatherPoints);
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
        dominantFlowMaterials.forEach((material, index) => {
          material.opacity = 0.27 + Math.sin(now * 0.0014 + index * 0.73) * 0.075;
        });
      }
      controls.update();
      stars.rotation.y += delta * 0.0015;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    void refreshWeather();
    const weatherTimer = window.setInterval(() => { void refreshWeather(); }, 10 * 60 * 1000);

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
        <p>Viditelné modelové oblaky, přízemní vítr v 10 m a samostatné výškové proudy v hladině 250 hPa (~10,4 km).</p>
        <div className={styles.metrics}>
          <span><b>{samples.length}</b><small>/ 144 buněk</small></span>
          <span><b>{peakWind.toFixed(0)}</b><small>km/h · 10 m</small></span>
          <span><b>{peakJet.toFixed(0)}</b><small>km/h · 250 hPa</small></span>
          <span><b>{averageCloud.toFixed(0)}%</b><small>prům. oblačnost</small></span>
        </div>
        <div className={styles.layers} aria-label="Viditelné vrstvy modelu">
          <button type="button" aria-pressed={layers.clouds} onClick={() => toggleLayer("clouds")}><i className={styles.cloudLayer} />Mraky</button>
          <button type="button" aria-pressed={layers.surface} onClick={() => toggleLayer("surface")}><i className={styles.surfaceWind} />Vítr 10 m</button>
          <button type="button" aria-pressed={layers.jet} onClick={() => toggleLayer("jet")}><i className={styles.jetWind} />Proudy 250 hPa</button>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => void refreshWeather()}>Obnovit data</button>
          <button type="button" onClick={toggleMotion}>{motion ? "Pozastavit pohyb" : "Spustit pohyb"}</button>
          <button type="button" onClick={() => bridgeRef.current?.reset()}>Výchozí pohled</button>
        </div>
        <dl>
          <div><dt>Modelový čas</dt><dd>{samples[0]?.observedAt?.replace("T", " ") ?? "čekám"} UTC</dd></div>
          <div><dt>Poslední kontakt</dt><dd>{refreshedAt ? new Date(refreshedAt).toLocaleTimeString("cs-CZ") : "čekám"}</dd></div>
          <div><dt>Zdroj</dt><dd><a href="https://open-meteo.com/en/docs" target="_blank" rel="noreferrer">Open-Meteo Forecast API</a></dd></div>
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
            <span><b>{selected.jetWind.toFixed(1)}</b>km/h · 250 hPa</span>
            <span><b>{selected.cloud.toFixed(0)}%</b>oblačnost</span>
            <span><b>{selected.precipitation.toFixed(1)}</b>mm srážky</span>
          </div>
          <p>Vítr 10 m z {compass(selected.windDirection)} · {selected.windDirection.toFixed(0)}°; 250 hPa z {compass(selected.jetDirection)} · {selected.jetDirection.toFixed(0)}°. V poli je {wetCells} srážkových buněk.</p>
        </> : <p>Čekám na první modelovou odpověď.</p>}
      </aside>

      <aside className={styles.systems} aria-label="Nejsilnější aktuální nárazy">
        <small>NEJSILNĚJŠÍ NÁRAZY V ODEBRANÉM POLI</small>
        {topSystems.map((sample) => <button type="button" key={`${sample.lat}-${sample.lon}`} onClick={() => { setSelected(sample); bridgeRef.current?.focus(sample.lat, sample.lon); }}>
          <span>{sample.lat}°, {sample.lon}°</span><b>{sample.gust.toFixed(0)} km/h</b>
        </button>)}
      </aside>

      <div className={styles.legend} aria-label="Barevná legenda rychlosti větru">
        <span><i className={styles.cloudLayer} />modelové oblaky</span>
        <span><i className={styles.surfaceWind} />vítr · 10 m</span>
        <span><i className={styles.jetWind} />výškové proudy · 250 hPa</span>
      </div>

      <footer className={styles.boundary}>
        <span>Tažením otáčíte · kolečkem přibližujete · kliknutím vybíráte buňku</span>
        <span><a href="https://visibleearth.nasa.gov/images/73776/august-blue-marble-next-generation-w-topography-and-bathymetry" target="_blank" rel="noreferrer">NASA Blue Marble</a> = statický povrch (08/2004) · Open-Meteo = aktuální modelový vzorek 10 m + 250 hPa · oblaky/proudy jsou vizualizace 144 buněk, nikoli radar ani výstražná služba</span>
      </footer>
    </div>
  );
}
