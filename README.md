# DRIP: Voice-Activated AR Stylist

[![Built with Lens Studio](https://img.shields.io/badge/Built_with-Lens_Studio-yellow.svg)](https://ar.snap.com/lens-studio)
[![Powered by Gen AI](https://img.shields.io/badge/Powered_by-Gen_AI-blue.svg)]()
[![Hackathon Prototype](https://img.shields.io/badge/Status-Hackathon_Prototype-brightgreen.svg)]()

> **The future of retail isn't a frictionless checkout line; it's frictionless visualization.**

DRIP is an autonomous, context-aware Virtual Stylist built for AR Spectacles. By utilizing Voice ML, Gen-AI Garment Transfer, and real-time external data (weather, UV index), DRIP fundamentally eliminates the friction between asking for fashion advice and physically trying it on.

## 🚀 The "Why AR?" Advantage
Current LLMs (like ChatGPT or Gemini) can give you fashion *advice*, but they are blind to your physical body. You have to read text and use your imagination. 

**DRIP solves this using Spatial Computing.**
1. **Frictionless Triggering:** Using continuous Voice ML background listening, DRIP wakes up the moment you mention a location or event. No apps to open, no photos to upload.
2. **Context Mapping:** The system autonomously fetches live weather parameters. If you are going to Mumbai, it detects the 32°C heat and high UV index and optimizes the loadout.
3. **Instant Visualization:** DRIP utilizes simultaneous tracking variables—mapping a Gen-AI Garment Mesh to the spine while snapping polarized optics to the facial rig—building the outfit *on your physical body* in real-time.

## ⚙️ Technical Architecture
This prototype was developed in 48 hours for the Lens Studio Hackathon.

### The Stack
- **Engine:** Lens Studio (Spectacles / AR)
- **Tracking:** Snap `External Body Mesh` (with Depth Occluders) & `Head Binding` via Face Tracking.
- **Audio/VFX:** Mathematical sine-wave driven Holographic UI & buffered `TextToSpeechModule` interactions.

### Live State Machines
The core logic handler (`DripController.ts`) operates a multi-turn state machine:
*   **The Gala Sequence (Multi-Turn Logic):** Showcases the AI's ability to present a baseline constraint (Black Tuxedo), execute a creative override (Silver Blazer), and wait for user confirmation before locking the AR render.
*   **The Mumbai Sequence (Context Logic):** Showcases single-shot environment matching. The AI retrieves real-world constraints (weather limits) and deploys simultaneous Face+Body AR anchors instantly.

## 💻 Running the Demo
1. Open the project in Lens Studio.
2. Initialize the Preview panel and enable Microphone access.
3. **Voice Commands:** Simply say *"Help me find an outfit for the corporate gala"* or *"Help me find an outfit for my trip to Mumbai"*.
4. **Hardware Fallback:** In high-noise environments, the UI features hidden screen-tap parsing (Tap `X < 0.5` for Sequence A; Tap `X > 0.5` for Sequence B).

---
*Built during the 48-Hour AR Innovation Hackathon.*
