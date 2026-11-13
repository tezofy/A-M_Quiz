# Advertising & More — Interactive Quiz

একটি ইন্টার‌্যাক্টিভ কুইজ ওয়েব অ্যাপ — **903টি প্রশ্ন**, 5টি সেকশন, 44টি ব্লক।
গেম মোড (লেভেল, লাইভ, স্ট্রিক, XP) + ব্রাউজ মোড (সব প্রশ্ন খুঁজে দেখা)।

An interactive quiz web app with **903 questions** across 5 sections and 44 blocks.
Game mode (levels, lives, streaks, XP) + Browse mode (search all questions).

---

## 📁 Project Structure / ফাইল কাঠামো

```
advertising-and-more-quiz/
├── index.html                  ← মূল পেজ (splash + app shell)
├── README.md                   ← এই ফাইল
├── css/
│   └── style.css               ← সব স্টাইল (রঙ, লেআউট, অ্যানিমেশন)
├── js/
│   ├── ui-data.js              ← UI টেক্সট/লেবেল + topic art (window.UI_DATA)
│   ├── meta-data.js            ← মেটাডেটা: coverage, quotes, sections
│   ├── questions-s1.js         ← S1 · Main website (251 প্রশ্ন)
│   ├── questions-s2.js         ← S2 · Party Rentals & Services (450 প্রশ্ন)
│   ├── questions-s3.js         ← S3 · Careers / Job Vacancies (145 প্রশ্ন)
│   ├── questions-s4.js         ← S4 · Thinkers' quotes (40 প্রশ্ন)
│   ├── questions-s5.js         ← S5 · Cross-page comparison (17 প্রশ্ন)
│   ├── app.js                  ← মূল লজিক (গেম, ব্রাউজ, রেন্ডারিং)
│   └── splash.js               ← splash স্ক্রিন + sticky stats
└── assets/                     ← সব ইমেজ এখানে
    ├── coffee-cup.png          ← A&M ব্র্যান্ড লোগো
    ├── quiz-brain-icon.png     ← কুইজ আইকন
    ├── topics/                 ← 10টি topic art (web, brands, stats, quotes,
    │                             services, campaigns, contact, faq,
    │                             careers, compare)
    ├── chapters/               ← 7টি chapter art (chapter-1 … chapter-7)
    └── gifts/                  ← gift-art, gift-icon, gift-mystery
```

---

## ✏️ How to Edit / কীভাবে এডিট করবেন

### প্রশ্ন যোগ/বদলানো (Questions)
`js/questions-s1.js` (বা s2–s5) ফাইলে প্রতিটি প্রশ্ন এক লাইনে JSON হিসেবে আছে:

```json
{"block": "S1-01", "section": "S1", "section_title": "S1 · Main website — advertisingandmore.com", "block_title": "Header, navigation and hero", "question": "Which item is NOT in the main site's header navigation?", "options": ["Services", "Contact", "Careers", "Home"], "answer_letter": "C", "answer_text": "Careers", "why": "...", "difficulty": "Easy", "type": "mcq", "source_url": "https://advertisingandmore.com/", "id": "S1-01-Q1", "difficulty_key": "easy"}
```

- `answer_letter`: সঠিক উত্তরের অক্ষর (`A` / `B` / `C` / `D`)
- `why`: ব্যাখ্যা (ঐচ্ছিক — খালি রাখা যায়)
- নতুন প্রশ্ন যোগ করতে: লাইনের শেষে কমা (`,`) দিয়ে নতুন লাইন যোগ করুন

### UI টেক্সট বদলানো (Labels)
`js/ui-data.js` — সব বাটন/লেবেল/মেসেজ এখানে।

### স্টাইল বদলানো (Styles)
`js/../css/style.css` — রঙ, ফন্ট, অ্যানিমেশন সব এখানে।

### লজিক বদলানো (Game logic)
`js/app.js` — গেম ফ্লো, স্কোরিং, popup, টাইমার।

---

## 🚀 Run Locally / লোকালে চালানো

```bash
# যেকোনো static server ব্যবহার করুন
python3 -m http.server 8000
# তারপর ব্রাউজারে খুলুন: http://localhost:8000
```

> ⚠️ `index.html`-এ ডাবল-ক্লিক করে `file://` দিয়ে খুললে কিছু ব্রাউজার
> external JS লোড আটকাতে পারে — তাই local server ব্যবহার করুন।

---

## 🌐 Deploy to GitHub Pages / গিটহাবে পাবলিশ

1. GitHub-এ নতুন রিপোজিটরি তৈরি করুন (যেমন: `advertising-and-more-quiz`)
2. এই ফোল্ডারের সব ফাইল আপলোড করুন (Add file → Upload files)
3. **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `(root)`
4. 1–2 মিনিটে সাইট লাইভ হবে: `https://YOUR-USERNAME.github.io/advertising-and-more-quiz/`

---

## 🎮 Features / ফিচারসমূহ

- **Splash screen** — "Click For Start" দিয়ে শুরু
- **Game mode** — 7টি chapter, লেভেল সিস্টেম, 3টি lives (♥), 30-সেকেন্ড টাইমার
- **Answer popup** — সঠিক হলে সবুজ popup → পরবর্তী প্রশ্ন; ভুল হলে "Try again" popup
- **3D flip card** — প্রশ্ন পেজে icon/logo coin-এর মতো ঘুরবে
- **Rotating stats bar** — Score / Brand / Gift স্লাইড ঘুরবে
- **Browse mode** — 903 প্রশ্ন সার্চ/ফিল্টার করে দেখা
- **Progress save** — localStorage-এ XP, stars, unlock সেভ থাকে

---

## 📊 Quiz Data / প্রশ্নের পরিসংখ্যান

| Section | বিষয় | প্রশ্ন |
|---------|------|-------|
| S1 | Main website — advertisingandmore.com | 251 |
| S2 | Party Rentals & Services | 450 |
| S3 | Careers / Job Vacancies | 145 |
| S4 | Thinkers' quotes | 40 |
| S5 | Cross-page comparison | 17 |
| **মোট** | | **903** |
