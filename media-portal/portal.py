"""LEIS Media Portal — local, source-linked exploration of the media archive."""
import json
import os
import re
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(r"L:\_LEIS_\MEDIA\_MEDIA_CATALOGUE_")
CACHE = Path(__file__).with_name("portal_index.json")
ASSET = Path(__file__).with_name("assets").joinpath("omega.png")
TOPICS = {
    "LEIS principles": ["lineage", "reconstruction", "validation", "orientation", "reality", "seed"],
    "Artificial intelligence": ["ai", "claude", "prompt", "automation", "agent", "machine learning"],
    "Technology & systems": ["software", "system", "engineering", "cyber", "data", "sql"],
    "Leadership & organisation": ["leadership", "management", "teams", "business", "decision"],
    "Health & mind": ["psychiatry", "brain", "health", "clinical", "immunity", "medicine"],
    "History & society": ["history", "rome", "korea", "politics", "society", "geopolitics"],
    "Media archive": ["video", "image", "book", "audio", "document", "plaud"],
}


def pdf_text(path: Path) -> str:
    try:
        from pypdf import PdfReader
        return "\n".join((page.extract_text() or "") for page in PdfReader(str(path)).pages)
    except Exception as error:
        return f"[PDF text unavailable: {type(error).__name__}]"


def records():
    sources = sorted(ROOT.glob("*.pdf"))
    state = {str(path): path.stat().st_mtime for path in sources}
    try:
        saved = json.loads(CACHE.read_text(encoding="utf-8"))
        if {item["path"]: item["mtime"] for item in saved["records"]} == state:
            return saved["records"]
    except Exception:
        pass
    result = []
    for path in sources:
        stat = path.stat()
        result.append({"name": path.name, "path": str(path), "mtime": stat.st_mtime,
                       "size": stat.st_size, "text": pdf_text(path)})
    CACHE.write_text(json.dumps({"records": result}, ensure_ascii=False), encoding="utf-8")
    return result


def search(query: str, topic: str = ""):
    words = re.findall(r"[\wÀ-ž.-]+", query.lower())
    terms = list(dict.fromkeys(words + TOPICS.get(topic, [])))
    found = []
    for item in records():
        haystack = (item["name"] + "\n" + item["text"]).lower()
        score = sum(haystack.count(term) for term in terms if len(term) > 1)
        if not score:
            continue
        positions = [haystack.find(term) for term in terms if haystack.find(term) >= 0]
        position = min(positions) if positions else 0
        excerpt = re.sub(r"\s+", " ", item["text"][max(0, position - 180):position + 520]).strip()
        found.append((score, {**item, "snippet": excerpt,
                               "signals": [term for term in terms if term in haystack][:8]}))
    return [item for _, item in sorted(found, key=lambda row: row[0], reverse=True)[:60]]


