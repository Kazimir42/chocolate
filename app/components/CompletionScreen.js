import Link from 'next/link';

/**
 * Screen displayed when workout is complete.
 * The work color floods the screen: the loudest state of all.
 */
export function CompletionScreen({ onRestart }) {
  return (
    <div className="min-h-dvh w-full bg-work flex flex-col items-center justify-center p-8 gap-8 text-center">
      <span className="eyebrow !text-bg/70">Séance complète</span>
      <h1 className="display-name text-7xl md:text-8xl text-bg">
        Terminé.
      </h1>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {onRestart && (
          <button
            type="button"
            className="btn bg-bg text-ink"
            onClick={onRestart}
          >
            Refaire la séance
          </button>
        )}
        <Link
          href="/steps"
          className="btn border border-bg/40 text-bg"
        >
          Programme
        </Link>
      </div>
    </div>
  );
}
