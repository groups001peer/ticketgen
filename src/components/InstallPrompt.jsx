import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      setReady(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!ready) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 px-3">
      <div className="bg-white border shadow rounded-xl p-3 flex items-center justify-between">
        <div className="text-sm">Install <span className="font-medium">TicketGen</span> on your device</div>
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-100" onClick={()=>setReady(false)}>Not now</button>
          <button
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white"
            onClick={async ()=>{
              await deferred.prompt();
              setDeferred(null);
              setReady(false);
            }}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
