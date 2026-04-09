import React, { useEffect, useState } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import DebatePage from "./pages/DebatePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SavedDebatesPage from "./pages/SavedDebatesPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { MOCK_DEBATES } from "./mockDebates.js";
import { MOCK_USERS } from "./mockUsers.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import useCommentsStore from "./stores/useCommentsStore.js";


function App() {
  const [debates, setDebates] = useState(MOCK_DEBATES);
  const navigate = useNavigate();
  
  const { currentUser, login, logout, requireLogin, showLogin, setShowLogin } = useAuth();
  const comments = useCommentsStore((s) => s.comments);
  const commentVotesByUser = useCommentsStore((s) => s.votesByUser);
  const resetVotes = useCommentsStore((s) => s.resetVotes);

  //Active tab state for homepage
  const [activeTab, setActiveTab] = useState("Trending");

  // -------- auth helpers (moved to AuthContext) ----------
  // Freeze background while login is open to prevent scrolling
  useEffect(() => {
    if (showLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogin]);

  // Adapter: keep an app-local login handler that accepts username/password
  // (LoginPage calls onLogin(username, password)). We validate using MOCK_USERS
  // and then call `login(user)` from context.
  const handleLogin = (username, password) => {
    const user = MOCK_USERS.find((u) => u.username === username);
    if (!user || user.passwordHash !== password) {
      alert("username or password is incorrect");
      return;
    }
    login(user);
  };

  // App-level logout wrapper to clear app-specific state as well
  const handleLogout = () => {
    logout();
    resetVotes();
  };
  // comment handlers now live in Zustand store (useCommentsStore)

  // -------- derived metrics for each debate ----------
  const debatesWithCounts = debates.map((d) => {

    const debateComments = comments.filter((c) => c.debateId === d.id);
    const numComments = debateComments.length;

    // Total "quality" = sum of (agree - disagree) per comment, floored at 0
    const rawCommentScoreSum = debateComments.reduce(
      (sum, c) => sum + (c.agreeCount - c.disagreeCount),
      0
    );
    const commentScoreSum = Math.max(rawCommentScoreSum, 0);

    // “Cross-lean engagement” balance based on # of comments by leaning
    const conservativeCommentCount = debateComments.filter((c) => c.leaning === "Conservative").length;
    const democratCommentCount = debateComments.filter((c) => c.leaning === "Democrat").length;
    const totalComments = Math.max(conservativeCommentCount + democratCommentCount, 1);

    const p = conservativeCommentCount / totalComments;
    const q = democratCommentCount / totalComments;

    // peaks when split is ~50/50 means more controversy/both sides engaged
    const controversyScore = 4 * p * q;

    // The popularity score is based on total comments
    const popularityScore = Math.log10(numComments + 1);

    // The quality score is based on total comment agree/disagree counts
    const qualityScore = Math.log10(commentScoreSum + 1);

    const POPULARITY_WEIGHT = 0.35;
    const COMMENT_QUALITY_WEIGHT = 0.1;
    const CONTROVERSY_WEIGHT = 0.65;
    
    // final heat score based on weighted sum of commet popularity, quality, and controversy (split between leanings)
    const heat =
      COMMENT_QUALITY_WEIGHT * qualityScore +
      POPULARITY_WEIGHT * popularityScore +
      CONTROVERSY_WEIGHT * controversyScore;

    return {
      ...d,
      commentCount: numComments,
      heat,
    };
  });

  // normalize + curve heat to 0–100
  const maxHeat = Math.max(...debatesWithCounts.map((d) => d.heat), 1);

  const debatesWithDisplayHeat = debatesWithCounts.map((d) => {
    const normalized = d.heat / maxHeat;
    const curved = Math.pow(normalized, 1.3);
    const heatPercent = Math.round(curved * 100);

    return {
      ...d,
      heatPercent,
    };
  });

  return (
    <>
      {showLogin && (
        <LoginPage
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              debates={debatesWithDisplayHeat}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          }
        />
        <Route path="/debate/:id" element={<DebateRouteWrapper debates={debatesWithDisplayHeat} />} />
        <Route path="/profile" element={
          <ProfilePage 
            onBack={() => navigate('/')} 
          />} 
        />
        <Route path="/saved" element={<SavedDebatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={
            <HomePage
              debates={debatesWithDisplayHeat}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;


// Top-level route wrapper moved out of `App` so it remains stable across
// re-renders (voting/other store updates in App shouldn't remount this).
function DebateRouteWrapper({ debates }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const debate = debates.find((d) => String(d.id) === String(id)) ?? null;
  if (!debate) {
    return (
      <div className="app">
        <main style={{ padding: 24 }}>
          <h2>Debate not found</h2>
          <button className="btn" onClick={() => navigate('/')}>Back to home</button>
        </main>
      </div>
    );
  }

  return <DebatePage debate={debate} onBack={() => navigate('/')} />;
}
