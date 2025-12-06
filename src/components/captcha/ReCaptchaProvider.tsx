import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import type { JSX } from "react";

interface ReCaptchaContextType {
  executeRecaptcha: (action: string) => Promise<string | null>;
  isReady: boolean;
}

const ReCaptchaContext = createContext<ReCaptchaContextType | undefined>(undefined);

interface ReCaptchaProviderProps {
  children: ReactNode;
  siteKey: string;
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function ReCaptchaProvider({ children, siteKey }: ReCaptchaProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Skip loading if site key is not provided (for development)
    if (!siteKey || siteKey.trim() === "") {
      console.warn("reCAPTCHA site key not provided. Skipping reCAPTCHA initialization.");
      setIsReady(false);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="recaptcha"]`);
    if (existingScript) {
      // Script already loaded, just set ready
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
        });
      }
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
        });
      }
    };

    script.onerror = () => {
      console.error("Failed to load reCAPTCHA script");
      setIsReady(false);
    };

    return () => {
      // Cleanup script on unmount (only if we created it)
      // Note: We don't remove it if it was already there
    };
  }, [siteKey]);

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    // If site key is not provided, return null (for development)
    if (!siteKey || siteKey.trim() === "") {
      return null;
    }

    if (!isReady || !window.grecaptcha) {
      console.warn("reCAPTCHA not ready");
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error("Error executing reCAPTCHA:", error);
      return null;
    }
  };

  return (
    <ReCaptchaContext.Provider value={{ executeRecaptcha, isReady }}>
      {children}
    </ReCaptchaContext.Provider>
  ) as JSX.Element;
}

export function useReCaptcha() {
  const context = useContext(ReCaptchaContext);
  // Return default values if provider is not available (for development)
  if (context === undefined) {
    return {
      executeRecaptcha: async () => {
        console.warn("ReCaptchaProvider not available, skipping reCAPTCHA");
        return null;
      },
      isReady: false,
    };
  }
  return context;
}
