import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

type GoogleLoginButtonProps = {
  onSuccess: (credential: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const loadGoogleScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Google script failed to load"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed to load"));
    document.body.appendChild(script);
  });

function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || disabled) return;

    let mounted = true;

    const setup = async () => {
      try {
        await loadGoogleScript();
        if (!mounted || !buttonRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              onSuccess(response.credential);
              return;
            }
            onError?.("Google sign-in did not return a credential.");
          },
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
        });
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : "Google sign-in could not be loaded"
        );
      }
    };

    void setup();

    return () => {
      mounted = false;
    };
  }, [disabled, onError, onSuccess]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-xs text-neutral-500">
        Google login ke liye <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> set karein.
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      <div ref={buttonRef} className="min-h-[44px]" />
    </div>
  );
}

export default GoogleLoginButton;
