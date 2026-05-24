import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const VerifyOtp = () => {
  const { verifyOtp, resendOtp, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [fieldError, setFieldError] = useState('');
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Redirect if no email in URL
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  // Start 60-second cooldown on mount
  useEffect(() => {
    startCooldown();
    inputRefs.current[0]?.focus();
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const otpCode = digits.join('');

  // ── Input handlers (mirroring the Vue implementation) ──────────────────────

  const onInput = (idx, raw) => {
    const val = raw.replace(/\D/g, '').slice(-1); // only last digit
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setFieldError('');
    if (val && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const onKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        const next = [...digits];
        next[idx - 1] = '';
        setDigits(next);
        inputRefs.current[idx - 1]?.focus();
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < OTP_LENGTH; i++) next[i] = pasted[i] || '';
    setDigits(next);
    setFieldError('');
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length < OTP_LENGTH) {
      setFieldError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setLoading(true);
    setFieldError('');
    const result = await verifyOtp({ email, code: otpCode });
    setLoading(false);
    if (result.success) {
      toast.success('Email verified! Welcome to LocalLink 🎉');
      navigate('/dashboard', { replace: true });
    } else {
      setFieldError(result.error || 'Incorrect OTP. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  // ── Resend ─────────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    const result = await resendOtp({ email });
    setResendLoading(false);
    if (result.success) {
      toast.success('A new code has been sent to your email.');
      setDigits(Array(OTP_LENGTH).fill(''));
      setFieldError('');
      startCooldown();
      inputRefs.current[0]?.focus();
    } else {
      toast.error(result.error || 'Failed to resend code.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const digitStyle = (filled, error) => ({
    width: 52, height: 60,
    textAlign: 'center',
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: 0,
    border: `1.5px solid ${error ? 'var(--danger)' : filled ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(6px)',
    outline: 'none',
    color: 'var(--text)',
    caretColor: 'var(--accent)',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: error ? '0 0 0 3px var(--danger-bg)' : 'none',
  });

  return (
    <div style={{ minHeight: '88vh', padding: '36px 16px 48px', position: 'relative', zIndex: 1 }}>
      {/* BG blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.07),transparent 70%)', top: '-10%', right: '-5%' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.05),transparent 70%)', bottom: '5%', left: '-5%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>LL</div>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>Verify your email</span>
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 8, lineHeight: 1.6 }}>
            We sent a 6-digit code to{' '}
            <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{email}</strong>
            <br />Enter it below to activate your account.
          </p>
        </div>

        <div className="glass-form" style={{ padding: '32px 28px' }}>
          <form onSubmit={handleSubmit} noValidate>
            {/* 6 OTP boxes */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '0 0 8px' }} role="group" aria-label="OTP input">
              {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
                <input
                  key={idx}
                  ref={el => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digits[idx]}
                  aria-label={`Digit ${idx + 1}`}
                  style={digitStyle(!!digits[idx], !!fieldError)}
                  onChange={e => onInput(idx, e.target.value)}
                  onKeyDown={e => onKeyDown(e, idx)}
                  onPaste={onPaste}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = fieldError ? 'var(--danger)' : 'var(--accent)';
                    if (!fieldError) e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.14)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = fieldError ? 'var(--danger)' : digits[idx] ? 'var(--accent)' : 'var(--border)';
                    e.currentTarget.style.boxShadow = fieldError ? '0 0 0 3px var(--danger-bg)' : 'none';
                  }}
                />
              ))}
            </div>

            {fieldError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center', marginTop: 8, marginBottom: 4 }} role="alert">
                {fieldError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length < OTP_LENGTH}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.96rem', borderRadius: 12, marginTop: 20, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Verifying…</>
              ) : 'Verify & Continue →'}
            </button>

            {/* Resend */}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resendLoading}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: cooldown > 0 ? 'default' : 'pointer',
                color: cooldown > 0 ? 'var(--muted)' : 'var(--accent)',
                fontWeight: 600, fontSize: '0.86rem', padding: '8px', fontFamily: 'inherit',
                borderRadius: 8, transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (cooldown === 0) e.currentTarget.style.background = 'var(--accent-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {resendLoading ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--muted)' }}>
          Wrong email?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
            Go back to register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
