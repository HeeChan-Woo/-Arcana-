import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { StarField } from './StarField';
import { Navigation } from './Navigation';
import { useTarot } from '../context/TarotContext';
import { CARD_POSITIONS } from '../data/tarotCards';
import { createFallbackTarotInterpretation, parseTarotAISections, TarotAISections } from '../services/tarotAI';

const FLIP_DELAYS = [400, 900, 1400];

function SparkleLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 0' }}>
      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div
            key={deg}
            style={{
              position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
              background: 'oklch(0.74 0.135 82)',
              top: '50%', left: '50%',
              transform: `rotate(${deg}deg) translateY(-22px) translate(-50%, -50%)`,
              animation: `sparkle-orbit 1.4s ${i * 0.23}s ease-in-out infinite`,
            }}
          />
        ))}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem',
          animation: 'sparkle-pulse 1.4s ease-in-out infinite',
        }}>
          ✦
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.18em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
          AI 타로 리더가 해석을 정리하는 중
        </p>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {[0, 0.25, 0.5].map((delay, i) => (
            <div key={i} style={{
              width: '8px', height: '4px', borderRadius: '2px',
              background: 'oklch(0.74 0.135 82)',
              animation: `dot-pulse 1.2s ${delay}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.85); color: oklch(0.74 0.135 82); }
          50% { opacity: 1; transform: scale(1.15); color: oklch(0.52 0.19 293); }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; transform: scaleX(0.6); }
          50% { opacity: 1; transform: scaleX(1.4); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sectionReveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function AIAnalyzingBanner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'linear-gradient(135deg, oklch(0.74 0.135 82 / 0.10), oklch(0.52 0.19 293 / 0.10))',
      border: '1px solid oklch(0.74 0.135 82 / 0.28)',
      borderRadius: '10px',
      padding: '14px 16px',
      marginBottom: '22px',
    }}>
      <div style={{ position: 'relative', width: '30px', height: '30px', flexShrink: 0 }}>
        {[0, 90, 180, 270].map((deg, i) => (
          <span
            key={deg}
            style={{
              position: 'absolute',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'oklch(0.74 0.135 82)',
              top: '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateY(-12px) translate(-50%, -50%)`,
              animation: `dot-pulse 1.2s ${i * 0.18}s ease-in-out infinite`,
            }}
          />
        ))}
        <span style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'oklch(0.74 0.135 82)',
          animation: 'sparkle-pulse 1.4s ease-in-out infinite',
        }}>
          ✦
        </span>
      </div>
      <div>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.13em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase', marginBottom: '3px' }}>
          AI 분석 중
        </p>
        <p style={{ fontSize: '0.92rem', color: 'oklch(0.72 0.018 82)', lineHeight: 1.6 }}>
          먼저 기본 카드 해석을 보여드리고 있어요. AI 답변이 도착하면 이 영역이 자동으로 업데이트됩니다.
        </p>
      </div>
    </div>
  );
}

