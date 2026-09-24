"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Намалява снимката (до 1600 px) в телефона, преди да я качи — пести интернет
async function shrink(file: File, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Неуспешна обработка"))), "image/jpeg", 0.82),
  );
}

// Избор и качване на снимка; адресът ѝ отива в скрито поле „image_url“
export function ImageUpload({
  userId,
  initialUrl = null,
  maxSide = 1600,
  label = "Добави снимка",
  round = false,
}: {
  userId: string;
  initialUrl?: string | null;
  maxSide?: number;
  label?: string;
  round?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const blob = await shrink(file, maxSide);
      const supabase = createClient();
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      setUrl(supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
    } catch (e) {
      console.error(e);
      setError("Снимката не можа да се качи. Опитайте с друга.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name="image_url" value={url ?? ""} />
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      {url ? (
        <div className={`relative ${round ? "h-24 w-24" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Избрана снимка"
            className={round ? "h-24 w-24 rounded-full object-cover" : "max-h-72 w-full rounded-2xl object-cover"}
          />
          <button
            type="button"
            onClick={() => setUrl(null)}
            aria-label="Махни снимката"
            className="absolute top-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-white"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-paper px-4 py-5 text-sm font-bold text-muted hover:border-forest/40"
        >
          {busy ? <Loader2 size={20} className="animate-spin" aria-hidden /> : <ImagePlus size={20} aria-hidden />}
          {busy ? "Качване…" : label}
        </button>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-alarm">{error}</p>}
    </div>
  );
}
