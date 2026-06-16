import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { StarField } from './StarField';
import { Navigation } from './Navigation';
import { useTarot, Reading } from '../context/TarotContext';
import { TAROT_CARDS } from '../data/tarotCards';
import { parseTarotAISections } from '../services/tarotAI';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const cosmic = {
  page: 'linear-gradient(180deg, oklch(0.075 0.035 270) 0%, oklch(0.055 0.024 265) 58%, oklch(0.045 0.018 260) 100%)',
  panel: 'linear-gradient(145deg, oklch(0.145 0.035 260 / 0.96), oklch(0.105 0.032 275 / 0.96))',
  panelSoft: 'oklch(0.13 0.032 262 / 0.82)',
  panelOpen: 'oklch(0.105 0.03 265 / 0.95)',
  border: 'oklch(0.72 0.06 230 / 0.24)',
  borderActive: 'oklch(0.78 0.11 82 / 0.5)',
  text: 'oklch(0.93 0.018 86)',
  textSoft: 'oklch(0.74 0.025 86)',
  textMuted: 'oklch(0.64 0.022 245)',
  gold: 'oklch(0.82 0.13 86)',
  cyan: 'oklch(0.74 0.09 220)',
  danger: 'oklch(0.65 0.18 27)',
};

// Augment mock readings with card data for display
function enrichReading(r: Reading): Reading {
  if (r.cards.length > 0) return r;
  const seed = parseInt(r.id.replace(/\D/g, ''), 10) || 0;
  return {
    ...r,
    cards: [
      TAROT_CARDS[(seed) % TAROT_CARDS.length],
      TAROT_CARDS[(seed + 7) % TAROT_CARDS.length],
      TAROT_CARDS[(seed + 13) % TAROT_CARDS.length],
    ],
  };
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatPhoneNumber(value: string): string {
  const formatted = formatPhoneInput(value);
  return /^010-\d{4}-\d{4}$/.test(formatted) ? formatted : '';
}

function isValidEmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

function isValidPassword(value: string): boolean {
  return /^[A-Za-z0-9]+$/.test(value);
}

function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return '인증에 실패했습니다. 다시 시도해주세요.';
  }

  const message = error.message.toLowerCase();

  if (error.message.includes('회원가입은 완료됐습니다')) {
    return error.message;
  }

  if (message.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }

  if (message.includes('email not confirmed')) {
    return '이메일 인증이 아직 완료되지 않았습니다. 인증을 먼저 확인해주세요.';
  }

  if (message.includes('too many requests') || message.includes('rate limit')) {
    return '요청이 너무 많습니다. 잠시 뒤 다시 시도해주세요.';
  }

  if (message.includes('user already registered') || message.includes('already registered')) {
    return '이미 가입된 이메일입니다. 로그인으로 해주세요.';
  }

  return error.message || '인증에 실패했습니다. 다시 시도해주세요.';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, login, signup, logout, readings, deleteReading, reanalyzeReading, startNewReading, setQuestion } = useTarot();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const authSubmittingRef = useRef(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>({});
  const [questionPanelOpen, setQuestionPanelOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState('');

  const handleAuth = async () => {
    if (loading || authSubmittingRef.current) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = formatPhoneNumber(phone);

    if (!normalizedEmail || !password) { setError('이메일과 비밀번호를 입력하세요'); return; }
    if (!isValidEmail(normalizedEmail)) { setError('올바른 이메일 주소를 입력하세요. 영문 이메일 형식이어야 합니다.'); return; }
    if (!isValidPassword(password)) { setError('비밀번호는 영문과 숫자만 입력할 수 있습니다.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('이름을 입력하세요'); return; }
    if (mode === 'signup' && !normalizedPhone) { setError('전화번호는 010-1234-5678 형식으로 입력하세요.'); return; }

    authSubmittingRef.current = true;
    setLoading(true); setError('');
    try {
      if (mode === 'login') await login(normalizedEmail, password);
      else await signup(normalizedEmail, password, name.trim(), normalizedPhone);
    } catch (error) {
      console.warn('Supabase auth failed.', error);
      setError(getAuthErrorMessage(error));
    } finally {
      authSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleStartNewReading = () => {
    startNewReading();
    setQuestionDraft('');
    setQuestionPanelOpen(true);
  };

  const handleSubmitNewReading = () => {
    const nextQuestion = questionDraft.trim();
    if (!nextQuestion) return;

    startNewReading();
    setQuestion(nextQuestion);
    navigate('/reading');
  };

  const enriched = readings.map(enrichReading);

  const handleReanalyze = async (reading: Reading) => {
    setReanalyzingId(reading.id);
    setAnalysisErrors(prev => ({ ...prev, [reading.id]: '' }));

    try {
      await reanalyzeReading(reading);
    } catch (error) {
      setAnalysisErrors(prev => ({
        ...prev,
        [reading.id]: error instanceof Error ? error.message : 'AI 분석을 다시 불러오지 못했습니다.',
      }));
    } finally {
      setReanalyzingId(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'oklch(0.08 0.035 285)', fontFamily: 'Crimson Text, serif', position: 'relative' }}>
        <StarField />
        <Navigation />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <div style={{
            width: '100%', maxWidth: '440px',
            background: 'oklch(0.13 0.055 288)',
            border: '1px solid oklch(0.74 0.135 82 / 0.25)',
            borderRadius: '16px',
            padding: '48px 40px',
            boxShadow: '0 20px 80px oklch(0.52 0.19 293 / 0.3)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✦</div>
              <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', letterSpacing: '0.08em', color: 'oklch(0.91 0.022 82)', marginBottom: '8px' }}>
                {mode === 'login' ? '로그인' : '회원가입'}
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'oklch(0.62 0.018 82)' }}>
                {mode === 'login' ? '나만의 타로 기록에 접속하세요' : '타로 여정을 시작하세요'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => {
                    if (loading) return;
                    setMode(m);
                    setError('');
                  }}
                  style={{
                    flex: 1, padding: '8px',
                    background: mode === m ? 'oklch(0.74 0.135 82 / 0.15)' : 'transparent',
                    border: `1px solid ${mode === m ? 'oklch(0.74 0.135 82 / 0.5)' : 'oklch(0.74 0.135 82 / 0.15)'}`,
                    borderRadius: '6px',
                    color: mode === m ? 'oklch(0.74 0.135 82)' : 'oklch(0.55 0.018 82)',
                    fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.08em',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {m === 'login' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'signup' && (
                <FormField label="이름" value={name} onChange={setName} placeholder="별빛 여행자" />
              )}
              {mode === 'signup' && (
                <FormField
                  label="전화번호"
                  value={phone}
                  onChange={value => setPhone(formatPhoneInput(value))}
                  placeholder="010-1234-5678"
                  inputMode="numeric"
                  maxLength={13}
                />
              )}
              <FormField label="이메일" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
              <FormField
                label="비밀번호"
                value={password}
                onChange={value => setPassword(value.replace(/[^A-Za-z0-9]/g, ''))}
                placeholder="영문과 숫자만"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <p style={{ marginTop: '12px', fontSize: '0.88rem', color: 'oklch(0.65 0.18 27)', fontFamily: 'Cinzel, serif', letterSpacing: '0.04em' }}>{error}</p>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              style={{
                width: '100%', marginTop: '24px', padding: '14px',
                background: 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))',
                border: 'none', borderRadius: '8px',
                color: 'oklch(0.08 0.035 285)',
                fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.15em',
                cursor: loading ? 'wait' : 'pointer', transition: 'all 0.3s',
                boxShadow: '0 4px 20px oklch(0.74 0.135 82 / 0.35)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '처리 중...' : mode === 'login' ? '✦  입장하기' : '✦  여정 시작하기'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'oklch(0.5 0.015 82)', fontStyle: 'italic' }}>
              회원가입한 이메일과 비밀번호로 로그인하세요
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: cosmic.page, fontFamily: 'Crimson Text, serif', position: 'relative' }}>
      <StarField />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '100px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.25em', color: cosmic.cyan, textTransform: 'uppercase', marginBottom: '8px' }}>
            나의 타로 기록
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: cosmic.text, letterSpacing: '0.05em' }}>
                {user?.name}의 별자리 일기
              </h1>
              <p style={{ fontSize: '1rem', color: cosmic.textSoft, marginTop: '4px' }}>
                총 {readings.length}개의 리딩 기록
              </p>
            </div>
            <button
              onClick={handleStartNewReading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))',
                border: 'none', borderRadius: '8px',
                color: 'oklch(0.08 0.035 285)',
                fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.12em',
                cursor: 'pointer',
                boxShadow: '0 4px 16px oklch(0.74 0.135 82 / 0.3)',
              }}
            >
              ✦ 새 리딩 시작
            </button>
          </div>
        </div>

        {questionPanelOpen && (
          <div style={{
            background: cosmic.panel,
            border: `1px solid ${cosmic.borderActive}`,
            borderRadius: '12px',
            padding: '22px',
            marginBottom: '28px',
            boxShadow: '0 16px 44px oklch(0.02 0.01 260 / 0.45), 0 0 28px oklch(0.74 0.135 82 / 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '14px' }}>
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.14em', color: cosmic.gold, textTransform: 'uppercase', marginBottom: '6px' }}>
                  ✦ 새 질문
                </p>
                <p style={{ fontSize: '0.95rem', color: cosmic.textSoft, lineHeight: 1.6 }}>
                  지금 가장 궁금한 한 가지를 적어주세요.
                </p>
              </div>
              <button
                onClick={() => setQuestionPanelOpen(false)}
                aria-label="질문 입력 닫기"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid oklch(0.74 0.135 82 / 0.18)',
                  color: cosmic.textMuted,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', flexWrap: 'wrap' }}>
              <input
                value={questionDraft}
                onChange={event => setQuestionDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') handleSubmitNewReading();
                }}
                autoFocus
                placeholder="예: 이번 주 안에 계획한 일을 잘 마무리할 수 있을까?"
                style={{
                  flex: '1 1 260px',
                  minHeight: '46px',
                  padding: '0 16px',
                  background: 'oklch(0.09 0.028 262 / 0.9)',
                  border: `1px solid ${cosmic.border}`,
                  borderRadius: '8px',
                  color: cosmic.text,
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSubmitNewReading}
                disabled={!questionDraft.trim()}
                style={{
                  flex: '0 0 auto',
                  minHeight: '46px',
                  padding: '0 20px',
                  background: questionDraft.trim()
                    ? 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))'
                    : cosmic.panelSoft,
                  border: questionDraft.trim() ? 'none' : `1px solid ${cosmic.border}`,
                  borderRadius: '8px',
                  color: questionDraft.trim() ? 'oklch(0.08 0.035 285)' : cosmic.textMuted,
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.76rem',
                  letterSpacing: '0.1em',
                  cursor: questionDraft.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: questionDraft.trim() ? '0 4px 16px oklch(0.74 0.135 82 / 0.25)' : 'none',
                }}
              >
                카드 선택하기
              </button>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: '총 리딩', value: readings.length.toString() },
            { label: '이번 달', value: readings.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length.toString() },
            { label: '가장 최근', value: readings.length ? format(new Date(readings[0].date), 'M월 d일', { locale: ko }) : '-' },
          ].map(s => (
            <div key={s.label} style={{
              background: cosmic.panel,
              border: `1px solid ${cosmic.border}`,
              borderRadius: '10px', padding: '20px',
              textAlign: 'center',
              boxShadow: '0 12px 34px oklch(0.02 0.01 260 / 0.38), inset 0 1px 0 oklch(1 0 0 / 0.04)',
            }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: cosmic.gold, marginBottom: '6px', textShadow: '0 0 18px oklch(0.82 0.13 86 / 0.25)' }}>{s.value}</div>
              <div style={{ fontFamily: 'Crimson Text, serif', fontSize: '0.88rem', color: cosmic.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Readings list */}
        {readings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}>☽</div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'oklch(0.5 0.015 82)', letterSpacing: '0.08em' }}>
              아직 리딩 기록이 없습니다
            </p>
            <button
              onClick={handleStartNewReading}
              style={{ marginTop: '20px', padding: '12px 28px', background: 'oklch(0.22 0.075 290)', border: '1px solid oklch(0.74 0.135 82 / 0.3)', borderRadius: '8px', color: 'oklch(0.74 0.135 82)', fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.1em', cursor: 'pointer' }}
            >
              첫 리딩 시작하기
            </button>
          </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {enriched.map(reading => {
              const isExpanded = expandedId === reading.id;
              const isConfirming = confirmDeleteId === reading.id;

              return (
                <div
                  key={reading.id}
                  style={{
                    background: cosmic.panel,
                    border: `1px solid ${isExpanded ? cosmic.borderActive : isConfirming ? 'oklch(0.55 0.22 27 / 0.5)' : cosmic.border}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: isExpanded
                      ? '0 16px 44px oklch(0.02 0.01 260 / 0.48), 0 0 0 1px oklch(0.78 0.11 82 / 0.06)'
                      : '0 10px 28px oklch(0.02 0.01 260 / 0.34)',
                  }}
                >
                  <div
                    style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
                  >
                    {/* Mini cards — click to expand */}
                    <div
                      style={{ display: 'flex', gap: '6px', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => setExpandedId(isExpanded ? null : reading.id)}
                    >
                      {reading.cards.slice(0, 3).map((card, i) => (
                        <div key={i} style={{
                          width: '30px', height: '48px', borderRadius: '4px',
                          background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`,
                          border: '1px solid oklch(0.74 0.135 82 / 0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', transition: 'transform 0.2s',
                        }}>
                          {card.symbol}
                        </div>
                      ))}
                    </div>

                    {/* Content — click to expand */}
                    <div
                      style={{ flex: 1, minWidth: '160px', cursor: 'pointer' }}
                      onClick={() => setExpandedId(isExpanded ? null : reading.id)}
                    >
                      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.1em', color: cosmic.gold, marginBottom: '5px' }}>
                        {format(new Date(reading.date), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                      </p>
                      <p style={{ fontSize: '1rem', color: cosmic.text, fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{reading.question}"
                      </p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {reading.cards.slice(0, 3).map((card, i) => (
                          <span key={i} style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.05em', color: cosmic.textMuted }}>
                            {['과거', '현재', '미래'][i]}: {card.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : reading.id)}
                        style={{
                          padding: '7px 12px',
                          background: isExpanded ? 'oklch(0.82 0.13 86 / 0.14)' : 'oklch(0.11 0.028 260 / 0.6)',
                          border: `1px solid ${isExpanded ? cosmic.borderActive : cosmic.border}`,
                          borderRadius: '6px',
                          color: cosmic.gold,
                          fontFamily: 'Cinzel, serif',
                          fontSize: '0.68rem',
                          letterSpacing: '0.08em',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isExpanded ? '접기' : '더보기'}
                      </button>
                      {/* Delete button */}
                      {!isConfirming ? (
                        <button
                          onClick={() => setConfirmDeleteId(reading.id)}
                          title="삭제"
                          style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: 'transparent',
                            border: '1px solid oklch(0.55 0.22 27 / 0.25)',
                            color: 'oklch(0.58 0.18 27)',
                            cursor: 'pointer', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', flexShrink: 0,
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'oklch(0.55 0.22 27 / 0.15)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.55 0.22 27 / 0.55)';
                            (e.currentTarget as HTMLElement).style.color = 'oklch(0.68 0.2 27)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.55 0.22 27 / 0.25)';
                            (e.currentTarget as HTMLElement).style.color = 'oklch(0.58 0.18 27)';
                          }}
                        >
                          ✕
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: 'oklch(0.65 0.18 27)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                            삭제?
                          </span>
                          <button
                            onClick={() => { deleteReading(reading.id); setConfirmDeleteId(null); if (expandedId === reading.id) setExpandedId(null); }}
                            style={{ padding: '4px 10px', background: 'oklch(0.55 0.22 27)', border: 'none', borderRadius: '4px', color: 'oklch(0.95 0.02 82)', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', cursor: 'pointer', letterSpacing: '0.06em' }}
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{ padding: '4px 10px', background: 'oklch(0.22 0.075 290)', border: '1px solid oklch(0.74 0.135 82 / 0.2)', borderRadius: '4px', color: 'oklch(0.72 0.018 82)', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', cursor: 'pointer', letterSpacing: '0.06em' }}
                          >
                            취소
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: `1px solid ${cosmic.border}`, padding: '22px 20px', background: cosmic.panelOpen }}>
                      <ReadingDetail
                        reading={reading}
                        isAnalyzing={reanalyzingId === reading.id}
                        error={analysisErrors[reading.id]}
                        onReanalyze={() => handleReanalyze(reading)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReadingDetail({
  reading,
  isAnalyzing,
  error,
  onReanalyze,
}: {
  reading: Reading;
  isAnalyzing: boolean;
  error?: string;
  onReanalyze: () => void;
}) {
  const sections = parseTarotAISections(reading.interpretation);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: cosmic.gold, marginBottom: '6px', textTransform: 'uppercase' }}>
            ✦ 이전 리딩 기록
          </p>
          <p style={{ fontSize: '0.95rem', color: cosmic.textSoft, lineHeight: 1.6 }}>
            더보기를 눌러 펼친 기록입니다. 필요하면 같은 질문과 카드로 AI 분석을 다시 요청할 수 있습니다.
          </p>
        </div>

        <button
          onClick={onReanalyze}
          disabled={isAnalyzing}
          style={{
            padding: '11px 16px',
            background: isAnalyzing
              ? cosmic.panelSoft
              : 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))',
            border: isAnalyzing ? `1px solid ${cosmic.border}` : 'none',
            borderRadius: '8px',
            color: isAnalyzing ? cosmic.textMuted : 'oklch(0.08 0.035 285)',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            cursor: isAnalyzing ? 'wait' : 'pointer',
            boxShadow: isAnalyzing ? 'none' : '0 4px 16px oklch(0.74 0.135 82 / 0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          {isAnalyzing ? 'AI 분석 중...' : 'AI에게 타로결과 분석하기'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'oklch(0.17 0.045 287 / 0.72)',
          border: '1px solid oklch(0.55 0.22 27 / 0.35)',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '18px',
        }}>
          <p style={{ fontSize: '0.88rem', color: 'oklch(0.68 0.18 27)', lineHeight: 1.6 }}>
            AI 분석을 완료하지 못했습니다. 현재 저장된 해석을 계속 표시합니다.
          </p>
          <p style={{ fontSize: '0.76rem', color: cosmic.textMuted, lineHeight: 1.55, marginTop: '4px' }}>
            {error}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {reading.cards.slice(0, 3).map((card, i) => (
          <div key={`${reading.id}-${card.id}-${i}`} style={{
            background: cosmic.panelSoft,
            border: `1px solid ${cosmic.border}`,
            borderRadius: '8px',
            padding: '14px',
          }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.12em', color: cosmic.cyan, marginBottom: '8px', textTransform: 'uppercase' }}>
              {['과거', '현재', '미래'][i]}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '50px',
                borderRadius: '4px',
                background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`,
                border: '1px solid oklch(0.74 0.135 82 / 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {card.symbol}
              </div>
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.74rem', letterSpacing: '0.05em', color: cosmic.text, lineHeight: 1.35 }}>
                  {card.name}
                </p>
                <p style={{ fontSize: '0.76rem', color: cosmic.textMuted, lineHeight: 1.45, marginTop: '4px' }}>
                  {card.keywords.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnalysisBlock title="질문에 대한 답" content={sections.directAnswer} />
        <AnalysisBlock title="카드 흐름" content={sections.cardFlow} />
        <AnalysisBlock title="다음 행동" content={sections.actionAdvice} highlight />
      </div>
    </div>
  );
}

function AnalysisBlock({
  title,
  content,
  highlight = false,
}: {
  title: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div style={{
      background: highlight ? 'oklch(0.82 0.13 86 / 0.09)' : 'transparent',
      border: highlight ? `1px solid ${cosmic.borderActive}` : 'none',
      borderLeft: `2px solid ${highlight ? cosmic.gold : cosmic.cyan}`,
      borderRadius: highlight ? '8px' : '0',
      padding: highlight ? '14px 16px' : '0 0 0 16px',
    }}>
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.12em', color: highlight ? cosmic.gold : cosmic.cyan, marginBottom: '8px', textTransform: 'uppercase' }}>
        {title}
      </p>
      <p style={{ fontSize: '0.98rem', color: cosmic.textSoft, lineHeight: 1.85, fontStyle: highlight ? 'italic' : 'normal', whiteSpace: 'pre-wrap' }}>
        {content}
      </p>
    </div>
  );
}

function FormField({
  label, value, onChange, placeholder, type = 'text', inputMode, maxLength, autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <div>
      <label style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.12em', color: 'oklch(0.62 0.018 82)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        style={{
          width: '100%', padding: '11px 14px',
          background: 'oklch(0.17 0.045 287)',
          border: '1px solid oklch(0.74 0.135 82 / 0.2)',
          borderRadius: '6px',
          color: 'oklch(0.91 0.022 82)',
          fontFamily: 'Crimson Text, serif', fontSize: '1rem',
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'oklch(0.74 0.135 82 / 0.6)'}
        onBlur={e => e.target.style.borderColor = 'oklch(0.74 0.135 82 / 0.2)'}
      />
    </div>
  );
}
