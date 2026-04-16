# DRIP 
**The Phygital AI Stylist Ecosystem**

DRIP bridges the gap between digital AR discovery and physical bespoke tailoring. Unlike standard AR applications that trap users in a phone screen, DRIP leverages the ambient computing power of Snap Spectacles to track biometrics and understand conversational context. It then bridges this data to the **DRIP Wardrobe Studio**—a professional web interface that utilizes live weather conditions and Generative AI to handoff precise fabric instructions to a local tailor via WhatsApp.

---

## Features

### 1. Zero-UI AR Fashion Core (Snap Spectacles)
- **Voice-Activated Context Engine:** Uses Lens Studio VoiceML to understand design intent. Try saying: *"Design a look for a corporate gala"* vs. *"Design a traditional wedding outfit"*.
- **Live Biometric Overlay:** Maps garments directly to the user's body mesh in real-time.
- **Ambient TTS Pacing:** Custom pacing algorithm simulates AI "thought processes," giving the experience an industrial-grade narrative feel.

### 2. DRIP Wardrobe Studio (Web Portal)
- **Live Weather Integration:** Analyzes the wearer's real location using `Open-Meteo` to recommend fabric properties (e.g., advising breathable Muslin dynamically when local humidity exceeds 70%).
- **AI Bespoke Tech-Pack:** Uses Gemini 1.5 Flash to automatically translate conversational intent ("hackathon startup event") into a structured PDF/JSON technical garment brief (Zari threadwork, super 110s wool, etc.).
- **Offline Resilient:** If network capabilities drop, DRIP falls back to a custom semantic edge-engine, ensuring the demo or professional pitch *never* breaks.

### 3. The "Phygital" Tailor Bridge
- **1-Click WhatsApp Handoff:** Instantly formats all body metrics, silhouettes, and AI tailor notes, packaging them seamlessly into a pre-filled `wa.me` handoff link.
- **Democratizing Bespoke:** Gives small-scale tailors an "API-like" digital bridge to Gen-Z consumers.

---

## Tech Stack
- **Hardware:** Snap Spectacles
- **AR Software:** Snap Lens Studio (TypeScript, VoiceML, Text-to-Speech Module, Body Tracking)
- **Portal Core:** HTML5, Vanilla JS, CSS Glassmorphism
- **Intelligence:** Google Gemini 1.5 Flash (Generative Language API)
- **Environment Context:** Open-Meteo REST API

---

## Running the Project

### AR Lens
1. Open the `.lsproj` file in Snap Lens Studio.
2. Pair your Spectacles via the Lens Studio connection flow.
3. Click **"Push to Device"**.
4. Tap the spectacle frame and speak your intent.

### Wardrobe Portal
1. Open `index.html` in any modern web browser (no local server required).
2. Allow Location Services to enable live weather/fabric context matching.
3. Use the **AI Generation** tab and try sending a brief via the WhatsApp bridge.

---

## Why We Built This

The multi-billion dollar bespoke tailoring industry in India, and globally, operates via pen and paper. Meanwhile, large fast-fashion brands use tech to push generic scale. **DRIP** brings the precision of AR tech, the intelligence of LLMs, and the ambient accessibility of Spectacles directly to the localized bespoke workflow. 

**From AR vision to physical creation in 60 seconds.**
