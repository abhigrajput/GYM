"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginClient() {
  const [tab, setTab] = useState<"email" | "phone">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function getRedirectPath(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (!data) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: email.split("@")[0] || "User",
        role: "member",
      })
      return "/member/dashboard"
    }
    if (data.role === "owner") return "/owner/dashboard"
    if (data.role === "admin") return "/admin/dashboard"
    return "/member/dashboard"
  }

  async function handleEmailLogin() {
    setLoading(true)
    setError("")
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const path = await getRedirectPath(data.user.id)
    router.push(path)
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSendOTP() {
    setLoading(true)
    setError("")
    const fullPhone = "+91" + phone.replace(/\D/g, "")
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone })
    if (error) {
      if (error.message.includes("provider") || error.message.includes("phone")) {
        setError("Phone OTP not configured. Use Email or Google login.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }
    setOtpSent(true)
    setLoading(false)
  }

  async function handleVerifyOTP() {
    setLoading(true)
    setError("")
    const fullPhone = "+91" + phone.replace(/\D/g, "")
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: "sms",
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const path = await getRedirectPath(data.user!.id)
    router.push(path)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        backgroundImage:
          "linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Rajdhani', sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "rgba(0,255,65,0.15)",
          pointerEvents: "none",
          zIndex: 9999,
          animation: "scanline 8s linear infinite",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#0a0a0a",
          border: "1px solid rgba(0,255,65,0.3)",
          borderRadius: "4px",
          padding: "40px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, #00FF41, transparent)",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "28px",
              fontWeight: 900,
              color: "#00FF41",
              textShadow: "0 0 20px rgba(0,255,65,0.8)",
              marginBottom: "4px",
            }}
          >
            IRONIQ
          </h1>
          <p style={{ color: "#888", fontSize: "12px", fontFamily: "'Share Tech Mono', monospace" }}>
            &gt; SYSTEM ACCESS REQUIRED
          </p>
        </div>

        <div
          style={{
            display: "flex",
            marginBottom: "24px",
            border: "1px solid rgba(0,255,65,0.2)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {(["email", "phone"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setError("")
              }}
              style={{
                flex: 1,
                padding: "10px",
                background: tab === t ? "#00FF41" : "transparent",
                color: tab === t ? "#000" : "#00FF41",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Orbitron', monospace",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                transition: "all 0.2s",
              }}
            >
              {t === "email" ? "EMAIL" : "PHONE OTP"}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255,0,64,0.1)",
              border: "1px solid rgba(255,0,64,0.3)",
              borderRadius: "4px",
              padding: "10px 12px",
              marginBottom: "16px",
              color: "#FF0040",
              fontSize: "13px",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            &gt; ERROR: {error}
          </div>
        )}

        {tab === "email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  color: "#00FF41",
                  fontSize: "11px",
                  fontFamily: "'Orbitron', monospace",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                EMAIL ADDRESS
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="user@example.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderBottom: "1px solid rgba(0,255,65,0.4)",
                  outline: "none",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  color: "#00FF41",
                  fontSize: "11px",
                  fontFamily: "'Orbitron', monospace",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                PASSWORD
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderBottom: "1px solid rgba(0,255,65,0.4)",
                  outline: "none",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "14px",
                }}
              />
            </div>
            <button
              onClick={handleEmailLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: "#00FF41",
                color: "#000",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Orbitron', monospace",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                boxShadow: "0 0 20px rgba(0,255,65,0.4)",
                opacity: loading ? 0.7 : 1,
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              }}
            >
              {loading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
            </button>
          </div>
        )}

        {tab === "phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {!otpSent ? (
              <>
                <div>
                  <label
                    style={{
                      color: "#00FF41",
                      fontSize: "11px",
                      fontFamily: "'Orbitron', monospace",
                      letterSpacing: "0.1em",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    PHONE NUMBER
                  </label>
                  <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(0,255,65,0.4)" }}>
                    <span style={{ color: "#00FF41", fontFamily: "'Share Tech Mono', monospace", padding: "12px 8px 12px 0" }}>+91</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      placeholder="9876543210"
                      style={{
                        flex: 1,
                        padding: "12px 0",
                        background: "transparent",
                        color: "#fff",
                        border: "none",
                        outline: "none",
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#00FF41",
                    color: "#000",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Orbitron', monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    boxShadow: "0 0 20px rgba(0,255,65,0.4)",
                    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  }}
                >
                  {loading ? "SENDING..." : "SEND OTP"}
                </button>
                <p style={{ color: "#888", fontSize: "12px", fontFamily: "'Share Tech Mono', monospace" }}>
                  Phone OTP requires setup. Please use Email or Google login.
                </p>
              </>
            ) : (
              <>
                <div>
                  <label
                    style={{
                      color: "#00FF41",
                      fontSize: "11px",
                      fontFamily: "'Orbitron', monospace",
                      letterSpacing: "0.1em",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    ENTER OTP
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#000",
                      color: "#00FF41",
                      border: "none",
                      borderBottom: "1px solid rgba(0,255,65,0.4)",
                      outline: "none",
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "24px",
                      letterSpacing: "0.5em",
                      textAlign: "center",
                    }}
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#00FF41",
                    color: "#000",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Orbitron', monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    boxShadow: "0 0 20px rgba(0,255,65,0.4)",
                    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  }}
                >
                  {loading ? "VERIFYING..." : "VERIFY ACCESS"}
                </button>
                <button
                  onClick={() => setOtpSent(false)}
                  style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "12px", fontFamily: "'Share Tech Mono', monospace" }}
                >
                  &gt; Resend OTP
                </button>
              </>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(0,255,65,0.2)" }} />
          <span style={{ color: "#444", fontSize: "12px", fontFamily: "'Share Tech Mono', monospace" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(0,255,65,0.2)" }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "14px",
            background: "transparent",
            color: "#00FF41",
            border: "1px solid rgba(0,255,65,0.3)",
            cursor: "pointer",
            borderRadius: "4px",
            fontFamily: "'Orbitron', monospace",
            fontSize: "12px",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,255,65,0.05)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <p style={{ textAlign: "center", marginTop: "24px", color: "#444", fontSize: "13px", fontFamily: "'Share Tech Mono', monospace" }}>
          &gt; No account?{" "}
          <a href="/signup" style={{ color: "#00FF41", textDecoration: "none" }}>CREATE ACCESS</a>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600&family=Share+Tech+Mono&display=swap');
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100vh; }
        }
      `}</style>
    </div>
  )
}
