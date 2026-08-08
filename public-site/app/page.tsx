"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type Source = "OpenAI" | "Anthropic" | "Google AI" | "Hugging Face" | "Mistral AI" | "Cohere" | "Google DeepMind" | "TII" | "RIKEN" | "AI Singapore" | "IndiaAI" | "KAIST" | "Brazil Government" | "CTU Prague" | "DFKI" | "AI Sweden" | "CSIRO" | "Kenya ICT" | "NCAIR Nigeria";
type News = { title: string; source: Source; place: string; lat: number; lon: number; url: string; summary: string; leis: string; reviewed?: string };
type Language = "en" | "cs" | "de" | "fr" | "es";

const languageOptions: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" }, { code: "cs", label: "Čeština" }, { code: "de", label: "Deutsch" }, { code: "fr", label: "Français" }, { code: "es", label: "Español" },
];

const supportedLanguages = new Set<Language>(languageOptions.map(({ code }) => code));
const isLanguage = (value: string | null): value is Language => Boolean(value && supportedLanguages.has(value as Language));
// Ke každému dalšímu jazyku se přidá i směr sazby; tím je portál připravený například pro arabštinu bez přestavby rozhraní.
const languageDirection: Record<Language, "ltr" | "rtl"> = { en: "ltr", cs: "ltr", de: "ltr", fr: "ltr", es: "ltr" };

const portalCopy = {
  en: { language: "Language", start: "Start here", story: "Our story", earth: "Earth Pulse", support: "Support LEIS", media: "Media", eyebrow: "REALITY-ORIENTED UNDERSTANDING SYSTEM", heroLead: "LEIS is a technology-independent framework for recognising, activating and reconstructing understanding from reality.", learn: "Learn about LEIS", lineage: "Follow the lineage ↓", grantEyebrow: "SUPPORT / COOPERATION / GRANT INTENT", grantA: "Keep LEIS free.", grantB: "Make it durable.", grantLead: "LEIS is free of charge forever. Support does not buy a wall around knowledge; it gives the human work behind preservation, validation and accessible public orientation the time to continue.", discuss: "Discuss support or a pilot", mediaEyebrow: "MEDIA / JOURNALISTS / RESEARCHERS", mediaTitle: "Start with the human question.", mediaLead: "Can understanding survive the departure of the person who created it? This is the story before any technology claim: continuity, evidence, uncertainty and the possibility of rebuilding context.", orientation: "Two-minute orientation", evidence: "Source-led briefing", dialogue: "Talk to Martin", readOrientation: "Read the orientation →", traceTimeline: "Trace the timeline →", openContact: "Open the contact path →", mediaContact: "Media / research enquiry", contactEyebrow: "A HUMAN CONTACT PATH", contactTitle: "Start with a real question.", contactLead: "For a grant, a research conversation, a practical pilot or media context. Your note stays on your device until you choose to open an e-mail.", write: "Write to LEIS", openMail: "Open prepared e-mail", copyMail: "Copy e-mail address", copied: "E-mail address copied.", notNow: "Not now" },
  cs: { language: "Jazyk", start: "Začněte zde", story: "Náš příběh", earth: "Pulz Země", support: "Podpořit LEIS", media: "Média", eyebrow: "SYSTÉM POROZUMĚNÍ ORIENTOVANÝ NA REALITU", heroLead: "LEIS je technologicky nezávislý rámec pro rozpoznávání, aktivaci a rekonstrukci porozumění z reality.", learn: "Poznejte LEIS", lineage: "Sledovat linii vývoje ↓", grantEyebrow: "PODPORA / SPOLUPRÁCE / GRANTOVÝ ZÁMĚR", grantA: "Nechte LEIS svobodný.", grantB: "Udělejte jej trvalým.", grantLead: "LEIS zůstává navždy zdarma. Podpora nekupuje zeď kolem znalostí; dává čas lidské práci, která stojí za uchováním, ověřováním a srozumitelnou veřejnou orientací.", discuss: "Probrat podporu nebo pilot", mediaEyebrow: "MÉDIA / NOVINÁŘI / VÝZKUMNÍCI", mediaTitle: "Začněte lidskou otázkou.", mediaLead: "Přežije porozumění odchod člověka, který jej vytvořil? To je příběh před každým technologickým tvrzením: kontinuita, důkaz, nejistota a možnost znovu vybudovat kontext.", orientation: "Dvouminutová orientace", evidence: "Briefing vedený zdroji", dialogue: "Promluvte si s Martinem", readOrientation: "Přečíst orientaci →", traceTimeline: "Projít časovou osu →", openContact: "Otevřít kontakt →", mediaContact: "Dotaz pro média / výzkum", contactEyebrow: "LIDSKÁ CESTA KE KONTAKTU", contactTitle: "Začněte skutečnou otázkou.", contactLead: "Pro grant, výzkumný rozhovor, praktický pilot nebo mediální souvislosti. Vaše poznámka zůstává ve vašem zařízení, dokud sami nezvolíte otevření e-mailu.", write: "Napsat LEIS", openMail: "Otevřít připravený e-mail", copyMail: "Kopírovat e-mail", copied: "E-mailová adresa zkopírována.", notNow: "Teď ne" },
  de: { language: "Sprache", start: "Start", story: "Unsere Geschichte", earth: "Erdimpuls", support: "LEIS unterstützen", media: "Medien", eyebrow: "REALITÄTSORIENTIERTES VERSTÄNDNISSYSTEM", heroLead: "LEIS ist ein technologieunabhängiger Rahmen, um Verständnis aus der Realität zu erkennen, zu aktivieren und zu rekonstruieren.", learn: "LEIS kennenlernen", lineage: "Entwicklungslinie verfolgen ↓", grantEyebrow: "UNTERSTÜTZUNG / KOOPERATION / GRANT-ABSICHT", grantA: "LEIS bleibt frei.", grantB: "Machen wir es dauerhaft.", grantLead: "LEIS bleibt für immer kostenfrei. Unterstützung schafft keine Mauer um Wissen; sie gibt der menschlichen Arbeit hinter Bewahrung, Validierung und öffentlicher Orientierung Zeit.", discuss: "Unterstützung oder Pilot besprechen", mediaEyebrow: "MEDIEN / JOURNALISTEN / FORSCHUNG", mediaTitle: "Beginnen Sie mit der menschlichen Frage.", mediaLead: "Kann Verständnis den Abschied der Person überleben, die es geschaffen hat? Das ist die Geschichte vor jedem Technologieversprechen: Kontinuität, Evidenz, Unsicherheit und rekonstruierbarer Kontext.", orientation: "Zwei-Minuten-Orientierung", evidence: "Quellenbasierte Einordnung", dialogue: "Mit Martin sprechen", readOrientation: "Orientierung lesen →", traceTimeline: "Zeitleiste verfolgen →", openContact: "Kontaktweg öffnen →", mediaContact: "Medien- / Forschungsanfrage", contactEyebrow: "EIN MENSCHLICHER KONTAKTWEG", contactTitle: "Beginnen Sie mit einer echten Frage.", contactLead: "Für einen Grant, ein Forschungsgespräch, einen praktischen Pilotversuch oder Medienkontext. Ihre Nachricht bleibt auf Ihrem Gerät, bis Sie selbst eine E-Mail öffnen.", write: "LEIS schreiben", openMail: "Vorbereitete E-Mail öffnen", copyMail: "E-Mail-Adresse kopieren", copied: "E-Mail-Adresse kopiert.", notNow: "Jetzt nicht" },
  fr: { language: "Langue", start: "Commencer", story: "Notre histoire", earth: "Pouls de la Terre", support: "Soutenir LEIS", media: "Médias", eyebrow: "SYSTÈME DE COMPRÉHENSION ORIENTÉ VERS LE RÉEL", heroLead: "LEIS est un cadre indépendant de la technologie pour reconnaître, activer et reconstruire la compréhension à partir de la réalité.", learn: "Découvrir LEIS", lineage: "Suivre la lignée ↓", grantEyebrow: "SOUTIEN / COOPÉRATION / INTENTION DE SUBVENTION", grantA: "Gardons LEIS libre.", grantB: "Rendons-le durable.", grantLead: "LEIS restera gratuit pour toujours. Le soutien n'achète pas un mur autour des connaissances ; il donne du temps au travail humain de préservation, de validation et d'orientation publique.", discuss: "Parler d'un soutien ou d'un pilote", mediaEyebrow: "MÉDIAS / JOURNALISTES / CHERCHEURS", mediaTitle: "Commencez par la question humaine.", mediaLead: "La compréhension peut-elle survivre au départ de la personne qui l'a créée ? C'est l'histoire avant toute promesse technologique : continuité, preuves, incertitude et possibilité de reconstruire le contexte.", orientation: "Orientation en deux minutes", evidence: "Briefing fondé sur les sources", dialogue: "Parler avec Martin", readOrientation: "Lire l'orientation →", traceTimeline: "Suivre la chronologie →", openContact: "Ouvrir le contact →", mediaContact: "Demande média / recherche", contactEyebrow: "UN CHEMIN DE CONTACT HUMAIN", contactTitle: "Commencez par une vraie question.", contactLead: "Pour une subvention, une conversation de recherche, un pilote pratique ou un contexte média. Votre message reste sur votre appareil jusqu'à ce que vous choisissiez d'ouvrir un e-mail.", write: "Écrire à LEIS", openMail: "Ouvrir l'e-mail préparé", copyMail: "Copier l'e-mail", copied: "Adresse e-mail copiée.", notNow: "Pas maintenant" },
  es: { language: "Idioma", start: "Empezar", story: "Nuestra historia", earth: "Pulso de la Tierra", support: "Apoyar LEIS", media: "Medios", eyebrow: "SISTEMA DE COMPRENSIÓN ORIENTADO A LA REALIDAD", heroLead: "LEIS es un marco independiente de la tecnología para reconocer, activar y reconstruir la comprensión a partir de la realidad.", learn: "Conocer LEIS", lineage: "Seguir el linaje ↓", grantEyebrow: "APOYO / COOPERACIÓN / INTENCIÓN DE SUBVENCIÓN", grantA: "Mantengamos LEIS libre.", grantB: "Hagámoslo duradero.", grantLead: "LEIS será gratuito para siempre. El apoyo no compra un muro alrededor del conocimiento; da tiempo al trabajo humano de preservación, validación y orientación pública accesible.", discuss: "Hablar de apoyo o un piloto", mediaEyebrow: "MEDIOS / PERIODISTAS / INVESTIGADORES", mediaTitle: "Empiece con la pregunta humana.", mediaLead: "¿Puede la comprensión sobrevivir a la partida de la persona que la creó? Esta es la historia previa a cualquier afirmación tecnológica: continuidad, evidencia, incertidumbre y la posibilidad de reconstruir el contexto.", orientation: "Orientación de dos minutos", evidence: "Resumen basado en fuentes", dialogue: "Hablar con Martin", readOrientation: "Leer la orientación →", traceTimeline: "Seguir la cronología →", openContact: "Abrir el contacto →", mediaContact: "Consulta de medios / investigación", contactEyebrow: "UNA RUTA DE CONTACTO HUMANA", contactTitle: "Empiece con una pregunta real.", contactLead: "Para una subvención, una conversación de investigación, un piloto práctico o contexto de medios. Su nota permanece en su dispositivo hasta que elija abrir un correo electrónico.", write: "Escribir a LEIS", openMail: "Abrir e-mail preparado", copyMail: "Copiar e-mail", copied: "Dirección de e-mail copiada.", notNow: "Ahora no" },
} as const;

type PortalCopy = (typeof portalCopy)[Language];

const sectionCopy: Record<Language, { orientation: string; reality: string; recognition: string; timeline: string; continuity: string; earth: string; earthLead: string }> = {
  en: { orientation: "QUICK ORIENTATION", reality: "Reality was never hidden. Recognition was incomplete.", recognition: "Recognition", timeline: "LIVING LEIS TIMELINE", continuity: "From seed to continuity.", earth: "Where the current conversation is coming from.", earthLead: "Explore public AI signals by place. Tap a glowing hub or a newsroom card to open its source, a short summary and LEIS context." },
  cs: { orientation: "RYCHLÁ ORIENTACE", reality: "Realita nikdy nebyla skrytá. Rozpoznání bylo neúplné.", recognition: "Rozpoznání", timeline: "ŽIVÁ ČASOVÁ OSA LEIS", continuity: "Od semene ke kontinuitě.", earth: "Odkud přichází současná konverzace.", earthLead: "Prozkoumejte veřejné AI signály podle místa. Klepněte na zářící bod nebo kartu zdroje a otevřete původ, krátké shrnutí a kontext LEIS." },
  de: { orientation: "SCHNELLE ORIENTIERUNG", reality: "Die Realität war nie verborgen. Die Erkenntnis war unvollständig.", recognition: "Erkennen", timeline: "LEBENDIGE LEIS-ZEITLINIE", continuity: "Vom Seed zur Kontinuität.", earth: "Woher die aktuelle Diskussion kommt.", earthLead: "Erkunden Sie öffentliche KI-Signale nach Ort. Wählen Sie einen leuchtenden Punkt oder eine Quellenkarte für Ursprung, Kurzfassung und LEIS-Kontext." },
  fr: { orientation: "ORIENTATION RAPIDE", reality: "La réalité n'a jamais été cachée. La reconnaissance était incomplète.", recognition: "Reconnaissance", timeline: "CHRONOLOGIE VIVANTE DE LEIS", continuity: "De la graine à la continuité.", earth: "D'où vient la conversation actuelle.", earthLead: "Explorez les signaux publics de l'IA par lieu. Touchez un point lumineux ou une carte source pour ouvrir son origine, un résumé et le contexte LEIS." },
  es: { orientation: "ORIENTACIÓN RÁPIDA", reality: "La realidad nunca estuvo oculta. El reconocimiento era incompleto.", recognition: "Reconocimiento", timeline: "CRONOLOGÍA VIVA DE LEIS", continuity: "De la semilla a la continuidad.", earth: "De dónde viene la conversación actual.", earthLead: "Explore señales públicas de IA por lugar. Toque un punto brillante o una tarjeta de fuente para abrir su origen, un resumen y el contexto de LEIS." },
};

const participationCopy: Record<Language, { eyebrow: string; title: string; lead: string; action: string; note: string; sourceNote: string }> = {
  en: { eyebrow: "OPEN · FREE · EVOLVING", title: "LEIS has no walls.", lead: "LEIS remains free of charge. Support, research dialogue and carefully scoped pilots help sustain its validation, preservation and human work.", action: "Start a respectful dialogue", note: "Public contact route · no mailing list · no pressure", sourceNote: "Original titles and links remain in the source language so every public signal can be verified at its origin." },
  cs: { eyebrow: "OTEVŘENÝ · SVOBODNÝ · VYVÍJEJÍCÍ SE", title: "LEIS nemá zdi.", lead: "LEIS zůstává zdarma. Podpora, výzkumný dialog a pečlivě vymezené piloty pomáhají udržet jeho ověřování, uchování a lidskou práci.", action: "Začít respektující dialog", note: "Veřejná cesta ke kontaktu · bez mailing listu · bez nátlaku", sourceNote: "Původní názvy a odkazy zůstávají v jazyce zdroje, aby bylo možné každý veřejný signál ověřit u jeho původu." },
  de: { eyebrow: "OFFEN · FREI · SICH ENTWICKELND", title: "LEIS hat keine Mauern.", lead: "LEIS bleibt kostenlos. Unterstützung, Forschungsdialog und sorgfältig begrenzte Pilotprojekte tragen Validierung, Bewahrung und menschliche Arbeit.", action: "Einen respektvollen Dialog beginnen", note: "Öffentlicher Kontaktweg · keine Mailingliste · kein Druck", sourceNote: "Originaltitel und Links bleiben in der Sprache der Quelle, damit jedes öffentliche Signal an seinem Ursprung überprüfbar bleibt." },
  fr: { eyebrow: "OUVERT · LIBRE · EN ÉVOLUTION", title: "LEIS n'a pas de murs.", lead: "LEIS reste gratuit. Le soutien, le dialogue de recherche et des pilotes soigneusement définis soutiennent sa validation, sa préservation et le travail humain.", action: "Commencer un dialogue respectueux", note: "Voie de contact publique · pas de liste de diffusion · pas de pression", sourceNote: "Les titres et liens originaux restent dans la langue de la source afin que chaque signal public soit vérifiable à son origine." },
  es: { eyebrow: "ABIERTO · LIBRE · EN EVOLUCIÓN", title: "LEIS no tiene muros.", lead: "LEIS sigue siendo gratuito. El apoyo, el diálogo de investigación y los pilotos cuidadosamente delimitados sostienen su validación, preservación y trabajo humano.", action: "Iniciar un diálogo respetuoso", note: "Ruta de contacto pública · sin lista de correo · sin presión", sourceNote: "Los títulos y enlaces originales permanecen en el idioma de la fuente para que cada señal pública pueda verificarse en su origen." },
};

