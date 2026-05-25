import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login, isAuthenticated, user, loading, error, clearError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const defaultPath = user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider' : '/dashboard';
      const from = location.state?.from?.pathname || defaultPath;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => { clearError(); }, [clearError]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success('Welcome back! 👋');
      const defaultPath = result.role === 'admin' ? '/admin' : result.role === 'rider' ? '/rider' : '/dashboard';
      const from = location.state?.from?.pathname || defaultPath;
      navigate(from, { replace: true });
    } else if (result.error) {
      // If account needs OTP verification, redirect to verify page
      const resp = result.rawResponse;
      if (resp?.requiresOtp) {
        toast.warning('Please verify your email first.');
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(result.error);
      }
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{
      minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px', position: 'relative', zIndex: 1,
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.08),transparent 70%)', top: '10%', left: '10%' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.06),transparent 70%)', bottom: '10%', right: '10%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em',
              boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
            }}>LL</div>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>Local Link</span>
          </Link>
        </div>

        {/* Glass form card */}
        <div className="glass-form">
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
              Sign in to your Local Link account
            </p>
          </div>

          {error && <div className="alert-error" style={{ marginBottom: 18 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.86rem', color: 'var(--text)' }}>
                Email address
              </label>
              <input
                name="email" type="email" required autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.86rem', color: 'var(--text)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  placeholder="Your password"
                  className="input-field"
                  style={{ paddingRight: 44 }}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4,
                  }}
                >
                  {showPassword ? (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember / forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                <input type="checkbox" style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
                Remember me
              </label>
              <a href="#" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-600)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
              >Forgot password?</a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.96rem', borderRadius: 12, marginTop: 4 }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: '0.88rem', color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>Create one →</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: 16, padding: '14px 18px', borderRadius: 12,
          background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)',
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 6 }}>🔑 Demo Credentials</p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span><strong>Customer:</strong> john@example.com / Test123456</span>
            <span><strong>Vendor:</strong> shop@example.com / Test123456</span>
            <span><strong>Admin:</strong> admin@locallink.com / Admin@1234</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
