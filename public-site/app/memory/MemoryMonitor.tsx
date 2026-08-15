"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./memory.module.css";

type Book = { title: string; type: string; started_at?: string | null; completed_at?: string | null; attempt?: number | null };
type Status = {
  published_at: string | null;
  reader_state: string;
  books: { total: number; fully_read: number; remaining: number; percent: number };
  current_book: Book | null;
  last_books: Book[];
};

const initial: Status = {
  published_at: null,
  reader_state: "LOADING",
  books: { total: 1450, fully_read: 0, remaining: 1450, percent: 0 },
  current_book: null,
  last_books: [],
};

function updatedLabel(value: string | null) {
  if (!value) return "Aktualizace čeká";
  const seconds = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 1000));
  return seconds < 60 ? `Aktualizováno před ${seconds} s` : `Aktualizováno před ${Math.floor(seconds / 60)} min`;
}

function playHarp() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const start = context.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start + index * 0.13);
    gain.gain.linearRampToValueAtTime(0.055, start + index * 0.13 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + index * 0.13 + 0.5);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + index * 0.13);
    oscillator.stop(start + index * 0.13 + 0.52);
  });
  window.setTimeout(() => context.close(), 1100);
}

export default function MemoryMonitor() {
  const [status, setStatus] = useState(initial);
  const [offline, setOffline] = useState(false);
  const [sound, setSound] = useState(false);
  const previous = useRef(0);
  const soundRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/memory-progress?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("status unavailable");
      const next = await response.json() as Status;
      if (soundRef.current && previous.current > 0 && next.books.fully_read > previous.current) playHarp();
      previous.current = next.books.fully_read;
      setStatus(next);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10_000);
    const resume = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("pageshow", resume);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pageshow", resume);
    };
  }, [refresh]);

  const state = offline ? "OFFLINE" : status.reader_state;
  const stateClass = state === "RUNNING" ? styles.running : state === "STALLED" || state === "OFFLINE" ? styles.stalled : styles.waiting;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>LEIS MEMORY</span><h1>Živý stav čtení</h1></div>
        <div className={`${styles.state} ${stateClass}`}>{state}</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.book} aria-hidden="true"><span /><i /><b /></div>
        <div className={styles.reading}>
          <span className={styles.label}>Právě se čte</span>
          <h2>{status.current_book?.title || (state === "IDLE" ? "Fronta je právě v klidovém bodu" : "Čekám na další titul…")}</h2>
          <p>{status.current_book ? `${status.current_book.type.toUpperCase()}${status.current_book.attempt ? ` · pokus ${status.current_book.attempt}` : ""}` : "Obsah knih a místní cesty se nikdy nezveřejňují."}</p>
        </div>
      </section>

      <section className={styles.progressCard}>
        <div className={styles.numbers}><strong>{status.books.fully_read.toLocaleString("cs-CZ")}</strong><span>/</span><span>{status.books.total.toLocaleString("cs-CZ")}</span><small>knih kompletně extrahováno</small></div>
        <div className={styles.track}><div className={styles.bar} style={{ width: `${Math.max(0, Math.min(100, status.books.percent))}%` }} /></div>
        <div className={styles.progressMeta}><span>{status.books.percent.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %</span><span>{updatedLabel(status.published_at)}</span></div>
      </section>

      <section className={styles.recent}>
        <div className={styles.sectionHead}>
          <div><span className={styles.label}>Poslední dokončené</span><h2>5 naposledy přečtených titulů</h2></div>
          <button type="button" onClick={() => { const next = !sound; setSound(next); soundRef.current = next; if (next) playHarp(); }}>{sound ? "Zvuk je zapnutý" : "Zapnout jemný zvuk"}</button>
        </div>
        <ol>{status.last_books.length ? status.last_books.map((item, index) => <li key={`${item.title}-${index}`}><span>{item.title}</span><small>{item.type}</small></li>) : <li><span>Zatím bez veřejného záznamu</span></li>}</ol>
      </section>

      <footer className={styles.footer}>
        <p><strong>Reality boundary:</strong> „Přečteno“ znamená úplnou místní extrakci textu s dohledatelnými lokátory. Neznamená to ověření pravdivosti ani lidské porozumění.</p>
        <p>Veřejný monitor může být proti místnímu stavu zpožděn přibližně o jednu minutu.</p>
        <Link href="/?lang=cs">← Zpět na LEIS Portal</Link>
      </footer>
    </main>
  );
}
