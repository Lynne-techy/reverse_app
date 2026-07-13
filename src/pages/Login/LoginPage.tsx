import { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter your email and password.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      /*
        To call backend later
        Example:
        await login({
            email: trimmedEmail,
            password: trimmedPassword
        });
      */
      console.log("Login button clicked", {
        email: trimmedEmail,
        password: trimmedPassword,
        rememberMe,
      });
    } catch (err) {
      setError("Unable to log in. Please try again.");
    } finally {
      // Whether login succeeds or fails, re-enable the button.
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "kakao" | "google") => {
    console.log(`${provider} login clicked`);
    // TODO: 백엔드 API 필요 (replace with real OAuth redirect / API call)
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <span className="cloud cloud--top" />
        <span className="cloud cloud--bottom" />

        <div className="login-hero__content">
          <h1 className="login-logo">
            Re
            <span className="login-logo__accent">:</span>
            Verse
          </h1>
          <p className="login-tagline">내가 적은 만큼 만나는 하나님</p>
        </div>
      </div>

      <div className="login-card">
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <div className="login-social">
          <button
            type="button"
            className="btn btn--kakao"
            onClick={() => handleSocialLogin("kakao")}
          >
            <span className="btn__icon">💬</span> 카카오로 시작하기
          </button>

          <button
            type="button"
            className="btn btn--google"
            onClick={() => handleSocialLogin("google")}
          >
            <span className="btn__icon">🔵</span> Google로 시작하기
          </button>
        </div>

        <div className="login-divider">
          <span />
          <p>or</p>
          <span />
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <label className="checkbox-field" htmlFor="rememberMe">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            로그인 상태 유지
          </label>

          <button type="submit" className="btn btn--primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-terms">
          계속 진행하면 이용약관 및 개인정보처리방침에 동의합니다
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
