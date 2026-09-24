// Снимка от публикация (от хранилището на Supabase)
export function Photo({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={`w-full bg-line object-cover ${className}`} />
  );
}
