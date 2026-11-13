# Advertising & More — Interactive Quiz

An interactive quiz web app with **903 questions** across 5 sections and 44 blocks.
Features Game mode (levels, lives, streaks, XP), Browse mode (search all questions),
Design Lab (website feedback), and NFC Digital Business Card.

---

## 📁 Project Structure

```
advertising-and-more-quiz/
├── index.html                  ← Main page (splash + app shell)
├── README.md                   ← This file
├── css/
│   └── style.css               ← All styles (colors, layout, animations)
├── js/
│   ├── ui-data.js              ← UI text/labels + topic art (window.UI_DATA)
│   ├── meta-data.js            ← Metadata: coverage, quotes, sections
│   ├── questions-s1.js         ← S1 · Main website (251 questions)
│   ├── questions-s2.js         ← S2 · Party Rentals & Services (450 questions)
│   ├── questions-s3.js         ← S3 · Careers / Job Vacancies (145 questions)
│   ├── questions-s4.js         ← S4 · Thinkers' quotes (40 questions)
│   ├── questions-s5.js         ← S5 · Cross-page comparison (17 questions)
│   ├── app.js                  ← Main logic (game, browse, rendering, prizes)
│   ├── splash.js               ← Splash screen + gift selection + sticky stats
│   └── design-lab.js           ← Design Lab feedback + NFC business card
└── assets/                     ← All images here
    ├── coffee-cup.png          ← A&M brand logo
    ├── quiz-brain-icon.png     ← Brain icon
    ├── tab-game.webp           ← Mode tab icons
    ├── tab-browse.webp
    ├── tab-design.webp         ← Design Lab tab icon
    ├── gift-button.webp        ← Gift button icon
    ├── gifts/                  ← Gift images
    │   ├── gift-splash.webp    ← Rotating gift (splash)
    │   ├── gift-art.webp
    │   ├── gift-mystery.webp
    │   ├── gift-icon.webp
    │   └── card-gift-*.webp    ← Gift card images
    ├── topics/                 ← Topic art (10 images)
    ├── chapters/               ← Chapter art (7 images)
    └── gifts/                  ← Gift art (3 images)
```

---

## 🎮 Features

### User Flow
1. **Splash Screen** — Blue gradient with rotating gift box + floating gift icons
2. **Gift Selection** — Pick 1 of 9 mystery cards (3×3 grid). Card shakes, flips, and is locked in
3. **Quiz** — Play levels, earn XP and stars
4. **Prize Reveal** — After level ends, chosen card bursts open revealing a Malaysia Prize Bond (RM 10–360) based on your score, plus gadget bonuses for high scores

### Game Mode
- 91 levels across 7 chapters
- 3 lives (hearts) per level
- 30-second timer per question (toggleable)
- Streaks, XP, ranks (Rookie → Legend)
- Rotating game bar slides (Score → Brand → Gift milestones)

### Browse Mode
- Search all 903 questions
- Filter by section, difficulty, answered status
- Reveal/hide answers
- Share questions via deep links

### Design Lab
- Review 6 website blocks (Logo, Hero, Services, Email Signature, Colors, Typography)
- Rate each block (😞 to 🤩)
- Submit design suggestions and ideas
- Earn **+50 XP** per feedback
- Export feedback as JSON
- Data stored in localStorage

### NFC Business Card
- Digital business card with contact details
- **NFC share** (Web NFC API — Android Chrome)
- **QR code** generation (scan to save contact)
- **Download** vCard (.vcf) file
- Fallback to Web Share API where NFC unavailable

---

## 🚀 Run Locally

```bash
# Start a local server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000
```

Or use any static server (Node, PHP, etc.).

---

## 📤 Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload all files (maintain folder structure)
3. Go to **Settings → Pages**
4. Select branch `main` and folder `/ (root)`
5. Your site will be live at `https://<username>.github.io/<repo-name>/`

---

## ✏️ Editing Guide

### Change UI Text
Edit `js/ui-data.js` — all labels, buttons, and messages are there.

### Add Questions
Add to the appropriate `js/questions-s*.js` file. Each question:
```js
{ id:'Q0001', sec:'S1', block:'S1-01', diff:'Easy', q:'Question?', opts:['A','B','C','D'], a:0, why:'Explanation' }
```
- `a` = correct answer index (0=A, 1=B, 2=C, 3=D)

### Change Colors
Edit CSS variables in `css/style.css`:
```css
:root {
  --brand:#0049A8;        /* Primary blue */
  --brand-dark:#00357C;   /* Dark blue */
  --brand-light:#0B62CC;  /* Light blue */
  --gold:#FFCE1B;         /* Gold accent */
}
```

### Add Design Lab Blocks
Edit `DL_BLOCKS` array in `js/design-lab.js`.

### Change Prize Pool
Edit `PRIZE_POOL` array in `js/app.js` — 9 prizes totaling RM 1000.

---

## 📊 Quiz Statistics

| Section | Questions | Topic |
|---------|-----------|-------|
| S1 | 251 | Main website |
| S2 | 450 | Party Rentals & Services |
| S3 | 145 | Careers / Job Vacancies |
| S4 | 40 | Thinkers' quotes |
| S5 | 17 | Cross-page comparison |
| **Total** | **903** | |

- Difficulty: Easy 232 · Medium 494 · Hard 177
- 91 levels · 7 chapters · 44 blocks

---

## 🔧 Tech Stack

- Pure HTML, CSS, JavaScript (no frameworks)
- Web NFC API (progressive enhancement)
- LocalStorage for progress & feedback
- WebP images for optimal loading
- Fully responsive (mobile-first)

---

## 📝 License

© 2026 Advertising & More Sdn. Bhd. All rights reserved.