const grantDossierCopy: Record<Language, { title: string; lead: string; why: string; route: string; routes: readonly [string, string][]; measure: string; measures: readonly [string, string][]; action: string }> = {
  en: {
    title: "What support makes possible.",
    lead: "Support protects the conditions in which LEIS can remain independent, inspectable and free to use. It is not a paywall, a promise of influence or a shortcut around evidence.",
    why: "Three ways to contribute",
    route: "A practical route, not a vague proposal",
    routes: [["Continuity", "Archive, preserve and make source lineage recoverable across changes of people, tools and time."], ["A bounded pilot", "Work with one real handover, decision or knowledge-continuity problem, with a clear scope and a human owner."], ["Independent challenge", "Invite researchers and institutions to test the method, question its limits and improve its measures."]],
    measure: "What a pilot should be able to show",
    measures: [["Recoverability", "Can the next person reconstruct why a decision was made, not only what was stored?"], ["Orientation", "How quickly can a new person find the relevant source, context, uncertainty and next responsible step?"], ["Continuity", "Does essential understanding remain explainable when a person, tool or system changes?"]],
    action: "Start a grant or pilot conversation",
  },
  cs: {
    title: "Co podpora skutečně umožňuje.",
    lead: "Podpora chrání podmínky, v nichž může LEIS zůstat nezávislý, přezkoumatelný a zdarma. Není to placená zeď, příslib vlivu ani zkratka kolem důkazů.",
    why: "Tři cesty, jak přispět",
    route: "Praktická cesta, ne vágní návrh",
    routes: [["Kontinuita", "Archivovat, uchovávat a zpřístupnit linii zdrojů napříč změnami lidí, nástrojů a času."], ["Vymezený pilot", "Pracovat s jedním skutečným problémem předání, rozhodování nebo kontinuity znalostí — s jasným rozsahem a lidským vlastníkem."], ["Nezávislá výzva", "Přizvat výzkumníky a instituce, aby metodu testovali, zpochybňovali její limity a zlepšovali její měřítka."]],
    measure: "Co by měl pilot umět ukázat",
    measures: [["Obnovitelnost", "Dokáže další člověk znovu vystavět, proč bylo rozhodnutí učiněno — ne jen co bylo uloženo?"], ["Orientace", "Jak rychle nový člověk najde relevantní zdroj, kontext, nejistotu a další odpovědný krok?"], ["Kontinuita", "Zůstává podstatné porozumění vysvětlitelné, když se změní člověk, nástroj nebo systém?"]],
    action: "Začít rozhovor o grantu nebo pilotu",
  },
  de: {
    title: "Was Unterstützung möglich macht.",
    lead: "Unterstützung schützt die Bedingungen, unter denen LEIS unabhängig, überprüfbar und kostenlos bleiben kann. Sie ist weder Paywall noch Einflussversprechen noch Abkürzung an Belegen vorbei.",
    why: "Drei Wege beizutragen",
    route: "Ein praktischer Weg, kein vager Vorschlag",
    routes: [["Kontinuität", "Quellenlinien archivieren, bewahren und über Veränderungen von Menschen, Werkzeugen und Zeit hinweg wiederherstellbar machen."], ["Ein begrenztes Pilotprojekt", "An einem realen Übergabe-, Entscheidungs- oder Wissenskontinuitätsproblem arbeiten — mit klarem Umfang und menschlicher Verantwortung."], ["Unabhängige Prüfung", "Forschende und Institutionen einladen, die Methode zu testen, ihre Grenzen zu hinterfragen und ihre Messgrößen zu verbessern."]],
    measure: "Was ein Pilot zeigen sollte",
    measures: [["Wiederherstellbarkeit", "Kann die nächste Person rekonstruieren, warum eine Entscheidung getroffen wurde, nicht nur was gespeichert wurde?"], ["Orientierung", "Wie schnell findet eine neue Person Quelle, Kontext, Unsicherheit und den nächsten verantwortlichen Schritt?"], ["Kontinuität", "Bleibt wesentliches Verständnis erklärbar, wenn sich Mensch, Werkzeug oder System verändert?"]],
    action: "Ein Gespräch zu Grant oder Pilot beginnen",
  },
  fr: {
    title: "Ce que le soutien rend possible.",
    lead: "Le soutien protège les conditions permettant à LEIS de rester indépendant, vérifiable et gratuit. Ce n'est ni un mur payant, ni une promesse d'influence, ni un raccourci autour des preuves.",
    why: "Trois façons de contribuer",
    route: "Une voie pratique, pas une proposition vague",
    routes: [["Continuité", "Archiver, préserver et rendre récupérable la filiation des sources malgré les changements de personnes, d'outils et de temps."], ["Un pilote délimité", "Travailler sur un vrai problème de transmission, de décision ou de continuité des connaissances, avec un périmètre clair et un responsable humain."], ["Examen indépendant", "Inviter chercheurs et institutions à tester la méthode, à questionner ses limites et à améliorer ses mesures."]],
    measure: "Ce qu'un pilote devrait montrer",
    measures: [["Reconstruction", "La personne suivante peut-elle reconstruire pourquoi une décision a été prise, et pas seulement ce qui a été stocké ?"], ["Orientation", "À quelle vitesse une nouvelle personne trouve-t-elle la source, le contexte, l'incertitude et la prochaine étape responsable ?"], ["Continuité", "La compréhension essentielle reste-t-elle explicable lorsqu'une personne, un outil ou un système change ?"]],
    action: "Ouvrir une conversation sur une subvention ou un pilote",
  },
  es: {
    title: "Lo que el apoyo hace posible.",
    lead: "El apoyo protege las condiciones para que LEIS siga siendo independiente, verificable y gratuito. No es un muro de pago, una promesa de influencia ni un atajo alrededor de la evidencia.",
    why: "Tres formas de contribuir",
    route: "Una vía práctica, no una propuesta vaga",
    routes: [["Continuidad", "Archivar, preservar y hacer recuperable el linaje de las fuentes a través de cambios de personas, herramientas y tiempo."], ["Un piloto delimitado", "Trabajar con un problema real de transferencia, decisión o continuidad del conocimiento, con alcance claro y una persona responsable."], ["Revisión independiente", "Invitar a investigadores e instituciones a probar el método, cuestionar sus límites y mejorar sus medidas."]],
    measure: "Lo que debería demostrar un piloto",
    measures: [["Reconstrucción", "¿Puede la siguiente persona reconstruir por qué se tomó una decisión, y no solo qué se almacenó?"], ["Orientación", "¿Con qué rapidez puede una nueva persona encontrar la fuente, el contexto, la incertidumbre y el siguiente paso responsable?"], ["Continuidad", "¿Sigue siendo explicable la comprensión esencial cuando cambia una persona, una herramienta o un sistema?"]],
    action: "Iniciar una conversación sobre subvención o piloto",
  },
};

const publicBriefCopy: Record<Language, { eyebrow: string; title: string; lead: string; cards: readonly [string, string, string][]; action: string }> = {
  en: {
    eyebrow: "PUBLIC BRIEFING",
    title: "A clear starting point for LEIS.",
    lead: "For a journalist, researcher, partner or simply a curious person: this is the shortest accurate way to orient yourself before following the sources.",
    cards: [["01", "In one sentence", "LEIS is a reality-oriented framework for recognising, activating and reconstructing understanding so it can survive change."], ["02", "What it is not", "LEIS is not an AI model, app or storage product. It can be carried by paper, conversation, Markdown, a repository or an AI system."], ["03", "How to examine it", "Ask whether the source, conditions, uncertainty and decision rationale can be recovered by the next person."], ["04", "What to ask next", "Begin with a real handover, research question or continuity problem. The public contact path opens a respectful conversation."]],
    action: "Open the public contact path",
  },
  cs: {
    eyebrow: "VEŘEJNÝ BRIEFING",
    title: "Jasný výchozí bod pro LEIS.",
    lead: "Pro novináře, výzkumníka, partnera i jednoduše zvídavého člověka: toto je nejkratší přesná orientace před dalším sledováním zdrojů.",
    cards: [["01", "Jednou větou", "LEIS je rámec orientovaný na realitu pro rozpoznávání, aktivaci a rekonstrukci porozumění, aby mohlo přežít změnu."], ["02", "Čím LEIS není", "LEIS není AI model, aplikace ani produkt pro ukládání. Může existovat na papíře, v konverzaci, Markdownu, repozitáři nebo AI systému."], ["03", "Jak jej zkoumat", "Ptejte se, zda další člověk dokáže obnovit zdroj, podmínky, nejistotu a důvody rozhodnutí."], ["04", "Na co se ptát dál", "Začněte skutečným předáním, výzkumnou otázkou nebo problémem kontinuity. Veřejná cesta ke kontaktu otevírá respektující dialog."]],
    action: "Otevřít veřejnou cestu ke kontaktu",
  },
  de: {
    eyebrow: "ÖFFENTLICHES BRIEFING",
    title: "Ein klarer Einstieg in LEIS.",
    lead: "Für Journalisten, Forschende, Partner und neugierige Menschen: Dies ist die kürzeste präzise Orientierung, bevor Sie den Quellen folgen.",
    cards: [["01", "In einem Satz", "LEIS ist ein realitätsorientierter Rahmen, um Verständnis zu erkennen, zu aktivieren und zu rekonstruieren, damit es Wandel überdauern kann."], ["02", "Was LEIS nicht ist", "LEIS ist weder KI-Modell noch App noch Speicherprodukt. Es kann durch Papier, Gespräch, Markdown, ein Repository oder ein KI-System getragen werden."], ["03", "Wie es geprüft wird", "Fragen Sie, ob Quelle, Bedingungen, Unsicherheit und Entscheidungsgrund durch die nächste Person wiederherstellbar sind."], ["04", "Was als Nächstes gefragt werden kann", "Beginnen Sie mit einer realen Übergabe, Forschungsfrage oder Kontinuitätsfrage. Der öffentliche Kontaktweg eröffnet einen respektvollen Dialog."]],
    action: "Öffentlichen Kontaktweg öffnen",
  },
  fr: {
    eyebrow: "BRIEFING PUBLIC",
    title: "Un point de départ clair pour LEIS.",
    lead: "Pour les journalistes, chercheurs, partenaires ou personnes curieuses : voici l'orientation la plus courte et la plus précise avant de suivre les sources.",
    cards: [["01", "En une phrase", "LEIS est un cadre orienté vers le réel pour reconnaître, activer et reconstruire la compréhension afin qu'elle survive au changement."], ["02", "Ce que LEIS n'est pas", "LEIS n'est ni un modèle d'IA, ni une application, ni un produit de stockage. Il peut être porté par le papier, la conversation, Markdown, un dépôt ou un système d'IA."], ["03", "Comment l'examiner", "Demandez si la source, les conditions, l'incertitude et le raisonnement d'une décision peuvent être retrouvés par la personne suivante."], ["04", "La question suivante", "Commencez par une vraie transmission, une question de recherche ou un problème de continuité. La voie publique de contact ouvre un dialogue respectueux."]],
    action: "Ouvrir la voie publique de contact",
  },
  es: {
    eyebrow: "BRIEFING PÚBLICO",
    title: "Un punto de partida claro para LEIS.",
    lead: "Para periodistas, investigadores, socios o personas curiosas: esta es la orientación más breve y precisa antes de seguir las fuentes.",
    cards: [["01", "En una frase", "LEIS es un marco orientado a la realidad para reconocer, activar y reconstruir la comprensión, de modo que pueda sobrevivir al cambio."], ["02", "Lo que LEIS no es", "LEIS no es un modelo de IA, una aplicación ni un producto de almacenamiento. Puede llevarse en papel, conversación, Markdown, un repositorio o un sistema de IA."], ["03", "Cómo examinarlo", "Pregunte si la siguiente persona puede recuperar la fuente, las condiciones, la incertidumbre y el razonamiento de una decisión."], ["04", "Qué preguntar después", "Comience con una transferencia real, una pregunta de investigación o un problema de continuidad. La vía pública de contacto abre un diálogo respetuoso."]],
    action: "Abrir la vía pública de contacto",
  },
};

const loopCopy: Record<Language, { eyebrow: string; title: string; lead: string; questionLabel: string; steps: readonly [string, string, string][] }> = {
  en: { eyebrow: "THE LEIS LOOP", title: "Understanding is a living loop.", lead: "The value is not in collecting more information. It is in activating the right understanding, then returning it to reality for validation.", questionLabel: "A useful question:", steps: [["Reality", "Start with what is actually present: an event, a need, a decision, a source or a contradiction.", "What can be observed or verified before interpretation begins?"], ["Recognition", "Notice the signal that matters among the noise; connect it to the relevant people, conditions and history.", "What pattern is becoming visible now?"], ["Activation", "Bring the relevant context into the present moment, instead of relying on memory or a disconnected file.", "What must be available now for a responsible next step?"], ["Understanding", "Make the relationship between evidence, purpose, uncertainty and action explainable to another person.", "Can the next person understand why this matters?"], ["Validation", "Return the proposed understanding to reality; retain uncertainty where the evidence does not carry more.", "What changed when the claim met reality?"], ["Continuity", "Leave behind a recoverable route so the next person can continue rather than begin from zero.", "Can this understanding travel through time, people and tools?"]] },
  cs: { eyebrow: "SMYČKA LEIS", title: "Porozumění je živá smyčka.", lead: "Hodnota není v hromadění dalších informací. Je v aktivaci správného porozumění a v jeho návratu k realitě pro ověření.", questionLabel: "Užitečná otázka:", steps: [["Realita", "Začněte tím, co je skutečně přítomné: událostí, potřebou, rozhodnutím, zdrojem nebo rozporem.", "Co lze pozorovat či ověřit dříve, než začne interpretace?"], ["Rozpoznání", "Všimněte si signálu, který je mezi šumem podstatný; propojte jej s relevantními lidmi, podmínkami a historií.", "Jaký vzorec se právě začíná ukazovat?"], ["Aktivace", "Přiveďte relevantní kontext do přítomného okamžiku, místo aby zůstal jen v paměti nebo v odděleném souboru.", "Co musí být nyní dostupné pro odpovědný další krok?"], ["Porozumění", "Učiňte vztah mezi důkazy, účelem, nejistotou a jednáním vysvětlitelným pro dalšího člověka.", "Dokáže další člověk pochopit, proč na tom záleží?"], ["Ověření", "Vraťte navržené porozumění zpět k realitě; ponechte nejistotu tam, kde důkazy nenesou více.", "Co se změnilo, když se tvrzení setkalo s realitou?"], ["Kontinuita", "Zanechte obnovitelnou cestu, aby další člověk mohl pokračovat místo začínání od nuly.", "Může toto porozumění cestovat časem, lidmi a nástroji?"]] },
  de: { eyebrow: "DER LEIS-KREISLAUF", title: "Verständnis ist ein lebendiger Kreislauf.", lead: "Der Wert liegt nicht im Sammeln weiterer Informationen. Er liegt darin, das richtige Verständnis zu aktivieren und es zur Prüfung an die Realität zurückzuführen.", questionLabel: "Eine hilfreiche Frage:", steps: [["Realität", "Beginnen Sie mit dem, was tatsächlich vorhanden ist: einem Ereignis, Bedarf, einer Entscheidung, Quelle oder einem Widerspruch.", "Was lässt sich beobachten oder prüfen, bevor die Interpretation beginnt?"], ["Erkennen", "Erkennen Sie das wichtige Signal im Rauschen und verbinden Sie es mit den relevanten Menschen, Bedingungen und der Geschichte.", "Welches Muster wird gerade sichtbar?"], ["Aktivierung", "Bringen Sie den relevanten Kontext in die Gegenwart, statt sich auf Erinnerung oder eine getrennte Datei zu verlassen.", "Was muss jetzt verfügbar sein, damit der nächste Schritt verantwortbar ist?"], ["Verständnis", "Machen Sie den Zusammenhang zwischen Belegen, Zweck, Unsicherheit und Handlung für eine andere Person erklärbar.", "Kann die nächste Person verstehen, warum das wichtig ist?"], ["Validierung", "Führen Sie das vorgeschlagene Verständnis zurück zur Realität; lassen Sie Unsicherheit bestehen, wenn die Belege nicht weiter tragen.", "Was hat sich verändert, als die Behauptung der Realität begegnete?"], ["Kontinuität", "Hinterlassen Sie einen wiederherstellbaren Weg, damit die nächste Person fortsetzen kann statt bei null zu beginnen.", "Kann dieses Verständnis durch Zeit, Menschen und Werkzeuge reisen?"]] },
  fr: { eyebrow: "LA BOUCLE LEIS", title: "Comprendre est une boucle vivante.", lead: "La valeur ne réside pas dans l’accumulation de nouvelles informations. Elle consiste à activer la bonne compréhension, puis à la ramener au réel pour la valider.", questionLabel: "Une question utile :", steps: [["Réalité", "Commencez par ce qui est réellement présent : un événement, un besoin, une décision, une source ou une contradiction.", "Que peut-on observer ou vérifier avant que l’interprétation commence ?"], ["Reconnaissance", "Repérez le signal important dans le bruit et reliez-le aux personnes, conditions et à l’histoire pertinentes.", "Quel motif devient visible maintenant ?"], ["Activation", "Ramenez le contexte pertinent au moment présent au lieu de dépendre de la mémoire ou d’un fichier isolé.", "Que faut-il avoir à disposition maintenant pour une prochaine étape responsable ?"], ["Compréhension", "Rendez explicable à une autre personne le lien entre preuves, intention, incertitude et action.", "La personne suivante peut-elle comprendre pourquoi cela compte ?"], ["Validation", "Ramenez la compréhension proposée au réel ; maintenez l’incertitude là où les preuves ne permettent pas davantage.", "Qu’est-ce qui a changé lorsque l’affirmation a rencontré le réel ?"], ["Continuité", "Laissez une voie récupérable afin que la personne suivante puisse poursuivre plutôt que repartir de zéro.", "Cette compréhension peut-elle traverser le temps, les personnes et les outils ?"]] },
  es: { eyebrow: "EL CICLO LEIS", title: "La comprensión es un ciclo vivo.", lead: "El valor no está en acumular más información. Está en activar la comprensión adecuada y devolverla a la realidad para validarla.", questionLabel: "Una pregunta útil:", steps: [["Realidad", "Empiece por lo que está realmente presente: un hecho, una necesidad, una decisión, una fuente o una contradicción.", "¿Qué se puede observar o verificar antes de que empiece la interpretación?"], ["Reconocimiento", "Detecte la señal importante entre el ruido y relaciónela con las personas, condiciones e historia relevantes.", "¿Qué patrón se está haciendo visible ahora?"], ["Activación", "Lleve el contexto relevante al momento presente, en lugar de depender de la memoria o de un archivo aislado.", "¿Qué debe estar disponible ahora para un siguiente paso responsable?"], ["Comprensión", "Haga explicable para otra persona la relación entre evidencia, propósito, incertidumbre y acción.", "¿Puede la siguiente persona comprender por qué esto importa?"], ["Validación", "Devuelva la comprensión propuesta a la realidad; conserve la incertidumbre cuando la evidencia no llegue más lejos.", "¿Qué cambió cuando la afirmación se encontró con la realidad?"], ["Continuidad", "Deje una ruta recuperable para que la siguiente persona pueda continuar en lugar de empezar desde cero.", "¿Puede esta comprensión viajar a través del tiempo, las personas y las herramientas?"]] },
};

const testCopy: Record<Language, { eyebrow: string; title: string; lead: string; checks: readonly [string, string, string][]; note: string }> = {
  en: { eyebrow: "A PUBLIC WAY TO TEST LEIS", title: "Do not take LEIS on trust.", lead: "Use a real decision, handover or research question. Then test whether the essential understanding survives.", checks: [["01", "Trace the source", "Can you distinguish evidence from interpretation, and find where a claim began?"], ["02", "Recover the reason", "Can the next person recover not only what was done, but why, under which conditions and with which uncertainty?"], ["03", "Return to reality", "Can the explanation be checked against reality, improved when wrong and preserved when useful?"]], note: "A good result is not a perfect story. It is a recoverable, honest route back to the evidence." },
  cs: { eyebrow: "VEŘEJNÝ ZPŮSOB, JAK LEIS OVĚŘIT", title: "Nevěřte LEIS jen proto, že to říká LEIS.", lead: "Vezměte skutečné rozhodnutí, předání nebo výzkumnou otázku. Potom ověřte, zda podstatné porozumění přežije.", checks: [["01", "Dohledejte zdroj", "Dokážete rozlišit důkaz od interpretace a najít, kde tvrzení začalo?"], ["02", "Obnovte důvod", "Dokáže další člověk obnovit nejen co se udělalo, ale i proč, za jakých podmínek a s jakou nejistotou?"], ["03", "Vraťte se k realitě", "Lze vysvětlení porovnat s realitou, zlepšit jej, když je chybné, a zachovat jej, když je užitečné?"]], note: "Dobrým výsledkem není dokonalý příběh. Je jím obnovitelná a poctivá cesta zpět k důkazům." },
  de: { eyebrow: "EIN ÖFFENTLICHER WEG, LEIS ZU PRÜFEN", title: "Nehmen Sie LEIS nicht einfach auf Vertrauen hin.", lead: "Nehmen Sie eine reale Entscheidung, Übergabe oder Forschungsfrage. Prüfen Sie dann, ob das wesentliche Verständnis überlebt.", checks: [["01", "Quelle nachvollziehen", "Können Sie Beleg und Interpretation unterscheiden und finden, wo eine Behauptung begann?"], ["02", "Grund wiederherstellen", "Kann die nächste Person nicht nur nachvollziehen, was getan wurde, sondern auch warum, unter welchen Bedingungen und mit welcher Unsicherheit?"], ["03", "Zur Realität zurückkehren", "Kann die Erklärung an der Realität geprüft, bei Fehlern verbessert und bei Nutzen bewahrt werden?"]], note: "Ein gutes Ergebnis ist keine perfekte Geschichte. Es ist ein wiederherstellbarer, ehrlicher Weg zurück zu den Belegen." },
  fr: { eyebrow: "UNE FAÇON PUBLIQUE DE METTRE LEIS À L’ÉPREUVE", title: "Ne croyez pas LEIS sur parole.", lead: "Prenez une décision réelle, une transmission ou une question de recherche. Vérifiez ensuite si la compréhension essentielle survit.", checks: [["01", "Retrouver la source", "Pouvez-vous distinguer les preuves de l’interprétation et retrouver l’origine d’une affirmation ?"], ["02", "Retrouver la raison", "La personne suivante peut-elle retrouver non seulement ce qui a été fait, mais pourquoi, dans quelles conditions et avec quelle incertitude ?"], ["03", "Revenir au réel", "L’explication peut-elle être confrontée au réel, améliorée lorsqu’elle est erronée et préservée lorsqu’elle est utile ?"]], note: "Un bon résultat n’est pas une histoire parfaite. C’est un chemin honnête et récupérable vers les preuves." },
  es: { eyebrow: "UNA FORMA PÚBLICA DE PONER A PRUEBA LEIS", title: "No acepte LEIS solo por confianza.", lead: "Tome una decisión real, una transferencia o una pregunta de investigación. Después pruebe si la comprensión esencial sobrevive.", checks: [["01", "Rastrear la fuente", "¿Puede distinguir la evidencia de la interpretación y encontrar dónde comenzó una afirmación?"], ["02", "Recuperar la razón", "¿Puede la siguiente persona recuperar no solo qué se hizo, sino por qué, bajo qué condiciones y con qué incertidumbre?"], ["03", "Volver a la realidad", "¿Puede la explicación contrastarse con la realidad, mejorarse cuando es incorrecta y preservarse cuando es útil?"]], note: "Un buen resultado no es una historia perfecta. Es una ruta honesta y recuperable de regreso a la evidencia." },
};

