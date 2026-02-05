'use client';

import Link from 'next/link';
import { useSteps } from '../hooks';
import { StepCard, HomeIcon } from '../components';

export default function StepsPage() {
  const {
    steps,
    cyclesNumber,
    isLoaded,
    addStep,
    updateStep,
    deleteStep,
    moveStep,
    updateCyclesNumber,
  } = useSteps();

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-main p-4 gap-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          className="btn-glass p-3"
          href="/"
          aria-label="Accueil"
        >
          <HomeIcon />
        </Link>
        <h1 className="font-bold text-2xl">Configuration</h1>
        <div className="w-12"></div>
      </div>

      {/* Cycles Configuration */}
      <section className="w-full max-w-md">
        <div className="glass-card p-4 flex flex-col gap-2">
          <label className="font-semibold text-sm text-text-muted uppercase tracking-wide" htmlFor="inputCycleNumber">
            Nombre de cycles
          </label>
          <input
            id="inputCycleNumber"
            className="glass-input p-3 text-lg text-center font-bold text-white w-full"
            type="number"
            min={1}
            max={99}
            value={cyclesNumber}
            onChange={(e) => updateCyclesNumber(e.target.value)}
          />
        </div>
      </section>

      {/* Steps Configuration */}
      <section className="w-full max-w-md">
        <h2 className="font-bold text-xl pb-4 text-center text-orange-light">Étapes</h2>
        <div className="flex flex-col gap-4">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              onUpdate={updateStep}
              onDelete={deleteStep}
              onMove={moveStep}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            className="btn-orange text-white"
            onClick={addStep}
          >
            + Nouvelle étape
          </button>
        </div>
      </section>
    </main>
  );
}
