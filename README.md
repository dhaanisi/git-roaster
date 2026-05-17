# 🔥 git-roaster

> **"Your code shame, publicly archived."**

An AI-powered web application that analyzes public GitHub profiles and uses advanced LLMs to brutally roast code life choices, repository names, and tech stack configurations. 

Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**, the app utilizes **Next.js Edge Runtime** to stream custom burns directly to the user's screen in real time.

---

## ✨ Features

- **Real-Time Text Streaming:** Leverages serverless Web Streams to pipe the AI's response token-by-token for a dynamic, retro-terminal typing effect.
- **Granular Tech Stack Auditing:** Automatically parses repositories to identify dominant languages, judge empty descriptions, and evaluate public repository metrics.
- **Variable Intensity Tiers:** Let users pick their preferred burn level using adjustable input chips:
  - 🌶 **Mild:** Sarcastic but gentle critiques.
  - 🔥 **Brutal:** Heavy developer-centric roasts.
  - 💀 **Savage:** Unforgiving, unfiltered reality checks.
- **Dynamic Scoring Display:** Generates a custom evaluation heat bar and numerical code rating system.
- **Social Sharing Integrations:** Quick one-click native clipboard copy and Twitter/X Web Intent triggers for organic viral sharing.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15+ (App Router, Edge Runtime)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Styled-JSX modules
- **AI Core:** Google Gen AI SDK (`gemini-2.5-flash`)
- **Data Ingestion:** GitHub REST API

---

## 🏗 Directory Architecture

```text
git-roaster/
├── src/
│   └── app/
│       ├── api/
│       │   └── roast/
│       │       └── route.ts  # Edge API Endpoint (Fetches data & orchestrates stream)
│       ├── globals.css       # Core styling setup
│       ├── layout.tsx        # HTML structure & baseline font configurations
│       └── page.tsx          # Main user dashboard interface & stream consumption
├── components/               # Custom presentation components and inline SVGs
├── services/                 # Layered business logic
│   ├── github.ts             # GitHub profile and repository normalization engine
│   └── ai.ts                 # Prompt engineering and Gemini stream initialization
├── public/                   # Static application assets
├── .env.local                # Local developer credentials (git-ignored)
└── package.json              # Project dependencies
```
---

## Clone the respository

git clone [https://github.com/dhaanisi/git-roaster.git] (https://github.com/dhaanisi/git-roaster.git)
cd git-roaster
---

## Install dependencies
npm install
---