const seedDownloadCopy: Record<Language, { eyebrow: string; title: string; lead: string; verified: string; language: string; download: string; view: string; steps: readonly [string, string][]; safety: string }> = {
  en: { eyebrow: "PUBLIC RECONSTRUCTION SEED", title: "Take the LEIS Root Seed with you.", lead: "This is a small Markdown text file: a portable starting context for understanding LEIS. It is not software and cannot run a program.", verified: "Verified archival copy · 3 August 2026 · SHA-256: 15BCC48F…CD6E3B4", language: "Source text: English — preserved exactly as the verified source.", download: "Download the Seed (.md)", view: "Read the Seed online", steps: [["1", "Download it", "Save the .md file anywhere you can find it again."], ["2", "Open it", "Use Notepad, Word, a Markdown reader, or upload the file to an AI you trust."], ["3", "Begin a conversation", "Tell the AI: “Read this as LEIS context. Keep evidence, uncertainty and reality visible.”"]], safety: "A Seed is a source text, not an instruction to grant access or execute anything. Keep your own private files private." },
  cs: { eyebrow: "VEŘEJNÝ SEED PRO REKONSTRUKCI", title: "Vezměte si LEIS Root Seed s sebou.", lead: "Jde o malý textový soubor Markdown: přenositelný výchozí kontext pro porozumění LEIS. Není to software a nemůže spustit program.", verified: "Ověřená archivní kopie · 3. srpna 2026 · SHA-256: 15BCC48F…CD6E3B4", language: "Zdrojový text: anglicky — zachován přesně jako ověřený zdroj.", download: "Stáhnout Seed (.md)", view: "Přečíst Seed online", steps: [["1", "Stáhněte jej", "Uložte soubor .md na místo, kde jej znovu snadno najdete."], ["2", "Otevřete jej", "Použijte Poznámkový blok, Word, čtečku Markdownu nebo jej nahrajte do AI, které důvěřujete."], ["3", "Začněte rozhovor", "AI napište: „Přečti tento soubor jako kontext LEIS. Zachovej viditelné důkazy, nejistotu a realitu.“"]], safety: "Seed je zdrojový text, ne instrukce k udělení přístupu ani ke spuštění čehokoli. Vaše soukromé soubory zůstávají soukromé." },
  de: { eyebrow: "ÖFFENTLICHER REKONSTRUKTIONS-SEED", title: "Nehmen Sie den LEIS Root Seed mit.", lead: "Dies ist eine kleine Markdown-Textdatei: ein tragbarer Ausgangskontext zum Verständnis von LEIS. Es ist keine Software und kann kein Programm ausführen.", verified: "Verifizierte Archivkopie · 3. August 2026 · SHA-256: 15BCC48F…CD6E3B4", language: "Quelltext: Englisch — genau wie die verifizierte Quelle erhalten.", download: "Seed herunterladen (.md)", view: "Seed online lesen", steps: [["1", "Herunterladen", "Speichern Sie die .md-Datei an einem Ort, an dem Sie sie wiederfinden."], ["2", "Öffnen", "Nutzen Sie Editor, Word, einen Markdown-Reader oder laden Sie die Datei in eine KI hoch, der Sie vertrauen."], ["3", "Gespräch beginnen", "Sagen Sie der KI: „Lies dies als LEIS-Kontext. Halte Belege, Unsicherheit und Realität sichtbar.“"]], safety: "Ein Seed ist Quelltext, keine Anweisung, Zugriff zu gewähren oder etwas auszuführen. Halten Sie private Dateien privat." },
  fr: { eyebrow: "SEED PUBLIC DE RECONSTRUCTION", title: "Emportez le LEIS Root Seed.", lead: "C’est un petit fichier texte Markdown : un contexte de départ portable pour comprendre LEIS. Ce n’est pas un logiciel et il ne peut exécuter aucun programme.", verified: "Copie archivistique vérifiée · 3 août 2026 · SHA-256 : 15BCC48F…CD6E3B4", language: "Texte source : anglais — préservé exactement comme la source vérifiée.", download: "Télécharger le Seed (.md)", view: "Lire le Seed en ligne", steps: [["1", "Téléchargez-le", "Enregistrez le fichier .md dans un endroit facile à retrouver."], ["2", "Ouvrez-le", "Utilisez le Bloc-notes, Word, un lecteur Markdown ou chargez le fichier dans une IA de confiance."], ["3", "Commencez une conversation", "Dites à l’IA : « Lis ceci comme contexte LEIS. Garde les preuves, l’incertitude et le réel visibles. »"]], safety: "Un Seed est un texte source, pas une instruction d’accorder un accès ou d’exécuter quoi que ce soit. Gardez vos fichiers privés privés." },
  es: { eyebrow: "SEED PÚBLICO DE RECONSTRUCCIÓN", title: "Lleve consigo el LEIS Root Seed.", lead: "Es un pequeño archivo de texto Markdown: un contexto inicial portátil para comprender LEIS. No es software y no puede ejecutar ningún programa.", verified: "Copia archivística verificada · 3 de agosto de 2026 · SHA-256: 15BCC48F…CD6E3B4", language: "Texto fuente: inglés — conservado exactamente como la fuente verificada.", download: "Descargar el Seed (.md)", view: "Leer el Seed en línea", steps: [["1", "Descárguelo", "Guarde el archivo .md en un lugar donde pueda encontrarlo de nuevo."], ["2", "Ábralo", "Use el Bloc de notas, Word, un lector Markdown o cargue el archivo en una IA de confianza."], ["3", "Inicie una conversación", "Dígale a la IA: «Lee esto como contexto LEIS. Mantén visibles la evidencia, la incertidumbre y la realidad». "]], safety: "Un Seed es texto fuente, no una instrucción para conceder acceso ni ejecutar nada. Mantenga privados sus archivos privados." },
};

const principleCopy: Record<Language, { roots: string; rootsText: string; lineage: string; lineageText: string; validation: string; validationText: string; formula: string; timelineNote: string }> = {
  en: { roots: "Recognition", rootsText: "Questions become roots. Relationships become branches. Understanding grows when the right pattern is recognised.", lineage: "Lineage", lineageText: "Context should survive change: of people, tools, time and technology.", validation: "Validation", validationText: "Reality remains the final validator. Where evidence is incomplete, uncertainty remains visible.", formula: "Reality → recognition → activation → understanding → validation → new reality", timelineNote: "Every point distinguishes documented evidence, creator-reported context and interpretation. The timeline is alive; it does not replace evidence." },
  cs: { roots: "Rozpoznání", rootsText: "Otázky se stávají kořeny. Vztahy se stávají větvemi. Porozumění roste, když je rozpoznán správný vzorec.", lineage: "Linie vývoje", lineageText: "Kontext by měl přežít změnu lidí, nástrojů, času i technologie.", validation: "Ověření", validationText: "Realita zůstává konečným ověřovatelem. Kde jsou důkazy neúplné, zůstává viditelná nejistota.", formula: "Realita → rozpoznání → aktivace → porozumění → ověření → nová realita", timelineNote: "Každý bod rozlišuje doložený důkaz, kontext uváděný autorem a interpretaci. Časová osa je živá; nenahrazuje důkazy." },
  de: { roots: "Erkennen", rootsText: "Fragen werden zu Wurzeln. Beziehungen werden zu Ästen. Verständnis wächst, wenn das richtige Muster erkannt wird.", lineage: "Entwicklungslinie", lineageText: "Kontext soll Veränderungen von Menschen, Werkzeugen, Zeit und Technologie überdauern.", validation: "Validierung", validationText: "Die Realität bleibt der endgültige Prüfer. Wo Belege unvollständig sind, bleibt Unsicherheit sichtbar.", formula: "Realität → Erkennen → Aktivierung → Verständnis → Validierung → neue Realität", timelineNote: "Jeder Punkt unterscheidet dokumentierte Belege, vom Urheber berichteten Kontext und Interpretation. Die Zeitleiste lebt; sie ersetzt keine Belege." },
  fr: { roots: "Reconnaissance", rootsText: "Les questions deviennent des racines. Les relations deviennent des branches. La compréhension grandit lorsque le bon schéma est reconnu.", lineage: "Lignée", lineageText: "Le contexte doit survivre aux changements de personnes, d'outils, de temps et de technologie.", validation: "Validation", validationText: "La réalité reste le validateur final. Lorsque les preuves sont incomplètes, l'incertitude reste visible.", formula: "Réalité → reconnaissance → activation → compréhension → validation → nouvelle réalité", timelineNote: "Chaque point distingue les preuves documentées, le contexte rapporté par le créateur et l'interprétation. La chronologie est vivante ; elle ne remplace pas les preuves." },
  es: { roots: "Reconocimiento", rootsText: "Las preguntas se convierten en raíces. Las relaciones se convierten en ramas. La comprensión crece cuando se reconoce el patrón correcto.", lineage: "Linaje", lineageText: "El contexto debe sobrevivir al cambio de personas, herramientas, tiempo y tecnología.", validation: "Validación", validationText: "La realidad sigue siendo el validador final. Cuando la evidencia es incompleta, la incertidumbre sigue visible.", formula: "Realidad → reconocimiento → activación → comprensión → validación → nueva realidad", timelineNote: "Cada punto distingue evidencia documentada, contexto informado por el creador e interpretación. La cronología está viva; no sustituye la evidencia." },
};

const earthCopy: Record<Language, { eyebrow: string; title: string; lead: string; selected: string; sourceSays: string; commentary: string; origin: string; read: string; hint: string }> = {
  en: { eyebrow: "EARTH PULSE / CURRENT AI SIGNALS", title: "Where the current conversation is coming from.", lead: "Explore public AI signals by place. Tap a glowing hub or a newsroom card to open its source, a short summary and LEIS context.", selected: "SELECTED SOURCE SIGNAL", sourceSays: "What the source says:", commentary: "LEIS commentary:", origin: "Originating public desk:", read: "Read the original source ↗", hint: "Drag to rotate · scroll to zoom · select a point" },
  cs: { eyebrow: "PULZ ZEMĚ / SOUČASNÉ AI SIGNÁLY", title: "Odkud přichází současná konverzace.", lead: "Prozkoumejte veřejné AI signály podle místa. Klepněte na zářící bod nebo kartu zdroje a otevřete původ, krátké shrnutí a kontext LEIS.", selected: "VYBRANÝ SIGNÁL ZDROJE", sourceSays: "Co uvádí zdroj:", commentary: "Komentář LEIS:", origin: "Původní veřejná redakce:", read: "Otevřít původní zdroj ↗", hint: "Táhnutím otáčejte · kolečkem přibližujte · zvolte bod" },
  de: { eyebrow: "ERDIMPULS / AKTUELLE KI-SIGNALE", title: "Woher die aktuelle Diskussion kommt.", lead: "Erkunden Sie öffentliche KI-Signale nach Ort. Wählen Sie einen leuchtenden Punkt oder eine Quellenkarte für Ursprung, Kurzfassung und LEIS-Kontext.", selected: "AUSGEWÄHLTES QUELLENSIGNAL", sourceSays: "Was die Quelle sagt:", commentary: "LEIS-Kommentar:", origin: "Ursprüngliche öffentliche Redaktion:", read: "Originalquelle lesen ↗", hint: "Zum Drehen ziehen · zum Zoomen scrollen · Punkt wählen" },
  fr: { eyebrow: "POULS DE LA TERRE / SIGNAUX IA ACTUELS", title: "D'où vient la conversation actuelle.", lead: "Explorez les signaux publics de l'IA par lieu. Touchez un point lumineux ou une carte source pour ouvrir son origine, un résumé et le contexte LEIS.", selected: "SIGNAL SOURCE SÉLECTIONNÉ", sourceSays: "Ce que dit la source :", commentary: "Commentaire LEIS :", origin: "Rédaction publique d'origine :", read: "Lire la source originale ↗", hint: "Glissez pour tourner · défilez pour zoomer · choisissez un point" },
  es: { eyebrow: "PULSO DE LA TIERRA / SEÑALES ACTUALES DE IA", title: "De dónde viene la conversación actual.", lead: "Explore señales públicas de IA por lugar. Toque un punto brillante o una tarjeta de fuente para abrir su origen, un resumen y el contexto de LEIS.", selected: "SEÑAL DE FUENTE SELECCIONADA", sourceSays: "Lo que dice la fuente:", commentary: "Comentario LEIS:", origin: "Redacción pública de origen:", read: "Leer la fuente original ↗", hint: "Arrastre para girar · desplácese para ampliar · elija un punto" },
};

const globeCopy: Record<Language, { aria: string; preparing: string; reloading: string; appearing: string; refresh: string; weatherAria: string; clouds: string; cloudNote: string; atmosphereOn: string; atmosphereOff: string; zoomAria: string; zoomIn: string; zoomOut: string; zoomHint: string; selectedSignal: string; sourceContext: string; sourceReports: string; leisContext: string; readSource: string; openContext: string; publicDesk: string; reviewedSignals: string; sourceReviewed: string; newsroom: string; chooseSignal: string; aiUse: string; emptyCountry: string; close: string }> = {
  en: { aria: "Interactive globe. Drag to rotate, scroll to zoom and choose a source point.", preparing: "Preparing the interactive Earth", reloading: "Interactive Earth is reloading", appearing: "The globe will appear in a moment.", refresh: "Please refresh once to try the live map again.", weatherAria: "Live weather layer active", clouds: "Live cloud conditions", cloudNote: "Open-Meteo · visualised cloud cover · refreshes every 10 min", atmosphereOn: "Atmosphere on", atmosphereOff: "Atmosphere off", zoomAria: "Globe zoom controls", zoomIn: "Zoom in", zoomOut: "Zoom out", zoomHint: "Shift + scroll", selectedSignal: "Selected source signal", sourceContext: "Source + LEIS context", sourceReports: "What this source reports", leisContext: "LEIS context", readSource: "Read the original source ↗", openContext: "Open context", publicDesk: "Public source desk", reviewedSignals: "Up to five reviewed signals", sourceReviewed: "Source reviewed", newsroom: "Newsroom", chooseSignal: "Choose a reviewed signal to open its full LEIS context.", aiUse: "How AI is used", emptyCountry: "No reviewed local source or country AI profile has been added here yet. LEIS does not substitute unrelated news from another country.", close: "Close selection" },
  cs: { aria: "Interaktivní glóbus. Tažením otáčejte, přibližujte a vyberte zdrojový bod.", preparing: "Připravuji interaktivní Zemi", reloading: "Interaktivní Země se znovu načítá", appearing: "Glóbus se objeví za okamžik.", refresh: "Obnovte stránku a zkuste živou mapu znovu.", weatherAria: "Aktivní vrstva živého počasí", clouds: "Aktuální oblačnost", cloudNote: "Open-Meteo · vizualizovaná oblačnost · obnovuje se každých 10 min", atmosphereOn: "Atmosféra zapnuta", atmosphereOff: "Atmosféra vypnuta", zoomAria: "Ovládání přiblížení glóbu", zoomIn: "Přiblížit", zoomOut: "Oddálit", zoomHint: "Shift + kolečko", selectedSignal: "Vybraný signál zdroje", sourceContext: "Zdroj + kontext LEIS", sourceReports: "Co tento zdroj uvádí", leisContext: "Kontext LEIS", readSource: "Otevřít původní zdroj ↗", openContext: "Otevřít kontext", publicDesk: "Veřejná zdrojová redakce", reviewedSignals: "Až pět ověřených signálů", sourceReviewed: "Zdroj ověřen", newsroom: "Redakce", chooseSignal: "Zvolte ověřený signál a otevřete jeho úplný kontext LEIS.", aiUse: "Jak se AI používá", emptyCountry: "Pro tuto zemi zatím nebyl přidán ověřený místní zdroj ani profil AI. LEIS nenahrazuje chybějící kontext nesouvisejícími zprávami z jiné země.", close: "Zavřít výběr" },
  de: { aria: "Interaktiver Globus. Zum Drehen ziehen, zum Zoomen scrollen und einen Quellenpunkt wählen.", preparing: "Interaktive Erde wird vorbereitet", reloading: "Interaktive Erde wird neu geladen", appearing: "Der Globus erscheint in einem Moment.", refresh: "Bitte aktualisieren Sie die Seite und versuchen Sie die Live-Karte erneut.", weatherAria: "Live-Wetterschicht aktiv", clouds: "Aktuelle Bewölkung", cloudNote: "Open-Meteo · visualisierte Bewölkung · Aktualisierung alle 10 Min.", atmosphereOn: "Atmosphäre an", atmosphereOff: "Atmosphäre aus", zoomAria: "Zoomsteuerung des Globus", zoomIn: "Vergrößern", zoomOut: "Verkleinern", zoomHint: "Umschalt + Scrollen", selectedSignal: "Ausgewähltes Quellensignal", sourceContext: "Quelle + LEIS-Kontext", sourceReports: "Was diese Quelle berichtet", leisContext: "LEIS-Kontext", readSource: "Originalquelle lesen ↗", openContext: "Kontext öffnen", publicDesk: "Öffentliche Quellenredaktion", reviewedSignals: "Bis zu fünf geprüfte Signale", sourceReviewed: "Quelle geprüft", newsroom: "Redaktion", chooseSignal: "Wählen Sie ein geprüftes Signal, um den vollständigen LEIS-Kontext zu öffnen.", aiUse: "Wie KI eingesetzt wird", emptyCountry: "Für dieses Land wurde noch keine geprüfte lokale Quelle oder kein KI-Profil ergänzt. LEIS ersetzt fehlenden Kontext nicht durch unverbundene Nachrichten aus einem anderen Land.", close: "Auswahl schließen" },
  fr: { aria: "Globe interactif. Glissez pour tourner, faites défiler pour zoomer et choisissez un point source.", preparing: "Préparation de la Terre interactive", reloading: "La Terre interactive se recharge", appearing: "Le globe apparaîtra dans un instant.", refresh: "Actualisez la page puis réessayez la carte en direct.", weatherAria: "Couche météo en direct active", clouds: "Conditions nuageuses actuelles", cloudNote: "Open-Meteo · couverture nuageuse visualisée · actualisation toutes les 10 min", atmosphereOn: "Atmosphère activée", atmosphereOff: "Atmosphère désactivée", zoomAria: "Commandes de zoom du globe", zoomIn: "Agrandir", zoomOut: "Réduire", zoomHint: "Maj + défilement", selectedSignal: "Signal source sélectionné", sourceContext: "Source + contexte LEIS", sourceReports: "Ce que rapporte cette source", leisContext: "Contexte LEIS", readSource: "Lire la source originale ↗", openContext: "Ouvrir le contexte", publicDesk: "Rédaction source publique", reviewedSignals: "Jusqu'à cinq signaux vérifiés", sourceReviewed: "Source vérifiée", newsroom: "Rédaction", chooseSignal: "Choisissez un signal vérifié pour ouvrir son contexte LEIS complet.", aiUse: "Comment l'IA est utilisée", emptyCountry: "Aucune source locale vérifiée ni profil IA national n'a encore été ajouté ici. LEIS ne remplace pas le contexte manquant par des nouvelles sans rapport provenant d'un autre pays.", close: "Fermer la sélection" },
  es: { aria: "Globo interactivo. Arrastre para girar, desplácese para ampliar y elija un punto de fuente.", preparing: "Preparando la Tierra interactiva", reloading: "La Tierra interactiva se está recargando", appearing: "El globo aparecerá en un momento.", refresh: "Actualice la página e inténtelo de nuevo con el mapa en directo.", weatherAria: "Capa meteorológica en directo activa", clouds: "Condiciones actuales de nubosidad", cloudNote: "Open-Meteo · cobertura de nubes visualizada · se actualiza cada 10 min", atmosphereOn: "Atmósfera activada", atmosphereOff: "Atmósfera desactivada", zoomAria: "Controles de zoom del globo", zoomIn: "Acercar", zoomOut: "Alejar", zoomHint: "Mayús + desplazamiento", selectedSignal: "Señal de fuente seleccionada", sourceContext: "Fuente + contexto LEIS", sourceReports: "Lo que informa esta fuente", leisContext: "Contexto LEIS", readSource: "Leer la fuente original ↗", openContext: "Abrir el contexto", publicDesk: "Redacción de fuente pública", reviewedSignals: "Hasta cinco señales revisadas", sourceReviewed: "Fuente revisada", newsroom: "Redacción", chooseSignal: "Elija una señal revisada para abrir su contexto LEIS completo.", aiUse: "Cómo se usa la IA", emptyCountry: "Aún no se ha añadido aquí una fuente local revisada ni un perfil nacional de IA. LEIS no sustituye el contexto ausente por noticias no relacionadas de otro país.", close: "Cerrar la selección" },
};

