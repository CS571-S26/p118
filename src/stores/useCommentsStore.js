import {create} from 'zustand';
import { MOCK_COMMENTS } from '../mockMessages.js';

export const useCommentsStore = create((set, get) => ({
  comments: (() => {
    try {
      const raw = localStorage.getItem("hotseat_comments");
      return raw ? JSON.parse(raw) : MOCK_COMMENTS ?? [];
    } catch (e) {
      return MOCK_COMMENTS ?? [];
    }
  })(),
  votesByUser: (() => {
    try {
      const raw = localStorage.getItem("hotseat_votesByUser");
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  })(),

  setComments: (comments) => set({ comments }),

  addComment: (debateId, text, parentCommentId = null, user = null) => {
    const newComment = {
      id: Date.now(),
      debateId,
      username: user?.username ?? '@You',
      text,
      leaning: user?.leaning ?? 'Neutral',
      agreeCount: 0,
      disagreeCount: 0,
      createdAt: Date.now(),
      parentCommentId,
    };
    console.log(user, 'is adding comment:', newComment);
    set((state) => {
      const next = { comments: [...state.comments, newComment], votesByUser: state.votesByUser };
      try {
        localStorage.setItem("hotseat_comments", JSON.stringify(next.comments));
      } catch (e) {}
      return { comments: next.comments };
    });
    return newComment;
  },

  voteComment: (commentId, type) => {
    const prevVote = get().votesByUser[commentId] ?? null;
    const newVote = prevVote === type ? null : type;

    set((state) => {
      const updatedComments = state.comments.map((msg) => {
        if (msg.id !== commentId) return msg;

        let agree = msg.agreeCount;
        let disagree = msg.disagreeCount;

        if (prevVote === 'agree') {
          agree = Math.max(0, agree - 1);
        }
        if (prevVote === 'disagree') {
          disagree = Math.max(0, disagree - 1);
        }

        if (newVote === 'agree') agree += 1;
        if (newVote === 'disagree') disagree += 1;

        return { ...msg, agreeCount: agree, disagreeCount: disagree };
      });

      const next = { comments: updatedComments, votesByUser: { ...state.votesByUser, [commentId]: newVote } };
      try {
        localStorage.setItem("hotseat_comments", JSON.stringify(next.comments));
        localStorage.setItem("hotseat_votesByUser", JSON.stringify(next.votesByUser));
      } catch (e) {}

      return { comments: next.comments, votesByUser: next.votesByUser };
    });
  },

  resetVotes: () => {
    try {
      localStorage.removeItem("hotseat_votesByUser");
    } catch (e) {}
    set({ votesByUser: {} });
  },

  getCommentsForDebate: (debateId) => {
    return get().comments.filter((c) => c.debateId === debateId);
  },

  getHotSeatForDebate: (debateId) => {
    const debateComments = get().comments.filter((c) => c.debateId === debateId);
    const score = (m) => (m.agreeCount ?? 0) - (m.disagreeCount ?? 0);

    const hotSeatConservative =
      debateComments
        .filter((msg) => msg.leaning === 'Conservative')
        .sort((a, b) => score(b) - score(a))[0] ?? null;

    const hotSeatDemocrat =
      debateComments
        .filter((msg) => msg.leaning === 'Democrat')
        .sort((a, b) => score(b) - score(a))[0] ?? null;

    return { hotSeatConservative, hotSeatDemocrat };
  },
}));

export default useCommentsStore;
