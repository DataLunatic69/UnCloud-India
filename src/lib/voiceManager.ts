// Global voice manager to prevent conflicts and ensure proper cleanup
class VoiceManager {
  private static instance: VoiceManager;
  private currentController: AbortController | null = null;
  private isActive = false;

  private constructor() {}

  static getInstance(): VoiceManager {
    if (!VoiceManager.instance) {
      VoiceManager.instance = new VoiceManager();
    }
    return VoiceManager.instance;
  }

  startVoice(controller: AbortController): boolean {
    // Stop any existing voice first
    this.stopVoice();
    
    this.currentController = controller;
    this.isActive = true;
    return true;
  }

  stopVoice(): void {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }
    speechSynthesis.cancel();
    this.isActive = false;
  }

  isVoiceActive(): boolean {
    return this.isActive;
  }

  // Global cleanup - called when navigating away from the app
  cleanup(): void {
    this.stopVoice();
  }
}

export const voiceManager = VoiceManager.getInstance();

// Add global cleanup listener
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    voiceManager.cleanup();
  });
}