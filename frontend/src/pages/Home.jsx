import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Typing effect words ── */
const WORDS = ['Products', 'Services', 'Local Vendors', 'Your Community'];

/* ── Features data ── */
const FEATURES = [
  { icon: '📍', title: 'Hyperlocal Discovery', desc: 'Find products and services right in your neighborhood. Support businesses within walking distance.', color: 'rgba(124,58,237,0.08)' },
  { icon: '🛒', title: 'Seamless Shopping', desc: 'Add to cart, checkout in seconds. Your local orders delivered or ready for pickup — hassle-free.', color: 'rgba(37,99,235,0.08)' },
  { icon: '🔒', title: 'Trust & Transparency', desc: 'Verified vendors, transparent pricing, and community reviews ensure quality every time.', color: 'rgba(5,150,105,0.08)' },
  { icon: '🤝', title: 'Community First', desc: 'Every transaction strengthens your local economy and builds lasting relationships.', color: 'rgba(217,119,6,0.08)' },
  { icon: '🔔', title: 'Real-Time Updates', desc: 'Instant notifications on order status, service bookings, and new arrivals from your favourite vendors.', color: 'rgba(20,184,166,0.1)' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Fully responsive design — shop from your phone, tablet, or desktop with equal ease.', color: 'rgba(236,72,153,0.08)' },
];

/* ── Steps ── */
const CUSTOMER_STEPS = [
  { num: '1', title: 'Browse & Discover', desc: 'Explore local products and services near you with smart filters and location search.' },
  { num: '2', title: 'Order or Book', desc: 'Place orders for products or schedule service bookings in just a few taps.' },
  { num: '3', title: 'Pay & Enjoy', desc: 'Simple payment, quality service, and real-time updates every step of the way.' },
];
const VENDOR_STEPS = [
  { num: '1', title: 'Create Your Profile', desc: 'Set up your business profile and showcase your products or services to the community.' },
  { num: '2', title: 'List & Manage', desc: 'Add products or services with photos, pricing, and availability — fully in your control.' },
  { num: '3', title: 'Grow Your Business', desc: 'Handle orders, serve customers, and expand your local reach with powerful analytics.' },
];

/* ── Stats strip ── */
const STATS = [
  { icon: '🏪', value: '500+', label: 'Local Vendors' },
  { icon: '📦', value: '10K+', label: 'Products Listed' },
  { icon: '🛠️', value: '2K+', label: 'Services Available' },
  { icon: '🌍', value: '50+', label: 'Cities Covered' },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  { text: 'Local Link made it so easy to find a reliable plumber in my area. Booked in minutes, great service!', name: 'Priya Sharma', role: 'Customer', initials: 'PS', color: '#7c3aed' },
  { text: 'My grocery shop got 3× more orders after listing on Local Link. The platform is a game-changer for local vendors.', name: 'Ramesh Patel', role: 'Vendor – Grocery', initials: 'RP', color: '#059669' },
  { text: 'I love how I can track everything in one place. Orders, bookings, and vendor info — all there.', name: 'Aisha Khan', role: 'Customer', initials: 'AK', color: '#d97706' },
];

/* ── Particle background ── */
const Particles = () => {
  const particles = Array.from({ length: 18 }, (_, i) => {
    const size = 8 + (i % 4) * 9;
    const left = ((i * 39 + 13) % 100);
    const delay = (i * 0.65) % 8;
    const duration = 14 + (i % 5) * 4;
    return { size, left, delay, duration, opacity: 0.1 + (i % 3) * 0.07 };
  });

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', bottom: -30, borderRadius: '50%',
            width: p.size, height: p.size, left: `${p.left}%`,
            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

/* ── Intersection hook ── */
const useVisible = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ══════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════ */
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  /* Typing effect */
  const [typedText, setTypedText] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    setHeroVisible(true);
    let wordIdx = 0, charIdx = 0, isDeleting = false;
    let timer;
    const loop = () => {
      const word = WORDS[wordIdx];
      if (!isDeleting) {
        setTypedText(word.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx >= word.length) { isDeleting = true; timer = setTimeout(loop, 2000); return; }
        timer = setTimeout(loop, 75);
      } else {
        setTypedText(word.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx <= 0) { isDeleting = false; wordIdx = (wordIdx + 1) % WORDS.length; timer = setTimeout(loop, 400); return; }
        timer = setTimeout(loop, 38);
      }
    };
    loop();
    return () => clearTimeout(timer);
  }, []);

  /* Scroll observers */
  const [featuresRef, featuresVisible] = useVisible();
  const [stepsRef, stepsVisible] = useVisible();
  const [statsRef, statsVisible] = useVisible();
  const [testimonialsRef, testimonialsVisible] = useVisible();

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Particles />

      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 32px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', position: 'relative', zIndex: 1 }} className="hero-section">
        {/* Content */}
        <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 22,
            background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)',
            color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem',
            padding: '6px 16px', borderRadius: 24,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'badgePulse 2s ease-in-out infinite', display: 'inline-block' }} />
            Now live in your city — Join the community
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: '3.1rem', fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.025em', color: 'var(--text)', margin: '0 0 18px' }}>
            Discover Local{' '}
            <span style={{
              background: 'linear-gradient(135deg,var(--accent),#a78bfa,#c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              display: 'inline-block', minWidth: '8ch',
            }}>
              {typedText}<span style={{ animation: 'blink 0.7s step-end infinite', fontWeight: 400, WebkitTextFillColor: 'var(--accent)' }}>|</span>
            </span>
            <br />with confidence.
          </h1>

          <p style={{ fontSize: '1.08rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 500, margin: '0 0 30px' }}>
            Local Link connects you to trusted vendors in your neighborhood —
            discover products, book services, and support your local economy, all in one place.
          </p>

          {/* CTA buttons */}
          {!isAuthenticated ? (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
              <Link to="/register" className="btn-primary" style={{ padding: '13px 28px', fontSize: '0.96rem', borderRadius: 12 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Get Started Free
              </Link>
              <Link to="/products" className="btn-secondary" style={{ padding: '13px 28px', fontSize: '0.96rem', borderRadius: 12 }}>Browse Products →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
              <Link to="/dashboard" className="btn-primary" style={{ padding: '13px 28px', fontSize: '0.96rem', borderRadius: 12 }}>Go to Dashboard</Link>
              <Link to={user?.role === 'customer' ? '/products' : '/products/new'} className="btn-secondary" style={{ padding: '13px 28px', fontSize: '0.96rem', borderRadius: 12 }}>
                {user?.role === 'customer' ? 'Browse Products' : 'Manage Listings'} →
              </Link>
            </div>
          )}

          {/* Trust pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)',
            padding: '8px 18px', borderRadius: 24,
          }}>
            <span>🌱</span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Trusted by 500+ local businesses across India</span>
          </div>
        </div>

        {/* Visual: floating cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateX(40px)', transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s' }}>
          {/* Card 1: Stats */}
          <div style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
            padding: '20px 24px', boxShadow: 'var(--shadow-lg)',
            transform: 'translateX(-14px)',
            animation: 'floatCard1 5.5s ease-in-out 1.2s infinite',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>Community Stats</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.5)', animation: 'badgePulse 2s infinite', display: 'inline-block' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['500+', 'Vendors'], ['10K+', 'Products'], ['2K+', 'Services'], ['50+', 'Cities']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>{val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Categories */}
          <div style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
            padding: '20px 24px', boxShadow: 'var(--shadow-lg)',
            transform: 'translateX(28px)',
            animation: 'floatCard2 6s ease-in-out 1.5s infinite',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}>Top Categories</div>
            {[['🥦', 'Grocery & Essentials', '#2563eb'],['🛠️', 'Home Services', '#059669'],['📚', 'Education & Tutors', '#7c3aed']].map(([emoji, name, col]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem', flex: 1 }}>{name}</span>
                <span style={{ fontWeight: 700, color: col, fontSize: '0.78rem', background: col + '12', padding: '2px 8px', borderRadius: 6 }}>Explore →</span>
              </div>
            ))}
          </div>

          {/* Card 3: Recent order */}
          <div style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
            padding: '16px 20px', boxShadow: 'var(--shadow-lg)',
            transform: 'translateX(-8px)',
            animation: 'floatCard3 5s ease-in-out 1.7s infinite',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>✅</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Order Delivered!</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Fresh groceries from Sharma's Store</div>
            </div>
            <div style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--success)', fontSize: '0.88rem' }}>₹249</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FEATURES
      ═══════════════════════════════════ */}
      <section ref={featuresRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-eyebrow">Why Local Link</span>
          <h2 className="section-title">Everything you need in one place</h2>
          <p className="section-subtitle">Powerful tools packed into one beautiful community platform.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)',
                padding: '26px 22px',
                opacity: featuresVisible ? 1 : 0,
                transform: featuresVisible ? 'none' : 'translateY(24px)',
                transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════ */}
      <section ref={statsRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg,var(--accent),#8b5cf6,#7c3aed)',
          borderRadius: 'var(--radius-xl)', padding: '48px 40px',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28,
          boxShadow: '0 20px 60px rgba(124,58,237,0.22)',
          opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
          position: 'relative', overflow: 'hidden',
        }} className="stats-grid">
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -80, animation: 'pulse-ring 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -60, left: -40, animation: 'pulse-ring 4s ease-in-out 2s infinite' }} />

          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: 'center', color: 'white', position: 'relative' }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.86rem', opacity: 0.8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════ */}
      <section ref={stepsRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-eyebrow">Get Started</span>
          <h2 className="section-title">Simple steps to connect with your community</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="steps-grid">
          {/* For Customers */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.3rem' }}>🛒</span> For Customers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {CUSTOMER_STEPS.map((s, i) => (
                <div
                  key={s.num}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                    opacity: stepsVisible ? 1 : 0,
                    transform: stepsVisible ? 'none' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg,var(--accent),#a78bfa)',
                    color: 'white', fontWeight: 800, fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(124,58,237,0.22)',
                  }}>{s.num}</div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', fontSize: '0.96rem' }}>{s.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Vendors */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.3rem' }}>🏪</span> For Vendors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {VENDOR_STEPS.map((s, i) => (
                <div
                  key={s.num}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                    opacity: stepsVisible ? 1 : 0,
                    transform: stepsVisible ? 'none' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${(i + 3) * 0.12}s, transform 0.5s ease ${(i + 3) * 0.12}s`,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg,#059669,#34d399)',
                    color: 'white', fontWeight: 800, fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(5,150,105,0.22)',
                  }}>{s.num}</div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', fontSize: '0.96rem' }}>{s.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════ */}
      <section ref={testimonialsRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span className="section-eyebrow">Trusted by the Community</span>
          <h2 className="section-title">What our users say</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }} className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              style={{
                background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)',
                padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: 14,
                opacity: testimonialsVisible ? 1 : 0,
                animation: testimonialsVisible ? `cardFadeUp 0.5s ease ${i * 0.12}s both` : 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ color: '#f59e0b', fontSize: '0.95rem', letterSpacing: 2 }}>★★★★★</div>
              <p style={{ fontSize: '0.91rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, flex: 1 }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg,var(--accent),#8b5cf6,#a78bfa)',
          borderRadius: 'var(--radius-xl)', padding: '62px 48px',
          textAlign: 'center', color: 'white',
          boxShadow: '0 24px 64px rgba(124,58,237,0.24)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -80, animation: 'pulse-ring 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -60, left: -40, animation: 'pulse-ring 4s ease-in-out 2s infinite' }} />
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 14px', position: 'relative' }}>
            Ready to join your local community?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: 540, margin: '0 auto 34px', lineHeight: 1.65, position: 'relative' }}>
            Whether you want to buy local or grow your business, Local Link is your gateway to community commerce — free to start.
          </p>
          {!isAuthenticated && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', position: 'relative' }}>
              <Link to="/register?role=customer" style={{
                background: 'white', color: 'var(--accent)', padding: '13px 30px', borderRadius: 12,
                fontWeight: 700, fontSize: '0.96rem', textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >Join as Customer</Link>
              <Link to="/register?role=vendor" style={{
                background: 'transparent', color: 'white', padding: '13px 30px', borderRadius: 12,
                fontWeight: 700, fontSize: '0.96rem', textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.45)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; }}
              >Join as Vendor →</Link>
            </div>
          )}
          {isAuthenticated && (
            <Link to="/dashboard" style={{
              background: 'white', color: 'var(--accent)', padding: '13px 36px', borderRadius: 12,
              fontWeight: 700, fontSize: '0.96rem', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'inline-block', position: 'relative',
            }}>Go to Dashboard →</Link>
          )}
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        @keyframes floatCard1 {
          0%,100% { transform: translateX(-14px) translateY(0); }
          50%      { transform: translateX(-14px) translateY(-12px); }
        }
        @keyframes floatCard2 {
          0%,100% { transform: translateX(28px) translateY(0); }
          50%      { transform: translateX(28px) translateY(-10px); }
        }
        @keyframes floatCard3 {
          0%,100% { transform: translateX(-8px) translateY(0); }
          50%      { transform: translateX(-8px) translateY(-8px); }
        }
        @media (max-width: 900px) {
          .hero-section { grid-template-columns: 1fr !important; padding: 48px 20px 40px !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          h1 { font-size: 2.1rem !important; }
          .section-title { font-size: 1.7rem !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
