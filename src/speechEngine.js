/**
 * Browser-native Text-to-Speech Engine supporting English & Hindi
 */
class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = this.synth.getVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth.getVoices();
        };
      }
    }
  }

  speak(text, language = 'English', onEndCallback) {
    if (!this.synth) return;

    // Stop any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set pitch & rate for natural classroom cadence
    utterance.rate = 0.95; 
    utterance.pitch = 1.0;

    // Match voice language
    const langCode = language.toLowerCase() === 'hindi' ? 'hi-IN' : 'en-US';
    utterance.lang = langCode;

    // Find best matching voice if available
    const matchedVoice = this.voices.find((voice) => voice.lang.includes(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechEngine = new SpeechEngine();