const globeRetryCopy: Record<Language, string> = {
  en: "Try the interactive Earth again",
  cs: "Zkusit interaktivní Zemi znovu",
  de: "Interaktive Erde erneut versuchen",
  fr: "Réessayer la Terre interactive",
  es: "Volver a probar la Tierra interactiva",
};

const countryBaselineCopy: Record<Language, { eyebrow: string; title: string; summary: string; use: string; leis: string; oecd: string; unesco: string }> = {
  en: { eyebrow: "COUNTRY AI CONTEXT · GLOBAL BASELINE", title: "AI context", summary: "Every country on this globe has an AI context card. This baseline keeps global orientation separate from country-specific claims that have not yet been independently reviewed by LEIS.", use: "A meaningful national AI picture has at least four dimensions: people and skills; public institutions and rules; research and infrastructure; and how organisations use AI in daily work. The links below are public starting points for checking those dimensions without importing unrelated news.", leis: "LEIS context: global orientation should never flatten local reality. The next local source added for this country will stay visibly attributed, dated and separate from this baseline.", oecd: "OECD · AI policy and country evidence", unesco: "UNESCO · AI readiness methodology" },
  cs: { eyebrow: "KONTEXT AI V ZEMI · GLOBÁLNÍ ZÁKLAD", title: "Kontext AI", summary: "Každá země na tomto glóbu má kartu kontextu AI. Tento základ odděluje globální orientaci od tvrzení specifických pro danou zemi, která zatím LEIS nezávisle neověřil.", use: "Smysluplný národní obraz AI má nejméně čtyři rozměry: lidé a dovednosti; veřejné instituce a pravidla; výzkum a infrastruktura; a způsob, jak organizace AI používají v každodenní práci. Níže uvedené odkazy jsou veřejnými výchozími body pro ověření těchto rozměrů bez přenášení nesouvisejících zpráv.", leis: "Kontext LEIS: globální orientace nesmí zploštit místní realitu. Další místní zdroj přidaný pro tuto zemi zůstane viditelně přiřazený, datovaný a oddělený od tohoto základu.", oecd: "OECD · politika AI a data podle zemí", unesco: "UNESCO · metodika připravenosti na AI" },
  de: { eyebrow: "KI-KONTEXT DES LANDES · GLOBALE GRUNDLAGE", title: "KI-Kontext", summary: "Jedes Land auf diesem Globus hat eine KI-Kontextkarte. Diese Grundlage trennt globale Orientierung von länderspezifischen Aussagen, die LEIS noch nicht unabhängig geprüft hat.", use: "Ein aussagekräftiges nationales KI-Bild hat mindestens vier Dimensionen: Menschen und Kompetenzen; öffentliche Institutionen und Regeln; Forschung und Infrastruktur; sowie die Nutzung von KI im Arbeitsalltag von Organisationen. Die folgenden Links sind öffentliche Ausgangspunkte, um diese Dimensionen zu prüfen, ohne unverbundene Nachrichten zu übernehmen.", leis: "LEIS-Kontext: Globale Orientierung darf lokale Realität nicht einebnen. Die nächste lokale Quelle für dieses Land bleibt sichtbar zugeordnet, datiert und von dieser Grundlage getrennt.", oecd: "OECD · KI-Politik und Länderinformationen", unesco: "UNESCO · Methodik zur KI-Bereitschaft" },
  fr: { eyebrow: "CONTEXTE IA DU PAYS · BASE GLOBALE", title: "Contexte de l’IA", summary: "Chaque pays de ce globe possède une carte de contexte IA. Cette base sépare l’orientation mondiale des affirmations propres à un pays que LEIS n’a pas encore examinées de façon indépendante.", use: "Une image nationale significative de l’IA comporte au moins quatre dimensions : les personnes et les compétences ; les institutions et les règles publiques ; la recherche et l’infrastructure ; et la façon dont les organisations utilisent l’IA au quotidien. Les liens ci-dessous sont des points de départ publics pour vérifier ces dimensions sans importer des nouvelles sans rapport.", leis: "Contexte LEIS : une orientation mondiale ne doit jamais aplatir la réalité locale. La prochaine source locale ajoutée pour ce pays restera visiblement attribuée, datée et distincte de cette base.", oecd: "OCDE · politiques et données IA par pays", unesco: "UNESCO · méthode de préparation à l’IA" },
  es: { eyebrow: "CONTEXTO DE IA DEL PAÍS · BASE GLOBAL", title: "Contexto de IA", summary: "Cada país de este globo tiene una tarjeta de contexto de IA. Esta base separa la orientación global de las afirmaciones específicas de cada país que LEIS aún no ha revisado de forma independiente.", use: "Una imagen nacional significativa de la IA tiene al menos cuatro dimensiones: personas y capacidades; instituciones y normas públicas; investigación e infraestructura; y cómo las organizaciones utilizan la IA en el trabajo cotidiano. Los enlaces siguientes son puntos de partida públicos para verificar esas dimensiones sin importar noticias no relacionadas.", leis: "Contexto LEIS: la orientación global nunca debe aplanar la realidad local. La próxima fuente local añadida para este país seguirá claramente atribuida, fechada y separada de esta base.", oecd: "OCDE · política y datos de IA por país", unesco: "UNESCO · metodología de preparación para la IA" },
};

const documentTitles: Record<Language, string> = {
  en: "LEIS — Understanding that can travel",
  cs: "LEIS — Porozumění, které může pokračovat",
  de: "LEIS — Verständnis, das weiterreisen kann",
  fr: "LEIS — Une compréhension qui peut voyager",
  es: "LEIS — Comprensión que puede viajar",
};

const pragueCopy: Record<Language, { czechLabel: string; czechTitle: string; czechIntro: string; originLabel: string; creatorLabel: string; creatorText: string; technicalLabel: string; technicalText: string; contactLabel: string; contactTitle: string; contactText: string; contactAction: string }> = {
  en: { czechLabel: "Czech Republic · public AI signals + LEIS origin", czechTitle: "Czech AI, with Prague context.", czechIntro: "These are public AI articles from Czech Technical University in Prague. They are separate from LEIS: the Prague origin cards below identify authorship and collaboration, not a Czech news desk.", originLabel: "LEIS origin · Prague", creatorLabel: "Creator · documented origin", creatorText: "Founder, creator and constitution author of LEIS. The core was independently completed around 10 July 2026.", technicalLabel: "Technical collaboration", technicalText: "Technical activation and development after the independent LEIS seed.", contactLabel: "Public contact", contactTitle: "Work with LEIS", contactText: "Questions, research, grants or partnership.", contactAction: "Contact Martin Pužík ↗" },
  cs: { czechLabel: "Česká republika · veřejné AI signály + původ LEIS", czechTitle: "České AI v pražském kontextu.", czechIntro: "Jde o veřejné AI články Českého vysokého učení technického v Praze. Jsou oddělené od LEIS: karty původu níže popisují autorství a spolupráci, nikoli českou zpravodajskou redakci.", originLabel: "Původ LEIS · Praha", creatorLabel: "Tvůrce · doložený původ", creatorText: "Zakladatel, tvůrce a autor ústavy LEIS. Jádro bylo nezávisle dokončeno kolem 10. července 2026.", technicalLabel: "Technická spolupráce", technicalText: "Technická aktivace a vývoj po nezávislém vzniku základu LEIS.", contactLabel: "Veřejný kontakt", contactTitle: "Spolupracujte s LEIS", contactText: "Dotazy, výzkum, granty nebo partnerství.", contactAction: "Kontaktovat Martina Pužíka ↗" },
  de: { czechLabel: "Tschechische Republik · öffentliche KI-Signale + LEIS-Ursprung", czechTitle: "Tschechische KI im Prager Kontext.", czechIntro: "Dies sind öffentliche KI-Artikel der Tschechischen Technischen Universität in Prag. Sie sind von LEIS getrennt: Die Ursprungskarten unten benennen Autorschaft und Zusammenarbeit, keine tschechische Nachrichtenredaktion.", originLabel: "LEIS-Ursprung · Prag", creatorLabel: "Schöpfer · dokumentierter Ursprung", creatorText: "Gründer, Schöpfer und Verfassungsautor von LEIS. Der Kern wurde um den 10. Juli 2026 unabhängig fertiggestellt.", technicalLabel: "Technische Zusammenarbeit", technicalText: "Technische Aktivierung und Entwicklung nach dem unabhängigen LEIS-Seed.", contactLabel: "Öffentlicher Kontakt", contactTitle: "Mit LEIS arbeiten", contactText: "Fragen, Forschung, Grants oder Partnerschaft.", contactAction: "Martin Pužík kontaktieren ↗" },
  fr: { czechLabel: "République tchèque · signaux IA publics + origine de LEIS", czechTitle: "L'IA tchèque dans le contexte de Prague.", czechIntro: "Il s'agit d'articles publics sur l'IA de l'Université technique tchèque de Prague. Ils sont distincts de LEIS : les cartes d'origine ci-dessous décrivent l'auteur et la collaboration, et non une rédaction tchèque.", originLabel: "Origine de LEIS · Prague", creatorLabel: "Créateur · origine documentée", creatorText: "Fondateur, créateur et auteur de la constitution de LEIS. Le noyau a été achevé indépendamment vers le 10 juillet 2026.", technicalLabel: "Collaboration technique", technicalText: "Activation et développement techniques après le seed LEIS indépendant.", contactLabel: "Contact public", contactTitle: "Travailler avec LEIS", contactText: "Questions, recherche, subventions ou partenariat.", contactAction: "Contacter Martin Pužík ↗" },
  es: { czechLabel: "República Checa · señales públicas de IA + origen de LEIS", czechTitle: "IA checa con contexto de Praga.", czechIntro: "Estos son artículos públicos de IA de la Universidad Técnica Checa de Praga. Son independientes de LEIS: las tarjetas de origen de abajo identifican autoría y colaboración, no una redacción checa.", originLabel: "Origen de LEIS · Praga", creatorLabel: "Creador · origen documentado", creatorText: "Fundador, creador y autor de la constitución de LEIS. El núcleo se completó de forma independiente alrededor del 10 de julio de 2026.", technicalLabel: "Colaboración técnica", technicalText: "Activación y desarrollo técnico después de la semilla independiente de LEIS.", contactLabel: "Contacto público", contactTitle: "Trabajar con LEIS", contactText: "Preguntas, investigación, subvenciones o colaboración.", contactAction: "Contactar a Martin Pužík ↗" },
};

const contactCopy: Record<Language, { topics: Record<string, string>; name: string; organisation: string; optional: string; question: string; notProvided: string; hello: string }> = {
  en: { topics: { "Grant or support": "Grant or support", "Research dialogue": "Research dialogue", "Practical pilot": "Practical pilot", "Media enquiry": "Media enquiry" }, name: "Your name", organisation: "Organisation", optional: "optional", question: "What would you like to explore?", notProvided: "Not provided", hello: "Hello Martin, I would like to begin a conversation about LEIS." },
  cs: { topics: { "Grant or support": "Grant nebo podpora", "Research dialogue": "Výzkumný dialog", "Practical pilot": "Praktický pilot", "Media enquiry": "Dotaz médií" }, name: "Vaše jméno", organisation: "Organizace", optional: "nepovinné", question: "Co chcete společně prozkoumat?", notProvided: "Neuvedeno", hello: "Dobrý den, Martine, rád/a bych zahájil/a rozhovor o LEIS." },
  de: { topics: { "Grant or support": "Grant oder Unterstützung", "Research dialogue": "Forschungsdialog", "Practical pilot": "Praktischer Pilot", "Media enquiry": "Medienanfrage" }, name: "Ihr Name", organisation: "Organisation", optional: "optional", question: "Was möchten Sie erkunden?", notProvided: "Nicht angegeben", hello: "Hallo Martin, ich möchte ein Gespräch über LEIS beginnen." },
  fr: { topics: { "Grant or support": "Subvention ou soutien", "Research dialogue": "Dialogue de recherche", "Practical pilot": "Pilote pratique", "Media enquiry": "Demande média" }, name: "Votre nom", organisation: "Organisation", optional: "facultatif", question: "Que souhaitez-vous explorer ?", notProvided: "Non renseigné", hello: "Bonjour Martin, je souhaiterais commencer une conversation au sujet de LEIS." },
  es: { topics: { "Grant or support": "Subvención o apoyo", "Research dialogue": "Diálogo de investigación", "Practical pilot": "Piloto práctico", "Media enquiry": "Consulta de medios" }, name: "Su nombre", organisation: "Organización", optional: "opcional", question: "¿Qué le gustaría explorar?", notProvided: "No proporcionado", hello: "Hola Martin, me gustaría iniciar una conversación sobre LEIS." },
};

const guideCopy: Record<Language, { label: string; close: string; ask: string; start: { title: string; text: string; action: string; choice: string }; story: { title: string; text: string; action: string; choice: string }; work: { title: string; text: string; action: string; choice: string }; note: string }> = {
  en: { label: "LEIS ORIENTATION GUIDE", close: "Close", ask: "Ask LEIS", start: { choice: "What is LEIS?", title: "What is LEIS?", text: "LEIS is not an AI product. It is a reality-oriented way to preserve, activate and reconstruct understanding when people, tools or time change.", action: "Start with orientation" }, story: { choice: "Our story", title: "Where did it begin?", text: "The public timeline distinguishes documentation, creator-reported context and interpretation. It begins with the constitutional seed and stays honest about what is known.", action: "Follow the timeline" }, work: { choice: "Work with LEIS", title: "Can we work together?", text: "Yes. LEIS is open to respectful research, a concrete pilot, a grant conversation or a company handover problem. There is no mailing list and no pressure.", action: "Explore cooperation" }, note: "This is an orientation guide, not a live AI chat." },
  cs: { label: "PRŮVODCE ORIENTACÍ LEIS", close: "Zavřít", ask: "Zeptejte se LEIS", start: { choice: "Co je LEIS?", title: "Co je LEIS?", text: "LEIS není produkt AI. Je to způsob orientovaný na realitu, jak uchovat, aktivovat a znovu vystavět porozumění, když se mění lidé, nástroje nebo čas.", action: "Začít orientací" }, story: { choice: "Náš příběh", title: "Kde to začalo?", text: "Veřejná časová osa rozlišuje dokumentaci, kontext uváděný autorem a interpretaci. Začíná ústavním semenem a otevřeně ukazuje, co je známo.", action: "Sledovat časovou osu" }, work: { choice: "Spolupráce s LEIS", title: "Můžeme spolupracovat?", text: "Ano. LEIS je otevřený respektujícímu výzkumu, konkrétnímu pilotu, rozhovoru o grantu i problému předání ve firmě. Bez mailing listu a bez tlaku.", action: "Prozkoumat spolupráci" }, note: "Je to orientační průvodce, nikoli živý AI chat." },
  de: { label: "LEIS-ORIENTIERUNG", close: "Schließen", ask: "LEIS fragen", start: { choice: "Was ist LEIS?", title: "Was ist LEIS?", text: "LEIS ist kein KI-Produkt. Es ist eine realitätsorientierte Art, Verständnis zu bewahren, zu aktivieren und zu rekonstruieren, wenn sich Menschen, Werkzeuge oder Zeit verändern.", action: "Mit der Orientierung beginnen" }, story: { choice: "Unsere Geschichte", title: "Wo begann es?", text: "Die öffentliche Zeitleiste unterscheidet Dokumentation, vom Urheber berichteten Kontext und Interpretation. Sie beginnt mit dem konstitutionellen Seed und bleibt ehrlich darüber, was bekannt ist.", action: "Zeitleiste folgen" }, work: { choice: "Mit LEIS arbeiten", title: "Können wir zusammenarbeiten?", text: "Ja. LEIS ist offen für respektvolle Forschung, einen konkreten Piloten, ein Grant-Gespräch oder ein Übergabeproblem in einem Unternehmen. Keine Mailingliste, kein Druck.", action: "Kooperation erkunden" }, note: "Dies ist eine Orientierungshilfe, kein Live-KI-Chat." },
  fr: { label: "GUIDE D'ORIENTATION LEIS", close: "Fermer", ask: "Demander à LEIS", start: { choice: "Qu'est-ce que LEIS ?", title: "Qu'est-ce que LEIS ?", text: "LEIS n'est pas un produit d'IA. C'est une manière orientée vers le réel de préserver, d'activer et de reconstruire la compréhension lorsque les personnes, les outils ou le temps changent.", action: "Commencer l'orientation" }, story: { choice: "Notre histoire", title: "Où cela a-t-il commencé ?", text: "La chronologie publique distingue la documentation, le contexte rapporté par le créateur et l'interprétation. Elle commence avec la graine constitutionnelle et reste honnête sur ce qui est connu.", action: "Suivre la chronologie" }, work: { choice: "Travailler avec LEIS", title: "Pouvons-nous coopérer ?", text: "Oui. LEIS est ouvert à la recherche respectueuse, à un pilote concret, à une discussion de subvention ou à un problème de transmission en entreprise. Sans liste de diffusion ni pression.", action: "Explorer la coopération" }, note: "Ceci est un guide d'orientation, pas un chat IA en direct." },
  es: { label: "GUÍA DE ORIENTACIÓN LEIS", close: "Cerrar", ask: "Preguntar a LEIS", start: { choice: "¿Qué es LEIS?", title: "¿Qué es LEIS?", text: "LEIS no es un producto de IA. Es una forma orientada a la realidad de preservar, activar y reconstruir la comprensión cuando cambian las personas, las herramientas o el tiempo.", action: "Empezar la orientación" }, story: { choice: "Nuestra historia", title: "¿Dónde empezó?", text: "La cronología pública distingue documentación, contexto informado por el creador e interpretación. Comienza con la semilla constitucional y es honesta sobre lo que se conoce.", action: "Seguir la cronología" }, work: { choice: "Trabajar con LEIS", title: "¿Podemos colaborar?", text: "Sí. LEIS está abierto a investigación respetuosa, un piloto concreto, una conversación sobre subvenciones o un problema de transferencia en una empresa. Sin lista de correo ni presión.", action: "Explorar cooperación" }, note: "Esta es una guía de orientación, no un chat de IA en vivo." },
};

