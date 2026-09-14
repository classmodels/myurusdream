"use client";

import Image, { type ImageProps } from "next/image";
import { withBasePath } from "@/lib/base-path";

/**
 * next/image + basePath: optimizer krijgt ?url=/foto.png → 400.
 * Unoptimized + expliciete basePath in src → /portaal/.../foto.png (200).
 */
export function AssetImage({ src, alt, unoptimized, ...rest }: ImageProps) {
  const isLocal = typeof src === "string" && src.startsWith("/");
  const resolved = typeof src === "string" ? withBasePath(src) : src;
  return <Image {...rest} alt={alt} src={resolved} unoptimized={unoptimized ?? isLocal} />;
}