function AISection({
  interpretationText,
  isAIAnswer,
  isLoading,
  error,
}: {
  interpretationText?: string;
  isAIAnswer: boolean;
  isLoading: boolean;
  error: string | null;
}) {
  const [phase, setPhase] = useState<'loading' | 'typing' | 'done'>('loading');
  const [interpretation, setInterpretation] = useState<TarotAISections | null>(null);
  const [visibleSections, setVisibleSections] = useState(0);

  useEffect(() => {
    if (!interpretationText) {
      setPhase('loading');
      setInterpretation(null);
      setVisibleSections(0);
      return;
    }

    setInterpretation(parseTarotAISections(interpretationText));
    setVisibleSections(0);
    setPhase('typing');
  }, [interpretationText]);

  useEffect(() => {
    if (phase !== 'typing') return;
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setVisibleSections(count);
      if (count >= 3) { clearInterval(iv); setPhase('done'); }
    }, 700);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <div style={{
      position: 'relative',
      background: 'oklch(0.10 0.05 290)',
      borderRadius: '16px',
      padding: '36px',
      marginBottom: '32px',
      overflow: 'hidden',
      isolation: 'isolate',
    }}>
      {/* Glowing border */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '16px',
        border: '1.5px solid transparent',
        background: 'linear-gradient(oklch(0.10 0.05 290), oklch(0.10 0.05 290)) padding-box, linear-gradient(135deg, oklch(0.74 0.135 82 / 0.6), oklch(0.52 0.19 293 / 0.4), oklch(0.74 0.135 82 / 0.6)) border-box',
        animation: phase === 'done' ? 'none' : 'glow-border 2s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px',
        background: 'radial-gradient(circle, oklch(0.52 0.19 293 / 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <style>{`
        @keyframes glow-border {
          0%, 100% { box-shadow: 0 0 20px oklch(0.52 0.19 293 / 0.2); }
          50% { box-shadow: 0 0 40px oklch(0.52 0.19 293 / 0.45), 0 0 80px oklch(0.74 0.135 82 / 0.1); }
        }
      `}</style>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.52 0.19 293), oklch(0.35 0.14 292))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', flexShrink: 0,
          boxShadow: '0 0 16px oklch(0.52 0.19 293 / 0.5)',
        }}>
          ✦
        </div>
        <div>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '0.12em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase' }}>
            AI 타로 리딩
          </h2>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'oklch(0.52 0.18 82)', marginTop: '2px' }}>
            AI Tarot Reading
          </p>
        </div>
        {(phase === 'done' || isLoading || error) && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isLoading ? 'oklch(0.74 0.135 82)' : isAIAnswer ? 'oklch(0.65 0.2 145)' : 'oklch(0.62 0.015 82)',
              boxShadow: isLoading
                ? '0 0 8px oklch(0.74 0.135 82)'
                : isAIAnswer ? '0 0 8px oklch(0.65 0.2 145)' : 'none',
              animation: isLoading ? 'dot-pulse 1.2s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'oklch(0.55 0.015 82)' }}>
              {isLoading ? 'AI 분석 중' : isAIAnswer ? 'AI 응답 완료' : '기본 해석'}
            </span>
          </div>
        )}
      </div>

      {(phase === 'loading' || isLoading) && !interpretation && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SparkleLoader />
        </div>
      )}

      {isLoading && interpretation && <AIAnalyzingBanner />}

      {error && !isLoading && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          background: 'oklch(0.17 0.045 287 / 0.65)',
          border: '1px solid oklch(0.74 0.135 82 / 0.22)',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '18px',
        }}>
          <p style={{ fontSize: '0.92rem', color: 'oklch(0.74 0.135 82)', lineHeight: 1.7 }}>
            AI 응답을 불러오지 못해 기본 카드 해석을 표시합니다.
          </p>
          <p style={{ fontSize: '0.78rem', color: 'oklch(0.62 0.015 82)', lineHeight: 1.6, marginTop: '4px' }}>
            {error}
          </p>
        </div>
      )}

      {(phase === 'typing' || phase === 'done') && interpretation && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Direct Answer */}
          {visibleSections >= 1 && (
            <InterpSection
              icon="◎"
              label="Direct Answer"
              labelKo="질문에 대한 답"
              content={interpretation.directAnswer}
              delay={0}
              accentColor="oklch(0.74 0.135 82)"
            />
          )}
          {/* Card Flow */}
          {visibleSections >= 2 && (
            <InterpSection
              icon="☾"
              label="Card Flow"
              labelKo="카드 흐름"
              content={interpretation.cardFlow}
              delay={0}
              accentColor="oklch(0.74 0.09 220)"
            />
          )}
          {/* Action Advice */}
          {visibleSections >= 3 && (
            <div style={{
              background: 'linear-gradient(135deg, oklch(0.74 0.135 82 / 0.08), oklch(0.52 0.19 293 / 0.08))',
              border: '1px solid oklch(0.74 0.135 82 / 0.3)',
              borderRadius: '10px', padding: '20px 24px',
              animation: 'sectionReveal 0.5s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1rem', color: 'oklch(0.74 0.135 82)' }}>★</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.14em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase' }}>Next Step</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: 'oklch(0.52 0.018 82)', marginLeft: '4px' }}>다음 행동</span>
              </div>
              <p style={{ fontSize: '1.08rem', color: 'oklch(0.88 0.02 82)', lineHeight: 1.8, fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
                {interpretation.actionAdvice}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterpSection({ icon, label, labelKo, content, delay, accentColor }: {
  icon: string; label: string; labelKo: string; content: string; delay: number; accentColor: string;
}) {
  return (
    <div style={{ animation: `sectionReveal 0.5s ${delay}s ease both` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.9rem', color: accentColor }}>{icon}</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.12em', color: accentColor, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: 'oklch(0.5 0.015 82)', marginLeft: '2px' }}>{labelKo}</span>
      </div>
      <p style={{ fontSize: '1.05rem', color: 'oklch(0.82 0.018 82)', lineHeight: 1.85, fontFamily: 'Crimson Text, serif', paddingLeft: '18px', borderLeft: `2px solid ${accentColor}33` }}>
        {content}
      </p>
    </div>
  );
}

export function ReadingResultPage() {
  const navigate = useNavigate();
  const { selectedCards, question, readings, isLoggedIn, isLoading, aiError, startNewReading } = useTarot();
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentReading = readings.find(reading =>
    reading.question === question &&
    reading.cards.length === selectedCards.length &&
    reading.cards.every((card, index) => card.id === selectedCards[index]?.id)
  );
  const fallbackInterpretation = useMemo(() => {
    if (!question || selectedCards.length === 0) return undefined;
    return createFallbackTarotInterpretation(selectedCards, question);
  }, [question, selectedCards]);
  const interpretationText = currentReading?.interpretation ?? fallbackInterpretation;

  useEffect(() => {
    if (!selectedCards.length) { navigate('/'); return; }
    FLIP_DELAYS.forEach((delay, i) => {
      setTimeout(() => setFlipped(prev => { const n = [...prev]; n[i] = true; return n; }), delay);
    });
  }, [selectedCards]);

  const handleSave = () => {
    if (!isLoggedIn) { navigate('/dashboard'); return; }
    if (saved) return;
    setSaved(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 700);
  };

  const handleStartOver = () => {
    startNewReading();
    navigate('/');
  };

  const handleShare = () => {
    const text = `✦ ARCANA 타로 리딩\n질문: ${question}\n\n` +
      selectedCards.map((c, i) => `${CARD_POSITIONS[i]}: ${c.name}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!selectedCards.length) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(0.08 0.035 285)', fontFamily: 'Crimson Text, serif', position: 'relative', paddingBottom: '100px' }}>
      <StarField />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '100px 24px 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.25em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase', marginBottom: '12px' }}>
            ✦ &nbsp; 리딩 결과 &nbsp; ✦
          </p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'oklch(0.91 0.022 82)', letterSpacing: '0.05em', marginBottom: '14px' }}>
            카드가 전하는 메시지
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'oklch(0.72 0.018 82)', fontStyle: 'italic', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            "{question}"
          </p>
        </div>

        {/* Three cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 4vw, 48px)', marginBottom: '56px', flexWrap: 'wrap' }}>
          {selectedCards.map((card, i) => (
            <div
              key={card.id}
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => setActiveCard(activeCard === i ? null : i)}
            >
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.14em', color: 'oklch(0.52 0.018 82)', textTransform: 'uppercase', marginBottom: '14px' }}>
                {CARD_POSITIONS[i]}
              </p>
              {/* Flip card */}
              <div style={{ perspective: '800px', width: '120px', height: '196px', margin: '0 auto 14px' }}>
                <div style={{
                  width: '100%', height: '100%',
                  position: 'relative', transformStyle: 'preserve-3d',
                  transition: 'transform 0.75s cubic-bezier(0.4,0,0.2,1)',
                  transform: flipped[i] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    borderRadius: '10px', background: 'linear-gradient(135deg, #1a0a2e, #0f0720)',
                    border: '1.5px solid oklch(0.74 0.135 82 / 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>✦</span>
                  </div>
                  <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)', borderRadius: '10px',
                    background: `linear-gradient(145deg, ${card.gradientFrom}, ${card.gradientTo})`,
                    border: `2px solid oklch(0.74 0.135 82 / ${activeCard === i ? '0.9' : '0.5'})`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 8px',
                    boxShadow: activeCard === i
                      ? '0 0 40px oklch(0.74 0.135 82 / 0.5), 0 8px 30px oklch(0.52 0.19 293 / 0.4)'
                      : '0 4px 20px oklch(0.52 0.19 293 / 0.25)',
                    transition: 'box-shadow 0.3s, border-color 0.3s',
                  }}>
                    <span style={{ fontSize: '2.8rem', lineHeight: 1 }}>{card.symbol}</span>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', letterSpacing: '0.06em', color: 'oklch(0.91 0.022 82)', textAlign: 'center', lineHeight: 1.4 }}>
                      {card.name}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {card.keywords.slice(0, 2).map(kw => (
                        <span key={kw} style={{ fontSize: '0.47rem', fontFamily: 'Cinzel, serif', color: 'oklch(0.91 0.022 82 / 0.8)', border: '0.5px solid oklch(0.91 0.022 82 / 0.3)', padding: '1px 4px', borderRadius: '2px' }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.82rem', color: 'oklch(0.74 0.135 82)', letterSpacing: '0.06em', marginBottom: '3px' }}>
                {card.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'oklch(0.5 0.015 82)', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
                {card.arcana === 'major' ? '메이저 아르카나' : `마이너 — ${card.suit}`}
              </p>
            </div>
          ))}
        </div>

        {/* Active card detail */}
        {activeCard !== null && (
          <div style={{
            background: 'oklch(0.13 0.055 288)', border: '1px solid oklch(0.74 0.135 82 / 0.3)',
            borderRadius: '12px', padding: '28px', marginBottom: '28px',
            animation: 'fadeInUp 0.3s ease',
          }}>
            <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.4rem' }}>{selectedCards[activeCard].symbol}</span>
              <div>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: 'oklch(0.74 0.135 82)', letterSpacing: '0.08em' }}>
                  {selectedCards[activeCard].name}
                </h3>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.08em', color: 'oklch(0.52 0.015 82)', marginTop: '2px' }}>
                  {CARD_POSITIONS[activeCard]} — 카드 의미
                </p>
              </div>
            </div>
            <p style={{ fontSize: '1.05rem', color: 'oklch(0.82 0.018 82)', lineHeight: 1.85, fontStyle: 'italic' }}>
              {selectedCards[activeCard].uprightMeaning}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {selectedCards[activeCard].keywords.map(kw => (
                <span key={kw} style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.1em', color: 'oklch(0.74 0.135 82)', border: '1px solid oklch(0.74 0.135 82 / 0.35)', padding: '3px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* AI Interpretation */}
        <AISection
          interpretationText={interpretationText}
          isAIAnswer={currentReading?.interpretationSource === 'ai'}
          isLoading={isLoading}
          error={aiError}
        />

        {/* No login hint */}
        {!isLoggedIn && (
          <div style={{
            textAlign: 'center', padding: '18px 24px',
            background: 'oklch(0.52 0.19 293 / 0.07)',
            border: '1px solid oklch(0.52 0.19 293 / 0.25)',
            borderRadius: '10px', marginBottom: '24px',
          }}>
            <p style={{ fontFamily: 'Crimson Text, serif', fontSize: '1rem', color: 'oklch(0.75 0.018 82)', lineHeight: 1.7 }}>
              리딩을 저장하려면 로그인이 필요합니다.{' '}
              <span onClick={() => navigate('/dashboard')} style={{ color: 'oklch(0.74 0.135 82)', cursor: 'pointer', textDecoration: 'underline' }}>
                지금 로그인 →
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: '14px 24px 20px',
        background: 'oklch(0.08 0.035 285 / 0.95)',
        borderTop: '1px solid oklch(0.74 0.135 82 / 0.18)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 2, padding: '14px',
              background: saved
                ? 'oklch(0.52 0.19 293 / 0.25)'
                : 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))',
              border: saved ? '1px solid oklch(0.52 0.19 293 / 0.4)' : 'none',
              borderRadius: '10px',
              color: saved ? 'oklch(0.74 0.135 82)' : 'oklch(0.08 0.035 285)',
              fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.12em',
              cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: saved ? 'none' : '0 4px 20px oklch(0.74 0.135 82 / 0.35)',
            }}
          >
            {saved ? '✓ 저장 완료' : isLoggedIn ? '✦ 이 리딩 저장하기' : '✦ 로그인 후 저장'}
          </button>
          <button
            onClick={handleShare}
            style={{
              flex: 1, padding: '14px',
              background: 'oklch(0.13 0.055 288)',
              border: '1px solid oklch(0.74 0.135 82 / 0.3)', borderRadius: '10px',
              color: copied ? 'oklch(0.74 0.135 82)' : 'oklch(0.82 0.018 82)',
              fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.1em',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
          >
            {copied ? '✓ 복사됨' : '↑ 공유'}
          </button>
          <button
            onClick={handleStartOver}
            style={{
              flex: 1, padding: '14px',
              background: 'oklch(0.17 0.045 287)',
              border: '1px solid oklch(0.74 0.135 82 / 0.12)', borderRadius: '10px',
              color: 'oklch(0.62 0.015 82)',
              fontFamily: 'Cinzel, serif', fontSize: '0.82rem', letterSpacing: '0.1em',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
          >
            ↺ 다시
          </button>
        </div>
      </div>
    </div>
  );
}