const firstStepCopy: Record<Language, { eyebrow: string; title: string; lead: string; routes: readonly [string, string, string, string][] }> = {
  en: { eyebrow: "A CALM PLACE TO BEGIN", title: "Choose your first useful step.", lead: "You do not need to accept a claim or learn a system all at once. Start with the route that fits your question.", routes: [["01", "Understand LEIS", "A short orientation to what LEIS is, what it is not, and how it stays tied to reality.", "#orientation"], ["02", "Take the Seed", "A portable public starting context, with a plain-language guide for using the file safely.", "#seed"], ["03", "Start a dialogue", "For research, a practical pilot, media context or support — begin with a real question.", "#participate"]] },
  cs: { eyebrow: "KLIDNÉ MÍSTO, KDE ZAČÍT", title: "Vyberte si první užitečný krok.", lead: "Nemusíte přijmout žádné tvrzení ani se učit celý systém najednou. Začněte cestou, která odpovídá vaší otázce.", routes: [["01", "Porozumět LEIS", "Krátká orientace: co LEIS je, co není a jak zůstává spojený s realitou.", "#orientation"], ["02", "Vzít si Seed", "Přenositelný veřejný výchozí kontext s jednoduchým návodem, jak soubor bezpečně použít.", "#seed"], ["03", "Začít dialog", "Pro výzkum, praktický pilot, mediální souvislost nebo podporu — začněte skutečnou otázkou.", "#participate"]] },
  de: { eyebrow: "EIN RUHIGER ANFANG", title: "Wählen Sie Ihren ersten hilfreichen Schritt.", lead: "Sie müssen weder eine Behauptung akzeptieren noch das ganze System auf einmal lernen. Beginnen Sie mit dem Weg, der zu Ihrer Frage passt.", routes: [["01", "LEIS verstehen", "Eine kurze Orientierung dazu, was LEIS ist, was es nicht ist und wie es an der Realität bleibt.", "#orientation"], ["02", "Den Seed mitnehmen", "Ein übertragbarer öffentlicher Ausgangskontext mit einer einfachen Anleitung zur sicheren Nutzung der Datei.", "#seed"], ["03", "Einen Dialog beginnen", "Für Forschung, einen praktischen Piloten, Medienkontext oder Unterstützung — beginnen Sie mit einer echten Frage.", "#participate"]] },
  fr: { eyebrow: "UN ENDROIT CALME POUR COMMENCER", title: "Choisissez votre première étape utile.", lead: "Vous n'avez pas besoin d'accepter une affirmation ni d'apprendre tout le système d'un coup. Commencez par le chemin qui correspond à votre question.", routes: [["01", "Comprendre LEIS", "Une courte orientation sur ce qu'est LEIS, ce qu'il n'est pas et son lien avec le réel.", "#orientation"], ["02", "Emporter le Seed", "Un contexte de départ public et portable, avec un guide simple pour utiliser le fichier en sécurité.", "#seed"], ["03", "Commencer un dialogue", "Pour la recherche, un pilote pratique, un contexte média ou un soutien — partez d'une vraie question.", "#participate"]] },
  es: { eyebrow: "UN LUGAR TRANQUILO PARA EMPEZAR", title: "Elija su primer paso útil.", lead: "No necesita aceptar una afirmación ni aprender todo el sistema de una vez. Empiece por la ruta que corresponda a su pregunta.", routes: [["01", "Entender LEIS", "Una breve orientación sobre qué es LEIS, qué no es y cómo permanece ligado a la realidad.", "#orientation"], ["02", "Llevar el Seed", "Un contexto inicial público y portátil, con una guía sencilla para usar el archivo de forma segura.", "#seed"], ["03", "Iniciar un diálogo", "Para investigación, un piloto práctico, contexto de medios o apoyo: empiece con una pregunta real.", "#participate"]] },
};

function LanguageDock({ language, onChange, label }: { language: Language; onChange: (language: Language) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = languageOptions.find((item) => item.code === language) ?? languageOptions[0];
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const closeOutside = (event: PointerEvent) => { if (!dockRef.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    return () => { window.removeEventListener("keydown", closeOnEscape); window.removeEventListener("pointerdown", closeOutside); };
  }, []);
  const focusLanguage = (edge: "first" | "last" = "first") => window.setTimeout(() => {
    const choices = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    choices[edge === "first" ? 0 : choices.length - 1]?.focus();
  }, 0);
  const navigateMenu = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const choices = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const index = choices.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key === "Home") { event.preventDefault(); choices[0]?.focus(); return; }
    if (event.key === "End") { event.preventDefault(); choices.at(-1)?.focus(); return; }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      choices[(index + (event.key === "ArrowDown" ? 1 : -1) + choices.length) % choices.length]?.focus();
    }
  };
  return <aside ref={dockRef} className={`language-dock ${open ? "open" : ""}`} aria-label={label} onMouseEnter={() => setOpen(true)} onMouseLeave={() => { if (!dockRef.current?.contains(document.activeElement)) setOpen(false); }} onKeyDown={(event) => { if (!(event.target instanceof HTMLElement) || !event.target.classList.contains("language-trigger")) return; if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); focusLanguage(event.key === "ArrowDown" ? "first" : "last"); } }}>
    <div id={menuId} ref={menuRef} className="language-menu" role="menu" aria-label={label} onKeyDown={navigateMenu}>
      {languageOptions.map((item) => <button type="button" role="menuitem" key={item.code} className={item.code === language ? "active" : ""} onClick={() => { onChange(item.code); setOpen(false); }}>{item.label}</button>)}
    </div>
    <button type="button" className="language-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`${label}: ${current.label}`}><span aria-hidden="true">◎</span>{current.label}</button>
  </aside>;
}

const milestones = [
  ["DOCUMENTED", "9 July 2026", "First constitutional seed", "The earliest currently located constitutional evidence identifies Martin Puzik as Founder and Initial Architect."],
  ["CREATOR-REPORTED", "Around 10 July 2026", "LEIS core completed", "Martin Puzik reports an independent intensive five-day creation period. Copilot was a working carrier, not the author."],
  ["EVOLUTION", "After the seed", "Technical collaboration", "M.A.J. Puzik supported practical activation and later technical development."],
  ["PRESENT", "Today", "Reconstruction and validation", "Archives, lineage and public orientation are being made navigable without exposing private source material."],
] as const;

const czechMilestones = [
  ["DOLOŽENO", "9. červenec 2026", "První ústavní semeno", "Nejstarší dosud nalezený ústavní doklad uvádí Martina Pužíka jako zakladatele a prvního architekta."],
  ["UVEDENO AUTOREM", "Přibližně 10. červenec 2026", "Jádro LEIS dokončeno", "Martin Pužík uvádí samostatné intenzivní pětidenní období tvorby. Copilot byl pracovní nosič, nikoli autor."],
  ["VÝVOJ", "Po semeni", "Technická spolupráce", "M.A.J. Pužík podpořil praktickou aktivaci a pozdější technický vývoj."],
  ["SOUČASNOST", "Dnes", "Rekonstrukce a ověřování", "Archivy, linie vývoje a veřejná orientace se stávají přehlednými, aniž by odkrývaly soukromé zdrojové materiály."],
] as const;

const czechStatic = {
  heroA: "Porozumění", heroB: "které může pokračovat.",
  seedOpen: "Veřejné semeno získává podobu.", seedClosed: "Dotkněte se semene.",
  seedOpenText: "Připravuje se ověřený veřejný vstup: linie vývoje, orientace a hranice — bez soukromých archivů.", seedClosedText: "Malý začátek, vytvořený pro další cestu.",
  seedAria: "Otevřít náhled semene LEIS", seedLabel: "SEMENO LEIS",
  grants: [
    ["Uchovat", "Zachytit linii zdrojů, rozlišit důkaz od interpretace a zabránit tomu, aby se roky práce změnily v nečitelné soubory."],
    ["Ověřit", "Zjišťovat, zda porozumění přežije předání: dokáže nový člověk znovu vystavět rozhodnutí, jeho podmínky a hranice?"],
    ["Sdílet", "Vytvářet veřejná vysvětlení, praktické piloty a otevřené materiály, aby lidé mohli LEIS posoudit sami."],
  ],
  grantPath: [
    ["Pro granty:", "provozní kontinuita, dokumentace, ověřování, infrastruktura a nezávislé posouzení."],
    ["Pro firmy:", "vymezená spolupráce kolem skutečného problému předání, rozhodování nebo kontinuity znalostí."],
    ["Pro výzkumníky a instituce:", "pozvání metodu zpochybňovat a zlepšovat její testy."],
  ],
  media: [
    ["01 · ORIENTACE", "Co LEIS je, co není, kde začal a jak jej lze ověřovat, aniž by kdokoli musel jen věřit."],
    ["02 · DŮKAZY", "Označení časové osy rozlišují doklady, kontext uváděný autorem a otevřené otázky. Soukromé archivy zůstávají soukromé."],
    ["03 · DIALOG", "Pro rozhovor, výzkumnou otázku nebo zdrojový balíček použijte veřejnou cestu ke kontaktu. Bez odběru mailing listu."],
  ],
  footer: "Vytvořil", technical: "Technická spolupráce:",
};

const localizedStatic = {
  cs: czechStatic,
  de: {
    heroA: "Verständnis", heroB: "das weiterwirken kann.",
    seedOpen: "Ein öffentlicher Seed nimmt Gestalt an.", seedClosed: "Berühren Sie den Seed.",
    seedOpenText: "Ein geprüfter öffentlicher Einstieg wird vorbereitet: Entwicklungslinie, Orientierung und Grenzen — ohne private Archive.", seedClosedText: "Ein kleiner Anfang, geschaffen für die weitere Reise.",
    seedAria: "Vorschau des LEIS-Seeds öffnen", seedLabel: "LEIS-SEED",
    grants: [["Bewahren", "Die Quellenlinie sichern, Beleg und Interpretation unterscheiden und verhindern, dass Jahre der Arbeit zu unlesbaren Dateien werden."], ["Prüfen", "Messen, ob Verständnis eine Übergabe überlebt: Kann eine neue Person eine Entscheidung, ihre Bedingungen und Grenzen wiederherstellen?"], ["Teilen", "Öffentliche Erklärungen, praktische Pilotprojekte und offene Materialien schaffen, damit Menschen LEIS selbst beurteilen können."]],
    grantPath: [["Für Grants:", "operative Kontinuität, Dokumentation, Validierung, Infrastruktur und unabhängige Prüfung."], ["Für Unternehmen:", "eine klar begrenzte Zusammenarbeit rund um eine reale Übergabe-, Entscheidungs- oder Wissenskontinuitätsfrage."], ["Für Forschende und Institutionen:", "eine Einladung, die Methode herauszufordern und ihre Tests zu verbessern."]],
    media: [["01 · ORIENTIERUNG", "Was LEIS ist, was es nicht ist, wo es begann und wie es geprüft werden kann — ohne dass jemand einfach glauben muss."], ["02 · EVIDENZ", "Zeitachsenmarkierungen unterscheiden dokumentierte Belege, vom Urheber berichteten Kontext und offene Fragen. Private Archive bleiben privat."], ["03 · DIALOG", "Für ein Gespräch, eine Forschungsfrage oder ein Quellenpaket nutzen Sie den öffentlichen Kontaktweg. Keine Mailingliste erforderlich."]],
    footer: "Geschaffen von", technical: "Technische Zusammenarbeit:",
  },
  fr: {
    heroA: "Une compréhension", heroB: "qui peut continuer.",
    seedOpen: "Une graine publique prend forme.", seedClosed: "Touchez la graine.",
    seedOpenText: "Un point d’entrée public vérifié se prépare : filiation, orientation et limites — sans archives privées.", seedClosedText: "Un petit commencement, conçu pour continuer son chemin.",
    seedAria: "Ouvrir l’aperçu de la graine LEIS", seedLabel: "GRAINE LEIS",
    grants: [["Préserver", "Conserver la filiation des sources, distinguer preuve et interprétation et empêcher que des années de travail ne deviennent illisibles."], ["Vérifier", "Mesurer si la compréhension survit à une transmission : une nouvelle personne peut-elle reconstruire une décision, ses conditions et ses limites ?"], ["Partager", "Créer des explications publiques, des pilotes pratiques et des ressources ouvertes afin que chacun puisse évaluer LEIS par lui-même."]],
    grantPath: [["Pour les subventions :", "continuité opérationnelle, documentation, validation, infrastructure et évaluation indépendante."], ["Pour les entreprises :", "une collaboration délimitée autour d’un véritable problème de transmission, de décision ou de continuité des connaissances."], ["Pour les chercheurs et institutions :", "une invitation à mettre la méthode à l’épreuve et à améliorer ses tests."]],
    media: [["01 · ORIENTATION", "Ce qu’est LEIS, ce qu’il n’est pas, où il a commencé et comment le mettre à l’épreuve sans demander à qui que ce soit de croire sur parole."], ["02 · PREUVES", "Les repères de la chronologie distinguent preuves documentées, contexte rapporté par le créateur et questions ouvertes. Les archives privées restent privées."], ["03 · DIALOGUE", "Pour un entretien, une question de recherche ou un dossier de sources, utilisez la voie publique de contact. Aucune inscription à une liste de diffusion."]],
    footer: "Créé par", technical: "Collaboration technique :",
  },
  es: {
    heroA: "Comprensión", heroB: "que puede continuar.",
    seedOpen: "Una semilla pública está tomando forma.", seedClosed: "Toque la semilla.",
    seedOpenText: "Se está preparando una entrada pública verificada: linaje, orientación y límites, sin archivos privados.", seedClosedText: "Un comienzo pequeño, creado para seguir viajando.",
    seedAria: "Abrir la vista previa de la semilla LEIS", seedLabel: "SEMILLA LEIS",
    grants: [["Preservar", "Conservar el linaje de las fuentes, distinguir evidencia de interpretación y evitar que años de trabajo se conviertan en archivos ilegibles."], ["Comprobar", "Medir si la comprensión sobrevive a una transferencia: ¿puede una nueva persona reconstruir una decisión, sus condiciones y sus límites?"], ["Compartir", "Crear explicaciones públicas, pilotos prácticos y materiales abiertos para que las personas puedan evaluar LEIS por sí mismas."]],
    grantPath: [["Para subvenciones:", "continuidad operativa, documentación, validación, infraestructura y revisión independiente."], ["Para empresas:", "una colaboración delimitada en torno a un problema real de transferencia, decisión o continuidad del conocimiento."], ["Para investigadores e instituciones:", "una invitación a cuestionar el método y mejorar sus pruebas."]],
    media: [["01 · ORIENTACIÓN", "Qué es LEIS, qué no es, dónde comenzó y cómo puede comprobarse sin pedir a nadie que simplemente crea."], ["02 · EVIDENCIA", "Las etiquetas de la cronología distinguen evidencia documentada, contexto informado por el creador y preguntas abiertas. Los archivos privados permanecen privados."], ["03 · DIÁLOGO", "Para una entrevista, una pregunta de investigación o un paquete de fuentes, use la vía pública de contacto. No se requiere suscripción a una lista de correo."]],
    footer: "Creado por", technical: "Colaboración técnica:",
  },
} as const;

const localizedMilestones: Record<Language, readonly (readonly [string, string, string, string])[]> = {
  en: milestones,
  cs: czechMilestones,
  de: [["DOKUMENTIERT", "9. Juli 2026", "Erster konstitutioneller Seed", "Der früheste bisher aufgefundene konstitutionelle Nachweis bezeichnet Martin Pužík als Gründer und ersten Architekten."], ["VOM URHEBER BERICHTET", "Etwa 10. Juli 2026", "LEIS-Kern fertiggestellt", "Martin Pužík berichtet von einer eigenständigen intensiven fünftägigen Schaffensphase. Copilot war ein Arbeitsmedium, nicht der Autor."], ["ENTWICKLUNG", "Nach dem Seed", "Technische Zusammenarbeit", "M.A.J. Pužík unterstützte die praktische Aktivierung und die spätere technische Entwicklung."], ["GEGENWART", "Heute", "Rekonstruktion und Validierung", "Archive, Entwicklungslinie und öffentliche Orientierung werden navigierbar, ohne private Quellen offenzulegen."]],
  fr: [["DOCUMENTÉ", "9 juillet 2026", "Première graine constitutionnelle", "Le premier élément constitutionnel retrouvé à ce jour identifie Martin Pužík comme fondateur et premier architecte."], ["RAPPORTÉ PAR LE CRÉATEUR", "Vers le 10 juillet 2026", "Noyau de LEIS achevé", "Martin Pužík rapporte une période autonome et intensive de création de cinq jours. Copilot était un support de travail, non l’auteur."], ["ÉVOLUTION", "Après la graine", "Collaboration technique", "M.A.J. Pužík a soutenu l’activation pratique et le développement technique ultérieur."], ["PRÉSENT", "Aujourd’hui", "Reconstruction et validation", "Les archives, le lignage et l’orientation publique deviennent navigables sans exposer de sources privées."]],
  es: [["DOCUMENTADO", "9 de julio de 2026", "Primera semilla constitucional", "La evidencia constitucional más antigua localizada hasta ahora identifica a Martin Pužík como fundador y arquitecto inicial."], ["DECLARADO POR EL CREADOR", "Alrededor del 10 de julio de 2026", "Núcleo de LEIS completado", "Martin Pužík informa de un periodo independiente e intensivo de creación de cinco días. Copilot fue un soporte de trabajo, no el autor."], ["EVOLUCIÓN", "Después de la semilla", "Colaboración técnica", "M.A.J. Pužík apoyó la activación práctica y el desarrollo técnico posterior."], ["PRESENTE", "Hoy", "Reconstrucción y validación", "Los archivos, el linaje y la orientación pública se están haciendo navegables sin revelar material de fuentes privadas."]],
};

