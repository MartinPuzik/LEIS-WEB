# LEIS MEMORY
## Protokol zachování a rekonstrukce orientace ohraničený důkazy

**Vydání:** v1.0 (revize gatekeeperu, 16. 8. 2026)  
**Pracovní jazyk:** angličtina; tato verze je český ekvivalent  
**Autor:** Martin Pužík / LEIS  
**Licence dokumentace:** CC BY 4.0. Kód a schémata zůstávají tam, kde je to označeno, pod Apache-2.0.

## Shrnutí

LEIS MEMORY je metoda, která uchovává dostatek orientace k pozdější obnově porozumění po kompresi nebo přenosu kontextu. Není to engine pravdy, přenos vědomí, certifikát obecné inteligence ani náhrada zdrojového materiálu. Její užší a testovatelný příslib zní: ohraničený příjemce má z Reality Frame rekonstruovat deklarovaný cíl, rizika, rozhodnutí, linii původu a neznámé části, přičemž hranice důkazů zůstanou viditelné.

Dodaná předchozí verze *Vědecký whitepaper: LEIS MEMORY v1.0-Stabilized* (16. 8. 2026) zachycuje správný směr, ale několik hypotéz a lokálních demonstrací popisuje jako hotové teorémy nebo dokončené empirické benchmarky. Tato revize zachovává užitečnou architekturu a odstraňuje nepodloženou jistotu.

## 1. Rozsah a ne-tvrzení

LEIS se zabývá rekonstrukcí ohraničenou důkazy a její správou. Tento dokument netvrdí, že:

- lze veškerý význam rekonstruovat ze stavu nula;
- `R(U) = T * L * S` je fyzikální teorém nebo vyvrácení Shannonovy teorie informace;
- vysoké OP znamená pravdu, správnost, inteligenci nebo právní soulad;
- lokální syntetický fixture zobecňuje na všechny knihy, obory, modely či lidi;
- stav `ACCEPTED_OPERATIONAL` certifikuje osobu, model nebo tvrzení jako neomylné;
- samotný protokol splňuje AI Act, GDPR nebo jiný zákon.

Povinná hranice zní **Reality != Render**. Render může být pozorovaný, simulovaný, odvozený nebo neznámý a musí tak být označen.

## 2. Zmrazené provozní jádro

LEIS MEMORY Core nyní zmrazuje tyto pracovní objekty a brány:

1. **Reality Frame** - ohraničené zachycení cíle, problému, rizik, rozhodnutí, hranice důkazů, neznámých a lineage.
2. **LEIS_ZERO** - transportní a rekonstrukční hypotéza a kontrakt, nikoli fyzikální teorém.
3. **GF-1 Rekonstrukce Reality Frame** - příjemce obnoví deklarovanou orientaci.
4. **GF-2 Shoda validace** - nezávislý hodnotitel souhlasí se závěrem podle předem dané rubriky.
5. **GF-3 Shoda lineage delty** - obnoví se podstatné změny zdroje nebo interpretace.
6. **GF-4 Zachování neznámého** - neznámé zůstává neznámým, dokud je nová evidence nepovýší.
7. **OP (Orientation Preservation)** - verzovaná provozní metrika, nikoli metrika pravdy.
8. **Taxonomie selhání a mapování hranic** - selhání se zapisují, nikoli skrytě povyšují na úspěch.

Pracovní smyčka je:

`Reality -> Compression -> Transfer -> Reconstruction -> Reality Check -> Lineage`

## 3. Model důkazů

Každé podstatné tvrzení má podle možnosti nést:

- identifikátor a třídu zdroje;
- verzi nebo časový původ;
- locator (stranu, oddíl, rozsah nebo identifikátor události);
- deklarovanou hranici jistoty;
- explicitní neznámé a konflikty;
- bezpečný další krok nebo požadovanou validaci.

Povolené stavy jsou `SUPPORTED`, `CONFLICTED`, `UNKNOWN` a `REJECTED`. Opakování stav nepovyšuje. Povýšení vyžaduje novou evidenci nebo zdokumentované lidské rozhodnutí.

## 4. Rekonstrukční protokol

Minimální experimentální sekvence je:

`Source -> Reality Frame -> LEIS_ZERO -> Independent Reconstruction -> GF Validation -> OP -> Review -> Lineage`

Odesílatel si ponechá referenci (`U0`) a příjemce neobdrží odpovědní klíč. Receipt se vyhodnotí proti deklarované rubrice. Pokud chybí kritický prvek, protokol vyšle ohraničený PATCH nebo vrátí `HOLD`; mezery se tiše nedoplňují.

Protokol je použitelný pro lidské, AI i smíšené pozorovatele. Měří obnovitelnost orientace, nikoli vnitřní prožívání nebo totožnost významu.

