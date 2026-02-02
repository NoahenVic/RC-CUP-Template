# RC Cup Team Template (Advanced Guide)

Deze template is gebouwd voor RC Cup teams die snel een professionele website willen met JSON‑data. Alles is aanpasbaar via de `data/` map, zonder HTML te wijzigen. De site ondersteunt **NL/EN** met een taal‑toggle.

## Inhoudsopgave

- Overzicht
- Structuur
- Data‑model (per pagina)
- Taalbeheer (NL/EN)
- Afbeeldingen & assets
- Pagina’s uitbreiden
- Deploy op Vercel (stap‑voor‑stap)
- Clean URLs
- Veelgemaakte fouten
- AI‑prompt (uitgebreid)

---

## Overzicht

- **Geen framework**: pure HTML + CSS + JS.
- **Content via JSON**: elke pagina heeft een eigen JSON bestand.
- **Taalkeuze**: data staat in `data/nl/` en `data/en/`.
- **Nav/Brand gedeeld**: in `data/site.json`.

---

## Structuur

```
/
├─ index.html
├─ info.html
├─ sponsors.html
├─ terms.html
├─ thankyou.html
├─ 404.html
├─ test.html
├─ vercel.json
├─ README.md
├─ assets/
│  ├─ styles.css
│  ├─ script.js
│  └─ img/
└─ data/
   ├─ site.json
   ├─ nl/
   │  ├─ index.json
   │  ├─ info.json
   │  ├─ sponsors.json
   │  ├─ terms.json
   │  ├─ thankyou.json
   │  ├─ 404.json
   │  └─ test.json
   └─ en/
      ├─ index.json
      ├─ info.json
      ├─ sponsors.json
      ├─ terms.json
      ├─ thankyou.json
      ├─ 404.json
      └─ test.json
```

---

## Data‑model (per pagina)

### Home (`data/nl/index.json`)
- `hero`: titel, lead, knoppen, quick links
- `countdown`: label + target datetime (ISO‑string)
- `stats`: cijfers in cards
- `aboutCards`: 2‑4 info cards
- `team`: teamleden
- `gallery`: foto’s
- `sponsors`: logos + CTA
- `contact`: tekst + formulier

### Team (`data/nl/info.json`)
- `hero`
- `sections`: 2 info blocks
- `values`: waarden cards
- `leaders`: team leads
- `members`: overige teamleden
- `headings`: labels voor section titles

### Sponsors (`data/nl/sponsors.json`)
- `hero`
- `packages`: sponsorpakketten
- `practical`: praktische info
- `cta`: call‑to‑action block

### Terms (`data/nl/terms.json`)
- `hero`
- `sections`: cards met bullets

### Thank you (`data/nl/thankyou.json`)
- `hero`
- `steps`: 3 cards
- `links`: knoppen

### 404 (`data/nl/404.json`)
- `hero`
- `links`: knoppen
- `tips`: bullets

### Test (`data/nl/test.json`)
- `hero`
- `cards`: test cards

---

## Taalbeheer (NL/EN)

- Standaard taal = **NL**.
- Klik op de taal‑knop in de nav om te wisselen.
- De keuze wordt opgeslagen in `localStorage`.
- Vertaalde content staat in:
  - `data/nl/*.json`
  - `data/en/*.json`

**Tip:** Zorg dat beide talen dezelfde structuur behouden.

---

## Nav & Brand (gedeeld)

`data/site.json` bevat:
- `brand` per taal (naam, logo letter, tagline, e‑mail)
- `nav` per taal (labels + links)

Je hoeft dit dus maar 1x aan te passen.

---

## Afbeeldingen & assets

- Zet eigen afbeeldingen in `assets/img/`.
- Verwijs in JSON naar het pad, bv:
  - `"assets/img/team-photo.jpg"`
- Vervang `placeholder.svg` waar nodig.

---

## Pagina’s uitbreiden

1. Maak nieuw JSON bestand in `data/nl/` en `data/en/`.
2. Maak nieuwe HTML pagina (kopie van `test.html`).
3. Voeg render‑logica toe in `assets/script.js`.

---

## Deploy op Vercel (stap‑voor‑stap)

1. Push naar GitHub.
2. Ga naar **vercel.com** → **New Project**.
3. Selecteer je repo.
4. Framework preset: **Other**.
5. Build command: **leeg**.
6. Output directory: **leeg**.
7. Deploy.

