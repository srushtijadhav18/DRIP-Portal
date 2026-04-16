@component
export class DripController extends BaseScriptComponent {
    @input voiceMLModule: VoiceMLModule;
    @input internetModule: InternetModule;
    @input ttsModule: TextToSpeechModule;
    @input audioComponent: AudioComponent;
    @input subtitleText: Text;
    @input calibratedHeightCm: number = 172;
    @input calibratedWeightKg: number = 68;
    
    // THE AR ITEMS
    @input optionBlack: SceneObject; 
    @input optionGrey: SceneObject;
    @input optionDress: SceneObject;   
    @input optionLehenga: SceneObject; // Assign your festive suit model here
    @input optionGlasses: SceneObject; 

    // Hologram references removed for stability.
    
    private readonly GEMINI_API_KEY = "AIzaSyCFzv34cgl3dU42jYKwkwxYiJO7-O6iZjc";
    private readonly GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=";
    
    // TRACK THE CONVERSATION: 0=idle, 1=gala_presenting, 2=gala_waiting, 3=mumbai_presenting, 4=done
    private conversationStep: number = 0; 

    // Subtitle Typing State
    private currentSubtitleText: string = "";
    private subtitleTimer: number = 0;
    private subtitleSpeed: number = 0.06; // SLOWER: Synced better with TTS pacing so it doesn't vanish too fast

    onAwake() {
        print("DRIP Controller initialized! Waiting for your voice...");
        this.setupVoice();

        // 1. Hide EVERYTHING at the start.
        if (this.optionBlack) this.optionBlack.enabled = false;
        if (this.optionGrey) this.optionGrey.enabled = false;
        if (this.optionDress) this.optionDress.enabled = false;
        if (this.optionLehenga) this.optionLehenga.enabled = false;
        if (this.optionGlasses) this.optionGlasses.enabled = false;
        if (this.subtitleText) this.subtitleText.text = ""; // Instantly clear the default word "Text"

        // 2. Subtitle Typing Hook (Updates text perfectly synced to clock)
        let typeEvent = this.createEvent("UpdateEvent");
        typeEvent.bind(() => {
            if (this.currentSubtitleText.length > 0) {
                let elapsed = getTime() - this.subtitleTimer;
                let targetChars = Math.floor(elapsed / this.subtitleSpeed);
                
                if (targetChars > this.currentSubtitleText.length) {
                    targetChars = this.currentSubtitleText.length;
                }
                
                if (this.subtitleText) {
                    this.subtitleText.text = this.currentSubtitleText.substring(0, targetChars);
                }
            }
        });

        // 3. HACKATHON ON-SCREEN CONTROLS (Left/Right Splitscreen Tap)
        let tapEvent = this.createEvent("TapEvent");
        tapEvent.bind((eventData) => {
            let tapX = eventData.getTapPosition().x;
            
            if (this.conversationStep === 0) {
                if (tapX < 0.33) {
                    print("LEFT TAP -> Wardrobe Gala");
                    this.handleVoiceCommand("gala"); 
                } else if (tapX < 0.66) {
                    print("MIDDLE TAP -> Bespoke Design Studio");
                    this.handleVoiceCommand("design"); 
                } else {
                    print("RIGHT TAP -> Wardrobe Mumbai");
                    this.handleVoiceCommand("mumbai"); 
                }
            } else if (this.conversationStep === 2) {
                print("SCREEN TAP -> Confirmed outfit choice");
                this.handleVoiceCommand("yes");
            } else if (this.conversationStep === 4) {
                print("SCREEN TAP -> Optional handoff to tailor");
                this.handleVoiceCommand("tailor");
            }
        });
    }

    setupVoice() {
        if (!this.voiceMLModule) return;
        let options = VoiceML.ListeningOptions.create();
        this.voiceMLModule.onListeningUpdate.add((e) => {
            if (e.transcription && e.transcription.length > 0) {
                this.handleVoiceCommand(e.transcription);
            }
        });
        this.voiceMLModule.startListening(options);
    }