## 5. OP a hranice kalibrace

Současná pilotní definice je průměr čtyř složek:

`OP = mean(Goal Recovery, Risk Recovery, Decision Recovery, Lineage Recovery)`

Každá složka se skóruje proti předem vyhlášené rubrice. Zachování neznámého je samostatná brána a nesmí být skryto v příznivém průměru. Prahy jsou parametry studie. Skóre musí být uváděno spolu s fixture, rubrikou, pozorovateli, velikostí vzorku, hranicí zdroje a intervalem spolehlivosti nebo výslovným uvedením, že kalibrace chybí.

Místní evidence zahrnuje syntetické fixture Gate-01 a Understanding Stream a jeden skutečný běh nad německým prostorovým plánováním (uváděné OP přibližně 0,89). Jde o demonstrace, nikoli důkaz univerzálního výkonu. Náhodný multidoménový intake zůstává aktivním výzkumným programem; přesná osmibodová OP čísla z předchozího whitepaperu nejsou v tomto vydání přijata jako ověřený důkaz.

## 6. Výsledky auditu gatekeeperu

### Zachováno

- zachování orientace je smysluplný inženýrský cíl;
- Reality Frames, zachování neznámého, provenance a lineage delty jsou užitečné kontroly;
- sokratovská výzva/odpověď prakticky testuje rekonstrukci bez předání klíče;
- fail-closed přístup ke konfliktům a chybějícím kotvám je lepší než sebejisté doplňování;
- Memory má vracet ohraničené evidence atoms a locators, nikoli celé soukromé knihy nebo transkripty.

### Přeřazeno do kandidáta nebo výzkumu

- rovnice LEIS_ZERO a entropický zápis;
- tvrzení o úplné rekonstrukci ze stavu nula;
- decay-plateau simulace jako důkaz obecné kognice;
- úplná ontologie Memory Graph a veřejný query brain;
- přesné multidoménové OP bez reprodukovatelných fixture a nezávislého posouzení;
- tvrzení o souladu nebo certifikaci podle zákona.

### Odstraněno ze souboru vědeckých tvrzení

- jakékoli tvrzení, že LEIS vyvrací Shannonovu teorii;
- jakýkoli náznak, že lokální test dokazuje pravdu, vědomí nebo univerzální inteligenci;
- automatický právní závěr odvozený z existence schématu nebo auditní stopy.

## 7. Validační roadmapa

Další potřebná evidence má být malá a falzifikovatelná:

1. Spustit stejný slepý fixture napříč nesouvisejícími obory vybranými předem deklarovanou náhodnou procedurou.
2. Použít nejméně jednoho lidského reality pozorovatele a jednoho nezávislého boundary pozorovatele.
3. Zdroj a U0 ponechat neveřejné hodnotící straně.
4. Zapsat GF-1 až GF-4, složky OP, neznámé, konflikty a lineage delty.
5. Zveřejnit fixture, rubriky, raw receipts a případy selhání, nikoli jen souhrnná skóre.
6. Opakovat do chvíle, kdy studie ukáže hranice zachování i hranice selhání.

Výzkumná otázka tedy není „Dokáže LEIS rekonstruovat tuto knihu?“, ale „Jaké druhy orientace přežijí, když většina informací zmizí, a kde metoda selhává?“

## 8. Právní a governance hranice

EU AI Act je zdrojem návrhových úvah, nikoli automatickým schválením. Článek 12 se týká logování a dohledatelnosti vysoce rizikových systémů; článek 14 lidského dohledu. Článek 99 stanoví stropy pokut včetně nižšího limitu pro SME u některých nesprávných, neúplných nebo zavádějících informací, ale použitelnost závisí na roli, jednání, jurisdikci a aktuálním znění práva. Žádný dokument LEIS není právním stanoviskem ani posouzením shody.

Primární zdroj: [nařízení (EU) 2024/1689 na EUR-Lex](https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:32024R1689). Pro skutečné nasazení vždy ověřte aktuální konsolidované znění a využijte kvalifikovanou právní radu.

## 9. Závěr

LEIS MEMORY je nejpřesněji **protokol zachování a rekonstrukce orientace ohraničený důkazy**. Důvěryhodnost stojí na omezených tvrzeních, explicitních neznámých, reprodukovatelných testech, nezávislých pozorovatelích a viditelné linii původu. Vědecký program je proto zmrazen jako disciplinovaný experiment, zatímco empirické zobecnění zůstává otevřené, dokud je evidence nezíská.

**Stav:** provozní jádro zdokumentováno; empirické zobecnění aktivní; právní a veřejný brain zůstávají ohraničenými kandidáty.
