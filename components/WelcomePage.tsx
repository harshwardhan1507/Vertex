'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="welcome-root">
      {/* Background Glow Effect */}
      <div className="welcome-bg-glow" />

      {/* Header */}
      <header
        className={`welcome-header ${mounted ? 'welcome-fade-in' : 'welcome-hidden'}`}
      >
        {/* Logo */}
        <Link href="/" className="welcome-logo" id="vertex-logo">
          <div className="welcome-logo-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 7L12 15L20 7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="welcome-logo-text">Vertex</span>
        </Link>

        {/* Log in Button */}
        <Link href="/login" className="welcome-login-btn" id="header-login-btn">
          Log in
        </Link>
      </header>

      {/* Main Content */}
      <main className="welcome-main">
        {/* Title Section */}
        <section
          className={`welcome-title-section ${mounted ? 'welcome-slide-up' : 'welcome-hidden'}`}
        >
          <h1 className="welcome-title" id="welcome-heading">
            Welcome to Vertex
          </h1>
          <p className="welcome-subtitle">Campus Operating System</p>
        </section>

        {/* Illustration */}
        <section
          className={`welcome-illustration ${mounted ? 'welcome-scale-in' : 'welcome-hidden'}`}
        >
          <div className="welcome-illustration-blob" />
          <Image
            src="/welcome-illustration.png"
            alt="Welcome Illustration showing a person with a clipboard and signposts"
            width={280}
            height={280}
            priority
            className="welcome-illustration-img"
          />
        </section>

        {/* Action Section */}
        <section
          className={`welcome-action ${mounted ? 'welcome-slide-up-delayed' : 'welcome-hidden'}`}
        >
          <h2 className="welcome-action-title">Get started by signing in</h2>
          <p className="welcome-action-desc">
            Sign in to access your campus events, track your activities, and more.
          </p>

          <Link href="/login" className="welcome-cta-btn" id="go-to-login-btn">
            Go to Login
          </Link>

          <p className="welcome-signup-text">
            New student?{' '}
            <Link href="/signup" className="welcome-signup-link" id="signup-link">
              Sign up here ›
            </Link>
          </p>
        </section>
      </main>

      <style>{`
        /* ===== ROOT ===== */
        .welcome-root {
          position: relative;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #FFFFFF 0%, #F8F8FF 50%, #EFE8FA 100%);
          font-family: var(--font-body);
          color: #3A445C;
          overflow: hidden;
        }

        /* ===== BACKGROUND GLOW ===== */
        .welcome-bg-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: radial-gradient(ellipse at bottom, rgba(160, 175, 255, 0.2) 0%, rgba(200, 150, 255, 0.1) 40%, rgba(255,255,255,0) 80%);
          pointer-events: none;
          z-index: 0;
        }

        /* ===== HEADER ===== */
        .welcome-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32px 24px;
          position: relative;
          z-index: 10;
        }
        @media (min-width: 768px) {
          .welcome-header {
            padding: 32px 48px;
          }
        }

        .welcome-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          cursor: pointer;
        }

        .welcome-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #8A79F9;
        }

        .welcome-logo-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #3A445C;
        }

        .welcome-login-btn {
          padding: 6px 16px;
          border-radius: 8px;
          border: 1px solid #E2E6EE;
          color: #6B7CF6;
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.2s ease;
          background: transparent;
        }
        .welcome-login-btn:hover {
          background: #F8F9FB;
          border-color: #6B7CF6;
        }

        /* ===== MAIN ===== */
        .welcome-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 24px 80px;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        /* ===== TITLE SECTION ===== */
        .welcome-title-section {
          margin-bottom: 40px;
          width: 100%;
        }

        .welcome-title {
          font-family: var(--font-body);
          font-size: 28px;
          font-weight: 600;
          color: #3A445C;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }
        @media (min-width: 768px) {
          .welcome-title {
            font-size: 36px;
          }
        }

        .welcome-subtitle {
          font-size: 17px;
          color: #8C95A7;
          font-weight: 500;
          margin: 0;
        }
        @media (min-width: 768px) {
          .welcome-subtitle {
            font-size: 19px;
          }
        }

        /* ===== ILLUSTRATION ===== */
        .welcome-illustration {
          margin-bottom: 40px;
          width: 100%;
          max-width: 280px;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-left: auto;
          margin-right: auto;
        }

        .welcome-illustration-blob {
          position: absolute;
          inset: 0;
          background: #F8F9FB;
          border-radius: 9999px;
          opacity: 0.5;
          transform: scale(1.1);
          z-index: 0;
        }

        .welcome-illustration-img {
          position: relative;
          z-index: 1;
          width: 100%;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
          mix-blend-mode: multiply;
        }

        /* ===== ACTION SECTION ===== */
        .welcome-action {
          width: 100%;
          max-width: 384px;
          margin: 0 auto;
        }

        .welcome-action-title {
          font-family: var(--font-body);
          font-size: 24px;
          font-weight: 600;
          color: #3A445C;
          margin: 0 0 12px;
        }
        @media (min-width: 768px) {
          .welcome-action-title {
            font-size: 28px;
          }
        }

        .welcome-action-desc {
          font-size: 15px;
          color: #8C95A7;
          line-height: 1.6;
          margin: 0 0 32px;
          padding: 0 16px;
        }

        /* ===== CTA BUTTON ===== */
        .welcome-cta-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 240px;
          margin: 0 auto 24px;
          padding: 14px 0;
          border-radius: 12px;
          background: linear-gradient(90deg, #6E84FF 0%, #A586FF 100%);
          color: #fff;
          font-weight: 500;
          font-size: 18px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(107, 124, 246, 0.3);
          transition: all 0.25s ease;
        }
        .welcome-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(107, 124, 246, 0.4);
          opacity: 0.95;
        }
        .welcome-cta-btn:active {
          transform: translateY(0);
          opacity: 0.9;
        }

        /* ===== SIGNUP LINK ===== */
        .welcome-signup-text {
          font-size: 15px;
          color: #8C95A7;
          margin: 0;
        }

        .welcome-signup-link {
          font-weight: 600;
          color: #9B86F2;
          text-decoration: none;
          transition: color 0.2s;
        }
        .welcome-signup-link:hover {
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-color: rgba(107, 124, 246, 0.3);
        }

        /* ===== ANIMATIONS ===== */
        .welcome-hidden {
          opacity: 0;
          transform: translateY(16px);
        }

        .welcome-fade-in {
          animation: welcomeFadeIn 0.5s ease-out forwards;
        }

        .welcome-slide-up {
          animation: welcomeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .welcome-scale-in {
          animation: welcomeScaleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
          transform: scale(0.9);
        }

        .welcome-slide-up-delayed {
          animation: welcomeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          opacity: 0;
          transform: translateY(16px);
        }

        @keyframes welcomeFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes welcomeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes welcomeScaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
