"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Source = "OpenAI" | "Anthropic" | "Google AI" | "Hugging Face" | "Mistral AI" | "Cohere" | "Google DeepMind" | "TII" | "RIKEN" | "AI Singapore" | "IndiaAI" | "KAIST" | "Brazil Government" | "CTU Prague";
type News = { title: string; source: Source; place: string; lat: number; lon: number; url: string; summary: string; leis: string; reviewed?: string };

const milestones = [
  ["DOCUMENTED", "9 July 2026", "First constitutional seed", "The earliest currently located constitutional evidence identifies Martin Puzik as Founder and Initial Architect."],
  ["CREATOR-REPORTED", "Around 10 July 2026", "LEIS core completed", "Martin Puzik reports an independent intensive five-day creation period. Copilot was a working carrier, not the author."],
  ["EVOLUTION", "After the seed", "Technical collaboration", "M.A.J. Puzik supported practical activation and later technical development."],
  ["PRESENT", "Today", "Reconstruction and validation", "Archives, lineage and public orientation are being made navigable without exposing private source material."],
] as const;

const news: News[] = [
  { title: "How AI is expanding what people do at work", source: "OpenAI", place: "San Francisco, USA", lat: 37.7749, lon: -122.4194, url: "https://openai.com/news/", summary: "OpenAI's newsroom presents AI as a way to extend what people can do at work, rather than as a story about automation alone.", leis: "LEIS question: can people later recover the purpose, judgement and limits behind an AI-assisted decision?", reviewed: "27 July 2026" },
  { title: "Launching Health in ChatGPT", source: "OpenAI", place: "San Francisco, USA", lat: 37.8, lon: -122.39, url: "https://openai.com/news/", summary: "OpenAI announced a Health experience in ChatGPT, placing a high-stakes domain directly in the public AI conversation.", leis: "LEIS lens: health guidance needs its evidence, uncertainty and human boundaries to remain visible at every handover.", reviewed: "23 July 2026" },
  { title: "How news organisations use AI", source: "OpenAI", place: "San Francisco, USA", lat: 37.75, lon: -122.45, url: "https://openai.com/news/", summary: "OpenAI describes ways news organisations are using AI to advance their reporting and public mission.", leis: "LEIS question: can a reader still trace where an interpretation began, what evidence supports it and what remains uncertain?", reviewed: "22 July 2026" },
  { title: "Introducing OpenAI Presence", source: "OpenAI", place: "San Francisco, USA", lat: 37.73, lon: -122.41, url: "https://openai.com/news/", summary: "OpenAI introduced a new product initiative called OpenAI Presence.", leis: "LEIS lens: a new interface becomes durable when its purpose, constraints and responsibilities remain understandable.", reviewed: "22 July 2026" },
  { title: "ChatGPT for small business program", source: "OpenAI", place: "San Francisco, USA", lat: 37.79, lon: -122.46, url: "https://openai.com/news/", summary: "OpenAI announced a program focused on small-business adoption of ChatGPT.", leis: "LEIS question: can a small organisation retain the reasoning behind AI-enabled work when tools, people or providers change?", reviewed: "21 July 2026" },
  { title: "Claude for Teachers", source: "Anthropic", place: "San Francisco, USA", lat: 37.79, lon: -122.43, url: "https://www.anthropic.com/news", summary: "Anthropic announced Claude for Teachers, bringing questions of learning, context and responsible assistance into education.", leis: "LEIS question: how can educational knowledge stay useful when the original teacher or context is absent?", reviewed: "14 July 2026" },
  { title: "Canadian AI research commitment", source: "Anthropic", place: "San Francisco, USA", lat: 37.76, lon: -122.4, url: "https://www.anthropic.com/news", summary: "Anthropic announced a commitment to Canadian AI research, connecting a frontier lab with a broader public research ecosystem.", leis: "LEIS lens: support is strongest when knowledge can travel with its evidence, local context and public purpose.", reviewed: "14 July 2026" },
  { title: "Physical AI in practice", source: "Anthropic", place: "San Francisco, USA", lat: 37.77, lon: -122.38, url: "https://www.anthropic.com/news", summary: "Anthropic's UST case study discusses the use of Claude in physical AI work.", leis: "LEIS question: can the logic and decisions behind a build survive handover to the next builder?", reviewed: "9 July 2026" },
  { title: "Inviting hard questions", source: "Anthropic", place: "San Francisco, USA", lat: 37.81, lon: -122.42, url: "https://www.anthropic.com/news", summary: "Anthropic invited the public to bring difficult questions about AI and committed to showing its work as it responds.", leis: "LEIS aligns with the principle that a useful system should make challenge possible, not merely present confidence.", reviewed: "9 July 2026" },
  { title: "Long-term benefit governance", source: "Anthropic", place: "San Francisco, USA", lat: 37.74, lon: -122.37, url: "https://www.anthropic.com/news", summary: "Anthropic reported a new appointment to its Long-Term Benefit Trust, a governance structure intended to hold long-term interests visible.", leis: "LEIS lens: continuity needs more than stored files; it needs durable responsibility, lineage and the ability to question decisions.", reviewed: "9 July 2026" },
  { title: "LFM2.5 encoders for long context", source: "Hugging Face", place: "New York, USA", lat: 40.7128, lon: -74.006, url: "https://huggingface.co/blog", summary: "A recent Hugging Face community article on fast, long-context encoders.", leis: "LEIS lens: long context helps only if the important relationships can be recognised rather than buried." },
  { title: "Open multilingual retrieval models", source: "Hugging Face", place: "New York, USA", lat: 40.75, lon: -73.98, url: "https://huggingface.co/blog", summary: "A recent Hugging Face community signal on multilingual retrieval.", leis: "LEIS question: can knowledge cross languages without losing the conditions that give it meaning?" },
  { title: "Preventing factual hallucinations in RAG", source: "Hugging Face", place: "New York, USA", lat: 40.69, lon: -74.02, url: "https://huggingface.co/blog", summary: "A selected Hugging Face community article on reducing factual hallucinations in RAG.", leis: "LEIS aligns with explicit uncertainty: when evidence is insufficient, the system should not manufacture certainty." },
  { title: "OlmoEarth: planetary-scale inference", source: "Hugging Face", place: "Paris, France", lat: 48.8566, lon: 2.3522, url: "https://huggingface.co/blog", summary: "A selected Hugging Face community article about geospatial inference at planetary scale.", leis: "LEIS question: can a global model remain grounded in the local evidence and assumptions behind its signals?" },
  { title: "Surgical robotics simulation", source: "Hugging Face", place: "Paris, France", lat: 48.87, lon: 2.31, url: "https://huggingface.co/blog", summary: "A selected Hugging Face community post relating to surgical robotics simulation.", leis: "LEIS lens: in high-stakes settings, preserving why a system acted is as important as preserving what it produced." },
  { title: "The agentic Gemini era", source: "Google AI", place: "Mountain View, USA", lat: 37.3861, lon: -122.0839, url: "https://blog.google/innovation-and-ai/technology/ai/", summary: "Google's AI desk frames I/O 2026 around an agentic Gemini era and product capabilities that carry more work across tools.", leis: "LEIS question: when an agent acts across systems, can people still orient themselves in the evidence, purpose and authority behind each action?", reviewed: "2026" },
  { title: "Gemini speaks Southeast Asian languages", source: "Google AI", place: "Mountain View, USA", lat: 37.4, lon: -122.06, url: "https://blog.google/innovation-and-ai/technology/ai/", summary: "Google highlights work to make Gemini more useful across the linguistic variety of Southeast Asia.", leis: "LEIS lens: language access becomes meaningful when the local context and limits of a system remain accessible too.", reviewed: "2026" },
  { title: "Personalised learning with Gemini", source: "Google AI", place: "Mountain View, USA", lat: 37.37, lon: -122.1, url: "https://blog.google/innovation-and-ai/technology/ai/", summary: "Google presents study notebooks with personalised lessons, quizzes and progress support.", leis: "LEIS question: does a learner receive a result, or can they also recover the reasoning and limits behind it?", reviewed: "2026" },
  { title: "Gemini Spark and connected apps", source: "Google AI", place: "Mountain View, USA", lat: 37.41, lon: -122.12, url: "https://blog.google/innovation-and-ai/technology/ai/", summary: "Google reports product updates around Gemini Spark, macOS and connected applications.", leis: "LEIS lens: tools are replaceable; the human ability to reconstruct intent must survive the tool.", reviewed: "2026" },
  { title: "AI for crisis resilience", source: "Google AI", place: "Mountain View, USA", lat: 37.35, lon: -122.08, url: "https://blog.google/innovation-and-ai/technology/ai/", summary: "Google's AI newsroom highlights work using AI breakthroughs to support resilience in crises.", leis: "LEIS question: can a decision-support system make its assumptions visible when the situation changes quickly?", reviewed: "2026" },
  { title: "Robostral Navigate: embodied navigation", source: "Mistral AI", place: "Paris, France", lat: 48.8566, lon: 2.3722, url: "https://mistral.ai/news/", summary: "Mistral AI presents Robostral Navigate, a research model for embodied navigation.", leis: "LEIS lens: when intelligence acts in a physical environment, its boundaries, evidence and responsibility need to remain reconstructable.", reviewed: "9 July 2026" },
  { title: "Responsible AI adoption at scale", source: "Cohere", place: "Toronto, Canada", lat: 43.6532, lon: -79.3832, url: "https://cohere.com/blog", summary: "Cohere and the University of Toronto describe a partnership for sovereign, enterprise-grade AI and responsible adoption at scale.", leis: "LEIS question: can an organisation preserve the reasons, permissions and human judgement that made an AI deployment trustworthy?", reviewed: "16 July 2026" },
  { title: "Project Genie: interactive AI worlds", source: "Google DeepMind", place: "London, United Kingdom", lat: 51.5072, lon: -0.1276, url: "https://deepmind.google/discover/blog/", summary: "Google DeepMind presents Project Genie as an experiment in infinite, interactive worlds.", leis: "LEIS lens: new capability becomes useful when people can see what it is grounded in and how to orient themselves within it.", reviewed: "January 2026" },
  { title: "Falcon-H1 Arabic: sovereign language AI", source: "TII", place: "Abu Dhabi, UAE", lat: 24.4539, lon: 54.3773, url: "https://www.tii.ae/index.php/news/abu-dhabis-tii-launches-falcon-h1-arabic-establishing-worlds-leading-arabic-ai-model", summary: "Technology Innovation Institute announced Falcon-H1 Arabic, a hybrid-architecture Arabic language model for high-performance and locally relevant AI.", leis: "LEIS lens: language, cultural context and sovereignty are part of the conditions needed to interpret an AI system responsibly.", reviewed: "5 January 2026" },
  { title: "RIKYU: AI for Science supercomputer", source: "RIKEN", place: "Kobe, Japan", lat: 34.6901, lon: 135.1956, url: "https://www.riken.jp/en/news_pubs/news/2026/20260619_1/index.html", summary: "RIKEN named its AI-for-Science development supercomputer RIKYU, designed to support science with large-scale AI computing.", leis: "LEIS question: as science accelerates, can the assumptions, negative results and human reasons behind discoveries remain available to the next generation?", reviewed: "23 June 2026" },
  { title: "AI bilingualism for community learning", source: "AI Singapore", place: "Singapore", lat: 1.3521, lon: 103.8198, url: "https://aisingapore.org/news/new-initiative-by-ai-singapore-to-drive-ai-bilingualism-across-the-community-and-empower-more-than-5000-youths/", summary: "AI Singapore announced a community initiative around practical AI bilingualism, education and youth participation.", leis: "LEIS lens: AI literacy is not only access to tools; it is the ability to understand their context, limitations and real-world consequences.", reviewed: "July 2026" },
  { title: "AI Impact Summit: public AI capacity", source: "IndiaAI", place: "New Delhi, India", lat: 28.6139, lon: 77.209, url: "https://impact.indiaai.gov.in/events/AiImpactExpo.pdf", summary: "India's Ministry of Electronics and Information Technology presents the AI Impact Summit 2026 as a public showcase for AI capability, research and societal application.", leis: "LEIS lens: capacity matters most when people can recover the human purpose, evidence and public responsibility behind deployment.", reviewed: "2026" },
  { title: "AI technology transfer and public research", source: "KAIST", place: "Seoul, South Korea", lat: 37.5665, lon: 126.978, url: "https://www.kaist.ac.kr/news/html/news/?skey=keyword&sval=KAIST+AI+%EA%B8%B0%EC%88%A0%EC%84%A4%EB%AA%85%ED%9A%8C+2026", summary: "KAIST's AI technology briefing presents research in trustworthy AI, health AI, robotics, multimodal systems and physical AI for collaboration with industry and the public.", leis: "LEIS question: when research crosses into practice, can its intent, limitations and evidence travel with it?", reviewed: "6 May 2026" },
  { title: "Responsible AI in public services", source: "Brazil Government", place: "Brasília, Brazil", lat: -15.7939, lon: -47.8828, url: "https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/inteligencia-artificial-1", summary: "Brazil's digital-government AI initiative reports public-sector AI tools, governance guidance, risk and ethics work, and planned capability building.", leis: "LEIS lens: public AI needs an understandable lineage from policy to implementation, including who remains responsible when systems change.", reviewed: "2026" },
  { title: "National Artificial Intelligence Center launches in Prague", source: "CTU Prague", place: "Prague, Czech Republic", lat: 50.1012, lon: 14.3948, url: "https://aktualne.cvut.cz/en/media-screenings/20260423-launch-of-the-national-artificial-intelligence-center", summary: "Czech Technical University reports the launch of the National Artificial Intelligence Center: six universities and dozens of companies are joining research with practical AI use in Czech industry and public life.", leis: "LEIS lens: practical adoption is stronger when research, pilots and decisions retain their evidence, purpose and responsibility across handovers.", reviewed: "23 April 2026" },
  { title: "AI cyber defence research moves toward practice", source: "CTU Prague", place: "Prague, Czech Republic", lat: 50.0934, lon: 14.4013, url: "https://www.aktualne.cvut.cz/en/press-reports/20260630-a-doctoral-student-at-the-faculty-of-electrical-engineering-and-computer", summary: "A CTU Artificial Intelligence Center project uses AI-assisted cyber-deception defence to detect, confuse and contain intruders; the team reports preparation for pilot deployments.", leis: "LEIS question: in a security response, can the next defender recover not just an alert, but the evidence and reasoning that produced it?", reviewed: "30 June 2026" },
  { title: "AI, autonomy and responsibility enter the Czech science debate", source: "CTU Prague", place: "Prague, Czech Republic", lat: 50.0868, lon: 14.4169, url: "https://aktualne.cvut.cz/en/reports/20260512-speech-by-ctu-rector-michal-pechoucek-at-the-annual-meeting-of-the-learned-society", summary: "CTU Rector Michal Pěchouček framed AI around scientific discovery, human autonomy, trust and the responsibilities that accompany advanced technologies.", leis: "LEIS aligns with the distinction between capability and orientation: a useful system should keep people able to understand, question and take responsibility.", reviewed: "12 May 2026" },
  { title: "Physical AI and intelligent industry at RICAIP Days", source: "CTU Prague", place: "Prague, Czech Republic", lat: 50.1057, lon: 14.3864, url: "https://www.aktualne.cvut.cz/en/press-reports", summary: "CTU's public news desk identified AI in the physical world and intelligent physical systems as a major RICAIP Days 2026 theme for European industrial competitiveness.", leis: "LEIS lens: physical systems need a readable chain from data and models to human intent, conditions and accountability.", reviewed: "5 June 2026" },
];