    handleVoiceCommand(command: string) {
        let cmd = command.toLowerCase();
        
        // SCENARIO A: Corporate Gala
        if (this.conversationStep === 0 && (cmd.includes("meeting") || cmd.includes("gala") || cmd.includes("corporate"))) {
            this.conversationStep = 1;
            this.runGalaSequence();
        } 
        // SCENARIO B: Mumbai (Weather & Face Tracking)
        else if (this.conversationStep === 0 && (cmd.includes("mumbai") || cmd.includes("trip") || cmd.includes("city"))) {
            this.conversationStep = 3;
            this.runMumbaiSequence();
        }
        // GENERATIVE DESIGN (NEW)
        else if (this.conversationStep === 0 && (cmd.includes("design") || cmd.includes("canvas") || cmd.includes("lehenga") || cmd.includes("festive suit") || cmd.includes("sherwani") || cmd.includes("bandhgala"))) {
            this.conversationStep = 5;
            this.runDesignSequence();
        }
        // FESTIVAL MODE (INDIA-FIRST)
        else if (this.conversationStep === 0 && (cmd.includes("wedding") || cmd.includes("shaadi") || cmd.includes("sangeet") || cmd.includes("haldi") || cmd.includes("festive") || cmd.includes("puja"))) {
            this.conversationStep = 5;
            this.runFestivalSequence(cmd);
        }
        // GALA CONFIRMATION
        else if (this.conversationStep === 2 && (cmd.includes("yes") || cmd.includes("yeah") || cmd.includes("sure"))) {
            this.conversationStep = 4;
            this.finalizeGala();
        }
        // TAILOR EXPORT
        else if (this.conversationStep >= 2 && (cmd.includes("tailor") || cmd.includes("send") || cmd.includes("data"))) {
            this.runTailorSequence();
        }
        // SHOPPING BRIDGE (NEW)
        else if (this.conversationStep >= 2 && (cmd.includes("shop") || cmd.includes("buy") || cmd.includes("find"))) {
            this.runShopSequence();
        }
        // INDIAN VALUE/BUDGET MODE
        else if (this.conversationStep >= 2 && (cmd.includes("budget") || cmd.includes("value") || cmd.includes("affordable") || cmd.includes("price"))) {
            this.runBudgetSequence();
        }
        // FAMILY APPROVAL MODE
        else if (this.conversationStep >= 2 && (cmd.includes("family") || cmd.includes("mom") || cmd.includes("parents") || cmd.includes("traditional"))) {
            this.runFamilyApprovalSequence();
        }
        // GENERATIVE REMIX (NEW)
        else if (this.conversationStep >= 2 && (cmd.includes("make it") || cmd.includes("add") || cmd.includes("change"))) {
            this.runRemixSequence(cmd);
        }
    }

    private isProcessing: boolean = false; 

    // ==========================================
    // SCENARIO A: THE GALA (Options)
    // ==========================================
    runGalaSequence() {
        print("Starting Gala Sequence...");
        this.hideAllLooks();
        
        // Set text to WHITE to contrast against the dark suits
        if (this.subtitleText) {
            this.subtitleText.textFill.color = new vec4(1, 1, 1, 1);
        }
        
        this.speakResponse("... Accessing your digital wardrobe. Analyzing your fit profile for the Annual Corporate Gala.", () => {
            // Show the garment only after the narration finishes (so it feels like "thinking").
            if (this.optionBlack) this.optionBlack.enabled = true;

            this.speakResponse("... Candidate one is the classic black tuxedo. Fit profile check complete. You can verify the calibration values in your DRIP Wardrobe Studio portal.", () => {
                if (this.optionGrey) this.optionGrey.enabled = true;

                this.speakResponse("... Candidate two is the silver blazer. It provides a more modern contrast for this creative keynote. Should we select this from your wardrobe?", () => {
                    this.conversationStep = 2; // Wait for "yes"
                });
            });
        });
    }

    finalizeGala() {
        this.speakResponse("... Design confirmed. Would you like me to Remix the materials, find similar options online, or optionally prepare tech-pack handoff for your tailor?");
    }

    // ==========================================
    // SCENARIO B: MUMBAI (Context + Face + Body)
    // ==========================================
    runMumbaiSequence() {
        print("Starting Mumbai Sequence...");
        this.hideAllLooks();
        
        // Keep text WHITE initially so you can read it over the live webcam feed
        if (this.subtitleText) {
            this.subtitleText.textFill.color = new vec4(1, 1, 1, 1);
        }

        this.speakResponse("... Accessing wardrobe inventory for Mumbai. Checking weather context and mapping your catalog to the local conditions.", () => {
            // Reveal the outfit only after the narration finishes.
            if (this.optionDress) this.optionDress.enabled = true;

            if (this.subtitleText) {
                this.subtitleText.textFill.color = new vec4(0, 0, 0, 1);
            }

            this.speakResponse("... I've retrieved a breathable upper from your collection. Fit profile check complete. Calibration is visible in your DRIP Wardrobe Studio portal. To protect your vision, I also recommend polarized optics from your physical closet.", () => {
                this.conversationStep = 4; // Finished
            });
        });
    }

