export const CLOUDINARY_CLOUD_NAME = "ddtywi2du";
export const CLOUDINARY_UPLOAD_PRESET = "TicketGen";

/**
 * Upload a file to Cloudinary (unsigned).
 * Returns: { secure_url, public_id, width, height, ... }
 */
export async function uploadToCloudinary(file, { folder } = {}) {
    console.log(  CLOUDINARY_CLOUD_NAME,CLOUDINARY_UPLOAD_PRESET)
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary env vars missing");
  }
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  if (folder) fd.append("folder", folder);

  // These are controlled by your preset (you set overwrite:false, unique_filename:false, etc.)
  // No API key/secret needed for unsigned.

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  return await res.json();
}
