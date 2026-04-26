import React from "react";
import { Card, Badge } from "react-bootstrap";

function HotSeatPanel({ commentConservative, commentDemocrat }) {
  const Slot = ({ comment, leaning, emptyText }) => (
    <Card.Body className="hotseat-panel__slot">
      <Badge
        className={"hotseat-slot__label " + (leaning === "Conservative" ? "conservative" : "democrat")}
      >
        Top {leaning} take
      </Badge>

      {comment ? (
        <>
          <div className="comment-meta">
            <strong className="comment-username">{comment.username}</strong>
          </div>
          <Card.Text>{comment.text}</Card.Text>
        </>
      ) : (
        <Card.Text className="hotseat-panel__empty">{emptyText}</Card.Text>
      )}
    </Card.Body>
  );

  return (
    <Card className="hotseat-panel">
      <Card.Header className="hotseat-panel__label">Top Takes</Card.Header>

      <Slot
        comment={commentConservative}
        leaning="Conservative"
        emptyText="No Conservative takes yet."
      />
      <Slot
        comment={commentDemocrat}
        leaning="Democrat"
        emptyText="No Democrat takes yet."
      />
    </Card>
  );
}

export default HotSeatPanel;