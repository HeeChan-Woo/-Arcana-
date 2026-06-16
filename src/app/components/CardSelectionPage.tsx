import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StarField } from './StarField';
import { Navigation } from './Navigation';
import { CardBack } from './CardBack';
import { useTarot } from '../context/TarotContext';
import { TAROT_CARDS, TarotCard } from '../data/tarotCards';

const REQUIRED = 3;

// Shuffle cards once on mount
function shuffleCards(cards: TarotCard[]): TarotCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function shuffleDeck(): TarotCard[] {
  return shuffleCards(TAROT_CARDS);
}

export function CardSelectionPage() {
  const navigate = useNavigate();
  const { question, setSelectedCards, addReading, isLoading } = useTarot();
  const [deck, setDeck] = useState<TarotCard[]>(shuffleDeck);
  const [selected, setSelected] = useState<number[]>([]); // card ids in selected order
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedCards = selected
    .map(id => deck.find(card => card.id === id))
    .filter((card): card is TarotCard => Boolean(card));

  useEffect(() => {
    if (!question) navigate('/');
  }, [question]);

  const toggleCard = (card: TarotCard) => {
    if (selected.includes(card.id)) {
      setSelected(selected.filter(id => id !== card.id));
      setRevealed(prev => { const s = new Set(prev); s.delete(card.id); return s; });
    } else if (selected.length < REQUIRED) {
      const newSelected = [...selected, card.id];
      setSelected(newSelected);
      // Brief reveal animation
      setRevealed(prev => new Set([...prev, card.id]));
      setTimeout(() => {
        setRevealed(prev => { const s = new Set(prev); s.delete(card.id); return s; });
      }, 500);
    }
  };

  const reshuffleRemainingCards = () => {
    if (selected.length === 0 || selected.length >= REQUIRED || isConfirming) return;

    setDeck(prev => {
      const selectedSet = new Set(selected);
      const shuffledRemaining = shuffleCards(prev.filter(card => !selectedSet.has(card.id)));
      let nextRemainingIndex = 0;

      return prev.map(card => {
        if (selectedSet.has(card.id)) return card;
        const nextCard = shuffledRemaining[nextRemainingIndex];
        nextRemainingIndex += 1;
        return nextCard;
      });
    });
    setHoveredId(null);
    setRevealed(new Set());
  };

  const handleConfirm = () => {
    if (selected.length < REQUIRED) return;
    setIsConfirming(true);
    setSelectedCards(selectedCards);
    void addReading(selectedCards);
    setTimeout(() => navigate('/result'), 800);
  };

  const cardSize = { w: 60, h: 98 };

  return (
    <div style={{ minHeight: '100vh', background: 'oklch(0.08 0.035 285)', fontFamily: 'Crimson Text, serif', position: 'relative' }}>
      <StarField />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '40px 24px 32px' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', letterSpacing: '0.25em', color: 'oklch(0.74 0.135 82)', textTransform: 'uppercase', marginBottom: '12px' }}>
            카드 선택
          </p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'oklch(0.91 0.022 82)', letterSpacing: '0.05em', marginBottom: '16px' }}>
            마음이 끌리는 카드를 선택하세요
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'oklch(0.72 0.018 82)', fontStyle: 'italic', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            "{question}"
          </p>

          {/* Progress indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            {Array.from({ length: REQUIRED }, (_, i) => (
              <div key={i} style={{
                width: '44px', height: '6px', borderRadius: '3px',
                background: i < selected.length ? 'oklch(0.74 0.135 82)' : 'oklch(0.22 0.075 290)',
                transition: 'background 0.3s',
                boxShadow: i < selected.length ? '0 0 8px oklch(0.74 0.135 82 / 0.6)' : 'none',
              }} />
            ))}
          </div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'oklch(0.55 0.018 82)' }}>
            {selected.length} / {REQUIRED} 선택
          </p>

          {selected.length > 0 && selected.length < REQUIRED && (
            <button
              onClick={reshuffleRemainingCards}
              disabled={isConfirming}
              style={{
                marginTop: '18px',
                padding: '10px 18px',
                background: 'oklch(0.17 0.045 287)',
                border: '1px solid oklch(0.74 0.135 82 / 0.32)',
                borderRadius: '8px',
                color: 'oklch(0.74 0.135 82)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.74rem',
                letterSpacing: '0.1em',
                cursor: isConfirming ? 'wait' : 'pointer',
                boxShadow: '0 4px 18px oklch(0.52 0.19 293 / 0.18)',
              }}
            >
              선택한 카드는 고정하고 남은 카드 섞기
            </button>
          )}
        </div>

        {/* Card positions guide */}
        {selected.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '0 24px 24px', flexWrap: 'wrap' }}>
            {['과거', '현재', '미래'].map((pos, i) => (
              <div key={pos} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '76px', borderRadius: '6px', margin: '0 auto 8px',
                  background: i < selected.length
                    ? `linear-gradient(135deg, ${selectedCards[i]?.gradientFrom}, ${selectedCards[i]?.gradientTo})`
                    : 'oklch(0.15 0.04 285)',
                  border: `1px solid ${i < selected.length ? 'oklch(0.74 0.135 82 / 0.7)' : 'oklch(0.74 0.135 82 / 0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'all 0.4s',
                  boxShadow: i < selected.length ? '0 0 16px oklch(0.52 0.19 293 / 0.3)' : 'none',
                }}>
                  {i < selected.length ? selectedCards[i]?.symbol : '?'}
                </div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.08em', color: i < selected.length ? 'oklch(0.74 0.135 82)' : 'oklch(0.4 0.015 82)' }}>
                  {pos}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Card grid */}
        <div style={{ padding: '16px 16px 156px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize.w}px, 1fr))`,
            gap: '10px',
          }}>
            {deck.map((card, idx) => {
              const isSelected = selected.includes(card.id);
              const isHovered = hoveredId === card.id;
              const isDisabled = !isSelected && selected.length >= REQUIRED;

              return (
                <div
                  key={card.id}
                  onClick={() => !isDisabled && toggleCard(card)}
                  onMouseEnter={() => setHoveredId(card.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    width: `${cardSize.w}px`,
                    height: `${cardSize.h}px`,
                    borderRadius: '6px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    transform: isSelected
                      ? 'translateY(-10px) scale(1.06)'
                      : isHovered && !isDisabled
                        ? 'translateY(-5px) scale(1.03)'
                        : 'none',
                    boxShadow: isSelected
                      ? '0 8px 30px oklch(0.74 0.135 82 / 0.6)'
                      : isHovered && !isDisabled
                        ? '0 4px 20px oklch(0.52 0.19 293 / 0.4)'
                        : 'none',
                    opacity: isDisabled ? 0.35 : 1,
                    outline: isSelected ? '2px solid oklch(0.74 0.135 82)' : '2px solid transparent',
                  }}
                >
                  <CardBack size="sm" />
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '-8px', right: '-8px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'oklch(0.74 0.135 82)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: 'oklch(0.08 0.035 285)',
                      fontFamily: 'Cinzel, serif', fontWeight: 700,
                      boxShadow: '0 2px 8px oklch(0.74 0.135 82 / 0.5)',
                    }}>
                      {selected.indexOf(card.id) + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirm button */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          padding: '16px 24px',
          background: 'oklch(0.08 0.035 285 / 0.95)',
          borderTop: '1px solid oklch(0.74 0.135 82 / 0.15)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <button
              onClick={handleConfirm}
              disabled={selected.length < REQUIRED || isConfirming}
              style={{
                width: '100%',
                padding: '14px',
                background: selected.length >= REQUIRED
                  ? 'linear-gradient(135deg, oklch(0.74 0.135 82), oklch(0.65 0.15 75))'
                  : 'oklch(0.17 0.045 287)',
                border: 'none',
                borderRadius: '8px',
                color: selected.length >= REQUIRED ? 'oklch(0.08 0.035 285)' : 'oklch(0.38 0.015 82)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.88rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: selected.length >= REQUIRED && !isConfirming ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: selected.length >= REQUIRED ? '0 4px 24px oklch(0.74 0.135 82 / 0.4)' : 'none',
                opacity: isConfirming ? 0.82 : 1,
              }}
            >
              {isConfirming
                ? isLoading ? '✦  AI 해석을 여는 중...' : '✦  카드를 펼치는 중...'
                : selected.length >= REQUIRED ? '✦  운명의 카드를 펼쳐라  ✦' : `${REQUIRED - selected.length}장 더 선택하세요`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