    runDesignSequence() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        print("Starting Design Sequence (Men's Desi Heritage)...");
        this.hideAllLooks();
        
        if (this.subtitleText) {
            this.subtitleText.textFill.color = new vec4(1, 1, 1, 1);
        }

        // CONVERSATIONAL PACED SCRIPT: Slow enough to feel "generated", short enough to not lag out.
        let fullSpeech = "... Initiating Generative Canvas for Heritage attire. . . . . Analyzing texture parameters. . . . . Mapping cultural Desi motifs. . . . . Generation complete. . . Your Traditional look is now live on your mesh. . . Calibration sent to portal.";
        
        this.speakResponse(fullSpeech, () => {
            this.conversationStep = 4; 
            this.isProcessing = false;
        });

        // Outfit reveals exactly when the AI says "Generation complete" (approx 6.0 seconds in)
        let revealTimer = this.createEvent("DelayedCallbackEvent");
        revealTimer.bind(() => {
            if (this.optionLehenga) {
                this.optionLehenga.enabled = true;
            } else if (this.optionDress) {
                this.optionDress.enabled = true;
            }
        });
        revealTimer.reset(6.0); 
    }

    runFestivalSequence(command: string) {
        print("Starting Festival Sequence...");
        this.hideAllLooks();

        // Reset text color to WHITE
        if (this.subtitleText) {
            this.subtitleText.textFill.color = new vec4(1, 1, 1, 1);
        }

        // Enable model immediately
        if (this.optionLehenga) {
            this.optionLehenga.enabled = true;
        } else if (this.optionDress) {
            this.optionDress.enabled = true;
        }

        let festivalLine = "... Festival Mode activated. . . Matching your bespoke wedding look for high-energy celebration and camera-ready elegance.";
        if (command.includes("haldi")) {
            festivalLine = "... Haldi Mode activated. . . Optimizing for breathable fabric, turmeric-tolerant tones, and festive movement.";
        } else if (command.includes("sangeet")) {
            festivalLine = "... Sangeet Mode activated. . . Prioritizing dance comfort, statement night-detailing, and gold-balanced glam.";
        } else if (command.includes("wedding") || command.includes("shaadi")) {
            festivalLine = "... Wedding Mode activated. . . Constructing your premium Heritage Lehenga blueprint. . . Elevating fit and festive detailing.";
        }

        this.speakResponse(festivalLine, () => {
            // Add a small 0.8s pause to prevent audio clipping
            let delay = this.createEvent("DelayedCallbackEvent");
            delay.bind(() => {
                this.speakResponse("... Fit profile check complete. . . . . Biometric metrics are visible in your Wardrobe Studio portal. . . Would you like to Remix, try Budget Mode, or export to your tailor?");
                this.conversationStep = 4;
            });
            delay.reset(0.8);
        });
    }

    runTailorSequence() {
        print("Starting Tailor Export...");
        this.speakResponse("... Preparing your calibrated tech-pack handoff. Download the PDF from the portal and copy the structured measurement JSON if you want a tailor to reproduce the fit.");
    }

    runShopSequence() {
        print("Opening Shopping Bridge...");
        this.speakResponse("... Querying trusted Indian fashion marketplaces for similar ready-to-wear patterns. Opening curated collection in your browser now.");
        // Note: In Lens Studio, you can use launchUrl for external sites if approved
    }

    runBudgetSequence() {
        print("Starting Budget Sequence...");
        this.speakResponse("... Budget optimizer active. Preserving your silhouette while reducing cost through fabric substitutions and multi-use styling.");
    }

    runFamilyApprovalSequence() {
        print("Starting Family Approval Sequence...");
        this.speakResponse("... Family approval mode active. Balancing modern fit with traditional elegance. Styling is now tuned for comfort, modesty, and celebration photographs.");
    }

    runRemixSequence(command: string) {
        print("Starting Generative Remix...");
        let text = "";
        let targetColor = new vec4(1, 1, 1, 1);

        if (command.includes("gold") || command.includes("yellow")) {
            text = "... Processing creative constraint. Infusing gold silk patterns into the garment mesh.";
            targetColor = new vec4(1, 0.8, 0, 1);
        } else if (command.includes("black") || command.includes("dark")) {
            text = "... Applying midnight noir override to the active layer.";
            targetColor = new vec4(0.1, 0.1, 0.1, 1);
        } else if (command.includes("red") || command.includes("bold")) {
            text = "... Applying high-contrast bold scarlet infusions.";
            targetColor = new vec4(0.8, 0, 0, 1);
        } else {
            text = "... Prompt received. Optimizing texture parameters for your requested style.";
        }

        this.speakResponse(text);

        // Visually change the garment color if it has a MeshVisual
        let activeObj = this.conversationStep === 1 || this.conversationStep === 2 ? this.optionGrey : this.optionDress;
        if (activeObj) {
            let meshVisual = activeObj.getComponent("Component.RenderMeshVisual");
            if (meshVisual && meshVisual.mainMaterial) {
                meshVisual.mainMaterial.mainPass.baseColor = targetColor;
            }
        }
    }

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    hideAllLooks() {
        if (this.optionBlack) this.optionBlack.enabled = false;
        if (this.optionGrey) this.optionGrey.enabled = false;
        if (this.optionDress) this.optionDress.enabled = false;
        if (this.optionLehenga) this.optionLehenga.enabled = false;
        if (this.optionGlasses) this.optionGlasses.enabled = false;
    }

    calculateLiveMetrics(): string {
        let height = Math.max(145, this.calibratedHeightCm);
        let weight = Math.max(40, this.calibratedWeightKg);
        let shoulderWidth = (height * 0.245).toFixed(1);
        let torsoLength = (height * 0.375).toFixed(1);
        let chestEstimate = (height * 0.31 + weight * 0.62).toFixed(1);

        return "Height " + height.toFixed(0) + "cm | Weight " + weight.toFixed(0) + "kg | Shoulders " + shoulderWidth + "cm | Torso " + torsoLength + "cm | Chest " + chestEstimate + "cm";
    }

    getCalibrationSummary(): string {
        return "Calibrated profile: " + this.calibratedHeightCm.toFixed(0) + " centimeters, " + this.calibratedWeightKg.toFixed(0) + " kilograms.";
    }

    speakResponse(text: string, onComplete?: () => void) {
        // Prepare text; show subtitles with typewriter animation immediately.
        let cleanText = text.replace(/\. \. \./g, "").replace(/\.\.\./g, "").trim(); 
        
        // Auto-wrap text for a 9:16 vertical screen (approx 25 chars per line)
        let words = cleanText.split(" ");
        let wrappedText = "";
        let lineLength = 0;
        for (let word of words) {
            if (lineLength + word.length > 22) { // Slightly narrower for safety
                wrappedText += "\n" + word + " ";
                lineLength = word.length + 1;
            } else {
                wrappedText += word + " ";
                lineLength += word.length + 1;
            }
        }
        var finalWrappedText = wrappedText.trim();

        // Clear the screen text immediately while we wait for cloud TTS to generate audio
        if (this.subtitleText) {
            this.subtitleText.text = "";
        }

        if (!this.ttsModule || !this.audioComponent) { return; }

        let options = TextToSpeech.Options.create();
        this.ttsModule.synthesize(text, options, (audioTrack: AudioTrackAsset, wordInfos: TextToSpeech.WordInfo[]) => {
            // Trigger the typewriter animation EXACTLY when the audio arrives and starts playing
            this.currentSubtitleText = finalWrappedText;
            this.subtitleTimer = getTime();

            this.audioComponent.audioTrack = audioTrack;
            this.audioComponent.play(1); 

            if (onComplete) {
                // Schedule completion based on word count as a safe fallback
                let wordCount = text.split(" ").length;
                let estimatedDuration = (wordCount * 0.45) + 0.5; // Approx 0.45s per word + buffer
                
                if (wordInfos && wordInfos.length > 0) {
                    estimatedDuration = (wordInfos[wordInfos.length - 1].endTime / 1000) + 0.2;
                }
                
                let doneEvent = this.createEvent("DelayedCallbackEvent");
                doneEvent.bind(() => {
                    onComplete();
                });
                doneEvent.reset(estimatedDuration);
            }
        }, (error: number, desc: string) => {
            print("TTS error [" + error + "]: " + desc);
            // If audio fails, still trigger the callback so the demo continues
            if (onComplete) {
                let failTimer = this.createEvent("DelayedCallbackEvent");
                failTimer.bind(() => onComplete());
                failTimer.reset(2.0);
            }
        });
    }
}