"""LEIS Reconstruction Portal - local read-only evidence navigation."""
import json,re,threading,webbrowser,os
from pathlib import Path
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlparse,parse_qs

ROOTS=[Path(r'L:\_LEIS_\START HERE (reconstruction)'),Path(r'L:\_LEIS_\START HERE (GMAIL_with_GEMINI)'),Path(r'L:\_LEIS_\LEIS_ARCHIV2\LEIS\SAFE_HOUSE')]
CACHE=Path(__file__).with_name('leis_portal_index.json')
TOPICS={'Core identity':['reality','recognition','understanding','orientation'],'Constitution':['constitution','mission','preservation','law'],'Seed & lineage':['seed','lineage','reconstruction','continuity'],'Features':['feature','skilldna','styledna','rccm','realsim'],'Recovery gaps':['gap','unknown','recovery','chat history'],'Gmail intelligence':['gmail','identity','relationship','evidence','confidence']}
def build():
 rec=[]
 for root in ROOTS:
  for p in root.rglob('*'):
   if p.is_file() and p.suffix.lower() in {'.md','.txt','.json','.yaml','.yml','.html','.htm'}:
    try:t=p.read_text(encoding='utf-8',errors='replace')
    except:continue
    s=p.stat();rec.append({'name':p.name,'path':str(p),'mtime':s.st_mtime,'size':s.st_size,'text':t})
 CACHE.write_text(json.dumps(rec,ensure_ascii=False),encoding='utf-8');return rec
def load():
 try:return json.loads(CACHE.read_text(encoding='utf-8'))
 except:return build()
def search(q,topic):
 terms=list(dict.fromkeys(re.findall(r'[\wÀ-ž.-]+',q.lower())+TOPICS.get(topic,[])));hits=[]
 for r in load():
  b=(r['name']+'\n'+r['text']).lower();score=sum(b.count(x) for x in terms if len(x)>1)
  if score:
   pos=min([b.find(x) for x in terms if b.find(x)>=0]or[0]);snip=re.sub(r'\s+',' ',r['text'][max(0,pos-170):pos+540]).strip();hits.append((score,{**r,'snippet':snip,'signals':[x for x in terms if x in b][:8]}))
 return [x[1] for x in sorted(hits,key=lambda x:x[0],reverse=True)[:70]]