const sourceColors: Record<Source, string> = { OpenAI: "#a991ff", Anthropic: "#ffb16e", "Google AI": "#6de4ff", "Hugging Face": "#f6dc6a", "Mistral AI": "#ff8bbb", Cohere: "#ffb270", "Google DeepMind": "#84a7ff", TII: "#7af0c8", RIKEN: "#ffd66d", "AI Singapore": "#91e8ee", IndiaAI: "#ffcf6a", KAIST: "#b6a2ff", "Brazil Government": "#6ff0b0", "CTU Prague": "#72e7c1" };
const leisOriginPoints = [
  { label: "LEIS CREATOR, Martin Pužík", role: "Founder and constitution author", location: "PRAGUE, Czech Republic", lat: 50.0755, lon: 14.4378 },
  { label: "LEIS TECHNICAL COLLABORATION, M.A.J. Pužík", role: "Technical activation and development", location: "PRAGUE, Czech Republic", lat: 50.087, lon: 14.425 },
];
const leisOrigins = [
  { label: "LEIS Creator · Martin Puzik", location: "Prague, Czech Republic", lat: 50.0755, lon: 14.4378 },
  { label: "LEIS technical collaboration · M.A.J. Puzik", location: "Prague, Czech Republic", lat: 50.087, lon: 14.425 },
];

const countryProfiles: Record<string, { eyebrow: string; title: string; summary: string; use: string; leis: string; links: Array<{ label: string; url: string }> }> = {
  Canada: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Canada: AI adoption, trust and sovereignty",
    summary: "Statistics Canada reports that 19.2% of Canadian businesses used AI to produce goods or deliver services in 2026, up from 12.2% in 2025.",
    use: "Reported business uses include data analytics, text analytics, virtual agents and chatbots, natural-language processing and large language models.",
    leis: "LEIS context: adoption becomes durable when organisations can retain the evidence, conditions and responsibility behind an AI-assisted decision.",
    links: [
      { label: "Statistics Canada · AI use in business", url: "https://www150.statcan.gc.ca/n1/pub/11-621-m/11-621-m2026010-eng.pdf" },
      { label: "Government of Canada · AI for All strategy", url: "https://ised-isde.canada.ca/site/ised/en/canadas-national-artificial-intelligence-strategy-ai-all" },
    ],
  },
  Austria: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Austria: research, industry and trustworthy AI",
    summary: "Statistics Austria reports that 29.9% of Austrian enterprises with at least ten employees used at least one AI-based technology in 2025, compared with 20% across the EU.",
    use: "Austria's public AI strategy, AIM AT 2030, connects research and innovation with skills, administration, industrial competitiveness, resilience and trustworthy AI.",
    leis: "LEIS context: when AI moves through organisations, the durable asset is not a result alone but the recoverable evidence, purpose and human responsibility behind it.",
    links: [
      { label: "Statistics Austria · enterprise AI use", url: "https://www.statistik.at/fileadmin/announcement/2026/06/20260624IKTU2025EN.pdf" },
      { label: "Austria · AIM AT 2030", url: "https://www.digitalaustria.gv.at/eng/strategy/strategy-AI-AIM-AT-2030.html" },
    ],
  },
};

function GlobeLegacy({ onSelect }: { onSelect: (index: number) => void }) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let root: { dispose: () => void } | undefined;
    let disposed = false;
    (async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5map = await import("@amcharts/amcharts5/map");
      const world = (await import("@amcharts/amcharts5-geodata/worldLow")).default;
      if (disposed || !node.current) return;
      root = am5.Root.new(node.current);
      root._logo?.dispose();
      const chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "rotateX", panY: "rotateY", wheelY: "zoom", projection: am5map.geoOrthographic(), rotationX: -22, rotationY: -6, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0,
      }));
      const polygons = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: world }));
      polygons.mapPolygons.template.setAll({ fill: am5.color(0x153f5e), stroke: am5.color(0x5bcfe0), strokeOpacity: 0.42, strokeWidth: 0.6, interactive: true, tooltipText: "{name}" });
      polygons.mapPolygons.template.states.create("hover", { fill: am5.color(0x246f8a) });
      const points = chart.series.push(am5map.MapPointSeries.new(root, {}));
      points.bullets.push(() => {
        const dot = am5.Circle.new(root!, { radius: 4.5, fill: am5.color(0x69ffba), stroke: am5.color(0xeafff4), strokeWidth: 1.5, cursorOverStyle: "pointer", tooltipText: "{location}" });
        dot.animate({ key: "scale", from: 0.82, to: 1.65, duration: 1250, loops: Infinity, easing: am5.ease.cubic });
        dot.animate({ key: "opacity", from: 1, to: 0.42, duration: 1250, loops: Infinity, easing: am5.ease.cubic });
        dot.events.on("click", (event) => { const item = event.target.dataItem?.dataContext as { index?: number }; if (typeof item?.index === "number") onSelect(item.index); });
        return am5.Bullet.new(root!, { sprite: dot });
      });
      points.data.setAll([
        ...news.map((item, index) => ({ index, location: `${item.place} · ${item.source}`, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })),
        ...leisOrigins.map((item) => ({ location: `${item.location} · ${item.label}`, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })),
      ]);
    })();
    return () => { disposed = true; root?.dispose(); };
  }, [onSelect]);
  return <div className="globe-map" ref={node} aria-label="Interactive globe. Drag to rotate, scroll to zoom and choose a source point." />;
}

