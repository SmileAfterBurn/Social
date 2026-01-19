
/**
 * @file Глобальні типи для AI Studio
 * @author Ілля Чернов (SmileAfterBurn)
 */

declare global {
  // Fix: Move AIStudio interface into declare global block to resolve conflicting 'aistudio' property declarations
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  // Fix: Declare google globally so it can be used as a value without window. prefix
  var google: any;

  interface Window {
    // Reference the global AIStudio interface defined above
    aistudio?: AIStudio;
    // Fix: Add google property to Window interface to resolve Property 'google' does not exist errors in MapView.tsx
    google: any;
  }
}

export {};
