declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
        };
        // + інші API
      };
    };
  }
}

export const WebApp = window.Telegram?.WebApp;

// Додати обгортки для зручності
export const initTelegram = () => {
  if (WebApp?.ready) {
    WebApp.ready();
    WebApp.expand();
  }
};