function GlobePrevious({ onSelect, focusIndex = 0 }: { onSelect: (index: number) => void; focusIndex?: number }) {
  const node = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  useEffect(() => {
    let root: any;
    let disposed = false;
    let focusHandler: ((event: Event) => void) | undefined;
    (async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5map = await import("@amcharts/amcharts5/map");
      const world = (await import("@amcharts/amcharts5-geodata/worldLow")).default;
      if (disposed || !node.current) return;
      root = am5.Root.new(node.current); root._logo?.dispose();
      const chart = root.container.children.push(am5map.MapChart.new(root, { panX: "rotateX", panY: "rotateY", wheelY: "zoom", projection: am5map.geoOrthographic(), rotationX: -22, rotationY: -6 }));
      chartRef.current = chart;
      focusHandler = (event: Event) => { const item = news[(event as CustomEvent<number>).detail]; if (!item) return; chart.animate({ key: "rotationX", to: -item.lon, duration: 900 }); chart.animate({ key: "rotationY", to: -item.lat, duration: 900 }); };
      window.addEventListener("leis-globe-focus", focusHandler);
      const polygons = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: world }));
      polygons.mapPolygons.template.setAll({ fill: am5.color(0x153f5e), stroke: am5.color(0x5bcfe0), strokeOpacity: 0.42, strokeWidth: 0.6, interactive: true, tooltipText: "{name}" });
      polygons.mapPolygons.template.states.create("hover", { fill: am5.color(0x246f8a) });
      const points = chart.series.push(am5map.MapPointSeries.new(root, {}));
      points.bullets.push(() => {
        const dot = am5.Circle.new(root, { radius: 5.4, fill: am5.color(0x69ffba), stroke: am5.color(0xeafff4), strokeWidth: 1.5, cursorOverStyle: "pointer", tooltipText: "{tooltip}" });
        dot.adapters.add("fill", (_value: any, target: any) => am5.color(target.dataItem?.dataContext?.color ?? 0x69ffba));
        dot.adapters.add("radius", (_value: any, target: any) => target.dataItem?.dataContext?.origin ? 6.5 : 5.4);
        const tooltip = am5.Tooltip.new(root, { keepTargetHover: true, pointerOrientation: "horizontal" });
        tooltip.get("background").setAll({ fill: am5.color(0x071b29), fillOpacity: 0.96, stroke: am5.color(0x77eff7), strokeOpacity: 0.8 });
        tooltip.label.setAll({ fill: am5.color(0xe9fcff), fontSize: 11, paddingTop: 7, paddingBottom: 7, paddingLeft: 9, paddingRight: 9 });
        dot.set("tooltip", tooltip);
        let timer: ReturnType<typeof setTimeout> | undefined;
        dot.events.on("pointerover", () => { if (timer) clearTimeout(timer); dot.showTooltip(); });
        dot.events.on("pointerout", () => { timer = setTimeout(() => dot.hideTooltip(), 1000); });
        dot.animate({ key: "scale", from: 0.9, to: 1.72, duration: 1350, loops: Infinity, easing: am5.ease.cubic });
        dot.animate({ key: "opacity", from: 1, to: 0.48, duration: 1350, loops: Infinity, easing: am5.ease.cubic });
        dot.events.on("click", (event: any) => { const index = event.target.dataItem?.dataContext?.index; if (typeof index === "number") onSelectRef.current(index); });
        return am5.Bullet.new(root, { sprite: dot });
      });
      points.data.setAll([
        ...news.map((item, index) => ({ index, color: 0x69ffba, tooltip: `${item.place}\n${item.source}\nSource checked: ${item.reviewed ?? "5 August 2026"}`, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })),
        ...leisOriginPoints.map((item) => ({ origin: true, color: 0x58a9ff, tooltip: `${item.location}\n${item.label}\n${item.role}`, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })),
      ]);
    })();
    return () => { disposed = true; if (focusHandler) window.removeEventListener("leis-globe-focus", focusHandler); chartRef.current = null; root?.dispose(); };
  }, []);
  useEffect(() => { const item = news[focusIndex]; const chart = chartRef.current; if (!item || !chart) return; chart.animate({ key: "rotationX", to: -item.lon, duration: 900 }); chart.animate({ key: "rotationY", to: -item.lat, duration: 900 }); }, [focusIndex]);
  return <div className="globe-map" ref={node} aria-label="Interactive globe. Drag to rotate, scroll to zoom and choose a source point." />;
}

