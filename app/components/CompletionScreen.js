import Link from 'next/link';

/**
 * Screen displayed when workout is complete
 */
export function CompletionScreen() {
  return (
    <div className="h-screen bg-gradient-success w-full flex flex-col items-center justify-center p-8">
      <div className="glass-light p-12 text-center max-w-md">
        <div className="text-8xl mb-6">
          🎉
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Bravo !
        </h1>
        <p className="text-xl text-white/80 mb-8">
          C&apos;est terminé !
        </p>
        <Link
          href="/"
          className="btn-glass inline-block text-lg font-semibold px-6 py-3"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
