// This file renders the comment thread: sorting/filtering roots, rendering children, vote + reply UI.
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import InlineReplyComposer from "./InlineReplyComposer";
import { useAuth } from "../contexts/AuthContext.jsx";
import useCommentsStore from "../stores/useCommentsStore.js";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const scoreOf = (c) => (c.agreeCount ?? 0) - (c.disagreeCount ?? 0);

function formatTimeAgo(input) {
  if (!input) return "";

  const ts = typeof input === "number" ? input : new Date(input).getTime();
  const diffMs = Date.now() - ts;
  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);

  const ranges = [
    { unit: "second", secs: 1 },
    { unit: "minute", secs: 60 },
    { unit: "hour", secs: 3600 },
    { unit: "day", secs: 86400 },
    { unit: "week", secs: 604800 },
    { unit: "month", secs: 2592000 }, // ~30d
    { unit: "year", secs: 31536000 }, // ~365d
  ];

  let unit = "second";
  for (let i = ranges.length - 1; i >= 0; i--) {
    if (seconds >= ranges[i].secs) {
      unit = ranges[i].unit;
      break;
    }
  }

  const unitSecs = ranges.find((r) => r.unit === unit).secs;
  const value = Math.floor(seconds / unitSecs);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(-value, unit);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

function ChatThread({
  comments,
  onReplyIntent,
  replyTo,
  setReplyTo,
}) {
  const { requireLogin } = useAuth();
  const voteComment = useCommentsStore((s) => s.voteComment);
  const commentVotesByUser = useCommentsStore((s) => s.votesByUser);
  const [filter, setFilter] = useState("All");
  const [filterTick, setFilterTick] = useState(0);
  const [sort, setSort] = useState("Best");
  const [sortTick, setSortTick] = useState(0);
  const [expandedThreads, setExpandedThreads] = useState(() => new Set());
  const [displayRoots, setDisplayRoots] = useState([]);
  const [displayChildrenByParent, setDisplayChildrenByParent] = useState(() => new Map());

  // Build thread structure once per comments change
  const { roots, childrenByParent } = useMemo(() => {
    const byId = new Map(comments.map((c) => [c.id, c]));
    const kids = new Map(); // parentId -> Comment[]
    const rootList = [];

    for (const c of comments) {
      const parentId = c.parentCommentId ?? null;

      if (parentId === null) {
        rootList.push(c);
        continue;
      }

      if (byId.has(parentId)) {
        if (!kids.has(parentId)) kids.set(parentId, []);
        kids.get(parentId).push(c);
      } else {
        // Orphan reply fallback (parent missing from dataset)
        rootList.push(c);
      }
    }

    return { roots: rootList, childrenByParent: kids };
  }, [comments]);

  // Compute filtered + sorted candidate roots (pure computation)
  const computeFilteredSortedRoots = useCallback(() => {
    let arr = [...roots];

    // Filter
    if (filter === "Conservative") {
      arr = arr.filter((r) => r.leaning === "Conservative");
    } else if (filter === "Democrat") {
      arr = arr.filter((r) => r.leaning === "Democrat");
    }

    // Sort
    if (sort === "New") {
      arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else {
      arr.sort((a, b) => scoreOf(b) - scoreOf(a));
    }

    return arr;
  }, [roots, filter, sort]);

  // Synchronize `displayRoots` only when the set of root IDs changes or the filter/sort changes.
  // For vote-only updates (which mutate counts but keep the same root IDs), preserve the
  // previous ordering and just refresh each item's data in-place so the UI doesn't reshuffle.
  const prevFilterRef = useRef(filter);
  const prevSortRef = useRef(sort);
  const prevFilterTickRef = useRef(filterTick);
  const prevSortTickRef = useRef(sortTick);

  useEffect(() => {
    const newSorted = computeFilteredSortedRoots();
    const newIds = newSorted.map((r) => r.id);
    const oldIds = displayRoots.map((r) => r.id);

    const idSetChanged = newIds.length !== oldIds.length || newIds.some((id) => !oldIds.includes(id));

    const filterChanged = prevFilterRef.current !== filter || prevFilterTickRef.current !== filterTick;
    const sortChanged = prevSortRef.current !== sort || prevSortTickRef.current !== sortTick;

    if (displayRoots.length === 0 || idSetChanged || filterChanged || sortChanged) {
      // Replace displayRoots when IDs changed or user explicitly changed filter/sort.
      setDisplayRoots(newSorted);
    } else {
      // Same IDs and no filter/sort change: preserve order but update fields from latest `comments`.
      const byId = new Map(comments.map((c) => [c.id, c]));
      setDisplayRoots(oldIds.map((id) => byId.get(id) || newSorted.find((s) => s.id === id)));
    }

    // store previous values for next run
    prevFilterRef.current = filter;
    prevSortRef.current = sort;
    prevFilterTickRef.current = filterTick;
    prevSortTickRef.current = sortTick;
  }, [roots, filter, sort, comments, computeFilteredSortedRoots, filterTick, sortTick]);

  // Maintain a stable, per-parent ordering for replies (children).
  // Rules implemented:
  // - When a thread is expanded, compute and cache its replies sorted-by-Best.
  // - While expanded, do not reorder on votes (vote-only updates refresh objects only).
  // - When a new reply arrives for an expanded thread, append it to the end of the cached order.
  // - Clear the entire reply-order cache on filter/sort/tick changes so next expand recomputes.
  const prevReplyFilterRef = useRef(filter);
  const prevReplySortRef = useRef(sort);
  const prevReplyFilterTickRef = useRef(filterTick);
  const prevReplySortTickRef = useRef(sortTick);

  useEffect(() => {
    // If filter or sort (or their ticks) changed, clear the cache so future expands recompute order.
    const filterChanged = prevReplyFilterRef.current !== filter || prevReplyFilterTickRef.current !== filterTick;
    const sortChanged = prevReplySortRef.current !== sort || prevReplySortTickRef.current !== sortTick;

    if (filterChanged || sortChanged) {
      setDisplayChildrenByParent(new Map());
      // update prev refs so we don't repeatedly clear
      prevReplyFilterRef.current = filter;
      prevReplySortRef.current = sort;
      prevReplyFilterTickRef.current = filterTick;
      prevReplySortTickRef.current = sortTick;
      return;
    }

    setDisplayChildrenByParent((prev) => {
      const byId = new Map(comments.map((c) => [c.id, c]));
      const next = new Map(prev); // start from previous cache

      // Remove any parent keys that no longer exist
      for (const key of Array.from(next.keys())) {
        if (!childrenByParent.has(key)) next.delete(key);
      }

      for (const [parentId, kids] of childrenByParent.entries()) {
        const newIds = kids.map((k) => k.id);
        const prevArr = prev.get(parentId);
        const prevIds = prevArr ? prevArr.map((c) => c.id) : null;

        // If we don't have a cached ordering yet
        if (!prevArr) {
          // Only compute & cache ordering when the thread is expanded.
          if (expandedThreads.has(parentId)) {
            const sorted = [...kids].sort((a, b) => scoreOf(b) - scoreOf(a));
            next.set(parentId, sorted);
          }
          // otherwise leave it uncached so expansion will compute it
          continue;
        }

        // We have a cached ordering. Check if child ID set changed.
        const idSetChanged = newIds.length !== prevIds.length || newIds.some((id) => !prevIds.includes(id));

        if (!idSetChanged) {
          // Vote-only update: refresh objects but keep order
          const refreshed = prevArr.map((old) => byId.get(old.id) || old).filter(Boolean);
          next.set(parentId, refreshed);
        } else {
          // Child ID set changed (added/removed)
          if (expandedThreads.has(parentId)) {
            // If expanded, preserve existing order for existing IDs, append new replies at bottom
            const existingIds = prevIds.filter((id) => newIds.includes(id));
            const addedIds = newIds.filter((id) => !prevIds.includes(id));
            const existingObjs = existingIds.map((id) => byId.get(id)).filter(Boolean);
            const addedObjs = addedIds.map((id) => byId.get(id) || kids.find((k) => k.id === id)).filter(Boolean);
            next.set(parentId, [...existingObjs, ...addedObjs]);
          } else {
            // Not expanded: remove cache for this parent so next expand recomputes sorted-by-Best
            next.delete(parentId);
          }
        }
      }

      return next;
    });
  }, [childrenByParent, comments, expandedThreads, filter, sort, filterTick, sortTick]);

  // Expand/collapse replies
  const isExpanded = useCallback(
    (commentId) => expandedThreads.has(commentId),
    [expandedThreads]
  );

  // Collect all descendants of a comment id (children, grandchildren, etc.)
  const collectDescendantIds = useCallback(
    (rootId) => {
      const out = new Set();
      const stack = [rootId];

      while (stack.length) {
        const id = stack.pop();
        const kids = childrenByParent.get(id) ?? [];

        for (const child of kids) {
          if (!out.has(child.id)) {
            out.add(child.id);
            stack.push(child.id);
          }
        }
      }

      return out; // descendants only (not rootId)
    },
    [childrenByParent]
  );

  const toggleReplies = useCallback(
    (commentId) => {
      setExpandedThreads((prev) => {
        const next = new Set(prev);
        const currentlyExpanded = next.has(commentId);

        if (currentlyExpanded) {
          // collapsing: remove parent + all descendants
          next.delete(commentId);

          const descendants = collectDescendantIds(commentId);
          for (const id of descendants) next.delete(id);
        } else {
          // expanding: only add this comment
          next.add(commentId);
        }

        return next;
      });
    },
    [collectDescendantIds]
  );

  // Reset expansion when switching filter or sort
  useEffect(() => {
    setExpandedThreads(new Set());
  }, [filter, sort]);

  // Ensure the comment being replied to is expanded
  useEffect(() => {
    if (!replyTo?.id) return;

    setExpandedThreads((prev) => {
      const next = new Set(prev);
      next.add(replyTo.id);
      return next;
    });
  }, [replyTo?.id]);

  const renderThread = (comment, depth = 0) => {
    const children = displayChildrenByParent.get(comment.id) ?? childrenByParent.get(comment.id) ?? [];
    const replyCount = (childrenByParent.get(comment.id) ?? []).length;

    const userVote = commentVotesByUser?.[comment.id] ?? null;
    const score = scoreOf(comment);
    const isReplyTarget = replyTo?.id === comment.id;

    return (
      <div key={comment.id} className="chat-thread">
        <div
          className={
            "chat-item" +
            (depth > 0 ? " is-reply" : "") +
            (isReplyTarget ? " has-inline-reply" : "")
          }
          style={{ marginLeft: depth * 16 }}
        >
          <div className="chat-message">
            {/* LEFT: vote stack */}
            <div className="vote-stack">
              <button
                type="button"
                className={"vote-arrow up" + (userVote === "agree" ? " active" : "")}
                onClick={() => {
                  if (!requireLogin?.()) return;
                  voteComment(comment.id, "agree");
                }}
                aria-label="Agree"
              >
                △
              </button>

              <div className="vote-score">{score}</div>

              <button
                type="button"
                className={
                  "vote-arrow down" + (userVote === "disagree" ? " active" : "")
                }
                onClick={() => {
                  if (!requireLogin?.()) return;
                  voteComment(comment.id, "disagree");
                }}
                aria-label="Disagree"
              >
                ▽
              </button>
            </div>

            {/* RIGHT: content + reply */}
            <div className="chat-body">
              <div className="chat-message__content">
                <div className="comment-meta">
                  <strong className="comment-username">{comment.username}</strong>

                  {comment.leaning && (
                    <span
                      className={
                        "party-tag " +
                        (comment.leaning === "Democrat"
                          ? "democrat"
                          : "conservative")
                      }
                    >
                      {comment.leaning}
                    </span>
                  )}

                  {comment.createdAt && (
                    <span
                      className="comment-age"
                      title={new Date(comment.createdAt).toLocaleString()}
                    >
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  )}
                </div>

                <p>{comment.text}</p>
              </div>

              <div className="chat-message__actions">
                {replyCount > 0 && (
                  <button
                    className="btn-show-replies"
                    type="button"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    {isExpanded(comment.id) ? "▾" : "▸"} {replyCount}{" "}
                    {replyCount === 1 ? "reply" : "replies"}
                  </button>
                )}

                <button
                  className="btn-reply"
                  type="button"
                  onClick={() => onReplyIntent(comment)}
                >
                  Reply
                </button>
              </div>

              {replyTo?.id === comment.id && (
                <InlineReplyComposer
                  parent={comment}
                  onClose={() => setReplyTo(null)}
                />
              )}
            </div>
          </div>
        </div>

        {children.length > 0 && isExpanded(comment.id) && (
          <div className="chat-children">
            {children.map((child) => renderThread(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-box">
      <div className="chat-box__header">
        <div className="comment-label">
          Comments <span className="comment-count">{displayRoots.length}</span>
        </div>

        <div className="chat-box__tabs">
          <div className="chat-box__controls">
            <div className="chat-box__filter">
              <div className="control-label">Filter By:</div>
              {[
                "All",
                "Conservative",
                "Democrat",
              ].map((t) => (
                <button
                  key={t}
                  className={"nav__item" + (filter === t ? " nav__item--active" : "")}
                  onClick={() => {
                    if (filter === t) setFilterTick((s) => s + 1);
                    else setFilter(t);
                  }}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="chat-box__sort">
              <div className="control-label">Sort By:</div>
              {["Best", "New"].map((t) => (
                <button
                  key={t}
                  className={"nav__item" + (sort === t ? " nav__item--active" : "")}
                  onClick={() => {
                    if (sort === t) setSortTick((s) => s + 1);
                    else setSort(t);
                  }}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-box__messages">
        {displayRoots.length === 0 ? (
          <div className="chat-message chat-message--empty">
            <span>
              {filter === "Conservative" || filter === "Democrat"
                ? `No ${filter} root comments yet. Be the first to take the hot seat.`
                : "No comments yet. Be the first to take the hot seat."}
            </span>
          </div>
        ) : (
          displayRoots.map((c) => renderThread(c, 0))
        )}
      </div>
    </div>
  );
}

export default ChatThread;
