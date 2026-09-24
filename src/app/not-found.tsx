import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest">Няма такава страница</h1>
        <p className="mt-2 text-muted">Може да е изтрита или линкът да е грешен.</p>
        <Link href="/" className="btn-primary mt-6">
          Към началото
        </Link>
      </div>
    </div>
  );
}
