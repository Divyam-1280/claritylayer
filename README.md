# ClarityLayer

A Gemini-powered AI interface that wraps every response with a real-time reasoning audit panel, helping users evaluate, question, and calibrate their trust in AI-generated outputs.

![ClarityLayer](https://img.shields.io/badge/Powered%20by-Gemini-blue)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Your API Key

Create a `.env.local` file in the root of the project (or edit the existing one):

```
GEMINI_API_KEY=your_key_here
```

Get your API key from: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Features

- **Dual Gemini Calls**: Every query triggers two AI calls — one for the response, one for structured audit analysis
- **Confidence Scoring**: Animated confidence bar with color-coded scoring (red/amber/green)
- **4 Audit Categories**: Assumptions, Uncertain Claims, Gaps, and Alternative Perspectives
- **Inline Highlighting**: Flagged phrases are highlighted directly in the response text
- **Refine Modal**: Add your personal context to re-evaluate the AI output
- **Responsive Design**: Full desktop/tablet/mobile support

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Font**: Geist
- **AI**: Google Gemini API (gemini-2.0-flash)
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Project Structure

```
/app
  /page.tsx                 # Main UI
  /api
    /gemini/route.ts        # User query endpoint
    /analyse/route.ts       # Audit analysis endpoint
/components
  /SearchBar.tsx            # Pill-shaped search input
  /ResponsePanel.tsx        # Left panel (AI response)
  /ClarityPanel.tsx         # Right panel (audit)
  /ConfidenceBar.tsx        # Animated confidence display
  /AccordionSection.tsx     # Reusable audit accordion
  /RefineModal.tsx          # Context refinement modal
  /InlinePills.tsx          # Inline phrase highlighting
/lib
  /gemini.ts                # Gemini client setup
  /analyseText.ts           # Audit prompt builder
  /types.ts                 # TypeScript interfaces
  /utils.ts                 # Utility functions
```
