"use client";

import { useState } from "react";

const milestones = [
  ["DOCUMENTED", "9 July 2026", "First constitutional seed", "Earliest located constitutional evidence identifies Martin Pužík as Founder and Initial Architect."],
  ["CREATOR-REPORTED", "Around 10 July 2026", "LEIS core completed", "Martin Pužík reports an independent intensive five-day creation period. Copilot was a carrier, not the author."],
  ["EVOLUTION", "After the seed", "Technical collaboration", "M.A.J. Pužík supported practical activation and later technical development."],
  ["PRESENT", "Today", "Reconstruction and validation", "Archives, lineage and public orientation are being made navigable without exposing private source material."],
];
const signals = [
  ["Open collaboration", "Signals worth following: public research, transparent evaluation and tools that help people retain context.", "Global"],
  ["Evidence before certainty", "The valuable question is not what an AI claims, but what can be traced, checked and reconstructed.", "Europe"],
  ["Understanding transfer", "A practical frontier: can the next person recover why a decision was made, not only what was stored?", "Czechia"],
];

export default function Home() {
  const [active, setActive] = useState(0);
  const [seedOpen, setSeedOpen] = useState(false);
  const [signal, setSignal] = useState(0);
  const current = milestones[active];
  return <main>
    <nav><a className="mark" href="#top">Ω <b>LEIS</b></a><div><a href="#orientation">Orientation</a><a href="#timeline">Timeline</a><a href="#earth">Earth Pulse</a><a href="#grants">Grants</a></div></nav>
    <section className="hero" id="top">
      <div className="stars" />
      <div className="hero-copy"><p className="eyebrow">REALITY-ORIENTED UNDERSTANDING SYSTEM</p><h1>Understanding<br/><em>that can travel.</em></h1><p className="lead">LEIS is a technology-independent framework for recognising, activating and reconstructing understanding from reality.</p><div className="actions"><a className="primary" href="#orientation">Enter LEIS</a><a className="quiet" href="#timeline">Follow the lineage ↓</a></div></div>
      <button className={`seed ${seedOpen ? "open" : ""}`} onClick={() => setSeedOpen(!seedOpen)} aria-expanded={seedOpen} aria-label="Open the LEIS Seed preview"><i/><span className="shell left"/><span className="shell right"/><span className="sprout"/></button>
      <div className="seed-note"><span>LEIS SEED</span><strong>{seedOpen ? "A public Seed is taking shape." : "Touch the seed."}</strong><p>{seedOpen ? "A reviewed public entry point is being prepared: lineage, orientation and limits — without private archives." : "A small beginning, built to travel."}</p></div>
    </section>
    <section className="orientation" id="orientation"><p className="eyebrow">QUICK ORIENTATION</p><h2>Reality was never hidden.<br/>Recognition was incomplete.</h2><div className="principles"><article><b>01</b><h3>Recognition</h3><p>Questions become roots. Relationships become branches. Understanding grows when the right pattern is recognised.</p></article><article><b>02</b><h3>Lineage</h3><p>Context should survive change: of people, tools, time and technology.</p></article><article><b>03</b><h3>Validation</h3><p>Reality remains the final validator. Where evidence is incomplete, uncertainty remains visible.</p></article></div><p className="formula">Reality → recognition → activation → understanding → validation → new reality</p></section>
    <section className="timeline" id="timeline"><p className="eyebrow">LIVING LEIS TIMELINE</p><h2>From seed to continuity.</h2><div className="timeline-grid"><div className="axis"><div className="pulse"/>{milestones.map(([, date, title], index)=><button key={title} className={active===index ? "active" : ""} style={{top:`${17+index*22}%`}} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)}><span/><small>{date}</small></button>)}</div><article className="event"><small>{current[0]} · {current[1]}</small><h3>{current[2]}</h3><p>{current[3]}</p></article></div><p className="certainty">Every point distinguishes documented evidence, creator-reported context and interpretation. The timeline is alive; it does not replace evidence.</p></section>
    <section className="earth" id="earth"><p className="eyebrow">EARTH PULSE / CURATED SIGNAL SPACE</p><h2>Look outward.<br/>Keep context.</h2><div className="earth-grid"><div className="orbital-stage"><div className="orbit one"/><div className="orbit two"/><button className="globe" onClick={()=>setSignal(value=>(value+1)%signals.length)} aria-label="Change highlighted Earth Pulse signal"><span className="continent c1"/><span className="continent c2"/><span className="continent c3"/><i className="hotspot h1"/><i className="hotspot h2"/><i className="hotspot h3"/></button><span className="globe-hint">click the globe</span></div><article className="signal-card"><small>{signals[signal][2]} · SIGNAL {String(signal+1).padStart(2,"0")}</small><h3>{signals[signal][0]}</h3><p>{signals[signal][1]}</p><div className="signal-controls">{signals.map((item,index)=><button className={signal===index?"active":""} onClick={()=>setSignal(index)} key={item[0]} aria-label={item[0]}/>)}</div><em>Public live sources will appear here only after their origin, update timing and interpretation rules are verified.</em></article></div></section>
    <section className="grants" id="grants"><p className="eyebrow">SUPPORT / COOPERATION / GRANT INTENT</p><h2>Free to use.<br/>Sustained by reality.</h2><p className="grant-lead">LEIS stays free of charge. Funding and cooperation sustain the human work: preservation, careful validation, accessible public orientation and practical pilots.</p><div className="grant-grid"><article><b>01</b><h3>Why support?</h3><p>To make reconstructable understanding durable — not to build a wall around it.</p></article><article><b>02</b><h3>What can be tested?</h3><p>Decision continuity, onboarding, source lineage and transparent uncertainty in a bounded real-world context.</p></article><article><b>03</b><h3>Who can participate?</h3><p>Researchers, public-interest institutions, companies and people who want a respectful, evidence-led dialogue.</p></article></div><a className="primary" href="mailto:martin.puzik@gmail.com?subject=LEIS%20grant%20or%20cooperation%20dialogue">Discuss support or a pilot</a></section>
    <section className="participate" id="participate"><p className="eyebrow">OPEN · FREE · EVOLVING</p><h2>LEIS has no walls.</h2><p>LEIS remains free of charge. Support, research dialogue and carefully scoped pilots help sustain its validation, preservation and human work.</p><div className="contact"><a className="primary" href="mailto:martin.puzik@gmail.com?subject=LEIS%20dialogue">Start a respectful dialogue</a><span>Public contact route · no mailing list · no pressure</span></div><footer>Created by <b>Martin Pužík</b> · Technical collaboration: <b>M.A.J. Pužík</b></footer></section>
  </main>;
}