PAGE = r'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LEIS / Media Portal</title><style>
:root{--ink:#050a12;--panel:#091522;--line:#1e5368;--ice:#a5efff;--cyan:#4ad8ee;--muted:#9bb8c8}*{box-sizing:border-box}body{margin:0;background:var(--ink);color:#e3f0f6;font:15px Inter,Segoe UI,Arial,sans-serif;overflow-x:hidden}body:before,body:after{content:'';z-index:-1;position:fixed;border-radius:50%;filter:blur(10px);pointer-events:none}body:before{width:55vw;height:55vw;top:-25vw;right:-20vw;background:radial-gradient(circle,#10628652,transparent 68%)}body:after{width:52vw;height:52vw;bottom:-28vw;left:-24vw;background:radial-gradient(circle,#047c8560,transparent 70%)}.shell{display:grid;grid-template-columns:286px minmax(0,1fr);min-height:100vh}.side{position:sticky;top:0;height:100vh;padding:25px 18px;background:#07111de8;border-right:1px solid #174255}.omega{width:100px;display:block;margin:0 auto 12px;border-radius:50%;box-shadow:0 0 38px #74eaff77;animation:breathe 5s ease-in-out infinite}.brand{text-align:center;letter-spacing:4px;font-weight:800;color:var(--ice)}.seed{text-align:center;color:#90abbc;font-size:11px;line-height:1.55}.creator{margin:20px 0;padding:13px;border:1px solid #1d5065;border-radius:13px;background:#0a1927;color:#a7c2cf;font-size:11px;line-height:1.65}.creator b{display:block;color:#e1fbff;font-size:13px}.topic{width:100%;margin:7px 0;padding:10px 11px;border:1px solid #1a485c;border-radius:10px;background:#0a1928;color:#bed9e4;text-align:left;cursor:pointer;transition:transform .2s,background .2s,border .2s}.topic:hover,.topic.active{transform:translateX(5px);background:#103449;border-color:#74eaff;color:#fff}.main{max-width:1260px;padding:46px;overflow:hidden}.eyebrow{color:#75dff2;letter-spacing:2px;font-size:11px}.hero{max-width:820px}.hero h1{margin:8px 0 10px;font-size:clamp(36px,5vw,58px);line-height:1.02;letter-spacing:-2px;background:linear-gradient(100deg,#f0fdff,#7cd7eb);color:transparent;background-clip:text}.hero p{max-width:690px;color:var(--muted);font-size:17px;line-height:1.6}.loop{margin:23px 0 27px;color:#80cbd9;letter-spacing:1px;font-size:11px}.search{display:flex;padding:8px;border:1px solid #245d73;border-radius:16px;background:#091725;box-shadow:0 14px 45px #0009}.search input{flex:1;min-width:0;padding:13px 15px;border:0;outline:0;background:transparent;color:#fff;font-size:17px}.search button{border:0;border-radius:11px;padding:0 21px;background:linear-gradient(135deg,#35bfd2,#25699d);color:#fff;font-weight:800;letter-spacing:.5px;cursor:pointer;transition:transform .2s,filter .2s}.search button:hover{transform:scale(1.03);filter:brightness(1.12)}.gateway{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:27px 0}.gateway-card{position:relative;display:block;min-height:220px;padding:24px;border:1px solid #24596d;border-radius:18px;background:linear-gradient(135deg,#0d2132,#091521);overflow:hidden;color:inherit;text-decoration:none;transition:transform .3s,border .3s,box-shadow .3s}.gateway-card:before{content:'';position:absolute;inset:auto -35% -75% auto;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,#52e6f264,transparent 66%);transition:transform .5s}.gateway-card:hover{transform:translateY(-7px);border-color:#91f2ff;box-shadow:0 18px 48px #0009}.gateway-card:hover:before{transform:scale(1.4)}.gateway-card.journal{background:linear-gradient(135deg,#121a33,#0b1423)}.gateway-card.journal:before{background:radial-gradient(circle,#9387ff55,transparent 66%)}.glyph{position:relative;display:grid;place-items:center;width:43px;height:43px;border:1px solid #61dff0;border-radius:14px;color:#9cf5ff;font-size:23px;box-shadow:inset 0 0 20px #42d5e426}.gateway-card.journal .glyph{border-color:#a89eff;color:#d4ceff}.gateway-card h2,.gateway-card p,.cta{position:relative}.gateway-card h2{margin:17px 0 7px;font-size:23px}.gateway-card p{max-width:360px;color:#abc3cf;line-height:1.5}.cta{display:inline-block;margin-top:10px;color:#9df1ff;font-weight:800}.journal .cta{color:#c9c5ff}.status{margin:22px 0;color:#95b0bf}.card{padding:18px;margin:12px 0;border:1px solid #1b485c;border-radius:14px;background:linear-gradient(115deg,#0b1a29,#081420);animation:rise .32s ease both}.card:hover{transform:translateY(-2px);border-color:#69d9ef}.card a{color:#91ecff;font-weight:800;font-size:17px;text-decoration:none}.meta,.line{margin:8px 0;color:#90aab7;font-size:12px}.snippet{white-space:pre-wrap;color:#d2e0e6;line-height:1.55}.tag{display:inline-block;padding:3px 8px;margin:5px 4px 0 0;border:1px solid #276179;border-radius:12px;color:#75dff2;font-size:11px}@keyframes breathe{50%{transform:scale(1.035);box-shadow:0 0 62px #b7f4ffbb}}@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@media(max-width:820px){.shell{grid-template-columns:1fr}.side{position:relative;height:auto}.main{padding:30px 22px}.gateway{grid-template-columns:1fr}.hero h1{letter-spacing:-1px}}
</style></head><body><div class="shell"><aside class="side"><img class="omega" src="/omega.png" alt="LEIS Omega"><div class="brand">LEIS</div><p class="seed">Reality-oriented understanding<br>Preserve. Validate. Reconstruct.</p><div class="creator"><b>Creator: Martin Pužík</b>Visionary · Constitution author<br>Founder of LEIS · Creator of its ethical framework and behavioral principles</div><div class="seed">TOPICS / IDEAS</div><div id="topics"></div></aside><main class="main"><div class="eyebrow">MEDIA INTELLIGENCE PORTAL</div><section class="hero"><h1>Find context,<br>not only files.</h1><p>LEIS search connects signals in the catalog, keeps every result tied to its source lineage and makes uncertainty visible instead of hiding it.</p></section><div class="loop">REALITY → SIGNALS → PATTERNS → RECOGNITION → VALIDATION → LINEAGE → ORIENTATION</div><div class="search"><input id="q" placeholder="Search books, authors, topics, names, principles…"><button onclick="go()">LEIS SEARCH</button></div><section class="gateway" aria-label="Explore LEIS"><a class="gateway-card timeline" href="/timeline"><div class="glyph">◌</div><h2>Living LEIS timeline</h2><p>Follow the documented seed, the creator-reported completion and the reconstruction that keeps the story verifiable.</p><span class="cta">Explore the timeline →</span></a><a class="gateway-card journal" href="/pavla"><div class="glyph">✦</div><h2>Journalist briefing</h2><p>A two-minute, human introduction: what LEIS is, why it matters, and the questions that should be tested.</p><span class="cta">Enter the briefing →</span></a></section><div id="status" class="status">Choose a topic or enter a question.</div><section id="results"></section></main></div><script>const topics=__TOPICS__;let selected='';const topicBox=document.querySelector('#topics');Object.keys(topics).forEach(name=>{const button=document.createElement('button');button.className='topic';button.textContent=name;button.onclick=()=>{selected=name;document.querySelectorAll('.topic').forEach(x=>x.classList.remove('active'));button.classList.add('active');document.querySelector('#q').value=name;go()};topicBox.appendChild(button)});document.querySelector('#q').onkeydown=e=>{if(e.key==='Enter')go()};function esc(value){const div=document.createElement('div');div.textContent=value||'';return div.innerHTML}async function go(){const query=document.querySelector('#q').value.trim();if(!query&&!selected)return;const status=document.querySelector('#status'),output=document.querySelector('#results');status.textContent='LEIS logic: collecting signals and checking source lineage…';output.innerHTML='';const response=await fetch('/api/search?q='+encodeURIComponent(query)+'&topic='+encodeURIComponent(selected));const data=await response.json();status.textContent=`${data.count} relevant source(s). Ranking uses query signals and the selected topic; every result remains traceable to its PDF.`;output.innerHTML=data.results.map(item=>`<article class="card"><a href="/open?path=${encodeURIComponent(item.path)}">${esc(item.name)}</a><div class="meta">${item.size.toLocaleString()} B · ${esc(item.path)}</div><div class="line">LINEAGE SIGNALS: ${item.signals.map(signal=>'<span class="tag">'+esc(signal)+'</span>').join('')}</div><div class="snippet">${esc(item.snippet||'Match in source filename.')}</div></article>`).join('')||'<div class="card">No reliable source match. Try a more concrete title, name, or topic.</div>'}</script></body></html>'''.replace("__TOPICS__", json.dumps(TOPICS))


def secondary_page(title, eyebrow, intro, body, accent="#75dff2"):
    return f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>body{{margin:0;background:#050a12;color:#dce9f4;font:16px Segoe UI,Arial;line-height:1.6}}.wrap{{max-width:950px;margin:auto;padding:55px 25px}}.k{{color:{accent};letter-spacing:2px;font-size:12px}}h1{{font-size:clamp(36px,5vw,52px);line-height:1.08;margin:8px 0}}.sub{{max-width:760px;color:#a9c3cf;font-size:18px}}.card{{padding:22px;margin:17px 0;border:1px solid #205065;border-radius:15px;background:linear-gradient(120deg,#0c1a29,#081420);transition:transform .22s,border .22s}}.card:hover{{transform:translateX(5px);border-color:{accent}}}.card h2{{margin-top:0;color:{accent}}}.tag{{float:right;padding:4px 9px;border-radius:10px;background:{accent};color:#07111b;font-size:11px;font-weight:800}}a{{color:#91ecff}}</style><main class="wrap"><div class="k">{eyebrow}</div><h1>{title}</h1><p class="sub">{intro}</p>{body}<p><a href="/">← Back to LEIS Media Portal</a></p></main>'''


PAVLA_PAGE = secondary_page(
    "LEIS in two minutes",
    "LEIS / JOURNALIST BRIEFING",
    "A concise, source-aware introduction. It does not ask for belief: it offers a story, a usable distinction and questions that can be tested.",
    '''<article class="card"><span class="tag">ORIGIN</span><h2>The story in one minute</h2><p>Martin Pužík created the LEIS core independently during an intensive five-day period at home. He used Copilot as a working carrier and AI underlayer to express and test ideas; Copilot did not author LEIS. Soon afterwards he introduced the seed to his father, M.A.J. Pužík, whose long technical and AI experience supported practical use and later technical development.</p></article><article class="card"><span class="tag">DISTINCTION</span><h2>What LEIS is — and is not</h2><p>LEIS is not an AI model, plugin or software product. It is a technology-independent way to organise orientation, evidence, validation and continuity of understanding. A notebook, conversation, GitHub repository or AI can carry LEIS; none of them is LEIS itself.</p></article><article class="card"><span class="tag">TEST</span><h2>Why it may matter</h2><p>AI can answer quickly. LEIS keeps the source, confidence, missing information, reality test and reconstruction path visible around an answer. The relevant question is whether a new person can reconstruct reasons behind a decision more quickly and reliably than with ordinary documentation alone.</p></article><article class="card"><span class="tag">VOICE</span><h2>In the creator’s words</h2><p><em>Reality was never hidden. Recognition was incomplete.</em></p><p>LEIS is a framework for recognising, activating and reconstructing understanding from reality. The goal is not to accumulate more knowledge; it is to activate the right understanding at the right moment. Reality remains the final validator.</p></article><article class="card"><span class="tag">LINEAGE</span><h2>Origin marker</h2><p>Earliest currently located constitutional evidence: <strong>9 July 2026</strong>, in <em>LEIS Constitution Working Archive v7.0-FIRST SEED</em>, which names Martin Pužík as Founder and Initial Architect. Creator-reported core completion: around <strong>10 July 2026</strong>.</p></article>''',
    "#a99fff",
)

TIMELINE_PAGE = secondary_page(
    "Understanding in motion.",
    "LEIS / RECONSTRUCTION TIMELINE",
    "A living orientation map. Each point identifies whether it is documented evidence, creator-reported context or a human time marker, so interpretation never replaces lineage.",
    '''<article class="card"><span class="tag">DOCUMENTED</span><h2>9 July 2026 · First constitutional seed</h2><p><em>LEIS Constitution Working Archive v7.0-FIRST SEED</em> is the earliest currently located constitutional evidence. It identifies Martin Pužík as Founder and Initial Architect and already contains mission, preservation, seed, lineage, uncertainty and technology-independence principles.</p></article><article class="card"><span class="tag">CREATOR-REPORTED</span><h2>Around 10 July 2026 · LEIS core completed</h2><p>Martin Pužík reports completing the LEIS core independently during an intensive five-day period. Copilot was a working carrier and AI underlayer, not the author.</p></article><article class="card"><span class="tag">CONTEXT MARKER</span><h2>14 July 2026 · Personal timeline anchor</h2><p>A family visit in Prague provides a human time marker shortly after the core was completed.</p></article><article class="card"><span class="tag">EVOLUTION</span><h2>After the seed · Technical collaboration</h2><p>Martin introduced the seed to M.A.J. Pužík. His technical and AI experience supported practical activation, portals and technical development while the LEIS core retained its independent origin.</p></article><article class="card"><span class="tag">PRESENT</span><h2>Reconstruction phase</h2><p>MEDIA and LEIS archive work preserves original sources, SHA-256 lineage, recovery gaps and portals that make evidence navigable.</p></article>''',
)


class PortalHandler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        return

    def respond(self, payload, content_type="text/html; charset=utf-8"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.end_headers()
        self.wfile.write(payload if isinstance(payload, bytes) else payload.encode("utf-8"))

    def do_GET(self):
        request = urlparse(self.path)
        args = parse_qs(request.query)
        if request.path == "/omega.png":
            return self.respond(ASSET.read_bytes(), "image/png")
        if request.path == "/timeline":
            return self.respond(TIMELINE_PAGE)
        if request.path == "/pavla":
            return self.respond(PAVLA_PAGE)
        if request.path == "/api/search":
            result = search(args.get("q", [""])[0], args.get("topic", [""])[0])
            return self.respond(json.dumps({"count": len(result), "results": result}, ensure_ascii=False),
                                "application/json; charset=utf-8")
        if request.path == "/open":
            path = Path(args.get("path", [""])[0])
            if path.is_file() and ROOT in path.parents:
                os.startfile(path)
            return self.respond("<script>window.close()</script>")
        return self.respond(PAGE)


if __name__ == "__main__":
    threading.Timer(0.7, lambda: webbrowser.open("http://127.0.0.1:8787")).start()
    ThreadingHTTPServer(("127.0.0.1", 8787), PortalHandler).serve_forever()
