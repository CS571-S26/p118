// ChatComposer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Stack } from "react-bootstrap";
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
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    const isReplying = replyTo?.id != null;
    if (isReplying) closeComposer();
  }, [replyTo?.id]);

  const openComposer = () => {
    if (!requireLogin?.()) return;
    setReplyTo(null);
    setIsExpanded(true);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
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
    <Form className="composer composer--expanded" onSubmit={handleSubmit}>
      <Form.Group className="composer__field">
        <Form.Control
          as="textarea"
          ref={textareaRef}
          className="composer__textarea"
          placeholder="Write a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onInput={autosize}
          rows={1}
        />

        <Stack direction="horizontal" gap={2} className="composer__actions composer__actions--inset">
          <Button variant="outline-secondary" onClick={closeComposer}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!draft.trim()}>
            Comment
          </Button>
        </Stack>
      </Form.Group>
    </Form>
  );
}

export default ChatComposer;