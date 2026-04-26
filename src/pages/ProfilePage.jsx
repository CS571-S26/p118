import React, { useState, useMemo } from "react";
import { Badge, ButtonGroup, Button } from "react-bootstrap";
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

  const replyParentPairs = useMemo(
    () => userReplies.map((reply) => ({ reply, parent: commentsById.get(reply.parentCommentId) })),
    [userReplies, commentsById]
  );

  const scoreOf = (c) => (c?.agreeCount ?? 0) - (c?.disagreeCount ?? 0);

  const sortedUserComments = useMemo(() => {
    const arr = [...userParentComments];
    return activeSort === "New"
      ? arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      : arr.sort((a, b) => scoreOf(b) - scoreOf(a));
  }, [userParentComments, activeSort]);

  const sortedReplyParentPairs = useMemo(() => {
    const arr = [...replyParentPairs];
    return activeSort === "New"
      ? arr.sort((a, b) => (b.reply.createdAt ?? 0) - (a.reply.createdAt ?? 0))
      : arr.sort((a, b) => scoreOf(b.reply) - scoreOf(a.reply));
  }, [replyParentPairs, activeSort]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__left">
          <span className="logo">HOTSEAT</span>
          <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        </div>
      </header>

      <div className="profile-page">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-header__identity">
            <h1 className="profile-header__username">@{currentUser.username}</h1>
            {currentUser.leaning && (
              <Badge className={`party-tag ${currentUser.leaning === "Democrat" ? "democrat" : "conservative"}`}>
                {currentUser.leaning}
              </Badge>
            )}
          </div>
          <span className="profile-header__joined">
            Joined {new Date(currentUser.createdAt).toLocaleDateString()}
          </span>

          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{currentUser.totalComments ?? 0}</strong>
              <span>Comments</span>
            </div>
            <div className="profile-stat">
              <strong>{currentUser.totalReplies ?? 0}</strong>
              <span>Replies</span>
            </div>
            <div className="profile-stat">
              <strong>{(currentUser.netScore ?? 0) > 0 ? `+${currentUser.netScore}` : currentUser.netScore ?? 0}</strong>
              <span>Net Score</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="profile-controls">
          <div className="chat-box__filter">
            <span className="control-label">View:</span>
            <ButtonGroup size="sm">
              {["Your Comments", "Your Replies"].map((t) => (
                <Button
                  key={t}
                  variant={activeView === t ? "primary" : "outline-secondary"}
                  onClick={() => setActiveView(t)}
                >{t}</Button>
              ))}
            </ButtonGroup>
          </div>

          <div className="chat-box__sort">
            <span className="control-label">Sort By:</span>
            <ButtonGroup size="sm">
              {["Best", "New"].map((t) => (
                <Button
                  key={t}
                  variant={activeSort === t ? "primary" : "outline-secondary"}
                  onClick={() => setActiveSort(t)}
                >{t}</Button>
              ))}
            </ButtonGroup>
          </div>
        </div>

        {/* Comments */}
        {activeView === "Your Comments" && (
          <div className="profile-feed">
            {sortedUserComments.length === 0 ? (
              <div className="profile-feed__empty">No comments yet.</div>
            ) : (
              sortedUserComments.map((comment) => (
                <div key={comment.id} className="profile-card">
                  <div className="comment-meta">
                    <strong className="comment-username">{comment.username}</strong>
                    {comment.leaning && (
                      <Badge className={`party-tag ${comment.leaning === "Democrat" ? "democrat" : "conservative"}`}>
                        {comment.leaning}
                      </Badge>
                    )}
                  </div>
                  <p className="profile-card__text">{comment.text}</p>
                  <span className="profile-card__score">
                    {scoreOf(comment) >= 0 ? `+${scoreOf(comment)}` : scoreOf(comment)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Replies */}
        {activeView === "Your Replies" && (
          <div className="profile-feed">
            {sortedReplyParentPairs.length === 0 ? (
              <div className="profile-feed__empty">No replies yet.</div>
            ) : (
              sortedReplyParentPairs.map(({ reply, parent }) => (
                <div key={reply.id} className="profile-reply-pair">
                  <div className="profile-card profile-card--parent">
                    {parent ? (
                      <>
                        <div className="comment-meta">
                          <strong className="comment-username">{parent.username}</strong>
                          {parent.leaning && (
                            <Badge className={`party-tag ${parent.leaning === "Democrat" ? "democrat" : "conservative"}`}>
                              {parent.leaning}
                            </Badge>
                          )}
                        </div>
                        <p className="profile-card__text">{parent.text}</p>
                      </>
                    ) : (
                      <p className="profile-card__deleted">Original comment deleted.</p>
                    )}
                  </div>

                  <div className="profile-card profile-card--reply">
                    <div className="comment-meta">
                      <strong className="comment-username">{reply.username}</strong>
                      {reply.leaning && (
                        <Badge className={`party-tag ${reply.leaning === "Democrat" ? "democrat" : "conservative"}`}>
                          {reply.leaning}
                        </Badge>
                      )}
                    </div>
                    <p className="profile-card__text">{reply.text}</p>
                    <span className="profile-card__score">
                      {scoreOf(reply) >= 0 ? `+${scoreOf(reply)}` : scoreOf(reply)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}