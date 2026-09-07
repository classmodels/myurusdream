"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent, type PointerEvent } from "react";
import {
  PIXEL_COLS,
  PIXEL_ROWS,
  PIXEL_CELL_CENTS,
  PIXEL_TITLE_RESERVE,
  makePixelSize,
  pixelOrderHref,
  pixelOverlapsTitleReserve,
  pixelPriceCents,
  rectsOverlap,
  withoutTitleReserveAds,
  type OccupiedPixel,
  type PixelSize,
} from "@/lib/sponsors";
import { formatCents } from "@/lib/money";
import { compressLogo } from "@/lib/compress-logo";
import { LegalChecks } from "../sponsors/SponsorForm";

type Props = {
  blockedReason: string | null;
  goalFailureText: string | null;
  mollieReady: boolean;
  initialOccupied: OccupiedPixel[];
  orderable?: boolean;
  fullBleed?: boolean;
};

type Cell = { x: number; y: number };
type Peek = { block: OccupiedPixel; x: number; y: number };

function PixelAdPeek({
  label,
  caption,
  image,
  className = "",
  style,
}: {
  label: string;
  caption?: string | null;
  image?: string | null;
  className?: string;
  style?: CSSProperties;
}) {
  const title = label.trim() || "Uw titel";
  return (
    <div
      className={`w-[min(280px,calc(100vw-1.5rem))] border border-yellow bg-black p-3 shadow-[0_0_40px_rgba(255,209,0,0.28)] ${className}`}
      style={style}
    >
      <div className="flex h-36 items-center justify-center bg-[#111]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="max-h-full max-w-full object-contain p-2" />
        ) : (
          <p className="px-3 text-center font-display text-2xl text-yellow">{title}</p>
        )}
      </div>
      {image ? <p className="mt-2 text-center font-display text-lg text-yellow">{title}</p> : null}
      {caption?.trim() ? (
        <p className="mt-1 text-center text-sm text-white/75">{caption.trim()}</p>
      ) : null}
    </div>
  );
}

function clampCell(x: number, y: number): Cell {
  return {
    x: Math.max(0, Math.min(PIXEL_COLS - 1, x)),
    y: Math.max(0, Math.min(PIXEL_ROWS - 1, y)),
  };
}

function rectFromCells(a: Cell, b: Cell) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.min(Math.abs(a.x - b.x) + 1, PIXEL_COLS - x);
  const h = Math.min(Math.abs(a.y - b.y) + 1, PIXEL_ROWS - y);
  return { x, y, w, h };
}

