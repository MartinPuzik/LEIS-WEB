"use client";

import { useState } from "react";

const milestones = [
  ["DOCUMENTED", "9 July 2026", "First constitutional seed", "Earliest located constitutional evidence identifies Martin Pužík as Founder and Initial Architect."],
  ["CREATOR-REPORTED", "Around 10 July 2026", "LEIS core completed", "Martin Pužík reports an independent intensive five-day creation period. Copilot was a carrier, not the author."],
  ["EVOLUTION", "After the seed", "Technical collaboration", "M.A.J. Pužík supported practical activation and later technical development."],
  ["PRESENT", "Today", "Reconstruction and validation", "Archives, lineage and public orientation are being made navigable without exposing private source material."],
];

export default function Home() {
  const [active, setActive] = useState(0);
  const [seedOpen, setSeedOpen] = useState(false);
  const current = milestones[active];
  return <main>
    <nav><a className="mark" href="#top">Ω <b>LEIS</b></a><div><a href="#orientation">Orientation</a><a href="#timeline">Timeline</a><a href="#participate">Participate</a></div></nav>
    <section className="hero" id="top">
      <div className="stars" />
      <div className="hero-copy"><p className="eyebrow">REALITY-ORIENTED UNDERSTANDING SYSTEM</p><h1>Understanding<br/><em>that can travel.</em></h1><p className="lead">LEIS is a technology-independent framework for recognising, activating and reconstructing understanding from reality.</p><div className="actions"><a className="primary" href="#orientation">Enter LEIS</a><a className="quiet" href="#timeline">Follow the lineage ↓</a></div></div>
      <button className={`seed ${seedOpen ? "open" : ""}`} onClick={() => setSeedOpen(!seedOpen)} aria-expanded={seedOpen} aria-label="Open the LEIS Seed preview"><i/><span className="shell left"/><span className="shell right"/><span className="sprout"/></button>
      <div className="seed-note"><span>LEIS SEED</span><strong>{seedOpen ? "A public Seed is taking shape." : "Touch the seed."}</strong><p>{seedOpen ? "A reviewed public entry point is being prepared: lineage, orientation and limits — without private archives." : "A small beginning, built to travel."}</p></div>
    </section>
    <section className="orientation" id="orientation"><p className="eyebrow">QUICK ORIENTATION</p><h2>Reality was never hidden.<br/>Recognition was incomplete.</h2><div className="principles"><article><b>01</b><h3>Recognition</h3><p>Questions become roots. Relationships become branches. Understanding grows when the right pattern is recognised.</p></article><article><b>02</b><h3>Lineage</h3><p>Context should survive change: of people, tools, time and technology.</p></article><article><b>03</b><h3>Validation</h3><p>Reality remains the final validator. Where evidence is incomplete, uncertainty remains visible.</p></article></div><p className="formula">Reality → recognition → activation → understanding → validation → new reality</p></section>
    <section className="timeline" id="timeline"><p className="eyebrow">LIVING LEIS TIMELINE</p><h2>From seed to continuity.</h2><div className="timeline-grid"><div className="axis"><div className="pulse"/>{milestones.map(([, date, title], index)=><button key={title} className={active===index ? "active" : ""} style={{top:`${17+index*22}%`}} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)}><span/><small>{date}</small></button>)}</div><article className="event"><small>{current[0]} · {current[1]}</small><h3>{current[2]}</h3><p>{current[3]}</p></article></div><p className="certainty">Every point distinguishes documented evidence, creator-reported context and interpretation. The timeline is alive; it does not replace evidence.</p></section>
    <section className="participate" id="participate"><p className="eyebrow">OPEN · FREE · EVOLVING</p><h2>LEIS has no walls.</h2><p>LEIS remains free of charge. Support, research dialogue and carefully scoped pilots help sustain its validation, preservation and human work.</p><div className="contact"><a className="primary" href="mailto:martin.puzik@gmail.com?subject=LEIS%20dialogue">Start a respectful dialogue</a><span>Public contact route · no mailing list · no pressure</span></div><footer>Created by <b>Martin Pužík</b> · Technical collaboration: <b>M.A.J. Pužík</b></footer></section>
  </main>;
}