### Domein koppelen
- Project settings → **Domains** → voeg domein toe.
- Volg DNS instructies.

---

## Local dev (belangrijk)

De site gebruikt `fetch` om JSON te laden. Dat werkt **niet** via `file://`.

Start dus altijd een lokale server. Twee eenvoudige opties:

### Optie 1: VS Code Live Server

1. Installeer de extensie **Live Server**.
2. Rechterklik op `index.html` → **Open with Live Server**.

### Optie 2: Python server

Open PowerShell in de projectmap en run:

```
python -m http.server 5500
```

Open daarna:

```
http://localhost:5500/index.html
```

---

## Formspree (contactformulier)

Je kunt het contactformulier direct laten mailen via Formspree.

### Stap 1: Formspree account + form

1. Ga naar https://formspree.io en maak een account.
2. Maak een nieuw form.
3. Kopieer je **Form Endpoint** (bv. `https://formspree.io/f/abcdwxyz`).

### Stap 2: Zet je endpoint in JSON

Open `data/nl/index.json` en `data/en/index.json` en pas aan:

```json
{
  "contact": {
    "form": {
      "action": "https://formspree.io/f/yourFormId",
      "method": "POST",
      "redirect": "thankyou.html",
      "fields": [
        { "label": "Name", "type": "text", "name": "name", "placeholder": "Your name" },
        { "label": "Email", "type": "email", "name": "email", "placeholder": "you@example.com" },
        { "label": "Message", "type": "textarea", "name": "message", "placeholder": "How can we help?" }
      ]
    }
  }
}
```

### Succes‑redirect

De `redirect` stuurt bezoekers na verzenden door naar `thankyou.html`.
Pas dit aan als je een andere pagina wil.

### Stap 3: Test

- Start de site lokaal (zie **Local dev**).
- Vul het formulier in en verstuur.
- Je krijgt een e‑mail in je Formspree inbox.

**Tip:** Formspree free plan heeft limieten. Check je dashboard voor quotas.

---

## Clean URLs

De `vercel.json` gebruikt `cleanUrls`, zodat je nette links krijgt:
- `/sponsors` i.p.v. `/sponsors.html`
- `/info`, `/terms`, etc.

---

## Veelgemaakte fouten

- JSON syntax fout (vergeten komma of quote).
- Pad naar afbeelding fout.
- Structuur in NL en EN is niet gelijk.
- Lege velden die in HTML wel verplicht zijn.

---

## AI‑prompt (uitgebreid)

Kopieer deze prompt en vul je eigen data in:

```
Je bent een ervaren web‑copy en JSON assistent.
Maak volledige inhoud voor een RC Cup teamwebsite.
Taal: Nederlands.

TEAM INFO
- Teamnaam: [TEAMNAAM]
- School: [SCHOOL]
- Stad: [STAD]
- Motto/Tagline: [TAGLINE]
- Contact e‑mail: [EMAIL]

TEAMLEDEN
- [Naam] – [Rol]
- [Naam] – [Rol]
- [Naam] – [Rol]

SPONSORPAKKETTEN
- Brons: [prijsrange]
- Goud: [prijsrange]
- Diamant: [prijsrange]
- Ultra: [prijsrange]

CONTENT STYLE
- Korte zinnen, professioneel maar toegankelijk.
- Gebruik actieve taal.
- Niet te technisch.

OUTPUT VEREISTEN
- Output **alleen JSON**.
- Lever deze bestanden (met identieke structuur als template):
  - data/nl/index.json
  - data/nl/info.json
  - data/nl/sponsors.json
  - data/nl/terms.json
  - data/nl/thankyou.json
  - data/nl/404.json
- Gebruik placeholder images als:
  - assets/img/placeholder.svg
- Houd dezelfde velden/structuur als het voorbeeld.

EXTRA
- Voeg 2 korte sponsor‑CTA teksten toe.
- Voeg 3 testimonials toe (kort, 1 zin) in index.json onder `testimonials`.
- Voeg 1 kort persbericht‑quote toe onder `pressQuote`.
```

**Tip:** Gebruik deze prompt bij voorkeur met AI‑agents zoals Claude Co‑Work, Cursor of Codex voor de snelste workflow.

---

