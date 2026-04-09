import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DebateCard from "../components/DebateCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function HomePage({
    debates,
    activeTab,
    setActiveTab,
}) {
    const { currentUser, logout, requireLogin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    let filteredDebates = debates;

    //Filter debates by by leaning
    if (activeTab == "Leans Conservative") {
        filteredDebates = debates.filter((d) => d.leaning == "Conservative");
    } else if (activeTab == "Leans Democrat") {
        filteredDebates = debates.filter((d) => d.leaning == "Democrat");
    }

    //sort debates by Trending = heat, recent = createdAt, lean tabs default to heat
    let visibleDebates = [...filteredDebates];

    if (activeTab === "Recent") {
        visibleDebates.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else {
        visibleDebates.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
    }

    const topDebate = visibleDebates[0] ?? null;
    const otherDebates = visibleDebates.slice(1);

    useEffect(() => {
        const onDown = (e) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const handleLoginClick = () => {
        requireLogin();
    };

    return (
        <div className="app">
            {/* Top navigation / header */}
            <header className="app-header">
                <div className="app-header__left">
                    <span className="logo">HOTSEAT</span>
                    <nav className="nav">
                        <button
                            className={
                                "nav__item" + (activeTab === "Trending" ? " nav__item--active" : "")
                            }
                            onClick={() => setActiveTab("Trending")}
                        >
                            Trending
                        </button>

                        <button
                            className={
                                "nav__item" + (activeTab === "Recent" ? " nav__item--active" : "")
                            }
                            onClick={() => setActiveTab("Recent")}
                        >
                            Recent
                        </button>

                        <button
                            className={
                                "nav__item" +
                                (activeTab === "Leans Conservative" ? " nav__item--active" : "")
                            }
                            onClick={() => setActiveTab("Leans Conservative")}
                        >
                            Leans Conservative
                        </button>

                        <button
                            className={
                                "nav__item" +
                                (activeTab === "Leans Democrat" ? " nav__item--active" : "")
                            }
                            onClick={() => setActiveTab("Leans Democrat")}
                        >
                            Leans Democrat
                        </button>
                    </nav>
                </div>

                <div className="app-header__center">
                    <input
                        type="search"
                        placeholder="search debates"
                        className="search-input search-input--large"
                    />
                </div>
                <div className="app-header__right">
                    {/* Notification bell icon */}
                    <button className="notifications-btn">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 01-3.46 0" />
                        </svg>
                    </button>

                    {!currentUser ? (
                        <button type="button" className="btn btn--primary" onClick={handleLoginClick}>
                            Login
                        </button>
                    ) : (
                        <div className="user-menu" ref={menuRef}>
                            <button type="button" className="btn btn--primary" onClick={() => setMenuOpen((open) => !open)}>
                                {currentUser.username} <span className={"caret" + (menuOpen ? " is-open" : "")}>▾</span>
                            </button>
                            {menuOpen && (
                                <div className="dropdown-menu">
                                    <button type="button"
                                        className="menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/profile");
                                        }}>
                                        Profile
                                    </button>
                                    <button type="button"
                                        className="menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/saved");
                                        }}>
                                        Saved Debates
                                    </button>
                                    <button type="button"
                                        className="menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/settings");
                                        }}>
                                        Settings
                                    </button>
                                    <button type="button" className="menu-item" onClick={() => { setMenuOpen(false); logout(); }}>Logout</button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </header>

            <main className="home">
                {/* Top debate */}
                {topDebate ? (
                    <DebateCard
                        {...topDebate}
                        variant="featured"
                        onClick={() => navigate(`/debate/${topDebate.id}`)}
                    />
                ) : (
                    //No debates match filter and therefor no top debate
                    <section className="home__top-debate">
                        <div className="top-debate top-debate--empty">
                            <h2 className="top-debate__title">
                                No debates found for this filter.
                            </h2>
                        </div>
                    </section>
                )}

                {/* grid of other debates */}
                <section className="home__debate-grid">
                    <h2 className="section-title">Debates happening now</h2>
                    <div className="debate-grid">
                        {otherDebates.map((debate) => (
                            <div
                                key={debate.id}
                                onClick={() => navigate(`/debate/${debate.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <DebateCard {...debate} />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

