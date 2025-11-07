import { useRef, useState } from "react";

export default function UploadDrop({ value, onChange, requiredW=800, requiredH=400 }) {
  const fileRef = useRef();
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    setError("");
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      if (img.width !== requiredW || img.height !== requiredH) {
        setError(`Image must be exactly ${requiredW}x${requiredH}px`);
        return;
      }
      const url = URL.createObjectURL(file);
      onChange({ file, preview:url });
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="bg-slate-100 rounded-xl p-6 text-center">
      {value?.preview ? (
        <img src={value.preview} alt="" className="w-full rounded-lg mb-3" />
      ) : (
        <div className="text-slate-500 text-sm mb-3">Upload Event Banner 800 by 400px</div>
      )}
      <div className="flex gap-2 justify-center">
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg" onClick={() => fileRef.current.click()}>
          Choose Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e)=>handleFile(e.target.files[0])} />
        {value ? <button className="px-3 py-2 bg-slate-200 rounded-lg" onClick={()=>onChange(null)}>Remove</button> : null}
      </div>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
}
