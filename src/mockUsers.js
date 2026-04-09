export const MOCK_USERS = [
  {
    id: "user_1",
    username: "test",
    email: "loan.forgiver@example.com",
    passwordHash: "test", // placeholder
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60, // ~60 days ago
    leaning: "Democrat",
    isBanned: false,
    role: "user",
    // aggregated stats (frontend-side makeshift backend)
    totalComments: 12,
    totalReplies: 4,
    netScore: 87,
  },
  {
    id: "user_2",
    username: "freeMarketMax",
    email: "max@example.com",
    passwordHash: "hashed_pw_freeMarketMax",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // ~30 days ago
    leaning: "Conservative",
    isBanned: false,
    role: "user",
    totalComments: 3,
    totalReplies: 10,
    netScore: 5,
  },
  {
    id: "user_3",
    username: "centristSam",
    email: "sam@example.com",
    passwordHash: "hashed_pw_centristSam",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // ~10 days ago
    leaning: "Democrat",
    isBanned: false,
    role: "mod",
    totalComments: 7,
    totalReplies: 2,
    netScore: 12,
  },
  {
    id: "user_4",
    username: "siteAdmin",
    email: "admin@example.com",
    passwordHash: "hashed_pw_siteAdmin",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120, // ~120 days ago
    leaning: "Conservative",
    isBanned: false,
    role: "admin",
    totalComments: 21,
    totalReplies: 8,
    netScore: 140,
  },
  {
    id: "user_5",
    username: "bannedTroll",
    email: "troll@example.com",
    passwordHash: "hashed_pw_bannedTroll",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // ~5 days ago
    leaning: "Conservative",
    isBanned: true,
    role: "user",
    totalComments: 0,
    totalReplies: 0,
    netScore: -12,
  },
];
