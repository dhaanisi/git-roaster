"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type Intensity = "mild" | "brutal" | "savage";

interface GitHubProfile {
  name: string | null;
  login: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface RoastResult {
  roast: string;
  score: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

const LOADING_MSGS = [
  "↳ fetching profile…",
  "↳ reading commit history…",
  "↳ judging your repo names…",
  "↳ counting empty READMEs…",
  "↳ crafting the perfect burns…",
];

const INTENSITIES: { value: Intensity; label: string }[] = [
  { value: "mild", label: "🌶 Mild" },
  { value: "brutal", label: "🔥 Brutal" },
  { value: "savage", label: "💀 Savage" },
];

// ── Main component ─────────────────────────────────────────────────────────
export default function Home() {
  const [username, setUsername] = useState("");
  const [intensity, setIntensity] = useState<Intensity>("mild");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Main handler ─────────────────────────────────────────────────────────
  async function startRoast() {
    const u = username.trim();
    if (!u) return;

    setLoading(true);
    setProfile(null);
    setResult(null);
    setError(null);

    // Cycle loading messages
    let idx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const msgTimer = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[idx]);
    }, 1200);

    try {
      // Send orchestration payload to our Edge handler
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, intensity }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Roast failed");
      }

      // Check if we have headers containing the Profile metadata 
      // (Sent as fallback or custom profile strip parsing if desired)
      // For standard streaming apps, you can construct a skeleton object or wait for stream end
      // For now, let's provision a baseline fallback so your UI components stay active
      setProfile({
        login: u,
        name: u,
        avatar_url: `https://github.com/${u}.png`,
        bio: "",
        public_repos: 0,
        followers: 0,
        following: 0,
      });

      if (!res.body) {
        throw new Error("No response body stream found.");
      }

      // Instantiate stream reader
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let cumulativeText = "";

      // Turn off full loading screen once stream tokens begin arriving
      clearInterval(msgTimer);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value);
        cumulativeText += textChunk;

        // Generate dynamic scoring based on data metrics or assign evaluation on completion
        setResult({
          roast: cumulativeText,
          score: 85 // Static evaluation fallback or increment hook
        });
      }

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      clearInterval(msgTimer);
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") startRoast();
  }

  function copyRoast() {
    if (!result) return;
    navigator.clipboard.writeText(result.roast).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareX() {
    if (!result) return;
    const text = encodeURIComponent(
      `My GitHub just got roasted 💀\n\n"${result.roast.slice(0, 160)}…"\n\ngitroast.dev`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="page">

      {/* Header */}
      <header className="header">
        <div className="badge">
          <span className="badge-dot" />
          AI-powered roasts
        </div>
        <h1>
          Your GitHub,<br />
          <span className="accent">roasted.</span>
        </h1>
        <p className="sub">
          Drop a username. Get brutally honest feedback<br />
          about your code life choices.
        </p>
      </header>

      {/* Input card */}
      <div className="input-card">
        <div className="field-label">GitHub username</div>

        <div className="input-row">
          <span className="prefix">github.com /</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKey}
            placeholder="your-username"
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
        </div>

        <div className="divider" />

        {/* Intensity chips */}
        <div className="chip-row">
          {INTENSITIES.map(({ value, label }) => (
            <button
              key={value}
              className={`chip ${intensity === value ? "active" : ""}`}
              onClick={() => setIntensity(value)}
              disabled={loading}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Roast Me button */}
        <button
          className="roast-btn"
          onClick={startRoast}
          disabled={loading || !username.trim()}
        >
          {loading ? (
            <>
              <Spinner />
              Roasting…
            </>
          ) : (
            <>
              <FlameIcon />
              Roast Me
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && !result && (
        <>
          <div className="progress">
            <div className="progress-fill" />
          </div>
          <p className="status-text">{loadingMsg}</p>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="error-card">
          ↳ {error}. Double-check the username and try again.
        </div>
      )}

      {/* Profile strip */}
      {profile && result && (
        <div className="profile-strip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="avatar" src={profile.avatar_url} alt={profile.login} />
          <div className="pinfo">
            <div className="pname">{profile.name || profile.login}</div>
            <div className="phandle">@{profile.login}</div>
          </div>
          <div className="pstats">
            <div className="ps">
              <div className="psv">{fmt(profile.public_repos)}</div>
              <span className="psl">repos</span>
            </div>
            <div className="ps">
              <div className="psv">{fmt(profile.followers)}</div>
              <span className="psl">followers</span>
            </div>
          </div>
        </div>
      )}

      {/* Roast card */}
      {result && (
        <div className="roast-card">
          <div className="roast-meta">
            <span className="roast-label">The verdict</span>
            <span className="score-pill">{result.score} / 100</span>
          </div>

          <p className="roast-body">{result.roast}</p>

          {/* Heat bar */}
          <div className="heat-row">
            <span className="heat-label">Burn level</span>
            <div className="heat-track">
              <div
                className="heat-fill"
                style={{ width: `${result.score}%` }}
              />
            </div>
            <span className="heat-val">{result.score}%</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {result && !loading && (
        <div className="actions">
          <button className="act-btn" onClick={copyRoast}>
            <CopyIcon />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button className="act-btn" onClick={shareX}>
            <XIcon />
            Share
          </button>
          <button className="act-btn" onClick={startRoast} disabled={loading}>
            <RefreshIcon />
            Again
          </button>
        </div>
      )}

      <footer className="footer">
        gitroast · your code shame, publicly archived
      </footer>

      {/* ── Styles ── */}
      <style jsx>{`
        /* Layout */
        .page {
          max-width: 680px;
          margin: 0 auto;
          padding: 64px 24px 80px;
          font-family: var(--font-geist), system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Header */
        .header { margin-bottom: 48px; }

        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #ff4d0012; border: 1px solid #ff4d0030;
          color: #ff7733; border-radius: 100px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.3px;
          padding: 4px 10px; margin-bottom: 20px;
        }
        .badge-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #ff4d00;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        h1 {
          font-size: 36px; font-weight: 600; letter-spacing: -1.5px;
          color: #e8e8e8; line-height: 1.1; margin-bottom: 10px;
        }
        .accent { color: #ff4d00; }
        .sub { font-size: 14px; color: #888; font-weight: 400; line-height: 1.6; }

        /* Input card */
        .input-card {
          background: #141414; border: 1px solid #222;
          border-radius: 12px; padding: 20px; margin-bottom: 12px;
        }
        .field-label {
          font-size: 11px; font-weight: 500; color: #444;
          letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px;
        }
        .input-row { display: flex; gap: 10px; align-items: center; }
        .prefix {
          font-family: var(--font-geist-mono), monospace;
          font-size: 13px; color: #444; white-space: nowrap; flex-shrink: 0;
        }
        input[type="text"] {
          flex: 1; background: transparent; border: none; outline: none;
          color: #e8e8e8; font-family: var(--font-geist-mono), monospace;
          font-size: 14px; caret-color: #ff4d00; min-width: 0;
        }
        input::placeholder { color: #444; }

        .divider { height: 1px; background: #222; margin: 16px 0; }

        /* Chips */
        .chip-row { display: flex; gap: 6px; margin-bottom: 16px; }
        .chip {
          flex: 1; padding: 7px 0; border-radius: 7px; cursor: pointer;
          border: 1px solid #2a2a2a; background: transparent;
          font-family: var(--font-geist), sans-serif;
          font-size: 12px; font-weight: 500; color: #888;
          transition: all 0.15s; text-align: center;
        }
        .chip:hover:not(:disabled) { border-color: #444; color: #e8e8e8; }
        .chip.active { background: #ff4d0015; border-color: #ff4d0050; color: #ff7733; }
        .chip:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Roast button */
        .roast-btn {
          width: 100%; padding: 13px 0; border-radius: 9px;
          background: #ff4d00; border: none; cursor: pointer;
          font-family: var(--font-geist), sans-serif;
          font-size: 14px; font-weight: 600; color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s, opacity 0.15s;
          position: relative; overflow: hidden;
        }
        .roast-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #ffffff18 0%, transparent 60%);
          pointer-events: none;
        }
        .roast-btn:hover:not(:disabled) { background: #e84500; }
        .roast-btn:active { transform: scale(0.98); }
        .roast-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Progress */
        .progress {
          height: 1px; background: #222; border-radius: 1px;
          overflow: hidden; margin-bottom: 16px;
        }
        .progress-fill {
          height: 100%; background: linear-gradient(90deg, #ff4d00, #ff7733);
          animation: prog 2.5s ease-in-out infinite;
        }
        @keyframes prog {
          0%   { width:0%;  margin-left:0%; }
          50%  { width:70%; margin-left:15%; }
          100% { width:0%;  margin-left:100%; }
        }
        .status-text {
          font-size: 12px; color: #444; margin-bottom: 20px;
          font-family: var(--font-geist-mono), monospace;
        }

        /* Error */
        .error-card {
          font-size: 12px; color: #888; padding: 14px 16px;
          background: #141414; border: 1px solid #222; border-radius: 10px;
          margin-bottom: 12px; font-family: var(--font-geist-mono), monospace;
        }

        /* Profile strip */
        .profile-strip {
          background: #141414; border: 1px solid #222;
          border-radius: 12px; padding: 16px 18px;
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 12px;
          animation: up 0.35s ease;
        }
        @keyframes up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .avatar { width:40px; height:40px; border-radius:8px; object-fit:cover; border:1px solid #2a2a2a; flex-shrink:0; }
        .pinfo { flex:1; min-width:0; }
        .pname { font-size:14px; font-weight:600; color:#e8e8e8; letter-spacing:-0.3px; }
        .phandle { font-size:12px; color:#888; margin-top:1px; font-family:var(--font-geist-mono),monospace; }
        .pstats { display:flex; gap:14px; }
        .ps { text-align:right; }
        .psv { font-size:15px; font-weight:600; color:#e8e8e8; letter-spacing:-0.5px; font-family:var(--font-geist-mono),monospace; }
        .psl { font-size:10px; color:#444; font-weight:500; text-transform:uppercase; letter-spacing:0.3px; display:block; }

        /* Roast card */
        .roast-card {
          background:#141414; border:1px solid #222;
          border-radius:16px; padding:32px; margin-bottom:16px;
          animation: up 0.4s ease;
        }
        .roast-meta { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
        .roast-label { font-size:11px; font-weight:500; color:#555; text-transform:uppercase; letter-spacing:1px; }
        .score-pill {
          background:#ff4d0015; border:1px solid #ff4d0025;
          color:#ff7733; border-radius:100px;
          font-size:12px; font-weight:600; padding:4px 12px;
          font-family:var(--font-geist-mono),monospace;
        }
        .roast-body { 
          font-size:15px; 
          line-height:2.0; 
          color:#c8c8c8; 
          white-space: pre-wrap;
          letter-spacing: -0.1px;
        }
        .heat-row { display:flex; align-items:center; gap:10px; margin-top:18px; padding-top:16px; border-top:1px solid #222; }
        .heat-track { flex:1; height:3px; background:#222; border-radius:2px; overflow:hidden; }
        .heat-fill { height:100%; background:linear-gradient(90deg,#ffd700,#ff7733,#ff4d00); border-radius:2px; transition:width 1.2s cubic-bezier(0.22,1,0.36,1); }
        .heat-label { font-size:11px; color:#444; white-space:nowrap; }
        .heat-val { font-size:12px; font-weight:600; color:#ff7733; font-family:var(--font-geist-mono),monospace; white-space:nowrap; }

        /* Actions */
        .actions { display:flex; gap:8px; margin-bottom:12px; }
        .act-btn {
          flex:1; padding:10px; border-radius:8px;
          border:1px solid #2a2a2a; background:transparent;
          font-family:var(--font-geist),sans-serif;
          font-size:12px; font-weight:500; color:#888;
          cursor:pointer; transition:all 0.15s;
          display:flex; align-items:center; justify-content:center; gap:6px;
        }
        .act-btn:hover:not(:disabled) { border-color:#444; color:#e8e8e8; background:#1a1a1a; }
        .act-btn:disabled { opacity:0.4; cursor:not-allowed; }

        .footer { margin-top:40px; font-size:11px; color:#333; text-align:center; }
      `}</style>
    </main>
  );
}

// ── Inline icons ───────────────────────────────────────────────────────────
function FlameIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5C5 1.5 3 4 3 6.5c0 1.5.6 2.6 1.5 3.5.4.4.5.9.5 1.5v.5h6v-.5c0-.6.1-1.1.5-1.5C12.4 9.1 13 8 13 6.5 13 4 11 1.5 8 1.5z" />
      <path d="M6 12h4M6.5 14h3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="5" y="5" width="9" height="9" rx="2" />
      <path d="M11 5V3a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2h2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v4h4M15 12v-4h-4" />
      <path d="M13.5 6A6 6 0 003.3 4.7L1 7M2.5 10a6 6 0 0010.2 1.3L15 9" />
    </svg>
  );
}