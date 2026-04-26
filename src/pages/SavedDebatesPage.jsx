import React from "react";
import useSavedDebatesStore from "../stores/useSavedDebatesStore.js";
import DebateCard from "../components/DebateCard.jsx";

export default function SavedDebatesPage({ debates = [], onDebateClick, onBack }) {
  const savedIds = useSavedDebatesStore((s) => s.savedIds);
  const savedDebates = debates.filter((d) => savedIds.has(d.id));

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__left">
          <span className="logo">HOTSEAT</span>
          <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        </div>
      </header>

      <div className="saved-page">
        <div className="saved-page__header">
          <h1 className="saved-page__title">Saved Debates</h1>
          <span className="comment-count badge">{savedDebates.length}</span>
        </div>

        {savedDebates.length === 0 ? (
          <div className="saved-page__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p>No saved debates yet.</p>
            <span>Bookmark any debate to find it here later.</span>
          </div>
        ) : (
          <div className="debate-grid">
            {savedDebates.map((debate) => (
              <DebateCard
                key={debate.id}
                debate={debate}
                title={debate.title}
                source={debate.source}
                leaning={debate.leaning}
                heatPercent={debate.heatPercent}
                commentCount={debate.commentCount}
                onClick={() => onDebateClick?.(debate)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}