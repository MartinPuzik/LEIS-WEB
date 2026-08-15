# LEIS DPIA / FRIA pre-assessment v1.0

Jazyk: cestina

Stav: prazdny pracovni podklad pro konkretni pripad. Nejde o pravni stanovisko, hotovou DPIA, hotovou FRIA ani potvrzeni souladu.

Datum pravniho zdroje: 2026-08-15

## 1. Rizeni dokumentu

- [ ] Nazev projektu a konkretni verze systemu:
- [ ] Oddeleny Space / pripad pouziti:
- [ ] Vlastnik posouzeni:
- [ ] Spravce osobnich udaju:
- [ ] Zpracovatel a dalsi zpracovatele:
- [ ] Role podle AI Actu: provider / deployer / importer / distributor / jina / neurceno
- [ ] Jurisdikce a misto pouziti:
- [ ] DPO konzultovan, pokud byl jmenovan:
- [ ] Pravni kontrola provedena kym a kdy:
- [ ] Bezpecnostni kontrola provedena kym a kdy:
- [ ] Dotcene osoby nebo jejich zastupci konzultovani, pokud je to vhodne:
- [ ] Verze, datum a predchozi verze posouzeni:

Zakazane predvyplnene vysledky: `COMPLIANT`, `ALL GATES PASS`, `APPROVED` nebo `CERTIFIED` bez konkretniho rozhodnuti a podepsane odpovednosti.

## 2. Gate A - Je DPIA nebo FRIA vubec povinna?

### DPIA podle clanku 35 GDPR

- [ ] Dochazi ke zpracovani osobnich udaju?
- [ ] Je popsana povaha, rozsah, kontext a ucel zpracovani?
- [ ] Muze zpracovani pravdepodobne zpusobit vysoke riziko pro prava a svobody fyzickych osob?
- [ ] Jde o systematicke a rozsahle automatizovane hodnoceni, vcetne profilovani, na nemz zavisi rozhodnuti s pravnimi nebo obdobne zavaznymi ucinky?
- [ ] Jde o rozsahle zpracovani zvlastnich kategorii udaju nebo udaju o trestnich vecech?
- [ ] Jde o systematicke rozsahle monitorovani verejne pristupneho prostoru?
- [ ] Byly zkontrolovany aktualni seznamy prislusneho dozoroveho uradu podle clanku 35(4) a 35(5)?
- [ ] Pokud DPIA neni povinna, je duvod rozhodnuti pisemne dolozen?

Vysledek DPIA gate: `REQUIRED / NOT_REQUIRED_WITH_REASON / UNCERTAIN_LEGAL_REVIEW`

### FRIA podle clanku 27 AI Actu

- [ ] Je system klasifikovan jako high-risk podle clanku 6(2) a Prilohy III? Uvest presny bod.
- [ ] Spada deployer do kategorii uvedenych v clanku 27(1), vcetne prislusnych vyjimek?
- [ ] Je popsan zamysleny ucel, proces nasazeni, doba a cetnost pouziti?
- [ ] Jsou urceny kategorie osob a skupin, ktere mohou byt dotceny?
- [ ] Jsou urcena konkretni rizika ujmy a opatreni lidskeho dohledu?
- [ ] Je popsano rizeni a mechanismus stiznosti pri materializaci rizika?
- [ ] Byla proverena povinnost oznameni prislusnemu market-surveillance organu?
- [ ] Pokud cast podkladu pokryva DPIA, je FRIA zpracovana jako jeji doplneni, nikoli automaticky nahrazena?

Vysledek FRIA gate: `REQUIRED / NOT_REQUIRED_WITH_REASON / UNCERTAIN_LEGAL_REVIEW`

## 3. Popis zpracovani a toku dat

- [ ] Presny ucel a zakaz sekundarniho pouziti bez noveho posouzeni:
- [ ] Kategorie osobnich udaju:
- [ ] Zvlastni kategorie, biometrika nebo udaje o trestnich vecech:
- [ ] Zdroje udaju a zpusob jejich ziskani:
- [ ] Kategorie dotcenych osob, vcetne zranitelnych skupin:
- [ ] Vstupy, vystupy a automatizovane odvozene udaje:
- [ ] Prijemci a role kazdeho prijemce:
- [ ] Zpracovatele, model provideri a dalsi subdodavatele:
- [ ] Predani mimo EHP a pouzity mechanismus predani:
- [ ] Umisteni ulozist a logu:
- [ ] Doby uchovani po jednotlivych kategoriich a duvod kazde doby:
- [ ] Proces oprav, vymazu, omezeni zpracovani a zaloh:
- [ ] Datovy diagram prilozen jako evidence:

