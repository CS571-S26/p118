import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { ButtonGroup, Button, Badge } from "react-bootstrap";
import InlineReplyComposer from "./InlineReplyComposer";
import { useAuth } from "../contexts/AuthContext.jsx";
import useCommentsStore from "../stores/useCommentsStore.js";

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
    { unit: "month", secs: 2592000 },
    { unit: "year", secs: 31536000 },
  ];
  let unit = "second";
  for (let i = ranges.length - 1; i >= 0; i--) {
    if (seconds >= ranges[i].secs) { unit = ranges[i].unit; break; }
  }
  const unitSecs = ranges.find((r) => r.unit === unit).secs;
  const value = Math.floor(seconds / unitSecs);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-value, unit);
}

function ChatThread({ comments, onReplyIntent, replyTo, setReplyTo }) {
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

  const { roots, childrenByParent } = useMemo(() => {
    const byId = new Map(comments.map((c) => [c.id, c]));
    const kids = new Map();
    const rootList = [];
    for (const c of comments) {
      const parentId = c.parentCommentId ?? null;
      if (parentId === null) { rootList.push(c); continue; }
      if (byId.has(parentId)) {
        if (!kids.has(parentId)) kids.set(parentId, []);
        kids.get(parentId).push(c);
      } else {
        rootList.push(c);
      }
    }
    return { roots: rootList, childrenByParent: kids };
  }, [comments]);

  const computeFilteredSortedRoots = useCallback(() => {
    let arr = [...roots];
    if (filter === "Conservative") arr = arr.filter((r) => r.leaning === "Conservative");
    else if (filter === "Democrat") arr = arr.filter((r) => r.leaning === "Democrat");
    if (sort === "New") arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    else arr.sort((a, b) => scoreOf(b) - scoreOf(a));
    return arr;
  }, [roots, filter, sort]);

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
      setDisplayRoots(newSorted);
    } else {
      const byId = new Map(comments.map((c) => [c.id, c]));
      setDisplayRoots(oldIds.map((id) => byId.get(id) || newSorted.find((s) => s.id === id)));
    }
    prevFilterRef.current = filter;
    prevSortRef.current = sort;
    prevFilterTickRef.current = filterTick;
    prevSortTickRef.current = sortTick;
  }, [roots, filter, sort, comments, computeFilteredSortedRoots, filterTick, sortTick]);

  const prevReplyFilterRef = useRef(filter);
  const prevReplySortRef = useRef(sort);
  const prevReplyFilterTickRef = useRef(filterTick);
  const prevReplySortTickRef = useRef(sortTick);

  useEffect(() => {
    const filterChanged = prevReplyFilterRef.current !== filter || prevReplyFilterTickRef.current !== filterTick;
    const sortChanged = prevReplySortRef.current !== sort || prevReplySortTickRef.current !== sortTick;
    if (filterChanged || sortChanged) {
      setDisplayChildrenByParent(new Map());
      prevReplyFilterRef.current = filter;
      prevReplySortRef.current = sort;
      prevReplyFilterTickRef.current = filterTick;
      prevReplySortTickRef.current = sortTick;
      return;
    }
    setDisplayChildrenByParent((prev) => {
      const byId = new Map(comments.map((c) => [c.id, c]));
      const next = new Map(prev);
      for (const key of Array.from(next.keys())) {
        if (!childrenByParent.has(key)) next.delete(key);
      }
      for (const [parentId, kids] of childrenByParent.entries()) {
        const newIds = kids.map((k) => k.id);
        const prevArr = prev.get(parentId);
        const prevIds = prevArr ? prevArr.map((c) => c.id) : null;
        if (!prevArr) {
          if (expandedThreads.has(parentId)) {
            next.set(parentId, [...kids].sort((a, b) => scoreOf(b) - scoreOf(a)));
          }
          continue;
        }
        const idSetChanged = newIds.length !== prevIds.length || newIds.some((id) => !prevIds.includes(id));
        if (!idSetChanged) {
          next.set(parentId, prevArr.map((old) => byId.get(old.id) || old).filter(Boolean));
        } else if (expandedThreads.has(parentId)) {
          const existingIds = prevIds.filter((id) => newIds.includes(id));
          const addedIds = newIds.filter((id) => !prevIds.includes(id));
          next.set(parentId, [
            ...existingIds.map((id) => byId.get(id)).filter(Boolean),
            ...addedIds.map((id) => byId.get(id) || kids.find((k) => k.id === id)).filter(Boolean),
          ]);
        } else {
          next.delete(parentId);
        }
      }
      return next;
    });
  }, [childrenByParent, comments, expandedThreads, filter, sort, filterTick, sortTick]);

  const isExpanded = useCallback((id) => expandedThreads.has(id), [expandedThreads]);

  const collectDescendantIds = useCallback((rootId) => {
    const out = new Set();
    const stack = [rootId];
    while (stack.length) {
      const id = stack.pop();
      for (const child of childrenByParent.get(id) ?? []) {
        if (!out.has(child.id)) { out.add(child.id); stack.push(child.id); }
      }
    }
    return out;
  }, [childrenByParent]);

  const toggleReplies = useCallback((commentId) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
        for (const id of collectDescendantIds(commentId)) next.delete(id);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, [collectDescendantIds]);

  useEffect(() => { setExpandedThreads(new Set()); }, [filter, sort]);

  useEffect(() => {
    if (!replyTo?.id) return;
    setExpandedThreads((prev) => new Set(prev).add(replyTo.id));
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
          className={"chat-item" + (depth > 0 ? " is-reply" : "") + (isReplyTarget ? " has-inline-reply" : "")}
          style={{ marginLeft: depth * 16 }}
        >
          <div className="chat-message">
            {/* Vote stack — kept as plain buttons; no Bootstrap equivalent */}
            <div className="vote-stack">
              <button
                type="button"
                className={"vote-arrow up" + (userVote === "agree" ? " active" : "")}
                onClick={() => { if (!requireLogin?.()) return; voteComment(comment.id, "agree"); }}
                aria-label="Agree"
              >△</button>
              <div className="vote-score">{score}</div>
              <button
                type="button"
                className={"vote-arrow down" + (userVote === "disagree" ? " active" : "")}
                onClick={() => { if (!requireLogin?.()) return; voteComment(comment.id, "disagree"); }}
                aria-label="Disagree"
              >▽</button>
            </div>

            <div className="chat-body">
              <div className="chat-message__content">
                <div className="comment-meta">
                  <strong className="comment-username">{comment.username}</strong>

                  {comment.leaning && (
                    <Badge
                      className={"party-tag " + (comment.leaning === "Democrat" ? "democrat" : "conservative")}
                    >
                      {comment.leaning}
                    </Badge>
                  )}

                  {comment.createdAt && (
                    <span className="comment-age" title={new Date(comment.createdAt).toLocaleString()}>
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  )}
                </div>

                <p>{comment.text}</p>
              </div>

              <div className="chat-message__actions">
                {replyCount > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="btn-show-replies"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    {isExpanded(comment.id) ? "▾" : "▸"} {replyCount}{" "}
                    {replyCount === 1 ? "reply" : "replies"}
                  </Button>
                )}

                <Button
                  variant="link"
                  size="sm"
                  className="btn-reply"
                  onClick={() => onReplyIntent(comment)}
                >
                  Reply
                </Button>
              </div>

              {replyTo?.id === comment.id && (
                <InlineReplyComposer parent={comment} onClose={() => setReplyTo(null)} />
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
          Comments <Badge bg="secondary" className="comment-count">{displayRoots.length}</Badge>
        </div>

        <div className="chat-box__tabs">
          <div className="chat-box__controls">
            <div className="chat-box__filter">
              <span className="control-label">Filter By:</span>
              <ButtonGroup size="sm">
                {["All", "Conservative", "Democrat"].map((t) => (
                  <Button
                    key={t}
                    variant={filter === t ? "primary" : "outline-secondary"}
                    onClick={() => { if (filter === t) setFilterTick((s) => s + 1); else setFilter(t); }}
                  >
                    {t}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            <div className="chat-box__sort">
              <span className="control-label">Sort By:</span>
              <ButtonGroup size="sm">
                {["Best", "New"].map((t) => (
                  <Button
                    key={t}
                    variant={sort === t ? "primary" : "outline-secondary"}
                    onClick={() => { if (sort === t) setSortTick((s) => s + 1); else setSort(t); }}
                  >
                    {t}
                  </Button>
                ))}
              </ButtonGroup>
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