function GlobeOldFocus({ onSelect }: { onSelect: (index: number) => void }) {
  const node = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [hover, setHover] = useState<{ city: string; label: string; date: string; origin?: boolean } | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const showInfo = (info: { city: string; label: string; date: string; origin?: boolean }) => { if (hideTimer.current) clearTimeout(hideTimer.current); setHover(info); };
  const delayHide = () => { hideTimer.current = setTimeout(() => setHover(null), 1000); };
  useEffect(() => {
    let root: any; let disposed = false; let manualUntil = 0; let rotationTimer: ReturnType<typeof setInterval> | undefined; let routeTimer: ReturnType<typeof setInterval> | undefined; let externalFocus: ((event: Event) => void) | undefined;
    const moveTo = (item: News, duration = 900) => { const chart = chartRef.current; if (!chart) return; chart.animate({ key: "rotationX", to: -item.lon, duration }); chart.animate({ key: "rotationY", to: -item.lat, duration }); };
    (async () => {
      const am5 = await import("@amcharts/amcharts5"); const am5map = await import("@amcharts/amcharts5/map"); const world = (await import("@amcharts/amcharts5-geodata/worldLow")).default;
      if (disposed || !node.current) return;
      root = am5.Root.new(node.current); root._logo?.dispose();
      const chart = root.container.children.push(am5map.MapChart.new(root, { panX: "rotateX", panY: "rotateY", wheelY: "zoom", projection: am5map.geoOrthographic(), rotationX: -22, rotationY: -6 }));
      chartRef.current = chart;
      externalFocus = (event: Event) => { const item = news[(event as CustomEvent<number>).detail]; if (item) { moveTo(item); manualUntil = Date.now() + 14000; } };
      window.addEventListener("leis-globe-focus", externalFocus);
      chart.chartContainer.events.on("pointerdown", () => { manualUntil = Date.now() + 14000; });
      const polygons = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: world }));
      polygons.mapPolygons.template.setAll({ fill: am5.color(0x153f5e), stroke: am5.color(0x5bcfe0), strokeOpacity: 0.42, strokeWidth: 0.6, interactive: true, tooltipText: "{name}" });
      polygons.mapPolygons.template.states.create("hover", { fill: am5.color(0x246f8a) });
      polygons.mapPolygons.template.events.on("click", (event: any) => { const name = event.target.dataItem?.dataContext?.name; if (name) setCountry(name); manualUntil = Date.now() + 14000; });
      const points = chart.series.push(am5map.MapPointSeries.new(root, {}));
      points.bullets.push(() => {
        const holder = am5.Container.new(root, { width: 0, height: 0, cursorOverStyle: "pointer" });
        const halo = holder.children.push(am5.Circle.new(root, { radius: 5.4, fill: am5.color(0x69ffba), fillOpacity: 0.42 }));
        const core = holder.children.push(am5.Circle.new(root, { radius: 5.4, fill: am5.color(0x69ffba), stroke: am5.color(0xeafff4), strokeWidth: 1.4 }));
        const hit = holder.children.push(am5.Circle.new(root, { radius: 17, fill: am5.color(0xffffff), fillOpacity: 0.001 }));
        for (const shape of [halo, core]) shape.adapters.add("fill", (_value: any, target: any) => am5.color(target.dataItem?.dataContext?.color ?? 0x69ffba));
        for (const shape of [halo, core]) shape.adapters.add("radius", (_value: any, target: any) => target.dataItem?.dataContext?.origin ? 6.5 : 5.4);
        halo.animate({ key: "scale", from: 1, to: 3.2, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
        halo.animate({ key: "opacity", from: 0.72, to: 0, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
        hit.events.on("pointerover", (event: any) => { const data = event.target.dataItem?.dataContext; showInfo({ city: data.city, label: data.label, date: data.date, origin: data.origin }); manualUntil = Date.now() + 5000; });
        hit.events.on("pointerout", () => delayHide());
        hit.events.on("click", (event: any) => { const data = event.target.dataItem?.dataContext; if (typeof data?.index === "number") { onSelectRef.current(data.index); moveTo(news[data.index]); } manualUntil = Date.now() + 14000; });
        return am5.Bullet.new(root, { sprite: holder });
      });
      points.data.setAll([
        ...news.map((item, index) => ({ index, color: 0x69ffba, city: item.place, label: item.source, date: `Source checked: ${item.reviewed ?? "5 August 2026"}`, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })),
        ...leisOriginPoints.map((item) => ({ origin: true, color: 0x58a9ff, city: item.location, label: item.label, date: item.role, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })),
      ]);
      rotationTimer = setInterval(() => { if (Date.now() > manualUntil) chart.set("rotationX", (chart.get("rotationX") ?? 0) + 0.33); }, 90);
      let route = -1; routeTimer = setInterval(() => { if (Date.now() <= manualUntil) return; route = (route + 1) % news.length; moveTo(news[route], 3200); }, 11500);
    })();
    return () => { disposed = true; if (rotationTimer) clearInterval(rotationTimer); if (routeTimer) clearInterval(routeTimer); if (externalFocus) window.removeEventListener("leis-globe-focus", externalFocus); if (hideTimer.current) clearTimeout(hideTimer.current); chartRef.current = null; root?.dispose(); };
  }, []);
  const moveTo = false;
  const countrySignals = country ? news.map((item, index) => ({ item, index })).filter(({ item }) => (country.includes("United States") && item.place.includes("USA")) || (country.includes("France") && item.place.includes("France"))) : [];
  const isPrague = Boolean(country && (country.includes("Czech") || country.includes("Czechia")));
  return <div className="globe-map-shell" onMouseLeave={delayHide}><div className="globe-map" ref={node} aria-label="Interactive globe. Drag to rotate, scroll to zoom and choose a source point." />{hover && <aside className={`globe-info ${hover.origin ? "origin" : ""}`} onMouseEnter={() => hideTimer.current && clearTimeout(hideTimer.current)} onMouseLeave={delayHide}><small>{hover.origin ? "LEIS ORIGIN" : "SOURCE LOCATION"}</small><strong>{hover.city}</strong><span>{hover.label}</span><em>{hover.date}</em></aside>}{country && <aside className="country-window"><button aria-label="Close country window" onClick={() => setCountry(null)}>×</button><small>COUNTRY SIGNAL WINDOW</small><h3>{country}</h3>{isPrague ? <p>Prague currently marks the documented public origin of LEIS. It is not presented as a news source.</p> : countrySignals.length ? <><p>Choose a reviewed public source signal from this country.</p><div>{countrySignals.slice(0, 5).map(({ item, index }) => <button key={item.title} onClick={() => { onSelectRef.current(index); moveTo? undefined : undefined; setCountry(null); }}>{item.title}</button>)}</div></> : <p>No reviewed public AI source signal has been added for this country yet.</p>}</aside>}</div>;
}

function GlobeFocusLegacy({ onSelect }: { onSelect: (index: number) => void }) {
  const node = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>();
  const [hover, setHover] = useState<{ city: string; label: string; date: string; origin?: boolean } | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [focusLevel, setFocusLevel] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const onSelectRef = useRef(onSelect); onSelectRef.current = onSelect;
  const openFocus = (index?: number) => { if (typeof index === "number") { setSelectedIndex(index); onSelectRef.current(index); } setFocusLevel((level) => level === 0 ? 1 : 2); };
  const closeFocus = () => { setFocusLevel(0); setCountry(null); };
  const showHover = (info: { city: string; label: string; date: string; origin?: boolean }) => { if (hideTimer.current) clearTimeout(hideTimer.current); setHover(info); };
  const delayHide = () => { hideTimer.current = setTimeout(() => setHover(null), 1000); };
  useEffect(() => { document.body.classList.toggle("globe-focus-mode", focusLevel > 0); return () => document.body.classList.remove("globe-focus-mode"); }, [focusLevel]);
  useEffect(() => {
    let root: any; let disposed = false; let manualUntil = 0; let rotationTimer: ReturnType<typeof setInterval> | undefined; let routeTimer: ReturnType<typeof setInterval> | undefined;
    const moveTo = (item: News, duration = 900) => { const chart = chartRef.current; if (!chart) return; chart.animate({ key: "rotationX", to: -item.lon, duration }); chart.animate({ key: "rotationY", to: -item.lat, duration }); };
    (async () => {
      const am5 = await import("@amcharts/amcharts5"); const am5map = await import("@amcharts/amcharts5/map"); const world = (await import("@amcharts/amcharts5-geodata/worldLow")).default;
      if (disposed || !node.current) return;
      root = am5.Root.new(node.current); root._logo?.dispose();
      const chart = root.container.children.push(am5map.MapChart.new(root, { panX: "rotateX", panY: "rotateY", wheelY: "zoom", projection: am5map.geoOrthographic(), rotationX: -22, rotationY: -6 })); chartRef.current = chart;
      chart.chartContainer.events.on("pointerdown", () => { manualUntil = Date.now() + 14000; });
      const polygons = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: world }));
      polygons.mapPolygons.template.setAll({ fill: am5.color(0x153f5e), stroke: am5.color(0x5bcfe0), strokeOpacity: 0.42, strokeWidth: 0.6, interactive: true, tooltipText: "{name}" });
      polygons.mapPolygons.template.states.create("hover", { fill: am5.color(0x246f8a) });
      polygons.mapPolygons.template.events.on("click", (event: any) => { const name = event.target.dataItem?.dataContext?.name; if (name) { setCountry(name); setSelectedIndex(null); openFocus(); } manualUntil = Date.now() + 14000; });
      const points = chart.series.push(am5map.MapPointSeries.new(root, {}));
      points.bullets.push(() => {
        const holder = am5.Container.new(root, { width: 0, height: 0, cursorOverStyle: "pointer" });
        const halo = holder.children.push(am5.Circle.new(root, { radius: 5.4, fill: am5.color(0x69ffba), fillOpacity: 0.42 }));
        const core = holder.children.push(am5.Circle.new(root, { radius: 5.4, fill: am5.color(0x69ffba), stroke: am5.color(0xeafff4), strokeWidth: 1.4 }));
        const hit = holder.children.push(am5.Circle.new(root, { radius: 17, fill: am5.color(0xffffff), fillOpacity: 0.001 }));
        for (const shape of [halo, core]) shape.adapters.add("fill", (_value: any, target: any) => am5.color(target.dataItem?.dataContext?.color ?? 0x69ffba));
        for (const shape of [halo, core]) shape.adapters.add("radius", (_value: any, target: any) => target.dataItem?.dataContext?.origin ? 6.5 : 5.4);
        halo.animate({ key: "scale", from: 1, to: 3.2, duration: 2400, loops: Infinity, easing: am5.ease.cubic }); halo.animate({ key: "opacity", from: 0.72, to: 0, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
        hit.events.on("pointerover", (event: any) => { const data = event.target.dataItem?.dataContext; showHover({ city: data.city, label: data.label, date: data.date, origin: data.origin }); manualUntil = Date.now() + 5000; });
        hit.events.on("pointerout", () => delayHide());
        hit.events.on("click", (event: any) => { const data = event.target.dataItem?.dataContext; if (typeof data?.index === "number") { moveTo(news[data.index]); openFocus(data.index); } else { openFocus(); } manualUntil = Date.now() + 14000; });
        return am5.Bullet.new(root, { sprite: holder });
      });
      points.data.setAll([...news.map((item, index) => ({ index, color: 0x69ffba, city: item.place, label: item.source, date: `Source checked: ${item.reviewed ?? "5 August 2026"}`, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })), ...leisOriginPoints.map((item) => ({ origin: true, color: 0x58a9ff, city: item.location, label: item.label, date: item.role, geometry: { type: "Point", coordinates: [item.lon, item.lat] } }))]);
      rotationTimer = setInterval(() => { if (Date.now() > manualUntil && focusLevel === 0) chart.set("rotationX", (chart.get("rotationX") ?? 0) + 0.33); }, 90);
      let route = -1; routeTimer = setInterval(() => { if (Date.now() <= manualUntil || focusLevel > 0) return; route = (route + 1) % news.length; moveTo(news[route], 3200); }, 11500);
    })();
    return () => { disposed = true; if (rotationTimer) clearInterval(rotationTimer); if (routeTimer) clearInterval(routeTimer); if (hideTimer.current) clearTimeout(hideTimer.current); chartRef.current = null; root?.dispose(); };
  }, []);
  const countrySignals = country ? news.map((item, index) => ({ item, index })).filter(({ item }) => (country.includes("United States") && item.place.includes("USA")) || (country.includes("France") && item.place.includes("France"))) : [];
  const selected = selectedIndex === null ? null : news[selectedIndex];
  const prague = Boolean(country && (country.includes("Czech") || country.includes("Czechia")));
  return <><div className="globe-map-shell" onMouseLeave={delayHide}><div className="globe-map" ref={node} aria-label="Interactive globe. Drag to rotate, scroll to zoom and choose a source point." />{hover && focusLevel === 0 && <aside className={`globe-info ${hover.origin ? "origin" : ""}`} onMouseEnter={() => hideTimer.current && clearTimeout(hideTimer.current)} onMouseLeave={delayHide}><small>{hover.origin ? "LEIS ORIGIN" : "SOURCE LOCATION"}</small><strong>{hover.city}</strong><span>{hover.label}</span><em>{hover.date}</em></aside>}</div>{focusLevel > 0 && <><div className="globe-focus-scrim" onClick={closeFocus}/><section className={`globe-focus-window level-${focusLevel}`}><button className="close-focus" onClick={closeFocus} aria-label="Close selection">×</button>{country && !selected ? <><small>COUNTRY SIGNAL WINDOW</small><h3>{country}</h3>{prague ? <p>Prague marks the public origin of LEIS. It is not presented as a news source.</p> : countrySignals.length ? <><p>Choose a reviewed source signal. The next selection opens its full LEIS context.</p><div className="focus-choices">{countrySignals.slice(0, 5).map(({ item, index }) => <button key={item.title} onClick={() => openFocus(index)}>{item.title}<span>{item.source} · {item.place}</span></button>)}</div></> : <p>No reviewed public AI source signal has been added for this country yet.</p>}</> : selected ? <><small>{focusLevel === 1 ? "SELECTED SOURCE SIGNAL" : "SOURCE + LEIS CONTEXT"}</small><h3>{selected.title}</h3><p className="focus-origin">{selected.source} · {selected.place} · source checked {selected.reviewed ?? "5 August 2026"}</p>{focusLevel === 1 ? <button className="open-context" onClick={() => setFocusLevel(2)}>Open full context</button> : <div className="focus-detail"><p><b>What the source says:</b> {selected.summary}</p><p><b>LEIS commentary:</b> {selected.leis}</p><a className="primary" href={selected.url} target="_blank" rel="noreferrer">Read original source ↗</a></div>}</> : null}</section></>}</>;
}

