import React from "react";
import { Card } from "react-bootstrap";
import useSavedDebatesStore from "../stores/useSavedDebatesStore.js";

export default function DebateCard({
  debate,
  title,
  source,
  leaning,
  img,
  heatPercent,
  commentCount,
  variant = "default",
  onClick
}) {
  const isFeatured = variant === "featured";
  const toggle = useSavedDebatesStore((s) => s.toggle);
  const isSaved = useSavedDebatesStore((s) => s.isSaved(debate?.id));

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (debate?.id) toggle(debate.id);
  };

  return (
    <Card
      className={"debate-card" + (isFeatured ? " debate-card--featured" : "")}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {isFeatured && <Card.Header className="debate-card__featured-label">Top Debate</Card.Header>}

      <Card.Body>
        <Card.Title className="debate-card__title">{title}</Card.Title>
        <Card.Text className="debate-card__source">{source}</Card.Text>
        {img && <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </Card.Body>

      <Card.Footer className="debate-card__footer">
        <span className="debate-card__heat">🔥 {heatPercent}% hot</span>
        <span className="debate-card__divider">·</span>
        <span className="debate-card__comments">{commentCount} comments</span>
        <button
          className={"debate-card__bookmark" + (isSaved ? " is-saved" : "")}
          onClick={handleBookmark}
          aria-label={isSaved ? "Unsave debate" : "Save debate"}
        >
          {isSaved ? "🔖" : "📑"}
          <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </Card.Footer>
    </Card>
  );
}