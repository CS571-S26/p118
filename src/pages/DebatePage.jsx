import React, { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useCommentsStore } from "../stores/useCommentsStore.js";
import useSavedDebatesStore from "../stores/useSavedDebatesStore.js";
import HotSeatPanel from "../components/HotSeatPanel.jsx";
import ChatComposer from "../components/ChatComposer.jsx";
import ChatThread from "../components/ChatThread.jsx";

export default function DebatePage({ debate, onBack }) {
  const { requireLogin } = useAuth();
  const comments = useCommentsStore((s) => s.comments);
  const commentsForDebate = useMemo(() => comments.filter((c) => c.debateId === debate.id), [comments, debate.id]);

  const toggle = useSavedDebatesStore((s) => s.toggle);
  const isSaved = useSavedDebatesStore((s) => s.isSaved(debate.id));

  const { hotSeatConservative, hotSeatDemocrat } = useMemo(() => {
    const score = (m) => (m.agreeCount ?? 0) - (m.disagreeCount ?? 0);
    return {
      hotSeatConservative: commentsForDebate.filter((c) => c.leaning === "Conservative").sort((a, b) => score(b) - score(a))[0] ?? null,
      hotSeatDemocrat:     commentsForDebate.filter((c) => c.leaning === "Democrat").sort((a, b) => score(b) - score(a))[0] ?? null,
    };
  }, [commentsForDebate]);

  const [replyTo, setReplyTo] = useState(null);

  const handleReplyIntent = (comment) => {
    if (!requireLogin()) return;
    setReplyTo({ id: comment.id, username: comment.username });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__left">
          <span className="logo">HOTSEAT</span>
          <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        </div>
      </header>

      <main className="debate-page">
        <div className="discussion-stack">
          <div className="discussion-stack__media">
            <div className="media-panel">
              <div className="media-panel__label">Media being discussed</div>

              <div className="media-panel__title-row">
                <h2 className="media-panel__title">{debate.title}</h2>
                <button
                  className={"media-panel__bookmark" + (isSaved ? " is-saved" : "")}
                  onClick={() => toggle(debate.id)}
                  aria-label={isSaved ? "Unsave debate" : "Save debate"}
                >
                  <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>

              <p className="media-panel__meta">
                {debate.source} · {debate.leaning} · 🔥 {debate.heatPercent}% hot
              </p>
              <div className="media-panel__placeholder">
                Video / article embed will go here for active display
              </div>
              <div>AI generated article summary</div>
            </div>
          </div>

          <div className="discussion-stack__composer">
            <ChatComposer debateId={debate.id} replyTo={replyTo} setReplyTo={setReplyTo} />
          </div>

          <div className="discussion-stack__hotseat">
            <HotSeatPanel commentConservative={hotSeatConservative} commentDemocrat={hotSeatDemocrat} />
          </div>

          <div className="discussion-stack__thread">
            <ChatThread
              comments={commentsForDebate}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              onReplyIntent={handleReplyIntent}
            />
          </div>
        </div>
      </main>
    </div>
  );
}