function GlobeCurrentLegacy({ onSelect }: { onSelect: (index: number) => void }) {
  const node = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [focus, setFocus] = useState(false);
  const focusRef = useRef(false); focusRef.current = focus;
  const [detail, setDetail] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [deskStart, setDeskStart] = useState<number | null>(null);
  const selectedNews = selected === null ? null : news[selected];
  const choose = (index: number, expand = false) => { setSelected(index); setCountry(null); setFocus(true); setDetail(expand); onSelect(index); const item = news[index]; const chart = chartRef.current; if (chart && item) { chart.animate({ key: "rotationX", to: -item.lon, duration: 850 }); chart.animate({ key: "rotationY", to: -item.lat, duration: 850 }); } };
  const close = () => { setFocus(false); setDetail(false); setCountry(null); };
  useEffect(() => { document.body.classList.toggle("globe-focus-mode", focus); return () => document.body.classList.remove("globe-focus-mode"); }, [focus]);
  useEffect(() => {
    let root: any; let disposed = false; let drift: ReturnType<typeof setInterval> | undefined; let route: ReturnType<typeof setInterval> | undefined; let manualUntil = 0;
    const aim = (item: News, duration = 3000) => { const chart = chartRef.current; if (!chart) return; chart.animate({ key: "rotationX", to: -item.lon, duration }); chart.animate({ key: "rotationY", to: -item.lat, duration }); };
    (async () => {
      const am5 = await import("@amcharts/amcharts5"); const am5map = await import("@amcharts/amcharts5/map"); const world = (await import("@amcharts/amcharts5-geodata/worldLow")).default;
      if (disposed || !node.current) return;
      root = am5.Root.new(node.current); root._logo?.dispose();
      const chart = root.container.children.push(am5map.MapChart.new(root, { panX: "rotateX", panY: "rotateY", wheelY: "zoom", projection: am5map.geoOrthographic(), rotationX: -22, rotationY: -6 })); chartRef.current = chart;
      chart.chartContainer.events.on("pointerdown", () => { manualUntil = Date.now() + 13000; });
      const polygons = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: world }));
      polygons.mapPolygons.template.setAll({ fill: am5.color(0x153f5e), stroke: am5.color(0x5bcfe0), strokeOpacity: 0.42, strokeWidth: 0.6, interactive: true, tooltipText: "{name}" }); polygons.mapPolygons.template.states.create("hover", { fill: am5.color(0x246f8a) });
      polygons.mapPolygons.template.events.on("click", (event: any) => { const data = event.target.dataItem?.dataContext ?? {}; setCountry(data.name ?? "Selected country"); setSelected(null); setDetail(false); setFocus(true); manualUntil = Date.now() + 13000; });
      const points = chart.series.push(am5map.MapPointSeries.new(root, {}));
      points.bullets.push(() => {
        const holder = am5.Container.new(root, { width: 0, height: 0, cursorOverStyle: "pointer" });
        const halo = holder.children.push(am5.Circle.new(root, { radius: 5.4, fill: am5.color(0x69ffba), fillOpacity: 0.42 })); const core = holder.children.push(am5.Circle.new(root, { radius: 5.4, fill: am5.color(0x69ffba), stroke: am5.color(0xeafff4), strokeWidth: 1.4 })); const hit = holder.children.push(am5.Circle.new(root, { radius: 18, fill: am5.color(0xffffff), fillOpacity: 0.001 }));
        for (const shape of [halo, core]) { shape.adapters.add("fill", (_value: any, target: any) => am5.color(target.dataItem?.dataContext?.color ?? 0x69ffba)); shape.adapters.add("radius", (_value: any, target: any) => target.dataItem?.dataContext?.origin ? 6.5 : 5.4); }
        halo.animate({ key: "scale", from: 1, to: 3.2, duration: 2400, loops: Infinity, easing: am5.ease.cubic }); halo.animate({ key: "opacity", from: 0.72, to: 0, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
        hit.events.on("click", () => { const data = holder.dataItem?.dataContext ?? {}; if (typeof data.index === "number") choose(data.index); else { setCountry("Prague, Czech Republic"); setSelected(null); setFocus(true); } manualUntil = Date.now() + 13000; });
        return am5.Bullet.new(root, { sprite: holder });
      });
      points.data.setAll([...news.map((item, index) => ({ index, color: 0x69ffba, geometry: { type: "Point", coordinates: [item.lon, item.lat] } })), ...leisOriginPoints.map((item) => ({ origin: true, color: 0x58a9ff, geometry: { type: "Point", coordinates: [item.lon, item.lat] } }))]);
      drift = setInterval(() => { if (Date.now() > manualUntil) chart.set("rotationX", (chart.get("rotationX") ?? 0) + 0.28); }, 90);
      let next = -1; route = setInterval(() => { if (Date.now() > manualUntil) { next = (next + 1) % news.length; aim(news[next]); } }, 11500);
    })();
    return () => { disposed = true; if (drift) clearInterval(drift); if (route) clearInterval(route); root?.dispose(); };
  }, []);
  const countrySignals = country ? news.map((item, index) => ({ item, index })).filter(({ item }) => country.includes("United States") ? item.place.includes("USA") : country.includes("France") ? item.place.includes("France") : false) : [];
  return <><div className="globe-map-shell"><div className="globe-map" ref={node} aria-label="Interactive globe. Drag to rotate, scroll to zoom and choose a source point." /></div>{focus && <><div className="globe-focus-scrim" onClick={close}/><section className={`globe-focus-window ${detail ? "level-2" : "level-1"}`}><button className="close-focus" onClick={close} aria-label="Close selection">×</button>{selectedNews ? <><small>{detail ? "SOURCE + LEIS CONTEXT" : "SELECTED SOURCE SIGNAL"}</small><h3>{selectedNews.title}</h3><p className="focus-origin">{selectedNews.source} · {selectedNews.place} · source checked {selectedNews.reviewed ?? "5 August 2026"}</p>{detail ? <div className="focus-detail"><p><b>What the source says:</b> {selectedNews.summary}</p><p><b>LEIS commentary:</b> {selectedNews.leis}</p><a className="primary" href={selectedNews.url} target="_blank" rel="noreferrer">Read original source ↗</a></div> : <button className="open-context" onClick={() => setDetail(true)}>Open full context</button>}</> : <><small>COUNTRY SIGNAL WINDOW</small><h3>{country ?? "Explore current AI source signals"}</h3>{countrySignals.length ? <><p>Choose a reviewed source signal. The next selection opens its full LEIS context.</p><div className="focus-choices">{countrySignals.slice(0, 5).map(({ item, index }) => <button key={item.title} onClick={() => choose(index, true)}>{item.title}<span>{item.source} · {item.place}</span></button>)}</div></> : <><p>Choose a source organisation to explore its current reviewed signals.</p><div className="focus-choices">{[0, 5, 10, 15].map((index) => <button key={news[index].source} onClick={() => choose(index, true)}>{news[index].source}<span>{news[index].place}</span></button>)}</div></>}</>}</section></>}</>;
}

