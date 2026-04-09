import React, { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import useCommentsStore from "../stores/useCommentsStore.js";

export default function ProfilePage({ onBack }) {
  const { currentUser } = useAuth();
  const [activeSort, setActiveSort] = useState("Best");
  const [activeView, setActiveView] = useState("Your Comments");

  const comments = useCommentsStore((state) => state.comments);
  const userComments = comments.filter((c) => c.username === currentUser.username);
  const userParentComments = userComments.filter((c) => c.parentCommentId === null);
  const userReplies = userComments.filter((c) => c.parentCommentId !== null);

  const commentsById = useMemo(() => new Map(comments.map((c) => [c.id, c])), [comments]);

  // For each reply authored by the current user, pair it with its immediate parent (may be undefined)
  const replyParentPairs = useMemo(
    () =>
      userReplies.map((reply) => ({
        reply,
        parent: commentsById.get(reply.parentCommentId),
      })),
    [userReplies, commentsById]
  );

  const scoreOf = (c) => (c?.agreeCount ?? 0) - (c?.disagreeCount ?? 0);

  // Sorted user comments according to activeSort
  const sortedUserComments = useMemo(() => {
    // only show root comments (parentCommentId === null) as "comments"
    const arr = [...userParentComments];
    if (activeSort === "New") {
      arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else {
      arr.sort((a, b) => scoreOf(b) - scoreOf(a));
    }
    return arr;
  }, [userParentComments, activeSort]);

  // Sorted reply-parent pairs according to activeSort (sort by reply)
  const sortedReplyParentPairs = useMemo(() => {
    const arr = [...replyParentPairs];
    if (activeSort === "New") {
      arr.sort((a, b) => (b.reply.createdAt ?? 0) - (a.reply.createdAt ?? 0));
    } else {
      arr.sort((a, b) => scoreOf(b.reply) - scoreOf(a.reply));
    }
    return arr;
  }, [replyParentPairs, activeSort]);

  

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__left">
          <span className="logo">HOTSEAT</span>
          <button className="btn btn--ghost" onClick={onBack}>
            ← Back
          </button>
        </div>
      </header>

      <div>
        <h1>@{currentUser.username}'s Profile</h1>
        {currentUser.leaning && (
          <span
            className={
              "party-tag " +
              (currentUser.leaning === "Democrat"
                ? "democrat"
                : "conservative")
            }
          >
            {currentUser.leaning}
          </span>
        )}

        <span member-since>Joined: {new Date(currentUser.createdAt).toLocaleDateString()}</span>

        <div className="profile-stats">
          <div>
            <strong>{currentUser.totalComments ?? 0}</strong>
            <span> Total comments</span>
          </div>
          <div>
            <strong>{currentUser.totalReplies ?? 0}</strong>
            <span> Total replies</span>
          </div>
          <div>
            <strong>{(currentUser.netScore ?? 0) > 0 ? `+${currentUser.netScore}` : currentUser.netScore ?? 0}</strong>
            <span> Net Score</span>
          </div>
        </div>
      </div>

      <div>
        <div>View</div>
        {["Your Comments", "Your Replies"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveView(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <div>Sort By:</div>
        {["Best", "New"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveSort(t)}
          >
            {t}
          </button>
        ))}
      </div>


      {activeView === "Your Comments" && (
        <div>
          {sortedUserComments.length === 0 ? (
            <div>No comments yet.</div>
          ) : (
            sortedUserComments.map((comment) => (
              <div key={comment.id} className="reply-card" style={{ padding: 8, marginTop: 6, background: "#0b0c10", borderRadius: 8, border: "1px solid #1d1d24" }}>
                <div style={{ fontSize: 12, color: "#d0d6ff" }}>{comment.username} {comment.leaning}</div>
                <div style={{ marginTop: 6 }}>{comment.text}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* If viewing replies, show each user reply paired with its immediate parent */}
      {activeView === "Your Replies" && (
        <div className="reply-pairs">
          {sortedReplyParentPairs.length === 0 ? (
            <div>No replies yet.</div>
          ) : (
            sortedReplyParentPairs.map(({ reply, parent }) => (
              <div key={reply.id} className="reply-pair" style={{ marginBottom: 12 }}>
                <div className="parent-card" style={{ padding: 8, background: "#0f1115", borderRadius: 8, border: "1px solid #23232b" }}>
                  {parent ? (
                    <>
                      <div style={{ fontSize: 12, color: "#bfc3ff" }}>{parent.username} {parent.leaning}</div>
                      <div style={{ marginTop: 6 }}>{parent.text}</div>
                    </>
                  ) : (
                    <div style={{ fontStyle: "italic", color: "#999" }}>Original comment deleted</div>
                  )}
                </div>

                <div className="reply-card" style={{ padding: 8, marginTop: 6, background: "#0b0c10", borderRadius: 8, border: "1px solid #1d1d24" }}>
                  <div style={{ fontSize: 12, color: "#d0d6ff" }}>{reply.username} {reply.leaning}</div>
                  <div style={{ marginTop: 6 }}>{reply.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}