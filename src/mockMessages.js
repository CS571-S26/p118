export const MOCK_COMMENTS = [
  // Debate 1 – student loans
  {
    id: 1,
    debateId: 1,
    username: "user1",
    text: "Canceling some loans makes sense, but it should be targeted to people really struggling.",
    leaning: "Democrat",
    agreeCount: 34,
    disagreeCount: 12,
    createdAt: Date.now() - 1000 * 60 * 60 * 6, // 6h ago
    parentCommentId: null,
  },
  {
    id: 2,
    debateId: 1,
    username: "user2",
    text: "Why should taxpayers who never went to college cover someone else’s tuition bill?",
    leaning: "Conservative",
    agreeCount: 41,
    disagreeCount: 27,
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5h ago
    parentCommentId: null,
  },
  {
    id: 3,
    debateId: 1,
    username: "user3",
    text: "We should fix interest rates and repayment options first before talking about forgiveness.",
    leaning: "Democrat",
    agreeCount: 19,
    disagreeCount: 4,
    createdAt: Date.now() - 1000 * 60 * 60 * 4, // 4h ago
    parentCommentId: null,
  },
  {
    id: 4,
    debateId: 1,
    username: "user4",
    text: "Forgiveness without reform just guarantees we’ll be back here in ten years.",
    leaning: "Conservative",
    agreeCount: 23,
    disagreeCount: 16,
    createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3h ago
    parentCommentId: null,
  },
  {
    id: 5,
    debateId: 1,
    username: "user5",
    text: "I’d support partial forgiveness tied to public service or teaching in high-need areas.",
    leaning: "Democrat",
    agreeCount: 27,
    disagreeCount: 6,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
    parentCommentId: null,
  },

  // Replies (Debate 1)
  {
    id: 13,
    debateId: 1,
    username: "user6",
    text: "Targeted relief makes sense, but we should also cap interest rates going forward.",
    leaning: "Conservative",
    agreeCount: 7,
    disagreeCount: 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 1.8,
    parentCommentId: 1, // reply to user1
  },
  {
    id: 14,
    debateId: 1,
    username: "user7",
    text: "I get the fairness argument, but the current system is trapping people even when they pay.",
    leaning: "Democrat",
    agreeCount: 11,
    disagreeCount: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 1.6,
    parentCommentId: 2, // reply to user2
  },
  {
    id: 15,
    debateId: 1,
    username: "user8",
    text: "This is why tying forgiveness to reform matters — otherwise tuition just keeps rising.",
    leaning: "Conservative",
    agreeCount: 5,
    disagreeCount: 6,
    createdAt: Date.now() - 1000 * 60 * 60 * 1.4,
    parentCommentId: 14, // reply-to-reply (nested)
  },

  // Debate 2 – TikTok national security
  {
    id: 6,
    debateId: 2,
    username: "user6",
    text: "If the data risks are real, we should force a U.S.-based owner rather than outright banning it.",
    leaning: "Conservative",
    agreeCount: 18,
    disagreeCount: 7,
    createdAt: Date.now() - 1000 * 60 * 60 * 4, // 4h ago
    parentCommentId: null,
  },
  {
    id: 7,
    debateId: 2,
    username: "user7",
    text: "Most apps track us. Singling out one company only makes sense if the evidence is public.",
    leaning: "Democrat",
    agreeCount: 21,
    disagreeCount: 9,
    createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3h ago
    parentCommentId: null,
  },
  {
    id: 8,
    debateId: 2,
    username: "user8",
    text: "I don’t trust any social media platform with my data, U.S. or not.",
    leaning: "Democrat",
    agreeCount: 15,
    disagreeCount: 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
    parentCommentId: null,
  },

  // Replies (Debate 2)
  {
    id: 16,
    debateId: 2,
    username: "user9",
    text: "A forced sale sounds cleaner than a ban, but enforcement gets messy fast.",
    leaning: "Conservative",
    agreeCount: 6,
    disagreeCount: 1,
    createdAt: Date.now() - 1000 * 60 * 60 * 1.5,
    parentCommentId: 6,
  },

  // Debate 3 – insider trading in politics
  {
    id: 9,
    debateId: 3,
    username: "user9",
    text: "Members of Congress shouldn’t be trading individual stocks at all, period.",
    leaning: "Democrat",
    agreeCount: 52,
    disagreeCount: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    parentCommentId: null,
  },
  {
    id: 10,
    debateId: 3,
    username: "user10",
    text: "Blind trusts are the minimum standard if we want people to trust the system.",
    leaning: "Conservative",
    agreeCount: 33,
    disagreeCount: 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    parentCommentId: null,
  },

  // Debate 4 – MTG leaving Congress
  {
    id: 11,
    debateId: 4,
    username: "user11",
    text: "If she thinks she can have more impact outside Congress, voters will decide if that’s true.",
    leaning: "Conservative",
    agreeCount: 14,
    disagreeCount: 11,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    parentCommentId: null,
  },
  {
    id: 12,
    debateId: 4,
    username: "user12",
    text: "Honestly this says more about how polarized Congress is than about one person.",
    leaning: "Democrat",
    agreeCount: 17,
    disagreeCount: 6,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    parentCommentId: null,
  },

  // Debate 5 - Has no comments (intentional)
];