function Globe({ onSelect }: { onSelect: (index: number) => void }) {
  const node = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [focus, setFocus] = useState(false);
  const [detail, setDetail] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [deskStart, setDeskStart] = useState<number | null>(null);
  const selectedNews = selected === null ? null : news[selected];

  const aim = useCallback((item: News, duration = 850) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.animate({ key: "rotationX", to: -item.lon, duration });
    chart.animate({ key: "rotationY", to: -item.lat, duration });
  }, []);

  const adjustZoom = useCallback((direction: number) => {
    const chart = chartRef.current;
    if (!chart) return;
    const current = chart.get("zoomLevel") ?? 1;
    const next = Math.max(1, Math.min(4.5, current + direction * 0.35));
    chart.animate({ key: "zoomLevel", to: next, duration: 220 });
  }, []);

  const choose = useCallback((index: number, expand = false) => {
    setSelected(index);
    setCountry(null);
    setDeskStart(null);
    setFocus(true);
    setDetail(expand);
    onSelect(index);
    aim(news[index]);
  }, [aim, onSelect]);

  const openCzechia = useCallback(() => {
    setCountry("Czech Republic");
    setSelected(null);
    setDetail(false);
    setDeskStart(null);
    setFocus(true);
  }, []);

  const openPragueOrigin = useCallback(() => {
    setCountry("Prague, Czech Republic");
    setSelected(null);
    setDetail(false);
    setDeskStart(null);
    setFocus(true);
  }, []);

  const openDesk = useCallback((start: number) => {
    setDeskStart(start);
    setCountry(null);
    setSelected(null);
    setDetail(false);
    setFocus(true);
    aim(news[start]);
  }, [aim]);

  const close = () => {
    setFocus(false);
    setDetail(false);
    setCountry(null);
    setDeskStart(null);
  };

  useEffect(() => {
    document.body.classList.toggle("globe-focus-mode", focus);
    return () => document.body.classList.remove("globe-focus-mode");
  }, [focus]);

  useEffect(() => {
    let root: any;
    let disposed = false;
    let drift: ReturnType<typeof setInterval> | undefined;
    let route: ReturnType<typeof setInterval> | undefined;
    let weatherRefresh: ReturnType<typeof setInterval> | undefined;
    let wheelHost: HTMLDivElement | null = null;
    let onWheel: ((event: WheelEvent) => void) | undefined;
    let onTouchStart: ((event: TouchEvent) => void) | undefined;
    let onTouchMove: ((event: TouchEvent) => void) | undefined;
    let onTouchEnd: ((event: TouchEvent) => void) | undefined;
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    let manualUntil = 0;
    const rotateTo = (item: News, duration = 3000) => {
      const chart = chartRef.current;
      if (!chart) return;
      chart.animate({ key: "rotationX", to: -item.lon, duration });
      chart.animate({ key: "rotationY", to: -item.lat, duration });
    };
    (async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5map = await import("@amcharts/amcharts5/map");
      const world = (await import("@amcharts/amcharts5-geodata/worldLow")).default;
      if (disposed || !node.current) return;
      root = am5.Root.new(node.current);
      root._logo?.dispose();
      const chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "rotateX", panY: "rotateY", wheelY: "none",
        projection: am5map.geoOrthographic(), rotationX: -22, rotationY: -6,
      }));
      chartRef.current = chart;
      wheelHost = node.current;
      onWheel = (event: WheelEvent) => {
        if (!event.shiftKey) return;
        event.preventDefault();
        manualUntil = Date.now() + 9000;
        const current = chart.get("zoomLevel") ?? 1;
        const next = Math.max(1, Math.min(4.5, current + (event.deltaY < 0 ? 0.35 : -0.35)));
        chart.animate({ key: "zoomLevel", to: next, duration: 180 });
      };
      wheelHost.addEventListener("wheel", onWheel, { passive: false });
      const distance = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      onTouchStart = (event: TouchEvent) => {
        if (event.touches.length !== 2) return;
        event.preventDefault();
        pinchStartDistance = distance(event.touches);
        pinchStartZoom = chart.get("zoomLevel") ?? 1;
        manualUntil = Date.now() + 9000;
      };
      onTouchMove = (event: TouchEvent) => {
        if (event.touches.length !== 2 || !pinchStartDistance) return;
        event.preventDefault();
        const scale = distance(event.touches) / pinchStartDistance;
        const next = Math.max(1, Math.min(4.5, pinchStartZoom * scale));
        chart.set("zoomLevel", next);
        manualUntil = Date.now() + 9000;
      };
      onTouchEnd = (event: TouchEvent) => { if (event.touches.length < 2) pinchStartDistance = 0; };
      wheelHost.addEventListener("touchstart", onTouchStart, { passive: false });
      wheelHost.addEventListener("touchmove", onTouchMove, { passive: false });
      wheelHost.addEventListener("touchend", onTouchEnd, { passive: true });
      chart.chartContainer.events.on("pointerdown", () => { manualUntil = Date.now() + 13000; });
      // A projected water polygon stays attached to the same Earth model as the countries.
      // Unlike a CSS background, it rotates and zooms with the orthographic globe.
      const ocean = chart.series.unshift(am5map.MapPolygonSeries.new(root, {}));
      ocean.mapPolygons.template.setAll({
        fill: am5.color(0x0a4166), fillOpacity: 0.96,
        stroke: am5.color(0x1b6b8b), strokeOpacity: 0.34, strokeWidth: 0.8,
        interactive: false,
      });
      ocean.data.setAll([{ geometry: am5map.getGeoRectangle(90, 180, -90, -180) }]);
      // This deliberately uses only the proven MapPolygon properties. It keeps the
      // ocean coupled to the globe and gives it a quiet, visible tide without
      // risking the country layer during initialisation.
      ocean.mapPolygons.template.animate({ key: "fillOpacity", from: 0.74, to: 1, duration: 5600, loops: Infinity, easing: am5.ease.sine });
      const polygons = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: world }));
      polygons.mapPolygons.template.setAll({
        fill: am5.color(0x286986), stroke: am5.color(0x72d2e2), strokeOpacity: 0.38,
        strokeWidth: 0.65, interactive: true, tooltipText: "{name}",
        shadowColor: am5.color(0x01070e), shadowBlur: 4, shadowOffsetY: 2, shadowOpacity: 0.34,
      });
      polygons.mapPolygons.template.states.create("hover", { fill: am5.color(0x246f8a) });
      polygons.mapPolygons.template.events.on("click", (event: any) => {
        const data = event.target.dataItem?.dataContext ?? {};
        if (data.name === "Czechia" || data.name === "Czech Republic") openCzechia();
        else { setCountry(data.name ?? "Selected country"); setSelected(null); setDeskStart(null); setDetail(false); setFocus(true); }
        manualUntil = Date.now() + 13000;
      });
      const weatherLayer = chart.series.push(am5map.MapPointSeries.new(root, {}));
      weatherLayer.bullets.push((rootArg: any, _series: any, dataItem: any) => {
        const data = dataItem?.dataContext ?? {};
        const tone = data.tone ?? 0x8edce8;
        const severe = Boolean(data.severe);
        const wet = Boolean(data.wet);
        const holder = am5.Container.new(rootArg, { width: 0, height: 0, tooltipText: data.weather });
        const field = holder.children.push(am5.Circle.new(rootArg, { radius: severe ? 33 : wet ? 27 : 20, fill: am5.color(tone), fillOpacity: severe ? 0.19 : wet ? 0.13 : 0.08 }));
        const ring = holder.children.push(am5.Circle.new(rootArg, { radius: severe ? 20 : wet ? 16 : 12, fillOpacity: 0, stroke: am5.color(tone), strokeOpacity: severe ? 0.48 : 0.28, strokeWidth: 1 }));
        const centre = holder.children.push(am5.Circle.new(rootArg, { radius: severe ? 8 : wet ? 6 : 4.5, fill: am5.color(tone), fillOpacity: severe ? 0.68 : 0.46 }));
        const duration = severe ? 2200 : wet ? 3200 : 5200;
        field.animate({ key: "scale", from: 0.88, to: severe ? 1.34 : wet ? 1.24 : 1.14, duration, loops: Infinity, easing: am5.ease.sine });
        field.animate({ key: "opacity", from: 0.55, to: 0.18, duration, loops: Infinity, easing: am5.ease.sine });
        ring.animate({ key: "scale", from: 0.76, to: severe ? 2.6 : wet ? 2.1 : 1.55, duration, loops: Infinity, easing: am5.ease.sine });
        ring.animate({ key: "opacity", from: 0.62, to: 0, duration, loops: Infinity, easing: am5.ease.sine });
        return am5.Bullet.new(rootArg, { sprite: holder });
      });
      const weatherSites = [
        { name: "San Francisco", lat: 37.7749, lon: -122.4194 }, { name: "Toronto", lat: 43.6532, lon: -79.3832 },
        { name: "London", lat: 51.5072, lon: -0.1276 }, { name: "Prague", lat: 50.0755, lon: 14.4378 },
        { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773 }, { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
        { name: "Singapore", lat: 1.3521, lon: 103.8198 }, { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
        { name: "Sao Paulo", lat: -23.5505, lon: -46.6333 }, { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
        { name: "Nairobi", lat: -1.2921, lon: 36.8219 }, { name: "Reykjavik", lat: 64.1466, lon: -21.9426 },
      ];
      const weatherLabel = (code: number) => code >= 95 ? "thunderstorm" : code >= 80 ? "rain showers" : code >= 51 ? "rain" : code >= 45 ? "mist" : code >= 3 ? "overcast" : code >= 1 ? "partly cloudy" : "clear";
      const weatherTone = (code: number, temperature = 0) => code >= 95 ? 0xc090ff : code >= 51 ? 0x5caef5 : temperature >= 30 ? 0xf2bb78 : code >= 3 ? 0x9ad7e4 : 0x9ee6c0;
      void Promise.all(weatherSites.map(async (site) => {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}&current=weather_code,cloud_cover,precipitation&timezone=auto`);
        const payload = await response.json();
        const code = Number(payload?.current?.weather_code ?? 0);
        return { geometry: { type: "Point", coordinates: [site.lon, site.lat] }, weather: `${site.name} · live weather: ${weatherLabel(code)}`, tone: weatherTone(code), severe: code >= 95 };
      })).then((weather) => { if (!disposed) weatherLayer.data.setAll(weather); }).catch(() => { /* The globe remains useful when the optional live weather stream is unavailable. */ });
      const refreshWeather = async () => {
        try {
          const weather = await Promise.all(weatherSites.map(async (site) => {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}&current=temperature_2m,weather_code,cloud_cover,precipitation,wind_speed_10m&timezone=auto`);
            if (!response.ok) throw new Error("Weather response unavailable");
            const payload = await response.json();
            const current = payload?.current ?? {};
            const code = Number(current.weather_code ?? 0);
            const temperature = Math.round(Number(current.temperature_2m ?? 0));
            const wind = Math.round(Number(current.wind_speed_10m ?? 0));
            const rain = Number(current.precipitation ?? 0);
            return {
              geometry: { type: "Point", coordinates: [site.lon, site.lat] },
              weather: `${site.name} · LIVE ${temperature}°C · ${weatherLabel(code)} · wind ${wind} km/h`,
              tone: weatherTone(code, temperature), wet: code >= 51 || rain > 0, severe: code >= 95,
            };
          }));
          if (!disposed) weatherLayer.data.setAll(weather);
        } catch { /* The optional stream never blocks the globe itself. */ }
      };
      void refreshWeather();
      weatherRefresh = setInterval(() => { void refreshWeather(); }, 10 * 60 * 1000);
      const routes = chart.series.push(am5map.MapLineSeries.new(root, {}));
      routes.mapLines.template.setAll({
        stroke: am5.color(0x72f2f5), strokeOpacity: 0.44, strokeWidth: 1.5,
        strokeDasharray: [2.4, 9], strokeDashoffset: 0,
      });
      routes.data.setAll([
        { geometry: { type: "LineString", coordinates: [[-122.4194, 37.7749], [-74.006, 40.7128]] } },
        { geometry: { type: "LineString", coordinates: [[-74.006, 40.7128], [2.3522, 48.8566]] } },
        { geometry: { type: "LineString", coordinates: [[2.3522, 48.8566], [14.4378, 50.0755]] } },
        { geometry: { type: "LineString", coordinates: [[14.4378, 50.0755], [-122.0839, 37.3861]] } },
        { geometry: { type: "LineString", coordinates: [[-122.0839, 37.3861], [-122.4194, 37.7749]] } },
      ]);
      routes.events.on("datavalidated", () => {
        routes.mapLines.each((line: any, index: number) => {
          line.animate({ key: "strokeDashoffset", from: 0, to: -32, duration: 1320 + index * 150, loops: Infinity, easing: am5.ease.linear });
        });
      });
      const points = chart.series.push(am5map.MapPointSeries.new(root, {}));
      points.bullets.push((rootArg: any, _series: any, dataItem: any) => {
        const data = dataItem?.dataContext ?? {};
        const isOrigin = Boolean(data.origin);
        const colour = data.color ?? (isOrigin ? 0x58a9ff : 0x69ffba);
        const holder = am5.Container.new(rootArg, { width: 0, height: 0, cursorOverStyle: "pointer" });
        const halo = holder.children.push(am5.Circle.new(rootArg, { radius: isOrigin ? 7 : 5.4, fill: am5.color(colour), fillOpacity: 0.42 }));
        const core = holder.children.push(am5.Circle.new(rootArg, { radius: isOrigin ? 7 : 5.4, fill: am5.color(colour), stroke: am5.color(0xeafff4), strokeWidth: 1.4 }));
        const hit = holder.children.push(am5.Circle.new(rootArg, { radius: 25, fill: am5.color(0xffffff), fillOpacity: 0.001 }));
        halo.animate({ key: "scale", from: 1, to: 3.2, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
        halo.animate({ key: "opacity", from: 0.72, to: 0, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
        hit.events.on("click", () => {
          if (typeof data.deskStart === "number") openDesk(data.deskStart);
          else openPragueOrigin();
          manualUntil = Date.now() + 13000;
        });
        return am5.Bullet.new(rootArg, { sprite: holder });
      });
      const clusterIndex = new Map<string, number>();
      const anchors = new Map<string, [number, number]>();
      points.data.setAll([
        ...[0, 5, 10, 13, 15, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map((deskStart) => {
          const item = news[deskStart];
          return { deskStart, color: 0x69ffba, geometry: { type: "Point", coordinates: [item.lon, item.lat] } };
        }),
        ...leisOriginPoints.map((item, index) => ({ origin: true, color: 0x58a9ff, clusterKey: "leis-prague", clusterIndex: index, shortTitle: index === 0 ? "Martin Pužík · LEIS" : "M.A.J. Pužík · technical", geometry: { type: "Point", coordinates: [14.4378, 50.0755] } })),
      ]);
      drift = setInterval(() => {
        if (Date.now() > manualUntil) chart.set("rotationX", (chart.get("rotationX") ?? 0) + 0.28);
      }, 90);
      let next = -1;
      route = setInterval(() => {
        if (Date.now() > manualUntil) {
          next = (next + 1) % news.length;
          rotateTo(news[next]);
        }
      }, 11500);
    })();
    return () => {
      disposed = true;
      if (drift) clearInterval(drift);
      if (route) clearInterval(route);
      if (weatherRefresh) clearInterval(weatherRefresh);
      if (wheelHost && onWheel) wheelHost.removeEventListener("wheel", onWheel);
      if (wheelHost && onTouchStart) wheelHost.removeEventListener("touchstart", onTouchStart);
      if (wheelHost && onTouchMove) wheelHost.removeEventListener("touchmove", onTouchMove);
      if (wheelHost && onTouchEnd) wheelHost.removeEventListener("touchend", onTouchEnd);
      root?.dispose();
    };
  }, [openCzechia, openDesk, openPragueOrigin]);

  const countrySignals = country
    ? news.map((item, index) => ({ item, index })).filter(({ item }) =>
      country.includes("United States") ? item.place.includes("USA") :
      country.includes("France") ? item.place.includes("France") :
      country.includes("Czech Republic") ? item.place.includes("Czech Republic") : false)
    : [];
  const isPrague = Boolean(country?.includes("Prague"));
  const deskSignals = deskStart === null ? [] : news.map((item, index) => ({ item, index })).filter(({ item }) => item.source === news[deskStart].source && item.place === news[deskStart].place).slice(0, 5);
  const countryProfile = country ? countryProfiles[country] : undefined;
  const pendingCountryProfile = country && !isPrague && !countryProfile && !countrySignals.length ? {
    eyebrow: "COUNTRY AI CONTEXT · LOCAL PROFILE IN PREPARATION",
    title: `${country}: AI context is being mapped`,
    summary: "AI is now part of daily life, research, public services or business in every country, but the evidence, pace and safeguards are local. LEIS will not fill this space with unrelated news from elsewhere.",
    use: "This country has not yet received a reviewed local evidence pack. The next update will attach primary local sources, relevant institutions and a concise explanation of how AI is shaping the country.",
    leis: "LEIS context: a useful global view does not pretend that all places are the same. It keeps local evidence, uncertainty and provenance visible.",
    links: [{ label: "OECD AI Policy Observatory", url: "https://oecd.ai/en/dashboards/countries" }],
  } : undefined;
  const displayedCountryProfile = countryProfile ?? pendingCountryProfile;

  return <>
    <div className="globe-map-shell">
      <div className="globe-map" ref={node} aria-label="Interactive globe. Drag to rotate, scroll to zoom and choose a source point." />
      <div className="globe-zoom-controls" aria-label="Globe zoom controls">
        <button onClick={() => adjustZoom(1)} aria-label="Zoom in">+</button>
        <button onClick={() => adjustZoom(-1)} aria-label="Zoom out">−</button>
        <span>Shift + scroll</span>
      </div>
    </div>
    {focus && <>
      <div className="globe-focus-scrim" onClick={close}/>
      <section className={`globe-focus-window ${detail ? "level-2" : "level-1"}`} aria-live="polite">
        <button className="close-focus" onClick={close} aria-label="Close selection">×</button>
        {selectedNews ? <article className="selected-article">
          <p className="article-source">
            {selectedNews.source} NEWSROOM · {selectedNews.place} · SOURCE REVIEWED {selectedNews.reviewed ?? "5 AUGUST 2026"}
          </p>
          <h3>{selectedNews.title}</h3>
          {detail ? <div className="selected-detail">
            <p><b>What this source reports</b><br />{selectedNews.summary}</p>
            <p><b>LEIS context</b><br />{selectedNews.leis}</p>
            <a className="primary" href={selectedNews.url} target="_blank" rel="noreferrer">Read the original source ↗</a>
          </div> : <button className="open-context" onClick={() => setDetail(true)}>Open context</button>}
        </article> : deskStart !== null ? <>
          <small>PUBLIC SOURCE DESK · UP TO FIVE REVIEWED SIGNALS</small>
          <h3>{news[deskStart].source} · {news[deskStart].place}</h3>
          <div className="focus-choices">
            {deskSignals.map(({ item, index }) => <button key={item.title} onClick={() => choose(index, true)}>
              <small>{item.source} NEWSROOM · {item.place} · SOURCE REVIEWED {item.reviewed ?? "5 AUGUST 2026"}</small>
              <strong>{item.title}</strong>
            </button>)}
          </div>
        </> : country === "Czech Republic" ? <>
          <small>CZECH REPUBLIC · PUBLIC AI SIGNALS + LEIS ORIGIN</small>
          <h3>Czech AI, with Prague context.</h3>
          <div className="country-profile czech-intro">
            <p>These are public AI articles from Czech Technical University in Prague. They are separate from LEIS: the Prague origin cards below identify authorship and collaboration, not a Czech news desk.</p>
          </div>
          <div className="focus-choices">
            {countrySignals.slice(0, 5).map(({ item, index }) => <button key={item.title} onClick={() => choose(index, true)}>
              <small>{item.source} · {item.place} · SOURCE REVIEWED {item.reviewed ?? "5 AUGUST 2026"}</small>
              <strong>{item.title}</strong>
            </button>)}
          </div>
          <div className="prague-origin-cards czech-origin-summary">
            <article><small>LEIS ORIGIN · PRAGUE</small><strong>Martin Pužík</strong><span>Founder, creator and constitution author of LEIS. The core was independently completed around 10 July 2026.</span></article>
            <article><small>TECHNICAL COLLABORATION</small><strong>M.A.J. Pužík</strong><span>Technical activation and development after the independent LEIS seed.</span></article>
          </div>
        </> : isPrague ? <>
          <small>LEIS ORIGIN / PRAGUE</small>
          <h3>Prague, Czech Republic</h3>
          <div className="prague-origin-cards">
            <article><small>CREATOR · DOCUMENTED ORIGIN</small><strong>Martin Pužík</strong><span>Founder, creator and constitution author of LEIS.</span><p>LEIS core was independently completed around 10 July 2026. Prague is the publicly documented origin context.</p></article>
            <article><small>TECHNICAL COLLABORATION</small><strong>M.A.J. Pužík</strong><span>Technical activation and development.</span><p>Joined after the seed: practical AI and technical experience supporting LEIS activation, while the core retained its independent origin.</p></article>
            <article><small>PUBLIC CONTACT</small><strong>Work with LEIS</strong><span>Questions, research, grants or partnership.</span><a href="mailto:martin.puzik@gmail.com?subject=LEIS%20contact">Contact Martin Pužík ↗</a></article>
          </div>
        </> : displayedCountryProfile ? <>
          <small>{displayedCountryProfile.eyebrow}</small>
          <h3>{displayedCountryProfile.title}</h3>
          <div className="country-profile">
            <p>{displayedCountryProfile.summary}</p>
            <p><b>How AI is used</b><br />{displayedCountryProfile.use}</p>
            <p><b>LEIS context</b><br />{displayedCountryProfile.leis}</p>
            <div className="country-profile-links">{displayedCountryProfile.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
          </div>
        </> : <>
          <small>PUBLIC SOURCE DESKS</small>
          <h3>{country ?? "Explore current AI source signals"}</h3>
          {countrySignals.length ? <div className="focus-choices">
            {countrySignals.slice(0, 5).map(({ item, index }) => <button key={item.title} onClick={() => choose(index, true)}>
              <small>{item.source} NEWSROOM · {item.place} · SOURCE REVIEWED {item.reviewed ?? "5 AUGUST 2026"}</small>
              <strong>{item.title}</strong>
            </button>)}
          </div> : <p className="country-empty">No reviewed local source or country AI profile has been added here yet. LEIS does not substitute unrelated news from another country.</p>}
        </>}
      </section>
    </>}
  </>;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [seedOpen, setSeedOpen] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const [leisOpen, setLeisOpen] = useState(false);
  const [leisTopic, setLeisTopic] = useState<"start" | "story" | "work">("start");
  const current = milestones[active];
  const selected = news[newsIndex];
  const leisGuidance = {
    start: { title: "What is LEIS?", text: "LEIS is not an AI product. It is a reality-oriented way to preserve, activate and reconstruct understanding when people, tools or time change.", link: "#orientation", action: "Start with orientation" },
    story: { title: "Where did it begin?", text: "The public timeline distinguishes documentation, creator-reported context and interpretation. It begins with the constitutional seed and stays honest about what is known.", link: "#timeline", action: "Follow the timeline" },
    work: { title: "Can we work together?", text: "Yes. LEIS is open to respectful research, a concrete pilot, a grant conversation or a company handover problem. There is no mailing list and no pressure.", link: "#grants", action: "Explore cooperation" },
  }[leisTopic];
  const choose = useCallback((index: number) => { setNewsIndex(index); window.dispatchEvent(new CustomEvent("leis-globe-focus", { detail: index })); }, []);
  return <><main>
    <nav><a className="mark" href="#top">Omega <b>LEIS</b></a><div><a href="#orientation">Start here</a><a href="#timeline">Our story</a><a href="#earth">Earth Pulse</a><a href="#grants">Support LEIS</a><a href="#media">Media</a></div></nav>
    <section className="hero" id="top"><div className="stars" /><div className="hero-copy"><p className="eyebrow">REALITY-ORIENTED UNDERSTANDING SYSTEM</p><h1>Understanding<br/><em>that can travel.</em></h1><p className="lead">LEIS is a technology-independent framework for recognising, activating and reconstructing understanding from reality.</p><div className="actions"><a className="primary" href="#orientation">Enter LEIS</a><a className="quiet" href="#timeline">Follow the lineage ↓</a></div></div><button className={`seed ${seedOpen ? "open" : ""}`} onClick={() => setSeedOpen(!seedOpen)} aria-expanded={seedOpen} aria-label="Open the LEIS Seed preview"><i/><span className="shell left"/><span className="shell right"/><span className="sprout"/></button><div className="seed-note"><span>LEIS SEED</span><strong>{seedOpen ? "A public Seed is taking shape." : "Touch the seed."}</strong><p>{seedOpen ? "A reviewed public entry point is being prepared: lineage, orientation and limits — without private archives." : "A small beginning, built to travel."}</p></div></section>
    <section className="orientation" id="orientation"><p className="eyebrow">QUICK ORIENTATION</p><h2>Reality was never hidden.<br/>Recognition was incomplete.</h2><div className="principles"><article><b>01</b><h3>Recognition</h3><p>Questions become roots. Relationships become branches. Understanding grows when the right pattern is recognised.</p></article><article><b>02</b><h3>Lineage</h3><p>Context should survive change: of people, tools, time and technology.</p></article><article><b>03</b><h3>Validation</h3><p>Reality remains the final validator. Where evidence is incomplete, uncertainty remains visible.</p></article></div><p className="formula">Reality → recognition → activation → understanding → validation → new reality</p></section>
    <section className="timeline" id="timeline"><p className="eyebrow">LIVING LEIS TIMELINE</p><h2>From seed to continuity.</h2><div className="timeline-grid"><div className="axis"><div className="pulse"/>{milestones.map(([, date, title], index) => <button key={title} className={active === index ? "active" : ""} style={{ top: `${17 + index * 22}%` }} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}><span/><small>{date}</small></button>)}</div><article className="event"><small>{current[0]} · {current[1]}</small><h3>{current[2]}</h3><p>{current[3]}</p></article></div><p className="certainty">Every point distinguishes documented evidence, creator-reported context and interpretation. The timeline is alive; it does not replace evidence.</p></section>
    <section className="earth" id="earth"><p className="eyebrow">EARTH PULSE / CURRENT AI SIGNALS</p><h2>Where the current conversation<br/>is coming from.</h2><p className="earth-lead">Drag the globe to explore. Every signal keeps its source visible: its colour, location and connector line show the originating public desk — not a claim about where its impact ends.</p><div className="earth-experience"><div className="signal-rail left-rail">{news.slice(0, 10).map((item, index) => <button className={newsIndex === index ? "selected" : ""} style={{ "--source": sourceColors[item.source] } as React.CSSProperties} onClick={() => choose(index)} key={item.title}><span className="signal-origin">{item.source} · {item.place}</span><strong>{item.title}</strong></button>)}</div><div className="globe-stage"><div className="stars local-stars"/>{Array.from({ length: 20 }, (_, index) => <i className="depth-star" key={index} style={{ left: `${(index * 31) % 100}%`, top: `${(index * 47) % 100}%`, animationDelay: `${index * 0.18}s` }} />)}<Globe onSelect={choose}/><p>Drag to rotate · scroll to zoom · select a point</p></div><div className="signal-rail right-rail">{news.slice(10).map((item, localIndex) => { const index = localIndex + 10; return <button className={newsIndex === index ? "selected" : ""} style={{ "--source": sourceColors[item.source] } as React.CSSProperties} onClick={() => choose(index)} key={item.title}><span className="signal-origin">{item.source} · {item.place}</span><strong>{item.title}</strong></button>; })}</div></div><article className="reading-card"><p className="eyebrow">SELECTED SOURCE SIGNAL · {selected.source.toUpperCase()}</p><h3>{selected.title}</h3><p><b>What the source says:</b> {selected.summary}</p><p><b>LEIS commentary:</b> {selected.leis}</p><div><span className="origin-dot" style={{ background: sourceColors[selected.source] }}/> Originating public desk: {selected.place}</div><a className="primary" href={selected.url} target="_blank" rel="noreferrer">Read the original source ↗</a></article><div className="source-row"><a href="https://blog.google/innovation-and-ai/technology/ai/" target="_blank">Google AI</a><a href="https://openai.com/news/" target="_blank">OpenAI</a><a href="https://www.anthropic.com/news" target="_blank">Anthropic</a><a href="https://huggingface.co/blog" target="_blank">Hugging Face</a></div></section>
    <section className="grants" id="grants"><p className="eyebrow">SUPPORT / COOPERATION / GRANT INTENT</p><h2>Keep LEIS free.<br/>Make it durable.</h2><p className="grant-lead">LEIS is free of charge forever. Support does not buy a wall around knowledge; it gives the human work behind preservation, validation and accessible public orientation the time to continue.</p><div className="grant-grid"><article><b>01</b><h3>Preserve</h3><p>Recover source lineage, distinguish evidence from interpretation and prevent years of work from becoming unreadable files.</p></article><article><b>02</b><h3>Test</h3><p>Measure whether understanding survives a handover: can a new person reconstruct a decision, its conditions and its limits?</p></article><article><b>03</b><h3>Share</h3><p>Build public explanations, practical pilots and open materials that let people judge LEIS for themselves.</p></article></div><div className="grant-path"><p><b>For grants:</b> operational continuity, documentation, validation, infrastructure and independent review.</p><p><b>For companies:</b> a bounded collaboration around a real handover, decision or knowledge-continuity problem.</p><p><b>For researchers and institutions:</b> an invitation to challenge the method and improve its tests.</p></div><a className="primary" href="mailto:martin.puzik@gmail.com?subject=LEIS%20grant%20or%20cooperation%20dialogue">Discuss support or a pilot</a></section>
    <section className="media" id="media"><p className="eyebrow">MEDIA / JOURNALISTS / RESEARCHERS</p><h2>Start with the human question.</h2><p>Can understanding survive the departure of the person who created it? This is the story before any technology claim: continuity, evidence, uncertainty and the possibility of rebuilding context.</p><div className="media-grid"><article><h3>Two-minute orientation</h3><p>What LEIS is, what it is not, where it began and how it can be tested without asking anyone to simply believe it.</p></article><article><h3>Source-led briefing</h3><p>Timeline labels distinguish documented evidence, creator-reported context and open questions. Private archives remain private.</p></article><article><h3>Talk to Martin</h3><p>For an interview, research question or source packet, use the public contact route. No mailing-list subscription is required.</p></article></div><a className="primary" href="mailto:martin.puzik@gmail.com?subject=LEIS%20media%20enquiry">Media / research enquiry</a></section>
    <section className="participate" id="participate"><p className="eyebrow">OPEN · FREE · EVOLVING</p><h2>LEIS has no walls.</h2><p>LEIS remains free of charge. Support, research dialogue and carefully scoped pilots help sustain its validation, preservation and human work.</p><div className="contact"><a className="primary" href="mailto:martin.puzik@gmail.com?subject=LEIS%20dialogue">Start a respectful dialogue</a><span>Public contact route · no mailing list · no pressure</span></div><footer>Created by <b>Martin Puzik</b> · Technical collaboration: <b>M.A.J. Puzik</b></footer></section>
  </main><aside className={`leis-dock ${leisOpen ? "open" : ""}`} aria-label="LEIS orientation guide">
    {leisOpen && <div className="leis-dock-window">
      <button className="leis-dock-close" onClick={() => setLeisOpen(false)} aria-label="Close LEIS guide">×</button>
      <small>LEIS ORIENTATION GUIDE</small>
      <h3>{leisGuidance.title}</h3>
      <p>{leisGuidance.text}</p>
      <div className="leis-dock-choices">
        <button className={leisTopic === "start" ? "active" : ""} onClick={() => setLeisTopic("start")}>What is LEIS?</button>
        <button className={leisTopic === "story" ? "active" : ""} onClick={() => setLeisTopic("story")}>Our story</button>
        <button className={leisTopic === "work" ? "active" : ""} onClick={() => setLeisTopic("work")}>Work with LEIS</button>
      </div>
      <a href={leisGuidance.link} onClick={() => setLeisOpen(false)}>{leisGuidance.action} ↗</a>
      <em>This is an orientation guide, not a live AI chat.</em>
    </div>}
    <button className="leis-dock-trigger" onClick={() => setLeisOpen(!leisOpen)} aria-expanded={leisOpen}><span>Ω</span>{leisOpen ? "Close" : "Ask LEIS"}</button>
  </aside></>;
}