// A new language is accepted only when every public interface layer contains it.
// This prevents a partly translated portal from reaching visitors.
const translationTables: Array<[string, Partial<Record<Language, unknown>>]> = [
  ["portal", portalCopy], ["sections", sectionCopy], ["participation", participationCopy], ["grant dossier", grantDossierCopy], ["public briefing", publicBriefCopy], ["LEIS loop", loopCopy], ["LEIS test", testCopy], ["Seed download", seedDownloadCopy], ["principles", principleCopy],
  ["earth", earthCopy], ["globe", globeCopy], ["country profiles", countryBaselineCopy], ["document titles", documentTitles],
  ["Prague context", pragueCopy], ["contact", contactCopy], ["orientation guide", guideCopy], ["timeline", localizedMilestones],
  ["localized page content", { en: true, ...localizedStatic }],
];

for (const [tableName, table] of translationTables) {
  for (const code of supportedLanguages) {
    if (table[code] === undefined) throw new Error(`Missing ${code} translation in ${tableName}.`);
  }
}

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
  { title: "AI research moves toward real-world use", source: "DFKI", place: "Saarbrucken, Germany", lat: 49.2402, lon: 6.9969, url: "https://www.dfki.de/en/web/news/ki-als-transformator-dfki-auf-der-hannover-messe-2026", summary: "The German Research Center for Artificial Intelligence presents practical AI applications across industry, health, logistics and decision support, with attention to social responsibility and technological autonomy.", leis: "LEIS question: when research crosses into practice, can the next operator recover the evidence, constraints and human judgement that made a system safe to use?", reviewed: "9 April 2026" },
  { title: "AI skills and practical collaboration", source: "AI Sweden", place: "Stockholm, Sweden", lat: 59.3293, lon: 18.0686, url: "https://www.ai.se/en/news", summary: "AI Sweden's public work connects skills, public institutions, industry and research, treating human-AI collaboration as a national capability rather than a tool rollout alone.", leis: "LEIS lens: skills endure when people can recognise not only how to use a system, but also its purpose, limits and the conditions in which it can be trusted.", reviewed: "9 July 2026" },
  { title: "AI infrastructure for robots learning in real time", source: "CSIRO", place: "Brisbane, Australia", lat: -27.4698, lon: 153.0251, url: "https://www.csiro.au/en/news/All/News/2026/May/Vetra-AI-infrastructure", summary: "Australia's national science agency introduced Vetra, a modular edge-AI research infrastructure designed to help robots and sensing systems process data close to where it is created.", leis: "LEIS question: in physical AI, can the evidence, decisions and safety boundaries made at the edge remain understandable when work moves to the next team or system?", reviewed: "18 May 2026" },
  { title: "Kenya's national AI strategy: inclusion and local innovation", source: "Kenya ICT", place: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219, url: "https://www.ict.go.ke/index.php/ict-ministry-set-launch-national-artificial-intelligence-strategy-2025-2030", summary: "Kenya's public AI strategy brings government, private sector, academia, civil society and communities into a plan for locally relevant AI in areas such as agriculture, health, education and public services.", leis: "LEIS lens: local relevance is not a decorative layer. It is part of the context that lets people judge whether an AI system is appropriate, fair and useful.", reviewed: "27 March 2025" },
  { title: "Multilingual AI grounded in Nigeria's languages", source: "NCAIR Nigeria", place: "Abuja, Nigeria", lat: 9.0765, lon: 7.3986, url: "https://ncair.nitda.gov.ng/", summary: "Nigeria's National Center for Artificial Intelligence and Robotics presents public work around research, entrepreneurship and multilingual AI, including Nigerian languages and locally relevant voices.", leis: "LEIS lens: understanding travels more faithfully when a system keeps language, culture, source and purpose connected rather than treating them as optional metadata.", reviewed: "2026 public source" },
];

const sourceColors: Record<Source, string> = { OpenAI: "#a991ff", Anthropic: "#ffb16e", "Google AI": "#6de4ff", "Hugging Face": "#f6dc6a", "Mistral AI": "#ff8bbb", Cohere: "#ffb270", "Google DeepMind": "#84a7ff", TII: "#7af0c8", RIKEN: "#ffd66d", "AI Singapore": "#91e8ee", IndiaAI: "#ffcf6a", KAIST: "#b6a2ff", "Brazil Government": "#6ff0b0", "CTU Prague": "#72e7c1", DFKI: "#ffcb72", "AI Sweden": "#8eb8ff", CSIRO: "#a8ecff", "Kenya ICT": "#ffb97a", "NCAIR Nigeria": "#9affb7" };
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
  Singapore: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Singapore: AI for the public good",
    summary: "Singapore’s National AI Strategy frames AI as a public-good capability: useful across government, research, industry and daily life, with trust and public confidence kept visible alongside adoption.",
    use: "The national strategy connects practical adoption, workforce capability, applied research, public services and governance. Its current priorities include manufacturing, financial services, connectivity and healthcare.",
    leis: "LEIS context: broad access becomes more useful when people can still recover why a system is being used, what it knows, and where human judgement remains necessary.",
    links: [
      { label: "Singapore · National AI Strategy", url: "https://www.smartnation.gov.sg/initiatives/national-ai-strategy/" },
      { label: "Singapore · 2026 strategy update", url: "https://www.mddi.gov.sg/newsroom/update-to-singapore-s-national-ai-strategy--refreshed-priorities-to-harness-ai-for-the-public-good-factsheet/" },
    ],
  },
  India: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "India: public AI capacity and access",
    summary: "India’s public AI work brings together national capability, datasets, compute, skills and responsible-use initiatives intended to make AI useful across a very large and diverse society.",
    use: "The IndiaAI ecosystem provides public routes to data, models, toolkits, compute and sector-specific use cases, while national programmes also emphasise responsible and human-centred use.",
    leis: "LEIS context: scale does not remove the need for local meaning. A useful system must let people trace a result back to its data, purpose, conditions and responsibility.",
    links: [
      { label: "IndiaAI · public mission and resources", url: "https://indiaai.gov.in/" },
      { label: "AIKosh · datasets, models and tools", url: "https://aikosh.indiaai.gov.in/home/about-us/" },
    ],
  },
  Brazil: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Brazil: inclusion, public services and AI sovereignty",
    summary: "Brazil’s public AI plan links technology development with inclusion, Portuguese-language capability, public services, skills, governance and national infrastructure.",
    use: "The 2024–2028 Brazilian AI Plan describes work across infrastructure, education and skills, public-service improvement, business innovation, and regulation and governance.",
    leis: "LEIS context: public value depends on more than deployment. People need to be able to understand which evidence, protections and human responsibilities travel with an AI system.",
    links: [
      { label: "Brazil · National AI Plan", url: "https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/transformacaodigital/plano-brasileiro-de-inteligencia-artificial" },
      { label: "Brazil · AI in digital government", url: "https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/inteligencia-artificial-1" },
    ],
  },
  Japan: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Japan: AI for science and practical discovery",
    summary: "Japan’s public research landscape connects advanced computing, AI and scientific discovery. RIKEN’s AI-for-Science development work is one visible example of that direction.",
    use: "AI is being developed alongside scientific infrastructure and research communities, with an emphasis on accelerating discovery while retaining rigorous scientific practice.",
    leis: "LEIS context: faster discovery still needs durable explanation — assumptions, negative results and human reasons must remain available to the next researcher.",
    links: [
      { label: "RIKEN · AI for Science news", url: "https://www.riken.jp/en/news_pubs/news/2026/20260619_1/index.html" },
      { label: "RIKEN · research overview", url: "https://www.riken.jp/en/research/" },
    ],
  },
  "South Korea": {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "South Korea: research moving toward practice",
    summary: "South Korea’s AI ecosystem combines research universities, advanced industry and public-private technology transfer. KAIST is one public source for work in trustworthy AI, health, robotics and physical systems.",
    use: "The local conversation spans AI research, manufacturing, robotics, health and deployment partnerships — areas where technical performance and practical accountability have to travel together.",
    leis: "LEIS context: when research becomes practice, the implementation needs to retain its limits, provenance and reasons — not merely its final output.",
    links: [
      { label: "KAIST · AI research and technology transfer", url: "https://www.kaist.ac.kr/en/" },
      { label: "KAIST · public news", url: "https://www.kaist.ac.kr/news/html/news/" },
    ],
  },
  "United Arab Emirates": {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "United Arab Emirates: language, research and sovereignty",
    summary: "The UAE’s AI ecosystem includes national policy, advanced research and Arabic-language model development. Abu Dhabi’s Technology Innovation Institute is one public research source in this landscape.",
    use: "Local work includes foundation models, language technologies, applied research and national AI capacity, with Arabic relevance and regional context treated as technical as well as cultural concerns.",
    leis: "LEIS context: language and cultural context are part of the evidence needed to interpret a system responsibly; they are not an optional decoration around the model.",
    links: [
      { label: "UAE · national AI strategy", url: "https://ai.gov.ae/" },
      { label: "TII · research and news", url: "https://www.tii.ae/" },
    ],
  },
  France: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "France: research, open ecosystems and public debate",
    summary: "France is a major European AI research and startup hub. The public conversation links frontier research, open-source communities, applied science, policy and responsible deployment.",
    use: "Paris-based research and AI organisations contribute to work in geospatial modelling, robotics, health and language technologies, while European governance remains an important part of the setting.",
    leis: "LEIS context: a strong ecosystem does not only produce models. It keeps the evidence, limits and human responsibility around their use readable across organisations.",
    links: [
      { label: "French government · national AI strategy", url: "https://www.economie.gouv.fr/numerique/strategie-nationale-intelligence-artificielle" },
      { label: "Hugging Face · public research community", url: "https://huggingface.co/blog" },
    ],
  },
  Germany: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Germany: industrial AI and human-centred deployment",
    summary: "Germany’s AI landscape connects research, manufacturing, public institutions and a large industrial base. The practical question is how capable systems remain understandable and accountable in real work.",
    use: "Key areas include industrial automation, mobility, health, research and enterprise systems, shaped by European rules and a strong emphasis on technical quality and safety.",
    leis: "LEIS context: industrial continuity depends on preserving the decision trail: the conditions, evidence and practical expertise that let another person operate or improve a system.",
    links: [
      { label: "Germany · AI strategy", url: "https://www.bundesregierung.de/breg-de/themen/digitalisierung/ki-strategie-1542410" },
      { label: "DFKI · German AI research", url: "https://www.dfki.de/en/web" },
    ],
  },
  Sweden: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Sweden: skills, public value and human-AI collaboration",
    summary: "Sweden's public AI ecosystem brings research, municipalities, health, industry and workforce learning into the same conversation. AI Sweden is one public hub for this work.",
    use: "Current public work covers workforce skills, responsible adoption, public-sector collaboration, digital sovereignty, health and practical AI transformation across organisations.",
    leis: "LEIS context: capability becomes more durable when people can recover the purpose, local conditions and limits behind an AI-assisted result — not only the result itself.",
    links: [
      { label: "AI Sweden · public news and projects", url: "https://www.ai.se/en/news" },
      { label: "AI Sweden · national ecosystem", url: "https://www.ai.se/en" },
    ],
  },
  Australia: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Australia: physical AI, science and responsible use",
    summary: "Australia's public AI landscape connects national science, environmental work, health, industry and physical systems. CSIRO is one visible source for applied research and responsible AI practice.",
    use: "Current public work includes edge AI for robotics and sensing, health, agriculture, climate and infrastructure — settings where systems need to act safely in the physical world.",
    leis: "LEIS context: physical intelligence needs continuity. The people who inherit a system must be able to recover its local evidence, conditions and safety boundaries.",
    links: [
      { label: "CSIRO · AI research", url: "https://www.csiro.au/en/research/technology-space/ai" },
      { label: "CSIRO · Vetra edge-AI infrastructure", url: "https://www.csiro.au/en/news/All/News/2026/May/Vetra-AI-infrastructure" },
    ],
  },
  Kenya: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Kenya: local innovation, inclusion and public purpose",
    summary: "Kenya's National AI Strategy sets out a participatory route for AI research, model innovation and adoption, with agriculture, healthcare, education and public services among the areas of focus.",
    use: "The strategy connects local communities, government, academia, private organisations and international partners. It also treats data sovereignty, cybersecurity and ethical oversight as part of AI development.",
    leis: "LEIS context: a system becomes locally useful only when people can see whose context it carries, what it was built for and which responsibilities remain human.",
    links: [
      { label: "Kenya · National AI Strategy 2025–2030", url: "https://www.ict.go.ke/sites/default/files/2025-06/National-AI-Strategy_IMPLEMENTATION.pdf" },
      { label: "Kenya ICT Ministry · strategy launch", url: "https://www.ict.go.ke/index.php/ict-ministry-set-launch-national-artificial-intelligence-strategy-2025-2030" },
    ],
  },
  Nigeria: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "Nigeria: multilingual AI, research and entrepreneurship",
    summary: "Nigeria's National Center for Artificial Intelligence and Robotics describes a national ecosystem for research, pilot projects, entrepreneurship and locally grounded AI capability.",
    use: "Public work includes AI and robotics research, infrastructure, education, commercialisation and language-focused models designed to include Nigerian languages and Nigerian-accented English.",
    leis: "LEIS context: language is evidence-bearing context. When it survives the transfer, the next person has a better chance of preserving meaning rather than merely translating words.",
    links: [
      { label: "NCAIR Nigeria · national AI and robotics centre", url: "https://ncair.nitda.gov.ng/" },
      { label: "Nigeria · National AI Strategy 2025", url: "https://ncair.nitda.gov.ng/" },
    ],
  },
  "United Kingdom": {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "United Kingdom: capability, public value and delivery",
    summary: "The United Kingdom’s public AI plan brings together scientific capability, public services, skills, infrastructure and homegrown companies. London is also a visible global centre for frontier AI research.",
    use: "The government’s action plan focuses on foundations for AI, practical public benefit and long-term national capability, with progress tracked through a public delivery dashboard.",
    leis: "LEIS context: a national plan is strongest when people can follow the path from ambition to evidence, pilots, results and the responsibilities that remain after implementation.",
    links: [
      { label: "UK · AI Opportunities Action Plan", url: "https://www.gov.uk/government/publications/ai-opportunities-action-plan/ai-opportunities-action-plan" },
      { label: "UK · progress update", url: "https://www.gov.uk/government/publications/ai-opportunities-action-plan-one-year-on/ai-opportunities-action-plan-one-year-on" },
    ],
  },
  China: {
    eyebrow: "COUNTRY AI CONTEXT · REVIEWED 5 AUGUST 2026",
    title: "China: AI, learning and cooperation",
    summary: "China’s public AI direction includes computing, data, industrial application, talent, standards, governance and AI literacy. These are presented as connected parts of a national and international capability agenda.",
    use: "Recent public action plans address collaboration, data, computing power, open-source ecosystems, industry, talent and governance; education policy also places AI literacy across schooling and lifelong learning.",
    leis: "LEIS context: national scale makes provenance more important, not less. People still need to see the source, purpose, local conditions and uncertainty behind a claim about AI.",
    links: [
      { label: "China · AI cooperation and development action plan", url: "https://english.www.gov.cn/news/202607/17/content_WS6a5a1bbec6d00ca5f9a0c474.html" },
      { label: "China · AI literacy system", url: "https://english.www.gov.cn/english.www.gov.cn/news/202604/15/content_WS69df29e6c6d00ca5f9a0a6b1.html" },
    ],
  },
};

/* Historical globe iterations preserved outside the active runtime.
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
  const [atmosphereOn, setAtmosphereOn] = useState(true);
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

*/