## 4. Zakonnost, nezbytnost a primerenost

- [ ] Pravni titul podle clanku 6 GDPR pro kazdy ucel:
- [ ] Podminka podle clanku 9 GDPR, pokud se zpracovavaji zvlastni kategorie:
- [ ] Proc je kazda kategorie udaju nezbytna?
- [ ] Existuje mene invazivni alternativa?
- [ ] Jsou data primerena, relevantni a omezena na nezbytne minimum?
- [ ] Jak se overuje spravnost a aktualnost udaju?
- [ ] Jsou informacni povinnosti transparentni, konkretni a srozumitelne?
- [ ] Je automatizovane rozhodovani posouzeno podle clanku 22 GDPR, vcetne vyjimek a ochrannych opatreni?
- [ ] Lze dolozit lidsky zasah, vyjadreni stanoviska a napadeni rozhodnuti tam, kde je to relevantni?

## 5. Registr rizik pro lidi

Pro kazde riziko vytvorte samostatny zaznam:

| ID | Dotcena osoba/skupina | Scenar ujmy | Zdroj rizika | Pravdepodobnost | Zavaznost | Opatreni | Zbytkove riziko | Vlastnik | Evidence | Stav |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 |  |  |  |  |  |  |  |  |  | OPEN |

Minimalne posoudit:

- [ ] neopravneny pristup, unik, ztrata nebo zmena dat;
- [ ] nepresne, diskriminacni nebo neprimerene rozhodnuti;
- [ ] nadmerne profilovani nebo sledovani;
- [ ] ztrata moznosti namitky nebo lidskeho prezkumu;
- [ ] model inversion, membership inference a opakovane dotazy;
- [ ] prompt injection, data exfiltration a zameneni instrukce za zdrojova data;
- [ ] vendor lock-in, nedostupnost a zmena podminek poskytovatele;
- [ ] nechtene znovupouziti vstupu pro trenink nebo zlepsovani sluzby;
- [ ] preshranicni prenos a pristup cizich organu;
- [ ] dopad na deti, pracovniky a jine zranitelne skupiny.

## 6. Technicka a organizacni opatreni

U kazdeho opatreni pouzijte stav `VERIFIED / PARTIAL / NOT_IMPLEMENTED / NOT_APPLICABLE` a odkaz na test nebo dokument.

- [ ] Rizeni pristupu, nejmensi opravneni a pravidelna revize uctu:
- [ ] Sifrovani pri prenosu a ulozeni; vlastnik a obnova klicu:
- [ ] Pseudonymizace nebo oddeleni identifikatoru:
- [ ] Logovani, integrita logu a omezeni pristupu:
- [ ] Zalohy, obnova a test dostupnosti:
- [ ] Retence a prokazatelne vymazani vcetne zaloh:
- [ ] Reakce na incident a odpovedne role:
- [ ] Pravidelne bezpecnostni a privacy testy podle clanku 32 GDPR:
- [ ] Dokumentovane omezeni modelu a navod k lidskemu dohledu:
- [ ] Moznost zastavit, ignorovat nebo zvratit vystup AI, pokud to vyzaduje kontext a pravo:
- [ ] Test dopadu na ruzne skupiny a zdokumentovana omezeni metrik:

## 7. Volitelny LEIS Hopper profil

Tato cast se vyplnuje pouze pri skutecnem pouziti LEIS Hopperu.

- [ ] OFFER je vazan na Space, task ID, nonce, dobu platnosti a obsahovy digest.
- [ ] Soukromy U0 control key nebyl odeslan prijimaci.
- [ ] OFFER obsahuje pouze commitment U0, ne ocekavane odpovedi.
- [ ] Exportni data prosla polozkovou klasifikaci a schvalenim.
- [ ] Nejsou pritomny credentials, secrets, raw personal data ani neschvalene embeddingy.
- [ ] RECEIPT priznava mezery, konflikty, nove zdroje a pozadovane externi akce.
- [ ] PATCH neobsahuje spravnou odpoved ani soukromy control key.
- [ ] Pocet pokusu je omezen a kazdy pokus je zaznamenan kvuli uniku informaci.
- [ ] Verejna nebo jina externi akce vyzaduje samostatne lidske schvaleni.
- [ ] Vysledek `ACCEPTED_OPERATIONAL` je popsan jako protokolova shoda, ne dukaz totozneho vnitrniho porozumeni.

