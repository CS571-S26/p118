import React, { useEffect, useRef, useState } from "react";
import useCommentsStore from "../stores/useCommentsStore.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function InlineReplyComposer({ parent, onClose }) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef(null);

  const autosize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;

      // Scroll it into view first
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Then focus + autosize
      el.focus({ preventScroll: true });
      autosize();
    });
  }, []);


  useEffect(() => {
    autosize();
  }, [draft]);

  const addComment = useCommentsStore((s) => s.addComment);
  const { requireLogin, currentUser } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    if (!requireLogin?.()) return;

    addComment(parent.debateId, text, parent.id, currentUser);
    setDraft("");
    onClose?.();
  };

  return (
    <form className="inline-reply" onSubmit={handleSubmit}>
      <div className="inline-reply__field">
        <textarea
          ref={textareaRef}
          className="inline-reply__textarea"
          placeholder={`Reply to ${parent.username}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onInput={autosize}
          rows={1}
        />

        <div className="inline-reply__actions inline-reply__actions--inset">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={!draft.trim()}>
            Reply
          </button>
        </div>
      </div>
    </form>
  );
}

export default InlineReplyComposer;
