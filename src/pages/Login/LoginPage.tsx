import { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  
  // State 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Event Handlers 
    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter your email and password.");
      return;
    }

    // 나중에 API call로 업뎃
    console.log("Login button clicked");
    console.log({
      email,
      password,
      rememberMe,
    });
  };

  return (
    <div>

      <h1>Login</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleLogin}>

        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <br />

        <label>

          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />

          로그인 상태 유지

        </label>

        <br />
        <br />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}

export default LoginPage;
