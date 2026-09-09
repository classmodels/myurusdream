export const PIXEL_IMAGE_PATH =
  /^\/(?:uploads|api\/media)\/pixels\/[a-zA-Z0-9._-]+\.(jpe?g|png|webp)$/i;

export function isSafePixelImageUrl(value: string | null | undefined) {
  return !!value && PIXEL_IMAGE_PATH.test(value);
}
