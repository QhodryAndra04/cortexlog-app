"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validasi format email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validasi input
    if (!email || !password) {
      setError("Email dan password harus diisi");
      setIsLoading(false);
      return;
    }

    // Validasi format email
    if (!isValidEmail(email)) {
      setError("Format email tidak valid");
      setIsLoading(false);
      return;
    }

    // Validasi panjang password
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    // Simulasi login dengan delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Login berhasil
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("email", email);
    router.push("/dashboard");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#151719" }}
    >
      {/* Animated Background - Particle Network Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 120, 212, 0.1) 0%, transparent 50%)",
          }}
        ></div>
        {/* Animated blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 mix-blend-screen filter blur-3xl opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 120, 212, 0.3) 0%, transparent 70%)",
            animationDuration: "8s",
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 mix-blend-screen filter blur-3xl opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 120, 212, 0.2) 0%, transparent 70%)",
            animationDuration: "10s",
            animationDelay: "2s",
          }}
        ></div>
      </div>

      {/* Login Card Container */}
      <div className="relative w-full max-w-md z-10">
        <div
          className="rounded overflow-hidden shadow-2xl border"
          style={{
            backgroundColor: "#202428",
            borderColor: "rgba(100, 116, 139, 0.3)",
            borderRadius: "4px",
          }}
        >
          {/* Card Content */}
          <div className="p-8">
            {/* Logo Section */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: "rgba(0, 120, 212, 0.2)",
                  borderColor: "rgba(0, 120, 212, 0.5)",
                  border: "1px solid rgba(0, 120, 212, 0.5)",
                  color: "#0078d4",
                }}
              >
                🏛️
              </div>
              <div
                className="w-10 h-10 rounded flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: "rgba(0, 120, 212, 0.2)",
                  borderColor: "rgba(0, 120, 212, 0.5)",
                  border: "1px solid rgba(0, 120, 212, 0.5)",
                  color: "#0078d4",
                }}
              >
                🎓
              </div>
            </div>

            {/* Title */}
            <h1
              className="text-2xl font-bold text-center mb-2"
              style={{ color: "#ffffff" }}
            >
              CortexLog
            </h1>
            <p
              className="text-xs text-center mb-6"
              style={{ color: "#a0a0a0" }}
            >
              Sistem Deteksi Ancaman Siber | v1.0
            </p>

            {/* Divider */}
            <div
              className="h-px mb-6"
              style={{ backgroundColor: "rgba(100, 116, 139, 0.5)" }}
            ></div>

            {/* Error Message */}
            {error && (
              <div
                className="mb-4 p-3 rounded flex items-start gap-2"
                style={{
                  backgroundColor: "rgba(220, 38, 38, 0.15)",
                  borderLeft: "3px solid #ef4444",
                }}
              >
                <span className="text-lg mt-0.5">⚠️</span>
                <p className="text-sm" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2"
                  style={{ color: "#a0a0a0" }}
                >
                  EMAIL ADMINISTRATOR
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3"
                    style={{ color: "#64748b" }}
                  >
                    ✉️
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email administrator"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded transition-colors text-sm"
                    style={{
                      backgroundColor: "#0f1113",
                      borderColor: "rgba(100, 116, 139, 0.5)",
                      border: "1px solid rgba(100, 116, 139, 0.5)",
                      color: "#e5e7eb",
                      borderRadius: "4px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(0, 120, 212, 0.7)";
                      e.target.style.boxShadow =
                        "0 0 0 2px rgba(0, 120, 212, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(100, 116, 139, 0.5)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2"
                  style={{ color: "#a0a0a0" }}
                >
                  SANDI AMAN
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3"
                    style={{ color: "#64748b" }}
                  >
                    🔒
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan sandi aman"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded transition-colors text-sm"
                    style={{
                      backgroundColor: "#0f1113",
                      borderColor: "rgba(100, 116, 139, 0.5)",
                      border: "1px solid rgba(100, 116, 139, 0.5)",
                      color: "#e5e7eb",
                      borderRadius: "4px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(0, 120, 212, 0.7)";
                      e.target.style.boxShadow =
                        "0 0 0 2px rgba(0, 120, 212, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(100, 116, 139, 0.5)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                    style={{ color: "#64748b" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#a0a0a0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#64748b")
                    }
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-6 font-semibold rounded transition-colors duration-200 flex items-center justify-center gap-2 text-white"
                style={{
                  backgroundColor: isLoading ? "#0078d4" : "#0078d4",
                  opacity: isLoading ? 0.8 : 1,
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) =>
                  !isLoading &&
                  (e.currentTarget.style.backgroundColor = "#0066b0")
                }
                onMouseLeave={(e) =>
                  !isLoading &&
                  (e.currentTarget.style.backgroundColor = "#0078d4")
                }
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Mengautentikasi...</span>
                  </>
                ) : (
                  <>
                    <span>→</span>
                    <span>MASUK KE DASHBOARD</span>
                  </>
                )}
              </button>

              {/* Support Link */}
              <p
                className="text-xs text-center mt-4"
                style={{ color: "#64748b" }}
              >
                Butuh bantuan?{" "}
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: "#0078d4" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#00b4d8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#0078d4")
                  }
                >
                  Hubungi Admin
                </a>
              </p>
            </form>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-4 text-center border-t"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(100, 116, 139, 0.3)",
            }}
          >
            <p className="text-xs" style={{ color: "#64748b" }}>
              CortexLog v1.0.0
            </p>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>
              © 2026 Universitas Negeri Padang
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
