import React from "react";

function HotSeatPanel({ commentConservative, commentDemocrat }) {
  const partyClass = (leaning) => {
    if (leaning === "Conservative") return "conservative";
    if (leaning === "Democrat") return "democrat";
    return "";
  };

  const Slot = ({ comment, leaning, emptyText }) => (
    <div className="hotseat-panel__slot">
      <div className={"hotseat-slot__label " + partyClass(leaning)}>
        Top {leaning} take
      </div>

      {comment ? (
        <>
          <div className="comment-meta">
            <strong className="comment-username">{comment.username}</strong>
          </div>

          <p>{comment.text}</p>
        </>
      ) : (
        <p className="hotseat-panel__empty">{emptyText}</p>
      )}
    </div>
  );

  return (
    <div className="hotseat-panel">
      <div className="hotseat-panel__label">Top Takes</div>
      

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
    </div>
  );
}

export default HotSeatPanel;