export function PixelWall({
  blockedReason,
  initialOccupied,
  orderable = true,
  fullBleed = false,
}: Props) {
  const wallRef = useRef<HTMLDivElement>(null);
  const [occupied, setOccupied] = useState(initialOccupied);
  const [size, setSize] = useState<PixelSize>(() => makePixelSize(1, 1));
  const [origin, setOrigin] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [dragStart, setDragStart] = useState<Cell | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Cell | null>(null);
  const [peek, setPeek] = useState<Peek | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [simulateId, setSimulateId] = useState<string | null>(null);
  const [color, setColor] = useState("#111111");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState("");
  const [adCaption, setAdCaption] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/pixels")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.occupied) && d.occupied.length) {
          setOccupied(withoutTitleReserveAds(d.occupied));
        }
      })
      .catch(() => {});
  }, []);

  const dragRect = dragStart && dragCurrent ? rectFromCells(dragStart, dragCurrent) : null;
  const preview = origin || hover;
  const previewRect = preview ? { x: preview.x, y: preview.y, w: size.w, h: size.h } : null;
  const placeRect = dragRect || (origin ? { x: origin.x, y: origin.y, w: size.w, h: size.h } : previewRect);
  const placeCents = placeRect ? pixelPriceCents(placeRect.w, placeRect.h) : pixelPriceCents(size.w, size.h);
  const previewOk =
    !!placeRect &&
    placeRect.x + placeRect.w <= PIXEL_COLS &&
    placeRect.y + placeRect.h <= PIXEL_ROWS &&
    !occupied.some((o) => rectsOverlap(placeRect, o)) &&
    !pixelOverlapsTitleReserve(placeRect);

  const occupiedCells = useMemo(() => {
    return occupied
      .filter((block) => !pixelOverlapsTitleReserve(block))
      .map((block) => ({ x: block.x, y: block.y, block }));
  }, [occupied]);

  function applySize(next: PixelSize, spot: { x: number; y: number }) {
    setSize(next);
    setOrigin(spot);
  }

  function cellAt(e: PointerEvent<HTMLDivElement>): Cell | null {
    const el = wallRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * PIXEL_COLS);
    const y = Math.floor(((e.clientY - r.top) / r.height) * PIXEL_ROWS);
    if (x < 0 || y < 0 || x >= PIXEL_COLS || y >= PIXEL_ROWS) return null;
    return clampCell(x, y);
  }

  function cellInTitleReserve(cell: Cell) {
    return pixelOverlapsTitleReserve({ x: cell.x, y: cell.y, w: 1, h: 1 });
  }

  function onWallPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!orderable) return;
    if (e.pointerType !== "touch" && e.pointerType !== "pen" && e.button !== 0 && e.button !== 2) return;
    if ((e.target as HTMLElement).closest("[data-pixel-block], [data-pixel-reserve]")) return;
    const cell = cellAt(e);
    if (!cell || cellInTitleReserve(cell)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setPeek(null);
    setDragStart(cell);
    setDragCurrent(cell);
  }

  function onWallPointerMove(e: PointerEvent<HTMLDivElement>) {
    const cell = cellAt(e);
    if (dragStart) {
      if (cell && !cellInTitleReserve(cell)) setDragCurrent(cell);
      return;
    }
    if (
      cell &&
      orderable &&
      !cellInTitleReserve(cell) &&
      !(e.target as HTMLElement).closest("[data-pixel-block], [data-pixel-reserve]")
    ) {
      setHover(cell);
    } else if (!dragStart) {
      setHover(null);
    }
  }

  function onWallPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragStart) return;
    const end = dragCurrent || cellAt(e) || dragStart;
    const rect = rectFromCells(dragStart, end);
    setDragStart(null);
    setDragCurrent(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (pixelOverlapsTitleReserve(rect)) return;
    applySize(makePixelSize(rect.w, rect.h), { x: rect.x, y: rect.y });
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      const compressed = await compressLogo(file);
      const res = await fetch("/api/pixels/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Logo uploaden mislukte.");
        return;
      }
      setLogoUrl(data.url);
      setLogoPreview(compressed.dataUrl);
      setLogoName(file.name);
      setStatus("Logo geplaatst. Tik of sleep op de muur hoe groot het vak moet zijn.");
    } catch {
      setStatus("Dit bestand kon niet als logo worden gelezen. Probeer JPG of PNG.");
    } finally {
      setBusy(false);
    }
  }

  function clearLogo() {
    setLogoUrl(null);
    setLogoPreview(null);
    setLogoName(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
    setStatus("Logo gewist. U kunt een ander bestand kiezen.");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!origin) {
      setStatus("Selecteer eerst vakken op de muur (tik of klik, houd vast en sleep).");
      return;
    }
    if (!previewOk) {
      setStatus("Die plek is te klein of al ingenomen.");
      return;
    }
    setBusy(true);
    setStatus(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      kind: "pixel",
      email: String(form.get("email")),
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName")),
      phone: String(form.get("phone")),
      vatNumber: String(form.get("vatNumber")),
      invoiceCompany: String(form.get("invoiceCompany")),
      address: String(form.get("address")),
      company: String(form.get("company")),
      url: String(form.get("url") || ""),
      pixelPackageId: size.id,
      pixelX: origin.x,
      pixelY: origin.y,
      pixelW: size.w,
      pixelH: size.h,
      pixelColor: color,
      pixelLabel: String(form.get("pixelLabel") || "").trim(),
      pixelImage: logoUrl || "",
      acceptTerms: form.get("acceptLegal") === "on",
      acceptPrivacy: form.get("acceptLegal") === "on",
      acceptCampaign: form.get("acceptLegal") === "on",
    };
    const res = await fetch("/api/checkout/ad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Er ging iets mis.");
      return;
    }
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    if (data.simulate) {
      setSimulateId(data.paymentId);
      setStatus(data.notice);
    }
  }

  async function simulate() {
    if (!simulateId) return;
    setBusy(true);
    const res = await fetch("/api/checkout/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: simulateId }),
    });
    const data = await res.json();
    if (data.redirect) window.location.href = data.redirect;
    else {
      setBusy(false);
      setStatus(data.error || "Simulatie mislukt.");
    }
  }

  const cents = pixelPriceCents(size.w, size.h);
  const showSelectLabel = !!placeRect;

  return (
    <div className="space-y-8">
      <div className="mb-4 flex flex-col items-center gap-3 px-1 text-center md:hidden">
        {fullBleed ? (
          <h1 className="pixelwall-title font-display text-4xl leading-none">De Pixelwall</h1>
        ) : (
          <p className="pixelwall-title font-display text-4xl leading-none">De Pixelwall</p>
        )}
        {orderable ? (
          <p className="max-w-md text-sm text-white/70">
            Tik en sleep op de muur om vakken te kiezen. Vanaf {formatCents(PIXEL_CELL_CENTS)} per vak.
          </p>
        ) : (
          <Link href={pixelOrderHref()} className="btn-yellow !px-8 !py-2 !text-[0.7rem]">
            Koop pixels vanaf {formatCents(PIXEL_CELL_CENTS)}
          </Link>
        )}
      </div>
      <div className={`overflow-x-clip border border-white/10 bg-black ${fullBleed ? "p-1 sm:p-2" : "p-2 md:p-3"}`}>
        <div
          ref={wallRef}
          className={`pixel-wall select-none w-full min-w-0 ${orderable ? "touch-none" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${PIXEL_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${PIXEL_ROWS}, minmax(0, 1fr))`,
            aspectRatio: `${PIXEL_COLS} / ${PIXEL_ROWS}`,
            backgroundImage: `linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)`,
            backgroundSize: `calc(100% / ${PIXEL_COLS}) calc(100% / ${PIXEL_ROWS})`,
            backgroundColor: "#141414",
            gap: 0,
          }}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={onWallPointerDown}
          onPointerMove={onWallPointerMove}
          onPointerUp={onWallPointerUp}
          onPointerCancel={() => {
            setDragStart(null);
            setDragCurrent(null);
          }}
          onMouseLeave={() => {
            if (!dragStart) {
              setHover(null);
              setPeek(null);
            }
          }}
        >
          {occupiedCells.map((c) => {
            const block = c.block;
            const style: CSSProperties = {
              gridColumn: `${c.x + 1} / span ${block.w}`,
              gridRow: `${c.y + 1} / span ${block.h}`,
              background: block.color,
            };
            const className =
              "relative z-[1] flex items-center justify-center overflow-hidden px-px text-center font-display text-[0.4rem] leading-tight text-black sm:text-[0.5rem]";
            const inner = (
              <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
                {block.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.image}
                    alt={block.label}
                    className="h-full w-full object-contain p-px"
                  />
                ) : (
                  <>
                    <span className="px-0.5 leading-tight">{block.label}</span>
                    {block.caption ? (
                      <span className="mt-px px-0.5 font-sans text-[0.35rem] font-medium normal-case tracking-normal text-black/70 sm:text-[0.42rem]">
                        {block.caption}
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            );
            const hoverHandlers = {
              onMouseEnter: (e: MouseEvent) =>
                setPeek({ block, x: e.clientX, y: e.clientY }),
              onMouseMove: (e: MouseEvent) =>
                setPeek({ block, x: e.clientX, y: e.clientY }),
              onMouseLeave: () => setPeek(null),
            };
            if (block.url) {
              return (
                <a
                  key={`${c.x}-${c.y}`}
                  data-pixel-block=""
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  title={block.label}
                  className={className}
                  style={style}
                  {...hoverHandlers}
                >
                  {inner}
                </a>
              );
            }
            return (
              <div
                key={`${c.x}-${c.y}`}
                data-pixel-block=""
                title={block.label}
                className={className}
                style={style}
                {...hoverHandlers}
              >
                {inner}
              </div>
            );
          })}
          <div
            data-pixel-reserve=""
            className="relative z-20 flex flex-col items-center justify-start bg-black px-2 pb-1 pt-1"
            style={{
              gridColumn: `${PIXEL_TITLE_RESERVE.x + 1} / span ${PIXEL_TITLE_RESERVE.w}`,
              gridRow: `${PIXEL_TITLE_RESERVE.y + 1} / span ${PIXEL_TITLE_RESERVE.h}`,
            }}
          >
            {fullBleed ? (
              <h1 className="pixelwall-title hidden whitespace-nowrap font-display text-4xl leading-none md:block md:text-6xl">
                De Pixelwall
              </h1>
            ) : (
              <p className="pixelwall-title hidden whitespace-nowrap font-display text-4xl leading-none md:block md:text-6xl">
                De Pixelwall
              </p>
            )}
            {!orderable ? (
              <Link
                href={pixelOrderHref()}
                className="btn-yellow mt-3 hidden shrink-0 !px-8 !py-2 !text-[0.7rem] md:inline-flex"
              >
                Koop piksels
              </Link>
            ) : (
              <span className="btn-yellow mt-3 hidden shrink-0 !px-8 !py-2 !text-[0.7rem] md:inline-flex">
                Koop piksels
              </span>
            )}
          </div>
          {placeRect ? (
            <div
              className={`pixel-select-overlay ${previewOk ? "pixel-select-ok" : "pixel-select-bad"}`}
              style={{
                gridColumn: `${placeRect.x + 1} / span ${placeRect.w}`,
                gridRow: `${placeRect.y + 1} / span ${placeRect.h}`,
                background: logoPreview || logoUrl ? color : undefined,
              }}
            >
              {logoPreview || logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview || logoUrl || ""}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain p-px"
                />
              ) : null}
              {showSelectLabel ? (
                placeRect.h < 2 ? (
                  <p
                    className="relative z-[1] px-px text-center font-display font-semibold leading-none"
                    style={{ fontSize: "clamp(0.28rem, min(42cqh, 16cqw), 0.85rem)" }}
                  >
                    {placeRect.w}×{placeRect.h} {formatCents(placeCents)}
                  </p>
                ) : (
                  <div className="relative z-[1] flex max-h-full flex-col items-center justify-center px-px text-center leading-none">
                    <p
                      className="font-display"
                      style={{ fontSize: "clamp(0.32rem, min(28cqh, 18cqw), 1.15rem)" }}
                    >
                      {placeRect.w}×{placeRect.h}
                    </p>
                    <p
                      className="font-semibold"
                      style={{ fontSize: "clamp(0.28rem, min(22cqh, 16cqw), 0.95rem)" }}
                    >
                      {formatCents(placeCents)}
                    </p>
                  </div>
                )
              ) : null}
            </div>
          ) : null}
        </div>
        {!fullBleed ? (
        <p className="mt-3 px-1 text-[10px] uppercase tracking-wide text-white/45 sm:text-xs sm:tracking-widest">
          vanaf {formatCents(PIXEL_CELL_CENTS)} per vak
          {orderable ? " · tik of klik en sleep over de vakken die u wilt kopen" : ""}
        </p>
        ) : null}
      </div>

      {peek ? (
        <PixelAdPeek
          className="pointer-events-none fixed z-50"
          label={peek.block.label}
          caption={peek.block.caption}
          image={peek.block.image}
          style={{
            left: Math.min(
              peek.x + 18,
              typeof window !== "undefined" ? Math.max(8, window.innerWidth - 292) : peek.x,
            ),
            top: Math.min(peek.y + 18, typeof window !== "undefined" ? window.innerHeight - 220 : peek.y),
          }}
        />
      ) : null}

      {orderable ? (
      <form onSubmit={onSubmit} className="card-dark pixel-form space-y-3 p-4 sm:p-5">
        <p className="font-display text-sm tracking-wide text-yellow sm:text-base">Koop uw pixels</p>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <label htmlFor="logo">Logo</label>
              <div className="relative mt-1 flex flex-wrap items-center gap-2">
                <input
                  ref={logoInputRef}
                  id="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="logo-file-native"
                  onChange={(e) => onLogo(e.target.files?.[0])}
                />
                <label htmlFor="logo" className="logo-file-btn">
                  {logoName ? "Ander logo" : "Kies logo"}
                </label>
                {logoPreview || logoName ? (
                  <button type="button" className="logo-file-clear" onClick={clearLogo}>
                    Wissen
                  </button>
                ) : null}
                <span className="min-w-0 text-[9px] leading-none tracking-wide text-white/45 sm:whitespace-nowrap">
                  {logoName ? logoName : "Geen bestand gekozen"}
                  {" · "}
                  JPG, PNG of WebP
                </span>
              </div>
            </div>
            <div className="min-w-0 sm:ml-[70px]">
              <label htmlFor="pixelColor">Kleur van het vak</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="pixelColor"
                  type="color"
                  className="shrink-0"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  title="Achtergrondkleur van uw vak, zichtbaar zonder logo"
                />
                <span className="min-w-0 text-[9px] leading-none tracking-wide text-white/45 sm:whitespace-nowrap">
                  De vakkleur is de achtergrond als er geen logo is.
                </span>
              </div>
            </div>
          </div>
          {logoPreview ? (
            <div className="mt-2 flex h-14 w-20 items-center justify-center border border-white/15 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
            </div>
          ) : null}
        </div>

        <div className="border border-yellow/40 bg-black/40 p-2.5">
          <p className="text-[8px] uppercase tracking-[0.16em] text-yellow">Gekozen plek</p>
          {origin || dragRect ? (
            <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <p className="text-[0.7rem] text-white/80">
                Kolom {(placeRect?.x ?? origin?.x ?? 0) + 1}, rij {(placeRect?.y ?? origin?.y ?? 0) + 1}
                {" · "}
                {placeRect?.w ?? size.w}×{placeRect?.h ?? size.h} vakken
                {!previewOk ? (
                  <span className="text-yellow"> — plek bezet of ongeldig</span>
                ) : null}
              </p>
              <p className="font-display text-sm text-yellow">{formatCents(placeCents)}</p>
            </div>
          ) : (
            <p className="mt-1.5 text-[0.7rem] text-white/60">
              Nog geen vakken geselecteerd — tik of sleep op de muur
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
          <div className="space-y-3">
            <div>
              <label htmlFor="company">Titel / naam</label>
              <input
                id="company"
                name="company"
                required
                className="mt-1"
                maxLength={80}
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pixelLabel">Optionele tekst</label>
              <input
                id="pixelLabel"
                name="pixelLabel"
                className="mt-1"
                maxLength={80}
                value={adCaption}
                onChange={(e) => setAdCaption(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="url">Website</label>
              <input
                id="url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                className="mt-1"
                placeholder="bakkerij.be"
              />
            </div>
            <div className="flex flex-col items-center justify-center py-1">
              <p className="mb-2 text-[8px] uppercase tracking-[0.16em] text-yellow">
                Voorbeeld van uw pixel bij hover
              </p>
              <PixelAdPeek
                label={adTitle}
                caption={adCaption}
                image={logoPreview || logoUrl}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border border-yellow/40 bg-black/40 p-2.5">
            <p className="text-[8px] uppercase tracking-[0.16em] text-yellow">Factuurgegevens</p>
            {blockedReason ? <p className="text-[0.7rem] text-yellow">{blockedReason}</p> : null}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="firstName">Voornaam</label>
                <input id="firstName" name="firstName" required className="mt-1" autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="lastName">Achternaam</label>
                <input id="lastName" name="lastName" required className="mt-1" autoComplete="family-name" />
              </div>
              <div>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="phone">GSM-nummer</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="invoiceCompany">Bedrijfsnaam</label>
                <input
                  id="invoiceCompany"
                  name="invoiceCompany"
                  required
                  className="mt-1"
                  autoComplete="organization"
                />
              </div>
              <div>
                <label htmlFor="vatNumber">BTW-nummer</label>
                <input
                  id="vatNumber"
                  name="vatNumber"
                  required
                  className="mt-1"
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label htmlFor="address">Adres</label>
              <textarea
                id="address"
                name="address"
                required
                rows={2}
                className="mt-1"
                autoComplete="street-address"
              />
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <LegalChecks />
              <button className="btn-yellow w-full !px-3 !py-2 !text-[0.7rem]" disabled={busy || !!blockedReason} type="submit">
                {busy ? "Even geduld…" : `Betaal ${formatCents(cents)} voor ${size.w}×${size.h} pixels`}
              </button>
            </div>
            {status ? <p className="text-[0.7rem] text-yellow">{status}</p> : null}
            {simulateId ? (
              <button type="button" className="btn-ghost w-full !px-3 !py-2 !text-[0.7rem]" onClick={simulate} disabled={busy}>
                Simuleer betaling (lokaal)
              </button>
            ) : null}
          </div>
        </div>
      </form>
      ) : null}
    </div>
  );
}
