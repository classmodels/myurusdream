export async function compressLogo(file: File) {
  const bitmap = await createImageBitmap(file);
  const origW = bitmap.width;
  const origH = bitmap.height;
  const max = 1600;
  const scale = Math.min(1, max / Math.max(origW, origH));
  const w = Math.max(1, Math.round(origW * scale));
  const h = Math.max(1, Math.round(origH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas niet beschikbaar");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.88),
    width: origW,
    height: origH,
    aspect: origW / Math.max(1, origH),
  };
}
