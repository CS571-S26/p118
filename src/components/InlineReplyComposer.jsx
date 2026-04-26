import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Stack } from "react-bootstrap";
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
      el.scrollIntoView({ behavior: "smooth", block: "center" });
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
    <Form className="inline-reply" onSubmit={handleSubmit}>
      <Form.Group className="inline-reply__field">
        <Form.Control
          as="textarea"
          ref={textareaRef}
          className="inline-reply__textarea"
          placeholder={`Reply to ${parent.username}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onInput={autosize}
          rows={1}
        />

        <Stack direction="horizontal" gap={2} className="inline-reply__actions inline-reply__actions--inset">
          <Button variant="outline-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!draft.trim()}>
            Reply
          </Button>
        </Stack>
      </Form.Group>
    </Form>
  );
}

export default InlineReplyComposer;