PAGE=r'''<!doctype html><meta charset="utf-8"><title>LEIS Reconstruction Portal</title><style>*{box-sizing:border-box}body{margin:0;background:#050a12;color:#dce9f4;font:15px Segoe UI,Arial}body:before{content:'';position:fixed;inset:0;background:radial-gradient(circle at 75% 5%,#17435a88,transparent 36%),radial-gradient(circle at 12% 80%,#0c435444,transparent 34%);pointer-events:none}.app{position:relative;display:grid;grid-template-columns:280px 1fr;min-height:100vh}.side{padding:24px 18px;background:#08111ddd;border-right:1px solid #1a4254}.omega{width:104px;border-radius:50%;display:block;margin:auto;box-shadow:0 0 38px #7dd8ff99;animation:pulse 5s infinite}.brand{text-align:center;letter-spacing:3px;color:#a5efff;font-weight:bold;margin:12px}.small{font-size:11px;color:#9cb6c5;line-height:1.5}.topic{width:100%;text-align:left;padding:10px;margin:6px 0;border-radius:9px;border:1px solid #245064;background:#0b1b29;color:#c6e5ee;cursor:pointer;transition:.2s}.topic:hover,.topic.active{transform:translateX(5px);border-color:#8cecff;background:#12394a}.main{padding:42px;max-width:1200px}.k{color:#82e4f3;letter-spacing:2px;font-size:11px}.h{font-size:42px;margin:8px 0}.sub{color:#a6becb;max-width:760px;line-height:1.6}.search{display:flex;padding:8px;background:#0b1928;border:1px solid #276177;border-radius:14px;margin:22px 0}.search input{flex:1;background:transparent;border:0;outline:0;color:white;font-size:17px;padding:13px}.search button{border:0;border-radius:9px;padding:0 20px;background:linear-gradient(135deg,#36bbce,#22689a);color:white;font-weight:bold}.card{padding:18px;border:1px solid #1d465a;background:#0b1827;border-radius:13px;margin:11px 0;animation:rise .28s ease}.card:hover{border-color:#8cecff;transform:translateY(-2px)}.card a{color:#8deeff;text-decoration:none;font-weight:bold;font-size:17px}.meta{font-size:11px;color:#8fa8b5;margin:8px 0}.tag{display:inline-block;margin:3px;padding:3px 8px;border:1px solid #2b687c;border-radius:12px;color:#88eafa;font-size:11px}.snip{line-height:1.55;color:#d3dfe5;white-space:pre-wrap}@keyframes pulse{50%{box-shadow:0 0 65px #b7f4ffbb}}@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media(max-width:800px){.app{grid-template-columns:1fr}.main{padding:24px}}</style><div class="app"><aside class="side"><img class="omega" src="/omega.png"><div class="brand">LEIS</div><p class="small">RECONSTRUCTION PORTAL<br>Preserve · Validate · Reconstruct</p><a class="small" href="http://127.0.0.1:8787" style="color:#8deeff">↗ MEDIA PORTAL</a><hr style="border-color:#1e4658"><div class="small">RECONSTRUCTION MAP</div><div id="topics"></div></aside><main class="main"><div class="k">LEIS / SOURCE OF TRUTH NAVIGATION</div><h1 class="h">Reconstruct understanding.</h1><p class="sub">Search the recovered seed, constitution, features, recovery gaps and evidence. LEIS logic keeps source, confidence and unknowns visible.</p><div class="search"><input id="q" placeholder="Search principles, features, gaps, seeds, questions…"><button onclick="go()">RECONSTRUCT</button></div><div id="status" class="small">Select a reconstruction map topic or ask a question.</div><div id="results"></div></main></div><script>const topics=__TOPICS__;let selected='';let box=document.querySelector('#topics');Object.keys(topics).forEach(x=>{let b=document.createElement('button');b.className='topic';b.textContent=x;b.onclick=()=>{selected=x;document.querySelectorAll('.topic').forEach(z=>z.classList.remove('active'));b.classList.add('active');document.querySelector('#q').value=x;go()};box.appendChild(b)});document.querySelector('#q').onkeydown=e=>{if(e.key==='Enter')go()};async function go(){let q=q=document.querySelector('#q').value.trim();let st=document.querySelector('#status'),o=document.querySelector('#results');st.textContent='LEIS logic: finding evidence, lineage and unknowns…';let d=await fetch('/api/search?q='+encodeURIComponent(q)+'&topic='+encodeURIComponent(selected)).then(x=>x.json());st.textContent=`${d.count} evidence-linked sources found.`;o.innerHTML=d.results.map(x=>`<article class="card"><a href="/open?path=${encodeURIComponent(x.path)}">${x.name}</a><div class="meta">${x.path}</div><div>${x.signals.map(z=>'<span class="tag">'+z+'</span>').join('')}</div><div class="snip">${x.snippet}</div></article>`).join('')||'<div class="card">No source match. Preserve the question as an open gap and refine the search.</div>'}</script>'''.replace('__TOPICS__',json.dumps(TOPICS))
class H(BaseHTTPRequestHandler):
 def log_message(self,*a):pass
 def send(self,b,t='text/html; charset=utf-8'):
  self.send_response(200);self.send_header('Content-Type',t);self.end_headers();self.wfile.write(b if isinstance(b,bytes)else b.encode())
 def do_GET(self):
  u=urlparse(self.path);a=parse_qs(u.query)
  if u.path=='/omega.png':return self.send(Path(__file__).with_name('assets').joinpath('omega.png').read_bytes(),'image/png')
  if u.path=='/api/search':
   x=search(a.get('q',[''])[0],a.get('topic',[''])[0]);return self.send(json.dumps({'count':len(x),'results':x},ensure_ascii=False),'application/json; charset=utf-8')
  if u.path=='/open':
   p=Path(a.get('path',[''])[0]);
   if p.is_file():os.startfile(p)
   return self.send(b'<script>window.close()</script>')
  return self.send(PAGE)
if __name__=='__main__':
 threading.Timer(.7,lambda:webbrowser.open('http://127.0.0.1:8788')).start();ThreadingHTTPServer(('127.0.0.1',8788),H).serve_forever()
