import { Link, useLocation, useNavigate } from 'react-router';
import { useTarot } from '../context/TarotContext';
import { useState, useRef, useEffect } from 'react';

const PROFILE_AVATAR = '🧙';

export function Navigation() {
  const { isLoggedIn, user, logout, readings, startNewReading } = useTarot();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const handleStartNewReading = () => {
    startNewReading();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'oklch(0.08 0.035 285 / 0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid oklch(0.74 0.135 82 / 0.18)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'Cinzel Decorative, serif', color: 'oklch(0.74 0.135 82)', fontSize: '1.05rem', letterSpacing: '0.1em' }}>
            ✦ ARCANA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '28px' }}>
          <NavButton active={isActive('/') || isActive('/reading')} onClick={handleStartNewReading}>타로 리딩</NavButton>
          {isLoggedIn && <NavLink to="/dashboard" active={isActive('/dashboard')}>내 기록</NavLink>}

          {isLoggedIn && user ? (
            /* Profile pill */
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: profileOpen
                    ? 'oklch(0.22 0.075 290)'
                    : 'oklch(0.17 0.05 288)',
                  border: `1px solid ${profileOpen ? 'oklch(0.74 0.135 82 / 0.55)' : 'oklch(0.74 0.135 82 / 0.2)'}`,
                  borderRadius: '40px',
                  padding: '5px 14px 5px 5px',
                  cursor: 'pointer',
                  transition: 'all 0.22s',
                  boxShadow: profileOpen ? '0 0 20px oklch(0.52 0.19 293 / 0.3)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!profileOpen) {
                    (e.currentTarget as HTMLElement).style.background = 'oklch(0.20 0.065 290)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.74 0.135 82 / 0.45)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px oklch(0.52 0.19 293 / 0.2)';
                  }
                }}
                onMouseLeave={e => {
                  if (!profileOpen) {
                    (e.currentTarget as HTMLElement).style.background = 'oklch(0.17 0.05 288)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.74 0.135 82 / 0.2)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }
                }}
              >
                {/* Avatar circle */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(145deg, oklch(0.36 0.14 292), oklch(0.18 0.065 274))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                  color: 'oklch(0.95 0.02 82)',
                  flexShrink: 0,
                  border: '1.5px solid oklch(0.74 0.135 82 / 0.4)',
                  boxShadow: '0 0 8px oklch(0.52 0.19 293 / 0.4)',
                }}>
                  {PROFILE_AVATAR}
                </div>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.06em', color: 'oklch(0.88 0.022 82)', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                {/* Chevron */}
                <span style={{
                  fontSize: '0.6rem', color: 'oklch(0.74 0.135 82)',
                  transition: 'transform 0.22s',
                  transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block', lineHeight: 1,
                }}>
                  ▾
                </span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  minWidth: '220px',
                  background: 'oklch(0.13 0.055 288)',
                  border: '1px solid oklch(0.74 0.135 82 / 0.25)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px oklch(0.05 0.02 285 / 0.8), 0 0 30px oklch(0.52 0.19 293 / 0.15)',
                  animation: 'dropdownIn 0.2s ease',
                }}>
                  <style>{`@keyframes dropdownIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>

                  {/* Profile header in dropdown */}
                  <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid oklch(0.74 0.135 82 / 0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'linear-gradient(145deg, oklch(0.36 0.14 292), oklch(0.18 0.065 274))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: 'oklch(0.95 0.02 82)',
                        border: '1.5px solid oklch(0.74 0.135 82 / 0.4)',
                      }}>
                        {PROFILE_AVATAR}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', color: 'oklch(0.91 0.022 82)', letterSpacing: '0.04em' }}>{user.name}</p>
                        <p style={{ fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', color: 'oklch(0.55 0.015 82)', marginTop: '2px' }}>{user.email}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'oklch(0.65 0.2 145)' }} />
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.08em', color: 'oklch(0.52 0.015 82)' }}>
                        {readings.length}개의 리딩 기록
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: '☽', label: '내 기록 보기', onClick: () => { navigate('/dashboard'); setProfileOpen(false); } },
                    { icon: '✦', label: '새 리딩 시작', onClick: handleStartNewReading },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      style={{
                        width: '100%', padding: '11px 18px',
                        background: 'transparent',
                        border: 'none',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'oklch(0.22 0.075 290)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '0.85rem', color: 'oklch(0.74 0.135 82)', width: '16px', textAlign: 'center' }}>{item.icon}</span>
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.06em', color: 'oklch(0.82 0.018 82)' }}>{item.label}</span>
                    </button>
                  ))}

                  <div style={{ height: '1px', background: 'oklch(0.74 0.135 82 / 0.1)', margin: '4px 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', padding: '11px 18px',
                      background: 'transparent', border: 'none',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'oklch(0.55 0.22 27 / 0.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'oklch(0.65 0.18 27)', width: '16px', textAlign: 'center' }}>↗</span>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.06em', color: 'oklch(0.65 0.18 27)' }}>로그아웃</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em',
                color: 'oklch(0.08 0.035 285)',
                background: 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))',
                border: 'none', padding: '7px 18px', borderRadius: '6px',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 12px oklch(0.74 0.135 82 / 0.3)',
              }}>
                로그인
              </button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: 'oklch(0.74 0.135 82)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'oklch(0.10 0.045 288)', borderTop: '1px solid oklch(0.74 0.135 82 / 0.12)', padding: '14px 20px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {isLoggedIn && user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0 14px', borderBottom: '1px solid oklch(0.74 0.135 82 / 0.12)', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(145deg, oklch(0.36 0.14 292), oklch(0.18 0.065 274))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'oklch(0.95 0.02 82)', border: '1px solid oklch(0.74 0.135 82 / 0.4)' }}>
                  {PROFILE_AVATAR}
                </div>
                <div>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', color: 'oklch(0.88 0.022 82)' }}>{user.name}</p>
                  <p style={{ fontFamily: 'Crimson Text, serif', fontSize: '0.78rem', color: 'oklch(0.52 0.015 82)' }}>{readings.length}개의 리딩</p>
                </div>
              </div>
            )}
            <MobileNavButton onClick={handleStartNewReading}>타로 리딩</MobileNavButton>
            {isLoggedIn && <MobileNavItem to="/dashboard" onClick={() => setMobileOpen(false)}>내 기록</MobileNavItem>}
            {isLoggedIn ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.06em', color: 'oklch(0.65 0.18 27)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '10px 0' }}>
                로그아웃
              </button>
            ) : (
              <MobileNavItem to="/dashboard" onClick={() => setMobileOpen(false)}>로그인</MobileNavItem>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} style={{
      fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em',
      color: active ? 'oklch(0.74 0.135 82)' : 'oklch(0.68 0.016 82)',
      textDecoration: 'none', transition: 'color 0.2s', textTransform: 'uppercase',
    }}>
      {children}
    </Link>
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        color: active ? 'oklch(0.74 0.135 82)' : 'oklch(0.68 0.016 82)',
        textTransform: 'uppercase',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        transition: 'color 0.2s',
      }}
    >
      {children}
    </button>
  );
}

function MobileNavItem({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} style={{
      fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.08em',
      color: 'oklch(0.74 0.135 82)', textDecoration: 'none', display: 'block', padding: '10px 0',
    }}>
      {children}
    </Link>
  );
}

function MobileNavButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '0.85rem',
        letterSpacing: '0.08em',
        color: 'oklch(0.74 0.135 82)',
        background: 'transparent',
        border: 'none',
        display: 'block',
        padding: '10px 0',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
