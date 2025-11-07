import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent default mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // If already installed, hide it
    window.addEventListener("appinstalled", () => {
      setVisible(false);
      setDeferredPrompt(null);
    });

    // Optional: if PWA already installed, don’t show button
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setVisible(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("Install prompt not ready. Try again shortly.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg animate-bounce"
      >
        📱 Install App
      </button>
    </div>
  );
}