## 8. Overeni technologickych tvrzeni

Nasledujici opatreni se nesmeji povazovat za aktivni bez implementace, konfigurace a testu:

| Tvrzeni | Stav | Pozadovana evidence |
| --- | --- | --- |
| Offline lokalni model / CPU fallback | NOT_IMPLEMENTED | build, konfigurace, sandbox, test nedostupnosti cloudu |
| Sifrovana Conflict Capsule | NOT_IMPLEMENTED | threat model, algoritmus, klice, test obnovy a revokace |
| Hamming / 1-bit privacy protection | RESEARCH | formalni threat model, privacy attack test, utility test |
| Differential privacy | NOT_CLAIMED | mechanismus, adjacency, epsilon, delta, accounting, privacy a utility report |
| Automaticke vymazani `leis_sync.db` | NOT_IMPLEMENTED | schema, retencni job, zalohy, auditovany delete test |
| BIP-340 release authority | NOT_ESTABLISHED | vlastnik, threat model, custody, rotace, revokace, nezavisla kontrola |
| Zero-loss nebo LEIS-ZERO theorem | NOT_VERIFIED | uplna definice, kodovani/dekoder, falsifikacni test, nezavisla review |

## 9. AI Act profil, pokud je relevantni

- [ ] Je dolozena klasifikace systemu a role operatoru?
- [ ] Pokud jde o high-risk system, je vytvoren risk-management proces podle clanku 9?
- [ ] Je posouzena potreba automatickych logu a jejich rozsah podle clanku 12?
- [ ] Jsou opatreni human oversight primerena riziku, autonomii a kontextu podle clanku 14?
- [ ] Je posouzena presnost, robustnost a kyberneticka bezpecnost podle clanku 15?
- [ ] Je clanek 50 aplikovan pouze na konkretni relevantni typ systemu nebo obsahu?
- [ ] Jsou povinnosti poskytovatele a deployera oddeleny?
- [ ] Je zaznamenan aktualni casovy a prechodny rezim pouzitelnosti jednotlivych povinnosti?

## 10. Poznamka k sankcim AI Actu

Clanek 99(5): nespravne, neuplne nebo zavadejici informace poskytnute oznamenym subjektum nebo vnitrostatnim prislusnym organum v odpovedi na jejich zadost mohou vest k pokute do 7,5 milionu EUR nebo, u podniku, do 1 procenta celosvetoveho rocniho obratu za predchozi financni rok, podle toho, co je vyssi.

Clanek 99(6): u SME vcetne start-upu je kazda pokuta podle odstavcu 3, 4 a 5 omezena nizsi z prislusne procentni a pevne castky.

Tato poznamka neni kalkulacka pokuty. Pred pouzitim musi byt zkontrolovano aktualni konsolidovane zneni, skutkova situace a pravni kvalifikace.

## 11. Rozhodnuti a schvaleni

Mozne vystupy:

- `NOT_REQUIRED_WITH_RECORDED_REASON`
- `DRAFT_INCOMPLETE`
- `HOLD_UNMITIGATED_HIGH_RISK`
- `PRIOR_CONSULTATION_REQUIRED`
- `READY_FOR_DPO_AND_LEGAL_REVIEW`
- `APPROVED_FOR_DEFINED_PROCESSING_ONLY`

Zakazane vystupy bez pravomoci a dukazu:

- `GDPR COMPLIANT`
- `AI ACT COMPLIANT`
- `100 PERCENT SAFE`
- `ALL GATES PASS`

Podpis odpovedneho vlastnika:

Podpis DPO / stanovisko, pokud je relevantni:

Pravni stanovisko:

Datum dalsi revize a udalosti vyvolavajici novou revizi:

## 12. Primarni zdroje

- GDPR, zejmena clanky 22, 25, 32, 35 a 36: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- EU AI Act, zejmena clanky 6, 9, 12, 14, 15, 27, 50 a 99: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- EDPB DPIA guidance WP248 rev.01: https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/data-protection-impact-assessments-high-risk-processing_en
- EDPB DPIA overview: https://www.edpb.europa.eu/topics/accountability-and-compliance-tools/data-protection-impact-assessment_en

