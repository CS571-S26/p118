import React, { useState } from "react";

export default function LoginPage({ onLogin, onClose }) {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(usernameInput, passwordInput);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="login-overlay" onClick={handleOverlayClick}>
      {/* stop clicks inside the card from closing it */}
      <div className="login" onClick={(e) => e.stopPropagation()}>
        <header className="login-header">
          <span className="logo">HOTSEAT</span>
          <span className="login-text">Login</span>
          <button
            type="button"
            className="close-form__btn"
            onClick={onClose}
          >
            X
          </button>
        </header>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="username-label">Email or Username</label>
            <input
              type="text"
              placeholder="Enter email or username"
              className="login_username-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="password-label">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="login_password-input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button
              type="button"
              className="forgot-password__btn"
              onClick={() => { /* placeholder */ }}
            >
              Forgot password?
            </button>
          </div>

          <button className="login__btn" type="submit">
            Login
          </button>
        </form>

        <footer className="login-footer">
          <span className="footer-text">Don't have an account?</span>
          <button
            className="create-account__btn"
            type="button"
            onClick={() => { /* placeholder */ }}
          >
            Create an account
          </button>
        </footer>
      </div>
    </div>
  );
}


