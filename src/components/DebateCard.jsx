// DebateCard.jsx
import React from "react";

function DebateCard({
  title,
  source,
  leaning,
  heatPercent,
  commentCount,
  variant = "default",
  onClick
}) {

   const isFeatured = variant === "featured";

  return (
    <article
      className={"debate-card" + (isFeatured ? " debate-card--featured" : "")}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {isFeatured && <div className="debate-card__featured-label">Top Debate</div>}

      <header className="debate-card__header">
        <span className={`debate-card__tag debate-card__tag--${leaning.toLowerCase()}`}>
          {leaning}
        </span>
        <span className="debate-card__source">{source}</span>
      </header>

      <h3 className="debate-card__title">{title}</h3>

      <div className="debate-card__media" aria-hidden="true" />

      <footer className="debate-card__footer">
        <span className="debate-card__heat">🔥 {heatPercent}% hot</span>
        <span className="debate-card__divider">·</span>
        <span className="debate-card__comments">{commentCount} comments</span>
      </footer>

      {isFeatured && (
        <button type="button" className="btn btn--primary debate-card__cta">
          Join Debate
        </button>
      )}
    </article>
  );
}
export default DebateCard;
