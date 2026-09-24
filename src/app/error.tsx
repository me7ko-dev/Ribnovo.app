"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest">Нещо се обърка</h1>
        <p className="mt-2 text-muted">Опитайте отново след малко.</p>
        <button onClick={reset} className="btn-primary mt-6">
          Опитай отново
        </button>
      </div>
    </div>
  );
}
