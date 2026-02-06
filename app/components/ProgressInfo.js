/**
 * Display current round and cycle progress
 */
export function ProgressInfo({ currentRound, totalRounds, currentCycle, totalCycles, profileName }) {
  return (
    <div className="pill-glass">
      <div className="flex flex-col items-end text-sm font-semibold">
        {profileName && (
          <span className="text-xs text-orange-light">{profileName}</span>
        )}
        <div className="flex gap-2">
          <span className="text-text-muted">tour</span>
          <span className="text-orange">{currentRound}/{totalRounds}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted">cycle</span>
          <span className="text-orange">{currentCycle}/{totalCycles}</span>
        </div>
      </div>
    </div>
  );
}
