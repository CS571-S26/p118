// DebateCard.jsx
import React from "react";
import { Card } from "react-bootstrap";

export default function DebateCard({
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

  return (
    <Card className={"debate-card" + (isFeatured ? " debate-card--featured" : "")} onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined }}>
      {isFeatured && <Card.Header className="debate-card__featured-label">Top Debate</Card.Header>}

      <Card.Body>
        <Card.Title className="debate-card__title">{title}</Card.Title>
        <Card.Text className="debate-card__source">{source}</Card.Text>
        {img && (
          <img
            src={img}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </Card.Body>

      <Card.Footer className="debate-card__footer">
        <span className="debate-card__heat">🔥 {heatPercent}% hot</span>
        <span className="debate-card__divider">·</span>
        <span className="debate-card__comments">{commentCount} comments</span>
      </Card.Footer>
    </Card>
  );
}
