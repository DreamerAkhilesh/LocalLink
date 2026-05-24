import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SHOP_CATEGORIES = ['grocery', 'clothing', 'electronics', 'pharmacy', 'stationery', 'bakery', 'other-shop'];
const SERVICE_CATEGORIES = ['plumber', 'electrician', 'carpenter', 'painter', 'cleaner', 'mechanic', 'tutor', 'other-service'];

const Register = () => {
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    role: searchParams.get('role') || 'customer',
    address: { street: '', city: '', pincode: '', state: '' },
    businessInfo: { businessName: '', businessType: 'shop', category: '', description: '' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated, navigate]);
  useEffect(() => { clearError(); }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'password' || name === 'confirmPassword') setPasswordError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setPasswordError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    setIsSubmitting(true);
    try {
      const data = { name: formData.name, email: formData.email, password: formData.password, phone: formData.phone, role: formData.role, address: formData.address };
      if (formData.role === 'vendor') data.businessInfo = formData.businessInfo;
      const result = await register(data);
      if (result.success && result.requiresOtp) {
        toast.info(`Verification code sent to ${result.email}`);
        navigate(`/verify-otp?email=${encodeURIComponent(result.email)}`);
      } else if (!result.success) {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const inputStyle = { width: '100%' };
  const labelStyle = { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.86rem', color: 'var(--text)' };
  const sectionTitle = { fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '8px 0 16px', paddingBottom: 8, borderBottom: '1px solid var(--border)' };

  return (
    <div style={{ minHeight: '88vh', padding: '36px 16px 48px', position: 'relative', zIndex: 1 }}>
      {/* BG blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.07),transparent 70%)', top: '-10%', right: '-5%' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.05),transparent 70%)', bottom: '5%', left: '-5%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>LL</div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>Create your account</span>
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 6 }}>
            Already have one?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>

        <div className="glass-form" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Role selector */}
            <div>
              <label style={labelStyle}>Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['customer', 'vendor'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    style={{
                      padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                      cursor: 'pointer', border: '2px solid', transition: 'all 0.18s', fontFamily: 'inherit',
                      background: formData.role === role ? 'linear-gradient(135deg,var(--accent),#8b5cf6)' : 'rgba(255,255,255,0.6)',
                      color: formData.role === role ? 'white' : 'var(--text-secondary)',
                      borderColor: formData.role === role ? 'var(--accent)' : 'var(--border)',
                      boxShadow: formData.role === role ? '0 2px 12px rgba(124,58,237,0.22)' : 'none',
                    }}
                  >
                    {role === 'customer' ? '🛒 Customer' : '🏪 Vendor'}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="name" type="text" required placeholder="Your full name" className="input-field" style={inputStyle} value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" type="tel" required maxLength={10} placeholder="10-digit number" className="input-field" style={inputStyle} value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input name="email" type="email" required placeholder="you@example.com" className="input-field" style={inputStyle} value={formData.email} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Min 6 characters" className="input-field" style={{ ...inputStyle, paddingRight: 42 }} value={formData.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {showPassword ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required placeholder="Repeat password" className="input-field" style={inputStyle} value={formData.confirmPassword} onChange={handleChange} />
                {passwordError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{passwordError}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <p style={sectionTitle}>📍 Address</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input name="address.street" type="text" required placeholder="Street address" className="input-field" style={inputStyle} value={formData.address.street} onChange={handleChange} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <input name="address.city" type="text" required placeholder="City" className="input-field" value={formData.address.city} onChange={handleChange} />
                  <input name="address.pincode" type="text" required maxLength={6} placeholder="Pincode" className="input-field" value={formData.address.pincode} onChange={handleChange} />
                  <input name="address.state" type="text" required placeholder="State" className="input-field" value={formData.address.state} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Vendor info */}
            {formData.role === 'vendor' && (
              <div>
                <p style={sectionTitle}>🏪 Business Info</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input name="businessInfo.businessName" type="text" required placeholder="Business name" className="input-field" style={inputStyle} value={formData.businessInfo.businessName} onChange={handleChange} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <select name="businessInfo.businessType" className="input-field" value={formData.businessInfo.businessType}
                      onChange={e => { handleChange(e); setFormData(prev => ({ ...prev, businessInfo: { ...prev.businessInfo, businessType: e.target.value, category: '' } })); }}>
                      <option value="shop">Shop</option>
                      <option value="service">Service</option>
                    </select>
                    <select name="businessInfo.category" required className="input-field" value={formData.businessInfo.category} onChange={handleChange}>
                      <option value="">Select category</option>
                      {(formData.businessInfo.businessType === 'shop' ? SHOP_CATEGORIES : SERVICE_CATEGORIES).map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <textarea name="businessInfo.description" rows={3} placeholder="Brief description of your business (optional)" className="input-field" style={{ resize: 'vertical', minHeight: 80 }} value={formData.businessInfo.description} onChange={handleChange} />
                </div>
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.96rem', borderRadius: 12, marginTop: 4 }}>
              {isSubmitting ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  Creating Account…
                </>
              ) : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
