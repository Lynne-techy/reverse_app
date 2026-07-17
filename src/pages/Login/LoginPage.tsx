import { useState } from "react";
import "./LoginPage.css";

const onboardingSlides = [
  {
    emoji: "✍️",
    title: "성경을 읽지 말고, 쓰세요",
    description:
    "한 글자씩 손으로 옮겨 적을 때 비로소 보이는 것들이 있습니다. 가장 적극적인 성경 읽기.",
  },
  {
    emoji: "🌾",
    title: "적은 만큼 쌓입니다",
    description:
    "31,102절 도트맵과 365일 잔디로, 당신이 만난 시간이 눈에 보이는 형태로 남습니다.",
  },
  {
    emoji: "🌍",
    title: "한국어로, 그리고 영어로",
    description:
    "좌=우리말 / 우=NIV. 한 글자씩 대조하며 묵상과 영어를 동시에.",
  },
];

function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setShowLogin(true);
    }
  };

  const handleSkip = () => {
    setShowLogin(true);
  };

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
      console.log("Login button clicked", {
        email: trimmedEmail,
        password: trimmedPassword,
        rememberMe,
      });

      // TODO
      // await login(...)
    } catch {
      setError("Unable to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "kakao" | "google") => {
    console.log(`${provider} login clicked`);
  };

  return (
    <div className="login-page">
    

{!showLogin ? (

  <section className="onboarding-screen">

    <div className="hero-cloud hero-cloud-left"></div>
    <div className="hero-cloud hero-cloud-right"></div>
    <div className="hero-sun"></div>

    <div className="onboarding-content">

      <h1 className="login-logo">
        Re
        <span className="login-logo-accent">:</span>
        Verse
      </h1>

      <p className="login-tagline">
        내가 적은 만큼 만나는 하나님
      </p>

      <div className="onboarding-body">

        <div className="onboarding-icon">
          {onboardingSlides[currentSlide].emoji}
        </div>

        <h2 className="onboarding-title">
          {onboardingSlides[currentSlide].title}
        </h2>

        <p className="onboarding-description">
          {onboardingSlides[currentSlide].description}
        </p>

      </div>

      <div className="onboarding-dots">

        {onboardingSlides.map((_, index) => (
          <span
            key={index}
            className={
              index === currentSlide
                ? "dot active"
                : "dot"
            }
          />
        ))}

      </div>

      <button
        className="btn btn-onboarding-next"
        onClick={handleNext}
      >
        {currentSlide ===
        onboardingSlides.length - 1
          ? "시작하기"
          : "다음"}
      </button>

      <button
        className="onboarding-skip"
        onClick={handleSkip}
      >
        건너뛰기
      </button>

    </div>

  </section>

) : (
  <>
      <section className="login-hero">
        <div className="hero-cloud hero-cloud-left"></div>
        <div className="hero-cloud hero-cloud-right"></div>
        <div className="hero-sun"></div>

        <div className="login-hero-content">
          <h1 className="login-logo">
            Re<span className="login-logo-accent">:</span>Verse
          </h1>

          <p className="login-tagline">
            내가 적은 만큼 만나는 하나님
          </p>
        </div>
      </section>

      {/* ================= CARD ================= */}

      <main className="login-card">

        <div className="login-card-header">
          <h2>환영합니다</h2>

          <p>
            로그인하여 오늘의 말씀을 만나보세요.
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {/* ================= SOCIAL ================= */}

        <div className="social-buttons">

          <button
            type="button"
            className="btn btn-kakao"
            onClick={() => handleSocialLogin("kakao")}
          >
            <span className="social-icon">💬</span>

            카카오로 시작하기
          </button>

          <button
            type="button"
            className="btn btn-google"
            onClick={() => handleSocialLogin("google")}
          >
            <span className="social-icon">🔵</span>

            Google로 시작하기
          </button>

        </div>

        <div className="login-divider">
          <span></span>
          <p>또는</p>
          <span></span>
        </div>

        {/* ================= LOGIN FORM ================= */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <label
            className="remember-me"
            htmlFor="rememberMe"
          >
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
            />

            로그인 상태 유지
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="login-terms">
          계속 진행하면 이용약관 및 개인정보처리방침에 동의합니다.
        </p>

      </main>
    </>
)}

    </div>
  );
}

export default LoginPage;