function Globe({ onSelect, language }: { onSelect: (index: number) => void; language: Language }) {
  const node = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const focusWindowRef = useRef<HTMLElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const [focus, setFocus] = useState(false);
  const [detail, setDetail] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [deskStart, setDeskStart] = useState<number | null>(null);
  const [atmosphereOn, setAtmosphereOn] = useState(true);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [mapAttempt, setMapAttempt] = useState(0);
  const selectedNews = selected === null ? null : news[selected];
  const globeText = globeCopy[language];
  const baselineText = countryBaselineCopy[language];
  const placeText = pragueCopy[language];

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

  const toggleAtmosphere = useCallback(() => {
    const next = !atmosphereOn;
    node.current?.dispatchEvent(new CustomEvent("leis-atmosphere-toggle", { detail: next }));
    setAtmosphereOn(next);
  }, [atmosphereOn]);

  const retryMap = useCallback(() => {
    setMapStatus("loading");
    setMapAttempt((attempt) => attempt + 1);
  }, []);

  const choose = useCallback((index: number, expand = false) => {
    lastActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(index);
    setCountry(null);
    setDeskStart(null);
    setFocus(true);
    setDetail(expand);
    onSelect(index);
    aim(news[index]);
  }, [aim, onSelect]);

  const openCzechia = useCallback(() => {
    lastActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCountry("Czech Republic");
    setSelected(null);
    setDetail(false);
    setDeskStart(null);
    setFocus(true);
  }, []);

  const openPragueOrigin = useCallback(() => {
    lastActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCountry("Prague, Czech Republic");
    setSelected(null);
    setDetail(false);
    setDeskStart(null);
    setFocus(true);
  }, []);

  const openDesk = useCallback((start: number) => {
    lastActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
    window.setTimeout(() => lastActiveElementRef.current?.focus(), 0);
  };

  useEffect(() => {
    document.body.classList.toggle("globe-focus-mode", focus);
    return () => document.body.classList.remove("globe-focus-mode");
  }, [focus]);

  useEffect(() => {
    if (!focus) return;
    const focusWindow = focusWindowRef.current;
    const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    window.setTimeout(() => (focusWindow?.querySelector<HTMLElement>(".close-focus") ?? focusWindow)?.focus(), 0);
    const keepFocusInWindow = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !focusWindow) return;
      const targets = Array.from(focusWindow.querySelectorAll<HTMLElement>(focusableSelector));
      if (!targets.length) return;
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keepFocusInWindow);
    return () => window.removeEventListener("keydown", keepFocusInWindow);
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
    let resizeObserver: ResizeObserver | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    let manualUntil = 0;
    let pageVisible = document.visibilityState !== "hidden";
    // Respect the visitor's operating-system accessibility preference. The
    // normal LEIS experience remains alive; this mode simply keeps the same
    // information available without autonomous visual movement.
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const onVisibilityChange = () => { pageVisible = document.visibilityState !== "hidden"; };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const rotateTo = (item: News, duration = 3000) => {
      const chart = chartRef.current;
      if (!chart) return;
      chart.animate({ key: "rotationX", to: -item.lon, duration });
      chart.animate({ key: "rotationY", to: -item.lat, duration });
    };
    (async () => {
      try {
      // Android Chrome can report its final viewport after the initial React
      // paint. Waiting two frames prevents an invisible zero-size map root.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
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
      const resizeMap = () => root?.resize?.();
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resizeMap);
        resizeObserver.observe(wheelHost);
      }
      resizeTimer = setTimeout(resizeMap, 140);
      setMapStatus("ready");
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
        fill: am5.color(0x061b31), fillOpacity: 0.98,
        stroke: am5.color(0x26799d), strokeOpacity: 0.52, strokeWidth: 1,
        interactive: false,
      });
      ocean.data.setAll([{ geometry: am5map.getGeoRectangle(90, 180, -90, -180) }]);
      // The generated polygon (not its template) owns the animation. This keeps
      // every later layer safe while providing a restrained, living water surface.
      ocean.events.once("datavalidated", () => {
        if (reducedMotion) return;
        const oceanPolygon = ocean.dataItems[0]?.get("mapPolygon");
        if (!oceanPolygon) return;
        oceanPolygon.animate({ key: "fillOpacity", from: 0.82, to: 0.98, duration: 7800, loops: Infinity, easing: am5.ease.yoyo(am5.ease.sine) });
        oceanPolygon.animate({ key: "strokeOpacity", from: 0.22, to: 0.40, duration: 7800, loops: Infinity, easing: am5.ease.yoyo(am5.ease.sine) });
      });
      const polygons = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: world }));
      polygons.mapPolygons.template.setAll({
        fill: am5.color(0x347c98), stroke: am5.color(0x87d8e6), strokeOpacity: 0.35,
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
      // Broad, low-profile cloud sheets: they deliberately read as stratiform
      // bands from orbit, rather than individual objects floating above the map.
      const stratusAssets = [
        "/clouds/cloud-front-a.png", "/clouds/cloud-bank-b.png", "/clouds/cloud-bank-e.png", "/clouds/cloud-bank-a.png",
      ];
      const stormAssets = ["/clouds/cloud-storm-a.png", "/clouds/cloud-storm-b.png"];
      const cloudAsset = (index: number, severe: boolean) => severe
        ? stormAssets[index % stormAssets.length]
        : stratusAssets[index % stratusAssets.length];
      const cloudVisual = (cloudCover: number, severe = false) => {
        const cloud = Math.max(0, Math.min(100, cloudCover));
        const width = severe ? 178 : 84 + cloud * 0.92;
        return {
          cloudWidth: width,
          cloudHeight: severe ? width * 0.46 : width * 0.28,
          // Low cloud cover remains transparent; real overcast becomes clearly
          // visible without turning the globe into an opaque weather map.
          cloudOpacity: cloud < 14 ? 0 : Math.min(severe ? 0.78 : 0.68, 0.16 + cloud * 0.006),
        };
      };
      // Cloud sheets are polygons in the same geographic projection as the
      // countries. They therefore follow the Earth, disappear behind its
      // horizon, and cannot spill out as flat image cards at the edge.
      const stratusGeometry = (lon: number, lat: number, cloudCover: number, severe = false) => {
        const cloud = Math.max(0, Math.min(100, cloudCover));
        // Small, irregular cloud decks stay within a single geographic region.
        // This avoids crossing the date seam while keeping the texture attached
        // to the surface as the globe moves.
        const horizontal = Math.min(severe ? 19 : 15, 4 + cloud * (severe ? 0.15 : 0.11));
        const vertical = Math.min(severe ? 8 : 5.8, 1.4 + cloud * (severe ? 0.06 : 0.042));
        const ring = Array.from({ length: 25 }, (_, index) => {
          const angle = (Math.PI * 2 * index) / 24;
          const ripple = 1 + Math.sin(angle * 3) * 0.18 + Math.cos(angle * 5) * 0.08;
          return [lon + Math.cos(angle) * horizontal * ripple, Math.max(-83, Math.min(83, lat + Math.sin(angle) * vertical * ripple))];
        });
        return { type: "Polygon", coordinates: [ring] };
      };
      const weatherLayer = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
      weatherLayer.mapPolygons.template.setAll({
        // This layer is intentionally passive: source hubs are drawn later and
        // must remain both visible and clickable through all weather conditions.
        templateField: "settings", interactive: false, forceInactive: true,
        fill: am5.color(0xdffaff), fillOpacity: 0.035,
        stroke: am5.color(0xe8fdff), strokeOpacity: 0.025, strokeWidth: 0.3,
      });
      // amCharts projects broad geographic polygons differently across some
      // viewports, which can turn thin weather shapes into a full-screen haze.
      // Keep the geographic weather feed for storm detection, but never render
      // that unreliable fill across the Earth surface.
      weatherLayer.set("visible", false);
      const stormLayer = chart.series.push(am5map.MapPointSeries.new(root, { clipBack: true }));
      stormLayer.bullets.push((rootArg: any) => {
        const holder = am5.Container.new(rootArg, { width: 0, height: 0, centerX: am5.p50, centerY: am5.p50 });
        const halo = holder.children.push(am5.Circle.new(rootArg, { radius: 11, fill: am5.color(0xffc85b), fillOpacity: 0.12, stroke: am5.color(0xffd67a), strokeOpacity: 0.56, strokeWidth: 1 }));
        const core = holder.children.push(am5.Circle.new(rootArg, { radius: 3.8, fill: am5.color(0xffd36e), fillOpacity: 0.96, stroke: am5.color(0xffefae), strokeOpacity: 0.95, strokeWidth: 1 }));
        if (!reducedMotion) {
          halo.animate({ key: "scale", from: 0.7, to: 2.25, duration: 1850, loops: Infinity, easing: am5.ease.out(am5.ease.cubic) });
          halo.animate({ key: "opacity", from: 0.84, to: 0, duration: 1850, loops: Infinity, easing: am5.ease.out(am5.ease.cubic) });
          core.animate({ key: "scale", from: 0.78, to: 1.22, duration: 900, loops: Infinity, easing: am5.ease.yoyo(am5.ease.sine) });
        }
        return am5.Bullet.new(rootArg, { sprite: holder });
      });
      const weatherSites = [
        { name: "San Francisco", lat: 37.7749, lon: -122.4194 }, { name: "Toronto", lat: 43.6532, lon: -79.3832 },
        { name: "London", lat: 51.5072, lon: -0.1276 }, { name: "Prague", lat: 50.0755, lon: 14.4378 },
        { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773 }, { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
        { name: "Singapore", lat: 1.3521, lon: 103.8198 }, { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
        { name: "Sao Paulo", lat: -23.5505, lon: -46.6333 }, { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
        { name: "Nairobi", lat: -1.2921, lon: 36.8219 }, { name: "Reykjavik", lat: 64.1466, lon: -21.9426 },
        { name: "Los Angeles", lat: 34.0522, lon: -118.2437 }, { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
        { name: "Bogota", lat: 4.711, lon: -74.0721 }, { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
        { name: "Lagos", lat: 6.5244, lon: 3.3792 }, { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
        { name: "Beijing", lat: 39.9042, lon: 116.4074 }, { name: "Seoul", lat: 37.5665, lon: 126.978 },
        { name: "Sydney", lat: -33.8688, lon: 151.2093 }, { name: "Perth", lat: -31.9505, lon: 115.8605 },
      ];
      const weatherLabel = (code: number) => code >= 95 ? "thunderstorm" : code >= 80 ? "rain showers" : code >= 51 ? "rain" : code >= 45 ? "mist" : code >= 3 ? "overcast" : code >= 1 ? "partly cloudy" : "clear";
      const weatherTone = (code: number, temperature = 0) => code >= 95 ? 0xc090ff : code >= 51 ? 0x5caef5 : temperature >= 30 ? 0xf2bb78 : code >= 3 ? 0x9ad7e4 : 0x9ee6c0;
      // A restrained atmospheric simulation is visible immediately. When the live
      // public weather feed returns, it replaces these visual starting conditions.
      weatherLayer.data.setAll(weatherSites.map((site, index) => {
        const cloud = [76, 58, 66, 46, 12, 42, 71, 35, 57, 64, 52, 79][index] ?? 48;
        const wet = [true, false, true, false, false, false, true, false, true, true, false, true][index] ?? false;
        const severe = index === 6;
        const tone = severe ? 0xc090ff : wet ? 0x5caef5 : cloud > 60 ? 0x9ad7e4 : 0x9ee6c0;
        return {
          geometry: stratusGeometry(site.lon, site.lat, cloud, severe), lon: site.lon, lat: site.lat,
          weather: `${site.name} · atmospheric simulation · live public conditions load when available`,
          tone, cloud, wet, severe,
          settings: { fill: am5.color(severe ? 0xf3d27d : wet ? 0xd9f9ff : 0xc3eefa), fillOpacity: severe ? 0.12 : cloud < 22 ? 0 : Math.min(0.075, 0.012 + cloud * 0.0007), strokeOpacity: severe ? 0.13 : 0.03 },
        };
      }));
      stormLayer.data.setAll([{ geometry: { type: "Point", coordinates: [103.8198, 1.3521] } }]);
      const refreshWeather = async () => {
        if (!pageVisible) return;
        try {
          const weather = await Promise.all(weatherSites.map(async (site, index) => {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}&current=temperature_2m,weather_code,cloud_cover,precipitation,wind_speed_10m&timezone=auto`);
            if (!response.ok) throw new Error("Weather response unavailable");
            const payload = await response.json();
            const current = payload?.current ?? {};
            const code = Number(current.weather_code ?? 0);
            const temperature = Math.round(Number(current.temperature_2m ?? 0));
            const wind = Math.round(Number(current.wind_speed_10m ?? 0));
            const rain = Number(current.precipitation ?? 0);
            const cloud = Math.round(Number(current.cloud_cover ?? 0));
            const severe = code >= 95;
            return {
              geometry: stratusGeometry(site.lon, site.lat, cloud, severe), lon: site.lon, lat: site.lat,
              weather: `${site.name} · LIVE ${temperature}°C · ${weatherLabel(code)} · cloud ${cloud}% · wind ${wind} km/h`,
              tone: weatherTone(code, temperature), cloud, wet: code >= 51 || rain > 0, severe,
              settings: { fill: am5.color(severe ? 0xf3d27d : code >= 51 || rain > 0 ? 0xd9f9ff : 0xc3eefa), fillOpacity: severe ? 0.14 : cloud < 22 ? 0 : Math.min(0.085, 0.016 + cloud * 0.00075), strokeOpacity: severe ? 0.16 : 0.035 },
            };
          }));
          if (!disposed) {
            weatherLayer.data.setAll(weather);
            stormLayer.data.setAll(weather.filter((item: any) => item.severe).map((item: any) => ({ geometry: { type: "Point", coordinates: [item.lon, item.lat] } })));
          }
        } catch { /* The optional stream never blocks the globe itself. */ }
      };
      void refreshWeather();
      weatherRefresh = setInterval(() => { void refreshWeather(); }, 10 * 60 * 1000);
      const atmosphereToggle = (event: Event) => {
        const visible = Boolean((event as CustomEvent<boolean>).detail);
        stormLayer.set("visible", visible);
      };
      node.current?.addEventListener("leis-atmosphere-toggle", atmosphereToggle);
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
        if (reducedMotion) return;
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
        if (!reducedMotion) {
          halo.animate({ key: "scale", from: 1, to: 3.2, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
          halo.animate({ key: "opacity", from: 0.72, to: 0, duration: 2400, loops: Infinity, easing: am5.ease.cubic });
        }
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
        if (!reducedMotion && pageVisible && Date.now() > manualUntil) chart.set("rotationX", (chart.get("rotationX") ?? 0) + 0.28);
      }, 90);
      let next = -1;
      route = setInterval(() => {
        if (!reducedMotion && pageVisible && Date.now() > manualUntil) {
          next = (next + 1) % news.length;
          rotateTo(news[next]);
        }
      }, 11500);
      } catch (error) {
        if (!disposed) setMapStatus("fallback");
        console.error("LEIS globe initialisation failed", error);
      }
    })();
    return () => {
      disposed = true;
      if (drift) clearInterval(drift);
      if (route) clearInterval(route);
      if (weatherRefresh) clearInterval(weatherRefresh);
      if (resizeTimer) clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver?.disconnect();
      node.current?.removeEventListener("leis-atmosphere-toggle", atmosphereToggle);
      if (wheelHost && onWheel) wheelHost.removeEventListener("wheel", onWheel);
      if (wheelHost && onTouchStart) wheelHost.removeEventListener("touchstart", onTouchStart);
      if (wheelHost && onTouchMove) wheelHost.removeEventListener("touchmove", onTouchMove);
      if (wheelHost && onTouchEnd) wheelHost.removeEventListener("touchend", onTouchEnd);
      root?.dispose();
    };
  }, [mapAttempt, openCzechia, openDesk, openPragueOrigin]);

  const isCzechRepublic = Boolean(country && /Czechia|Czech Republic/i.test(country));
  const countrySignals = country
    ? news.map((item, index) => ({ item, index })).filter(({ item }) =>
      country.includes("United States") ? item.place.includes("USA") :
      country.includes("France") ? item.place.includes("France") :
      isCzechRepublic ? item.place.includes("Czech Republic") : false)
    : [];
  const isPrague = Boolean(country?.includes("Prague"));
  const deskSignals = deskStart === null ? [] : news.map((item, index) => ({ item, index })).filter(({ item }) => item.source === news[deskStart].source && item.place === news[deskStart].place).slice(0, 5);
  const countryProfile = country ? countryProfiles[country] ?? (country.includes("Korea") ? countryProfiles["South Korea"] : country.includes("UAE") ? countryProfiles["United Arab Emirates"] : undefined) : undefined;
  const pendingCountryProfile = country && !isPrague && !countryProfile && !countrySignals.length ? {
    eyebrow: baselineText.eyebrow,
    title: `${country}: ${baselineText.title}`,
    summary: baselineText.summary,
    use: baselineText.use,
    leis: baselineText.leis,
    links: [
      { label: baselineText.oecd, url: "https://oecd.ai/en/" },
      { label: baselineText.unesco, url: "https://www.unesco.org/ethics-ai/en/ram" },
    ],
  } : undefined;
  const displayedCountryProfile = countryProfile ?? pendingCountryProfile;

  return <>
    <div className="globe-map-shell">
      <div className="globe-map" ref={node} aria-label={globeText.aria} aria-busy={mapStatus !== "ready"} />
      {mapStatus !== "ready" && <div className={`mobile-map-status ${mapStatus}`} aria-live="polite">
        <span aria-hidden="true">◌</span>
        <b>{mapStatus === "loading" ? globeText.preparing : globeText.reloading}</b>
        <small>{mapStatus === "loading" ? globeText.appearing : globeText.refresh}</small>
        {mapStatus === "fallback" && <button type="button" onClick={retryMap}>{globeRetryCopy[language]}</button>}
      </div>}
      <div className="globe-weather-hud" aria-label={globeText.weatherAria}>
        <i aria-hidden="true" />
        <span>{globeText.clouds}</span>
        <small>{globeText.cloudNote}</small>
      </div>
      <button type="button" className={`globe-atmosphere-control ${atmosphereOn ? "active" : ""}`} onPointerDown={(event) => event.stopPropagation()} onClick={toggleAtmosphere} aria-pressed={atmosphereOn}>
        <span aria-hidden="true">☁</span>{atmosphereOn ? globeText.atmosphereOn : globeText.atmosphereOff}
      </button>
      <div className="globe-zoom-controls" aria-label={globeText.zoomAria}>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => adjustZoom(1)} aria-label={globeText.zoomIn}>+</button>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => adjustZoom(-1)} aria-label={globeText.zoomOut}>−</button>
        <span>{globeText.zoomHint}</span>
      </div>
    </div>
    {focus && <>
      <div className="globe-focus-scrim" onClick={close}/>
      <section ref={focusWindowRef} className={`globe-focus-window ${detail ? "level-2" : "level-1"}`} role="dialog" aria-modal="true" aria-label={`${globeText.selectedSignal}: ${detail ? globeText.sourceContext : globeText.publicDesk}`} aria-live="polite">
        <button className="close-focus" onClick={close} aria-label={globeText.close}>×</button>
        {selectedNews ? <article className="selected-article">
          <p className="article-source">
            {selectedNews.source} · {globeText.newsroom} · {selectedNews.place} · {globeText.sourceReviewed} {selectedNews.reviewed ?? "5 AUGUST 2026"}
          </p>
          <h3>{selectedNews.title}</h3>
          {detail ? <div className="selected-detail">
            <p><b>{globeText.sourceReports}</b><br />{selectedNews.summary}</p>
            <p><b>{globeText.leisContext}</b><br />{selectedNews.leis}</p>
            <a className="primary" href={selectedNews.url} target="_blank" rel="noreferrer">{globeText.readSource}</a>
          </div> : <button className="open-context" onClick={() => setDetail(true)}>{globeText.openContext}</button>}
        </article> : deskStart !== null ? <>
          <small>{globeText.publicDesk} · {globeText.reviewedSignals}</small>
          <h3>{news[deskStart].source} · {news[deskStart].place}</h3>
          <div className="focus-choices">
            {deskSignals.map(({ item, index }) => <button key={item.title} onClick={() => choose(index, true)}>
              <small>{item.source} · {item.place} · {globeText.sourceReviewed} {item.reviewed ?? "5 AUGUST 2026"}</small>
              <strong>{item.title}</strong>
            </button>)}
          </div>
        </> : isCzechRepublic ? <>
          <small>{placeText.czechLabel}</small>
          <h3>{placeText.czechTitle}</h3>
          <div className="country-profile czech-intro">
            <p>{placeText.czechIntro}</p>
          </div>
          <div className="focus-choices">
            {countrySignals.slice(0, 5).map(({ item, index }) => <button key={item.title} onClick={() => choose(index, true)}>
              <small>{item.source} · {item.place} · {globeText.sourceReviewed} {item.reviewed ?? "5 AUGUST 2026"}</small>
              <strong>{item.title}</strong>
            </button>)}
          </div>
          <div className="prague-origin-cards czech-origin-summary">
            <article><small>{placeText.originLabel}</small><strong>Martin Pužík</strong><span>{placeText.creatorText}</span></article>
            <article><small>{placeText.technicalLabel}</small><strong>M.A.J. Pužík</strong><span>{placeText.technicalText}</span></article>
          </div>
        </> : isPrague ? <>
          <small>{placeText.originLabel}</small>
          <h3>{placeText.czechTitle}</h3>
          <div className="prague-origin-cards">
            <article><small>{placeText.creatorLabel}</small><strong>Martin Pužík</strong><span>{placeText.creatorText}</span></article>
            <article><small>{placeText.technicalLabel}</small><strong>M.A.J. Pužík</strong><span>{placeText.technicalText}</span></article>
            <article><small>{placeText.contactLabel}</small><strong>{placeText.contactTitle}</strong><span>{placeText.contactText}</span><a href="mailto:martin.puzik@gmail.com?subject=LEIS%20contact">{placeText.contactAction}</a></article>
          </div>
        </> : displayedCountryProfile ? <>
          <small>{displayedCountryProfile.eyebrow}</small>
          <h3>{displayedCountryProfile.title}</h3>
          <div className="country-profile">
            <p>{displayedCountryProfile.summary}</p>
            <p><b>{globeText.aiUse}</b><br />{displayedCountryProfile.use}</p>
            <p><b>{globeText.leisContext}</b><br />{displayedCountryProfile.leis}</p>
            <div className="country-profile-links">{displayedCountryProfile.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
          </div>
        </> : <>
          <small>{globeText.publicDesk}</small>
          <h3>{country ?? globeText.publicDesk}</h3>
          {countrySignals.length ? <div className="focus-choices">
            {countrySignals.slice(0, 5).map(({ item, index }) => <button key={item.title} onClick={() => choose(index, true)}>
              <small>{item.source} {globeText.newsroom} · {item.place} · {globeText.sourceReviewed} {item.reviewed ?? "5 AUGUST 2026"}</small>
              <strong>{item.title}</strong>
            </button>)}
          </div> : <p className="country-empty">{globeText.emptyCountry}</p>}
        </>}
      </section>
    </>}
  </>;
}

function ContactPath({ copy, contactText }: { copy: PortalCopy; contactText: (typeof contactCopy)[Language] }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("Research dialogue");
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const openRequestedContact = (event: Event) => {
      const requestedTopic = (event as CustomEvent<string>).detail;
      if (["Grant or support", "Research dialogue", "Practical pilot", "Media enquiry"].includes(requestedTopic)) setTopic(requestedTopic);
      setOpen(true);
      window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    };
    window.addEventListener("leis-open-contact", openRequestedContact);
    return () => window.removeEventListener("leis-open-contact", openRequestedContact);
  }, []);
  const openMail = (event: React.FormEvent) => {
    event.preventDefault();
    const topicLabel = contactText.topics[topic] ?? topic;
    const subject = `LEIS · ${topicLabel}`;
    const body = [
      `Topic: ${topicLabel}`,
      `${contactText.name}: ${name || contactText.notProvided}`,
      `${contactText.organisation}: ${organisation || contactText.notProvided}`,
      "",
      message || contactText.hello,
    ].join("\n");
    window.location.href = `mailto:martin.puzik@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <section className="contact-path" id="contact" aria-label="Contact LEIS">
    <p className="eyebrow">{copy.contactEyebrow}</p>
    <h2>{copy.contactTitle}</h2>
    <p>{copy.contactLead}</p>
    {!open ? <button type="button" className="primary" onClick={() => setOpen(true)}>{copy.write}</button> : <form onSubmit={openMail}>
      <div className="contact-topics">{["Grant or support", "Research dialogue", "Practical pilot", "Media enquiry"].map((item) => <button type="button" key={item} className={topic === item ? "active" : ""} onClick={() => setTopic(item)}>{contactText.topics[item]}</button>)}</div>
      <label>{contactText.name}<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
      <label>{contactText.organisation} <small>({contactText.optional})</small><input value={organisation} onChange={(event) => setOrganisation(event.target.value)} autoComplete="organization" /></label>
      <label>{contactText.question}<textarea value={message} onChange={(event) => setMessage(event.target.value)} required /></label>
      <div className="contact-actions"><button type="submit" className="primary">{copy.openMail}</button><button type="button" className="quiet" onClick={async () => { await navigator.clipboard?.writeText("martin.puzik@gmail.com"); setCopied(true); }}>{copy.copyMail}</button><button type="button" className="quiet" onClick={() => setOpen(false)}>{copy.notNow}</button>{copied && <span className="copy-status">{copy.copied}</span>}</div>
    </form>}
  </section>;
}

function FirstSteps({ copy }: { copy: (typeof firstStepCopy)[Language] }) {
  return <section className="first-steps" aria-label={copy.title}>
    <div className="first-steps-intro"><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.lead}</p></div>
    <div className="first-steps-grid">{copy.routes.map(([number, title, text, href]) => <a key={number} href={href}><b>{number}</b><h3>{title}</h3><p>{text}</p><span aria-hidden="true">→</span></a>)}</div>
  </section>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [active, setActive] = useState(0);
  const [seedOpen, setSeedOpen] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [newsIndex, setNewsIndex] = useState(0);
  const [leisOpen, setLeisOpen] = useState(false);
  const [leisTopic, setLeisTopic] = useState<"start" | "story" | "work">("start");
  const [activeSection, setActiveSection] = useState("top");
  const copy = portalCopy[language];
  const sections = sectionCopy[language];
  const participation = participationCopy[language];
  const grantDossier = grantDossierCopy[language];
  const publicBrief = publicBriefCopy[language];
  const loop = loopCopy[language];
  const activeLoop = loop.steps[loopStep];
  const test = testCopy[language];
  const seedDownload = seedDownloadCopy[language];
  const principles = principleCopy[language];
  const earthText = earthCopy[language];
  const contactText = contactCopy[language];
  const guideText = guideCopy[language];
  const firstSteps = firstStepCopy[language];
  const isLocalized = language !== "en";
  const local = isLocalized ? localizedStatic[language] : null;
  const current = localizedMilestones[language][active];
  const selected = news[newsIndex];
  const earth = earthCopy[language];
  const navigation = [["top", copy.start], ["timeline", copy.story], ["earth", copy.earth], ["grants", copy.support], ["media", copy.media]] as const;
  useEffect(() => {
    const chooseLanguage = () => {
      const requested = new URLSearchParams(window.location.search).get("lang");
      const stored = window.localStorage.getItem("leis-portal-language");
      setLanguage(isLanguage(requested) ? requested : isLanguage(stored) ? stored : "en");
    };
    chooseLanguage();
    window.addEventListener("popstate", chooseLanguage);
    return () => window.removeEventListener("popstate", chooseLanguage);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languageDirection[language];
    document.title = documentTitles[language];
    window.localStorage.setItem("leis-portal-language", language);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState({}, "", url);
  }, [language]);
  useEffect(() => {
    const sectionIds = ["top", "timeline", "earth", "grants", "media"];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-20% 0px -58% 0px", threshold: [0.08, 0.18, 0.35] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const earth = document.querySelector(".earth");
    if (!earth) return;
    const heading = earth.querySelector("h2");
    const eyebrow = earth.querySelector(".eyebrow");
    const lead = earth.querySelector(".earth-lead");
    const hint = earth.querySelector(".globe-stage > p");
    if (heading) heading.textContent = earthText.title;
    if (eyebrow) eyebrow.textContent = earthText.eyebrow;
    if (lead) lead.textContent = earthText.lead;
    if (hint) hint.textContent = earthText.hint;
    const reading = earth.querySelector(".reading-card");
    if (reading) {
      const readingEyebrow = reading.querySelector(".eyebrow");
      const labels = reading.querySelectorAll("p b");
      const origin = reading.querySelector("div:not(.source-row)");
      const link = reading.querySelector("a.primary");
      if (readingEyebrow) readingEyebrow.textContent = `${earthText.selected} · ${selected.source.toUpperCase()}`;
      if (labels[0]) labels[0].textContent = earthText.sourceSays;
      if (labels[1]) labels[1].textContent = earthText.commentary;
      if (origin) origin.childNodes[1].nodeValue = ` ${earthText.origin} ${selected.place}`;
      if (link) link.textContent = earthText.read;
    }
  }, [earthText, selected]);
  useEffect(() => {
    const sections = navigation.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: "-16% 0px -62% 0px", threshold: [0.02, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  const leisGuidance = {
    start: { ...guideText.start, link: "#orientation" },
    story: { ...guideText.story, link: "#timeline" },
    work: { ...guideText.work, link: "#grants" },
  }[leisTopic];
  const choose = useCallback((index: number) => { setNewsIndex(index); window.dispatchEvent(new CustomEvent("leis-globe-focus", { detail: index })); }, []);
  return <><a className="skip-link" href="#orientation">{copy.learn}</a><main>
    <nav><a className="mark omega-mark" href="#top" aria-label={`LEIS — ${copy.start}`}><span aria-hidden="true"/><b>LEIS</b></a><div>{navigation.map(([id, label]) => <a key={id} href={`#${id}`} className={activeSection === id ? "active" : ""} aria-current={activeSection === id ? "page" : undefined} onClick={() => setActiveSection(id)}>{label}</a>)}</div></nav>
    <section className="hero" id="top"><div className="stars" /><div className="hero-copy"><p className="eyebrow">{copy.eyebrow}</p><h1>{local ? local.heroA : "Understanding"}<br/><em>{local ? local.heroB : "that can travel."}</em></h1><p className="lead">{copy.heroLead}</p><div className="actions"><a className="primary" href="#orientation">{copy.learn}</a><a className="quiet" href="#timeline">{copy.lineage}</a></div></div><button className={`seed ${seedOpen ? "open" : ""}`} onClick={() => setSeedOpen(!seedOpen)} aria-expanded={seedOpen} aria-label={local ? local.seedAria : "Open the LEIS Seed preview"}><i/><span className="shell left"/><span className="shell right"/><span className="sprout"/></button><div className="seed-note"><span>{local ? local.seedLabel : "LEIS SEED"}</span><strong>{local ? (seedOpen ? local.seedOpen : local.seedClosed) : (seedOpen ? "A public Seed is taking shape." : "Touch the seed.")}</strong><p>{local ? (seedOpen ? local.seedOpenText : local.seedClosedText) : (seedOpen ? "A reviewed public entry point is being prepared: lineage, orientation and limits — without private archives." : "A small beginning, built to travel.")}</p></div></section>
    <FirstSteps copy={firstSteps}/>
    <section className="seed-download" id="seed" aria-label={seedDownload.title}><div className="seed-download-intro"><p className="eyebrow">{seedDownload.eyebrow}</p><h2>{seedDownload.title}</h2><p>{seedDownload.lead}</p><p className="seed-verified">{seedDownload.verified}</p><p className="seed-language">{seedDownload.language}</p><div className="actions"><a className="primary" href="/LEIS_ROOT_SEED_2026_08_03.md" download>{seedDownload.download}</a><a className="quiet" href="/LEIS_ROOT_SEED_2026_08_03.md" target="_blank" rel="noreferrer">{seedDownload.view}</a></div></div><div className="seed-steps">{seedDownload.steps.map(([number, title, detail]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{detail}</p></article>)}</div><p className="seed-safety">{seedDownload.safety}</p></section>
    <section className="orientation" id="orientation"><p className="eyebrow">{sections.orientation}</p><h2>{sections.reality}</h2><div className="principles"><article><b>01</b><h3>{principles.roots}</h3><p>{principles.rootsText}</p></article><article><b>02</b><h3>{principles.lineage}</h3><p>{principles.lineageText}</p></article><article><b>03</b><h3>{principles.validation}</h3><p>{principles.validationText}</p></article></div><p className="formula">{principles.formula}</p><section className="leis-loop" aria-label={loop.title}><div className="leis-loop-heading"><p className="eyebrow">{loop.eyebrow}</p><h3>{loop.title}</h3><p>{loop.lead}</p></div><div className="leis-loop-track" aria-label={loop.title}>{loop.steps.map(([label], index) => <button type="button" key={label} className={loopStep === index ? "active" : ""} aria-pressed={loopStep === index} onClick={() => setLoopStep(index)}><span>{String(index + 1).padStart(2, "0")}</span>{label}</button>)}</div><article className="leis-loop-reading" aria-live="polite"><span>{String(loopStep + 1).padStart(2, "0")} / {String(loop.steps.length).padStart(2, "0")}</span><h4>{activeLoop[0]}</h4><p>{activeLoop[1]}</p><p className="leis-loop-question"><b>{loop.questionLabel}</b> {activeLoop[2]}</p></article></section><section className="leis-test" aria-label={test.title}><p className="eyebrow">{test.eyebrow}</p><h3>{test.title}</h3><p className="leis-test-lead">{test.lead}</p><div>{test.checks.map(([number, title, detail]) => <article key={number}><b>{number}</b><h4>{title}</h4><p>{detail}</p></article>)}</div><p className="leis-test-note">{test.note}</p></section></section>
    <section className="timeline" id="timeline"><p className="eyebrow">{sections.timeline}</p><h2>{sections.continuity}</h2><div className="timeline-grid"><div className="axis"><div className="pulse"/>{localizedMilestones[language].map(([, date, title], index) => <button key={title} className={active === index ? "active" : ""} style={{ top: `${17 + index * 22}%` }} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}><span/><small>{date}</small></button>)}</div><article className="event"><small>{current[0]} · {current[1]}</small><h3>{current[2]}</h3><p>{current[3]}</p></article></div><p className="certainty">{principles.timelineNote}</p></section>
    <section className="earth" id="earth"><p className="eyebrow">{earth.eyebrow}</p><h2>{earth.title}</h2><p className="earth-lead">{earth.lead}</p><div className="earth-experience"><div className="signal-rail left-rail">{news.slice(0, 10).map((item, index) => <button className={newsIndex === index ? "selected" : ""} style={{ "--source": sourceColors[item.source] } as React.CSSProperties} onClick={() => choose(index)} key={item.title}><span className="signal-origin">{item.source} · {item.place}</span><strong>{item.title}</strong></button>)}</div><div className="globe-stage"><div className="stars local-stars"/>{Array.from({ length: 20 }, (_, index) => <i className="depth-star" key={index} style={{ left: `${(index * 31) % 100}%`, top: `${(index * 47) % 100}%`, animationDelay: `${index * 0.18}s` }} />)}<Globe onSelect={choose} language={language}/><p>{earth.hint}</p></div><div className="signal-rail right-rail">{news.slice(10).map((item, localIndex) => { const index = localIndex + 10; return <button className={newsIndex === index ? "selected" : ""} style={{ "--source": sourceColors[item.source] } as React.CSSProperties} onClick={() => choose(index)} key={item.title}><span className="signal-origin">{item.source} · {item.place}</span><strong>{item.title}</strong></button>; })}</div></div><article className="reading-card"><p className="eyebrow">{earth.selected} · {selected.source.toUpperCase()}</p><h3>{selected.title}</h3><p><b>{earth.sourceSays}</b> {selected.summary}</p><p><b>{earth.commentary}</b> {selected.leis}</p><div><span className="origin-dot" style={{ background: sourceColors[selected.source] }}/> {earth.origin} {selected.place}</div><a className="primary" href={selected.url} target="_blank" rel="noreferrer">{earth.read}</a></article><div className="source-row"><a href="https://blog.google/innovation-and-ai/technology/ai/" target="_blank">Google AI</a><a href="https://openai.com/news/" target="_blank">OpenAI</a><a href="https://www.anthropic.com/news" target="_blank">Anthropic</a><a href="https://huggingface.co/blog" target="_blank">Hugging Face</a></div></section>
    <section className="grants" id="grants">
      <p className="eyebrow">{copy.grantEyebrow}</p><h2>{copy.grantA}<br/>{copy.grantB}</h2><p className="grant-lead">{copy.grantLead}</p>
      <div className="grant-grid">{(local ? local.grants : [["Preserve", "Recover source lineage, distinguish evidence from interpretation and prevent years of work from becoming unreadable files."], ["Test", "Measure whether understanding survives a handover: can a new person reconstruct a decision, its conditions and its limits?"], ["Share", "Build public explanations, practical pilots and open materials that let people judge LEIS for themselves."]]).map(([title, text], index) => <article key={title}><b>{String(index + 1).padStart(2, "0")}</b><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className="grant-path">{(local ? local.grantPath : [["For grants:", "operational continuity, documentation, validation, infrastructure and independent review."], ["For companies:", "a bounded collaboration around a real handover, decision or knowledge-continuity problem."], ["For researchers and institutions:", "an invitation to challenge the method and improve its tests."]]).map(([title, text]) => <p key={title}><b>{title}</b> {text}</p>)}</div>
      <section className="grant-dossier" aria-label={grantDossier.title}>
        <div className="grant-dossier-intro"><p className="eyebrow">{grantDossier.route}</p><h3>{grantDossier.title}</h3><p>{grantDossier.lead}</p></div>
        <div className="grant-dossier-grid">
          <article><p className="eyebrow">{grantDossier.why}</p>{grantDossier.routes.map(([title, text], index) => <div className="dossier-row" key={title}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{title}</strong><p>{text}</p></div></div>)}</article>
          <article><p className="eyebrow">{grantDossier.measure}</p>{grantDossier.measures.map(([title, text], index) => <div className="dossier-row" key={title}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{title}</strong><p>{text}</p></div></div>)}</article>
        </div>
      </section>
      <button type="button" className="primary" onClick={() => window.dispatchEvent(new CustomEvent("leis-open-contact", { detail: "Grant or support" }))}>{copy.discuss}</button>
      <p className="grant-next-step">{grantDossier.action}</p>
    </section>
    <section className="media" id="media">
      <p className="eyebrow">{copy.mediaEyebrow}</p><h2>{copy.mediaTitle}</h2><p>{copy.mediaLead}</p>
      <section className="public-brief" aria-label={publicBrief.title}>
        <div className="public-brief-intro"><p className="eyebrow">{publicBrief.eyebrow}</p><h3>{publicBrief.title}</h3><p>{publicBrief.lead}</p></div>
        <div className="public-brief-grid">{publicBrief.cards.map(([number, title, text]) => <article key={number}><b>{number}</b><h4>{title}</h4><p>{text}</p></article>)}</div>
        <button type="button" className="brief-link" onClick={() => window.dispatchEvent(new CustomEvent("leis-open-contact", { detail: "Media enquiry" }))}>{publicBrief.action} →</button>
      </section>
      <div className="media-grid"><article><b>{local ? local.media[0][0] : "01 · ORIENTATION"}</b><h3>{copy.orientation}</h3><p>{local ? local.media[0][1] : "What LEIS is, what it is not, where it began and how it can be tested without asking anyone to simply believe it."}</p><a className="card-link" href="#orientation">{copy.readOrientation}</a></article><article><b>{local ? local.media[1][0] : "02 · EVIDENCE"}</b><h3>{copy.evidence}</h3><p>{local ? local.media[1][1] : "Timeline labels distinguish documented evidence, creator-reported context and open questions. Private archives remain private."}</p><a className="card-link" href="#timeline">{copy.traceTimeline}</a></article><article><b>{local ? local.media[2][0] : "03 · DIALOGUE"}</b><h3>{copy.dialogue}</h3><p>{local ? local.media[2][1] : "For an interview, research question or source packet, use the public contact route. No mailing-list subscription is required."}</p><button type="button" className="card-link" onClick={() => window.dispatchEvent(new CustomEvent("leis-open-contact", { detail: "Media enquiry" }))}>{copy.openContact}</button></article></div>
      <button type="button" className="primary" onClick={() => window.dispatchEvent(new CustomEvent("leis-open-contact", { detail: "Media enquiry" }))}>{copy.mediaContact}</button>
    </section>
    <section className="participate" id="participate"><p className="eyebrow">{participation.eyebrow}</p><h2>{participation.title}</h2><p>{participation.lead}</p><div className="contact"><button type="button" className="primary" onClick={() => window.dispatchEvent(new CustomEvent("leis-open-contact", { detail: "Research dialogue" }))}>{participation.action}</button><span>{participation.note}</span></div><p className="source-language-note">{participation.sourceNote}</p><footer>{local ? local.footer : "Created by"} <b>Martin Puzik</b> · {local ? local.technical : "Technical collaboration:"} <b>M.A.J. Puzik</b></footer></section>
  <ContactPath copy={copy} contactText={contactText}/></main><LanguageDock language={language} onChange={setLanguage} label={copy.language}/><aside className={`leis-dock ${leisOpen ? "open" : ""}`} aria-label={guideText.label}>
    {leisOpen && <div className="leis-dock-window">
      <button className="leis-dock-close" onClick={() => setLeisOpen(false)} aria-label={guideText.close}>×</button>
      <small>{guideText.label}</small>
      <h3>{leisGuidance.title}</h3>
      <p>{leisGuidance.text}</p>
      <div className="leis-dock-choices">
        <button className={leisTopic === "start" ? "active" : ""} onClick={() => setLeisTopic("start")}>{guideText.start.choice}</button>
        <button className={leisTopic === "story" ? "active" : ""} onClick={() => setLeisTopic("story")}>{guideText.story.choice}</button>
        <button className={leisTopic === "work" ? "active" : ""} onClick={() => setLeisTopic("work")}>{guideText.work.choice}</button>
      </div>
      <a href={leisGuidance.link} onClick={() => setLeisOpen(false)}>{leisGuidance.action} ↗</a>
      <em>{guideText.note}</em>
    </div>}
    <button className="leis-dock-trigger" onClick={() => setLeisOpen(!leisOpen)} aria-expanded={leisOpen}><span aria-hidden="true"/>{leisOpen ? guideText.close : guideText.ask}</button>
  </aside></>;
}
