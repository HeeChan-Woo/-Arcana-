import { useState } from 'react';
import { useNavigate } from 'react-router';
import { StarField } from './StarField';
import { useTarot } from '../context/TarotContext';
import { Navigation } from './Navigation';
import { TAROT_CARDS } from '../data/tarotCards';

const DAILY_CARD = TAROT_CARDS[Math.floor(Date.now() / 86400000) % TAROT_CARDS.length];

export function LandingPage() {
  const navigate = useNavigate();
  const { setQuestion } = useTarot();
  const [inputQuestion, setInputQuestion] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleStart = () => {
    if (!inputQuestion.trim()) return;
    setQuestion(inputQuestion.trim());
    navigate('/reading');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(0.08 0.035 285)', fontFamily: 'Crimson Text, serif', position: 'relative' }}>
      <StarField />
      <Navigation />

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', maxWidth: '900px', margin: '0 auto', padding: '120px 24px 80px' }}>
        {/* Decorative orb */}
        <div style={{
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, oklch(0.52 0.19 293 / 0.3) 0%, oklch(0.35 0.14 292 / 0.1) 50%, transparent 70%)',
          borderRadius: '50%',
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }} />

        <div style={{ position: 'relative' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.35em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase', marginBottom: '24px' }}>
            ✦ &nbsp; 별이 전하는 메시지 &nbsp; ✦
          </p>
          <h1 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: 700,
            color: 'oklch(0.91 0.022 82)',
            lineHeight: 1.15,
            marginBottom: '24px',
            textShadow: '0 0 60px oklch(0.52 0.19 293 / 0.5)',
            letterSpacing: '0.03em',
          }}>
            ARCANA
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'oklch(0.78 0.018 82)', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto 48px', fontStyle: 'italic' }}>
            78장의 카드가 우주의 언어로 당신에게 말을 건넵니다.<br />
            질문을 던지고 운명의 카드를 선택하세요.
          </p>

          {/* Question input */}
          <div style={{ maxWidth: '540px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.15em', color: 'oklch(0.74 0.135 82)', marginBottom: '12px', textTransform: 'uppercase' }}>
              풀어보고 싶은 질문을 입력하세요
            </p>
            <div style={{ position: 'relative' }}>
              <input
                value={inputQuestion}
                onChange={e => setInputQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="예: 올해 나의 사랑은 어떻게 될까요?"
                style={{
                  width: '100%',
                  padding: '16px 64px 16px 20px',
                  background: 'oklch(0.13 0.055 288)',
                  border: '1px solid oklch(0.74 0.135 82 / 0.35)',
                  borderRadius: '8px',
                  color: 'oklch(0.91 0.022 82)',
                  fontFamily: 'Crimson Text, serif',
                  fontSize: '1.05rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'oklch(0.74 0.135 82 / 0.7)';
                  e.target.style.boxShadow = '0 0 20px oklch(0.74 0.135 82 / 0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'oklch(0.74 0.135 82 / 0.35)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              onClick={handleStart}
              disabled={!inputQuestion.trim()}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '16px',
                background: inputQuestion.trim()
                  ? 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))'
                  : 'oklch(0.22 0.075 290)',
                border: 'none',
                borderRadius: '8px',
                color: inputQuestion.trim() ? 'oklch(0.08 0.035 285)' : 'oklch(0.45 0.02 82)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.9rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: inputQuestion.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: inputQuestion.trim() ? '0 4px 30px oklch(0.74 0.135 82 / 0.4)' : 'none',
              }}
            >
              ✦ &nbsp; 타로 시작하기 &nbsp; ✦
            </button>
          </div>
        </div>
      </section>

      {/* Feature bar */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid oklch(0.74 0.135 82 / 0.12)', borderBottom: '1px solid oklch(0.74 0.135 82 / 0.12)', padding: '30px 24px', background: 'oklch(0.06 0.026 270 / 0.72)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '18px' }}>
          <FeatureSignal icon="✦" title="질문으로 시작" desc="지금 가장 궁금한 한 가지를 입력하세요." />
          <FeatureSignal icon="☽" title="3장 스프레드" desc="과거·현재·미래의 흐름으로 카드를 읽습니다." />
          <FeatureSignal icon="★" title="AI 맞춤 해석" desc="선택한 카드와 질문을 함께 분석합니다." />
          <FeatureSignal icon="◎" title="리딩 기록" desc="지난 질문과 해석을 다시 확인할 수 있습니다." />
        </div>
      </section>

      {/* How it works */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', letterSpacing: '0.12em', color: 'oklch(0.74 0.135 82)', textAlign: 'center', marginBottom: '56px', textTransform: 'uppercase' }}>
          ✦ &nbsp; 사용방법 &nbsp; ✦
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { step: '01', title: '질문 입력', desc: '마음속 깊은 곳의 질문을 작성하세요. 진지하게 생각하고 집중하세요.' },
            { step: '02', title: '카드 선택', desc: '78장의 카드 중 마음이 끌리는 3장을 직관적으로 선택하세요.' },
            { step: '03', title: '리딩 확인', desc: '과거·현재·미래의 세 카드가 당신의 질문에 답을 드립니다.' },
            { step: '04', title: '기록 저장', desc: '소중한 리딩을 저장하고 나만의 타로 일기를 만들어보세요.' },
          ].map(item => (
            <div key={item.step} style={{
              background: 'oklch(0.13 0.055 288)',
              border: '1px solid oklch(0.74 0.135 82 / 0.15)',
              borderRadius: '12px',
              padding: '28px 24px',
              transition: 'transform 0.3s, border-color 0.3s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.74 0.135 82 / 0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.74 0.135 82 / 0.15)';
              }}
            >
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: 'oklch(0.74 0.135 82 / 0.4)', marginBottom: '12px', lineHeight: 1 }}>{item.step}</div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '0.08em', color: 'oklch(0.91 0.022 82)', marginBottom: '12px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.95rem', color: 'oklch(0.68 0.018 82)', lineHeight: 1.75 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Today's card spotlight */}
      <section style={{ position: 'relative', zIndex: 1, background: 'oklch(0.11 0.05 288)', borderTop: '1px solid oklch(0.74 0.135 82 / 0.12)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.25em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase', marginBottom: '24px' }}>
            오늘의 카드
          </p>
          <div style={{
            width: '120px', height: '200px', margin: '0 auto 32px',
            background: `linear-gradient(135deg, ${DAILY_CARD.gradientFrom}, ${DAILY_CARD.gradientTo})`,
            borderRadius: '10px',
            border: '2px solid oklch(0.74 0.135 82 / 0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 0 40px oklch(0.52 0.19 293 / 0.4)',
          }}>
            <span style={{ fontSize: '2.5rem' }}>{DAILY_CARD.symbol}</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.08em', color: 'oklch(0.91 0.022 82)', textAlign: 'center', padding: '0 8px', lineHeight: 1.4 }}>{DAILY_CARD.name}</span>
          </div>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem', color: 'oklch(0.74 0.135 82)', marginBottom: '16px', letterSpacing: '0.08em' }}>{DAILY_CARD.name}</h3>
          <p style={{ fontSize: '1.05rem', color: 'oklch(0.78 0.018 82)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '24px' }}>
            {DAILY_CARD.uprightMeaning}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {DAILY_CARD.keywords.map(kw => (
              <span key={kw} style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.1em',
                color: 'oklch(0.74 0.135 82)', border: '1px solid oklch(0.74 0.135 82 / 0.35)',
                padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase',
              }}>{kw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 24px', borderTop: '1px solid oklch(0.74 0.135 82 / 0.1)' }}>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'oklch(0.45 0.015 82)' }}>
          ✦ ARCANA — 별이 전하는 이야기 ✦
        </p>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'oklch(0.45 0.015 82)' }}>
          ✦ 그녀는 나의 마음을 알까나?_Developer-Chan ✦
        </p>
      </footer>
    </div>
  );
}

function FeatureSignal({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px 14px',
      background: 'linear-gradient(145deg, oklch(0.13 0.038 264 / 0.82), oklch(0.095 0.032 275 / 0.82))',
      border: '1px solid oklch(0.74 0.135 82 / 0.16)',
      borderRadius: '10px',
      minHeight: '88px',
      boxShadow: '0 10px 28px oklch(0.02 0.01 260 / 0.28)',
    }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'oklch(0.82 0.13 86)', lineHeight: 1, paddingTop: '3px', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.86rem', color: 'oklch(0.93 0.018 86)', marginBottom: '6px', letterSpacing: '0.06em' }}>
          {title}
        </div>
        <div style={{ fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', color: 'oklch(0.7 0.024 86)', lineHeight: 1.55 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}
