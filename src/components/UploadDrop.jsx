// import { useRef, useState } from "react";

// export default function UploadDrop({ value, onChange, requiredW=800, requiredH=400 }) {
//   const fileRef = useRef();
//   const [error, setError] = useState("");

//   const handleFile = async (file) => {
//     setError("");
//     if (!file) return;
//     const img = new Image();
//     img.onload = () => {
//       if (img.width !== requiredW || img.height !== requiredH) {
//         setError(`Image must be exactly ${requiredW}x${requiredH}px`);
//         return;
//       }
//       const url = URL.createObjectURL(file);
//       onChange({ file, preview:url });
//     };
//     img.src = URL.createObjectURL(file);
//   };

//   return (
//     <div className="bg-slate-100 rounded-xl p-6 text-center">
//       {value?.preview ? (
//         <img src={value.preview} alt="" className="w-full rounded-lg mb-3" />
//       ) : (
//         <div className="text-slate-500 text-sm mb-3">Upload Event Banner 800 by 400px</div>
//       )}
//       <div className="flex gap-2 justify-center">
//         <button className="px-3 py-2 bg-blue-600 text-white rounded-lg" onClick={() => fileRef.current.click()}>
//           Choose Image
//         </button>
//         <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e)=>handleFile(e.target.files[0])} />
//         {value ? <button className="px-3 py-2 bg-slate-200 rounded-lg" onClick={()=>onChange(null)}>Remove</button> : null}
//       </div>
//       {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
//     </div>
//   );
// }
























import { useRef, useState } from "react";
import { uploadToCloudinary } from "../lib/cloudinary";

export default function UploadDrop({ value, onChange }) {
  const fileRef = useRef();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Clear internal state when parent clears value
  const clear = () => {
    try {
      if (value?.preview && value.preview.startsWith("blob:")) URL.revokeObjectURL(value.preview);
    } catch (e) {
      console.warn("failed to revoke preview url", e);
    }
    setError("");
    setUploading(false);
  };

  const handleFile = async (file) => {
    setError("");
    if (!file) return;

    // Validate image file (no strict dimension requirement)
    const img = new Image();
    img.onload = async () => {
      // Provide immediate preview + uploading flag to parent (best-effort)
      let previewUrl = null;
      try {
        previewUrl = URL.createObjectURL(file);
        onChange({ preview: previewUrl, uploading: true, fileName: file.name });
      } catch (err) {
        console.warn("preview generation failed", err);
      }

  setUploading(true);
      try {
        const result = await uploadToCloudinary(file, { folder: "ticketgen/banners" });
        // Finalize with Cloudinary response
        onChange({
          preview: result.secure_url,
          cloudinary: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          },
          fileName: file.name,
          uploading: false,
        });
      } catch (e) {
        setError(e?.message || "Upload failed");
        // ensure parent knows upload ended with failure
        onChange({ preview: previewUrl || null, uploading: false, fileName: file.name });
      } finally {
        setUploading(false);
      }
    };
    img.onerror = () => setError("Invalid image file");
    img.src = URL.createObjectURL(file);
  };

  // remove handler
  const remove = () => {
    try {
      if (value?.preview && value.preview.startsWith("blob:")) URL.revokeObjectURL(value.preview);
    } catch (e) {
      console.warn("failed to revoke preview url", e);
    }
    onChange(null);
    clear();
  };

  return (
    <div className="bg-slate-100 rounded-xl p-6 text-center">
      {value?.preview ? (
        <img src={value.preview} alt="banner preview" className="w-full rounded-lg mb-3" />
      ) : (
        <div className="text-slate-500 text-sm mb-3">Upload Event Banner 800 by 400px</div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          type="button"
          className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Choose Image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e)=>handleFile(e.target.files?.[0])}
        />
        {value ? (
          <button
            type="button"
            className="px-3 py-2 bg-slate-200 rounded-lg"
            onClick={remove}
            disabled={uploading}
          >
            Remove
          </button>
        ) : null}
      </div>

      {value?.cloudinary?.publicId && (
        <div className="text-[11px] text-slate-500 mt-2">
          Saved: <span className="font-mono">{value.cloudinary.publicId}</span>
        </div>
      )}
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
}
