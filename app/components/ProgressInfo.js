/**
 * Display current round and cycle progress
 */
export function ProgressInfo({ currentRound, totalRounds, currentCycle, totalCycles, profileName }) {
  return (
    <div className="flex flex-col items-end gap-0.5 font-mono text-xs">
      {profileName && (
        <span className="eyebrow text-ink">{profileName}</span>
      )}
      <span className="text-muted">
        Tour <span className="text-ink">{currentRound}/{totalRounds}</span>
      </span>
      {totalCycles > 1 && (
        <span className="text-muted">
          Cycle <span className="text-ink">{currentCycle}/{totalCycles}</span>
        </span>
      )}
    </div>
  );
}
