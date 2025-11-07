export default function Support(){
  const tg = () => window.open("https://t.me/", "_blank", "noopener");
  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-lg font-semibold mb-3">Contact Support</h1>
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <p className="text-sm text-slate-600">We handle support on Telegram only.</p>
        <button className="w-full py-3 bg-blue-600 text-white rounded-lg" onClick={tg}>
          Open Telegram
        </button>
      </div>
    </div>
  );
}
