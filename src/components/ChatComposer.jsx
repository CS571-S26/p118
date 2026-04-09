import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import useCommentsStore from "../stores/useCommentsStore.js";

function ChatComposer({ debateId, replyTo, setReplyTo }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef(null);
  const { requireLogin, currentUser } = useAuth();
  const addComment = useCommentsStore((s) => s.addComment);

  const autosize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";                 // reset
    el.style.height = el.scrollHeight + "px"; // grow to fit
  };

  useEffect(() => {
    const isReplying = replyTo?.id != null
    if (isReplying) {
      closeComposer();
    }
  }, [replyTo?.id]);

  //Want to make sure if this is open then reply auto closes
  //I think this logic should be handled within inlineReplyComposer
  const openComposer = () => {
    if (!requireLogin?.()) return;
    setReplyTo(null);
    setIsExpanded(true);
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      autosize();
    });
  };

  const closeComposer = () => {
    setIsExpanded(false);
    setDraft("");
  };

  useEffect(() => {
    autosize();
  }, [draft]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requireLogin?.()) return;

    const text = draft.trim();
    if (!text) return;

    addComment(debateId, text, null, currentUser);
    closeComposer();
  };

  const isReplying = replyTo?.id != null;

  // Collapsed pill
  if (!isExpanded || isReplying) {
    return (
      <div
        className="composer composer--collapsed"
        role="button"
        tabIndex={0}
        onClick={openComposer}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openComposer();
        }}
      >
        What are your thoughts?
      </div>
    );
  }

  // Expanded
  return (
    <form className="composer composer--expanded" onSubmit={handleSubmit}>

      <div className="composer__field">
        <textarea
          ref={textareaRef}
          className="composer__textarea"
          placeholder={"Write a comment…"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onInput={autosize}
          rows={1}
        />

        <div className="composer__actions composer__actions--inset">
          <button type="button" className="btn btn--ghost" onClick={closeComposer}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={!draft.trim()}>
            Comment
          </button>
        </div>
      </div>
    </form>
  );
}

export default ChatComposer;
