export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  symbol: string;
  gradientFrom: string;
  gradientTo: string;
}

export const TAROT_CARDS: TarotCard[] = [
  // --- MAJOR ARCANA ---
  { id: 0, name: 'The Fool', arcana: 'major', number: 0, symbol: '◯', gradientFrom: '#f0e68c', gradientTo: '#4a90d9', keywords: ['새로운 시작', '순수함', '자유'], uprightMeaning: '새로운 여정의 시작. 두려움 없이 세상으로 뛰어드는 용기와 순수한 마음을 뜻합니다. 예상치 못한 모험이 기다리고 있습니다.', reversedMeaning: '무모함, 경솔함. 현실을 직시하지 않고 위험을 무릅쓸 수 있습니다.' },
  { id: 1, name: 'The Magician', arcana: 'major', number: 1, symbol: '∞', gradientFrom: '#c9a227', gradientTo: '#7c3aed', keywords: ['의지', '창조', '숙련'], uprightMeaning: '당신이 원하는 것을 현실로 만들 힘이 있습니다. 네 가지 원소(불·물·공기·흙)를 모두 갖추었으며 창조적 에너지가 넘칩니다.', reversedMeaning: '기만, 조작, 재능의 낭비. 잠재력을 제대로 발휘하지 못하고 있습니다.' },
  { id: 2, name: 'The High Priestess', arcana: 'major', number: 2, symbol: '☽', gradientFrom: '#4a4a8a', gradientTo: '#c0c0e0', keywords: ['직관', '신비', '내면의 지혜'], uprightMeaning: '표면 아래 숨겨진 진실이 있습니다. 내면의 목소리에 귀를 기울이고 직관을 신뢰하세요.', reversedMeaning: '내면 무시, 비밀, 표면적 지식. 깊이 있는 통찰을 회피하고 있습니다.' },
  { id: 3, name: 'The Empress', arcana: 'major', number: 3, symbol: '♀', gradientFrom: '#5c8a3c', gradientTo: '#e8c27a', keywords: ['풍요', '양육', '창조성'], uprightMeaning: '풍요롭고 아름다운 창조의 에너지. 자연과 조화를 이루며 삶의 아름다움을 만끽할 때입니다.', reversedMeaning: '의존, 창의력 막힘, 과잉보호. 자신을 너무 희생하고 있을 수 있습니다.' },
  { id: 4, name: 'The Emperor', arcana: 'major', number: 4, symbol: '♂', gradientFrom: '#8b2020', gradientTo: '#c9a227', keywords: ['권위', '구조', '리더십'], uprightMeaning: '강한 리더십과 안정된 구조를 의미합니다. 규율과 질서를 통해 목표를 달성하세요.', reversedMeaning: '독재, 경직, 통제욕. 권력을 남용하거나 타인에게 지나치게 의존할 수 있습니다.' },
  { id: 5, name: 'The Hierophant', arcana: 'major', number: 5, symbol: '☩', gradientFrom: '#6a4a9a', gradientTo: '#c9a227', keywords: ['전통', '영성', '조언'], uprightMeaning: '전통적인 가르침과 영적인 안내. 멘토나 스승의 지혜를 구하는 것이 도움이 됩니다.', reversedMeaning: '독단, 반항, 새로운 접근. 기존의 관습에 의문을 품고 자신만의 길을 찾고 있습니다.' },
  { id: 6, name: 'The Lovers', arcana: 'major', number: 6, symbol: '♡', gradientFrom: '#d4607a', gradientTo: '#f4c2a0', keywords: ['사랑', '선택', '조화'], uprightMeaning: '깊은 연결과 중요한 선택의 순간. 진정한 가치관에 따른 결정이 필요합니다.', reversedMeaning: '불화, 잘못된 선택, 불균형. 관계나 결정에서 근본적인 문제를 직면해야 합니다.' },
  { id: 7, name: 'The Chariot', arcana: 'major', number: 7, symbol: '⊕', gradientFrom: '#1a3a6a', gradientTo: '#c9a227', keywords: ['승리', '의지', '통제'], uprightMeaning: '장애물을 극복하고 앞으로 나아가는 강한 의지. 목표를 향해 집중하면 반드시 승리합니다.', reversedMeaning: '통제 상실, 공격성, 방향 상실. 에너지가 분산되어 목표를 잃고 있습니다.' },
  { id: 8, name: 'Strength', arcana: 'major', number: 8, symbol: '∞', gradientFrom: '#c9a227', gradientTo: '#e05c20', keywords: ['용기', '인내', '내면의 힘'], uprightMeaning: '부드러운 힘과 용기로 어떤 어려움도 극복할 수 있습니다. 자신을 믿고 온화하게 전진하세요.', reversedMeaning: '자기 의심, 나약함, 방어적 태도. 내면의 두려움이 성장을 막고 있습니다.' },
  { id: 9, name: 'The Hermit', arcana: 'major', number: 9, symbol: '☯', gradientFrom: '#3a3a5a', gradientTo: '#a0a0c0', keywords: ['고독', '내면 탐색', '지혜'], uprightMeaning: '혼자만의 시간을 통해 깊은 지혜를 얻을 때. 내면의 빛으로 자신의 길을 비추세요.', reversedMeaning: '고립, 외로움, 고집. 타인과의 연결을 두려워하거나 잘못된 고독을 선택하고 있습니다.' },
  { id: 10, name: 'Wheel of Fortune', arcana: 'major', number: 10, symbol: '⊗', gradientFrom: '#2a6a2a', gradientTo: '#c9a227', keywords: ['운명', '변화', '행운'], uprightMeaning: '운명의 바퀴가 돌고 있습니다. 변화를 받아들이면 행운이 찾아옵니다. 좋은 일이 다가옵니다.', reversedMeaning: '불운, 저항, 통제력 상실. 변화에 저항하면 더 큰 어려움이 올 수 있습니다.' },
  { id: 11, name: 'Justice', arcana: 'major', number: 11, symbol: '⚖', gradientFrom: '#5a3a8a', gradientTo: '#c9a227', keywords: ['공정', '진실', '균형'], uprightMeaning: '공정한 결과와 균형 잡힌 판단. 과거의 행동에 대한 결과가 올 것이며 진실이 밝혀집니다.', reversedMeaning: '불공정, 책임 회피, 편견. 편향된 시각으로 잘못된 판단을 내릴 수 있습니다.' },
  { id: 12, name: 'The Hanged Man', arcana: 'major', number: 12, symbol: '⊥', gradientFrom: '#1a5a5a', gradientTo: '#a0d4d4', keywords: ['희생', '인내', '새로운 시각'], uprightMeaning: '잠시 멈추고 다른 각도에서 바라보세요. 희생을 통해 더 깊은 깨달음을 얻을 수 있습니다.', reversedMeaning: '지체, 자기 희생, 순교. 불필요한 희생으로 시간을 낭비하고 있습니다.' },
  { id: 13, name: 'Death', arcana: 'major', number: 13, symbol: '⌛', gradientFrom: '#1a1a1a', gradientTo: '#6a3a6a', keywords: ['변환', '종말', '새로운 시작'], uprightMeaning: '두려운 변화가 아닌 필요한 전환. 낡은 것이 끝나야 새로운 것이 시작됩니다. 변화를 환영하세요.', reversedMeaning: '저항, 정체, 부패. 변화를 거부하면 삶이 침체됩니다.' },
  { id: 14, name: 'Temperance', arcana: 'major', number: 14, symbol: '◈', gradientFrom: '#2a6a9a', gradientTo: '#f0c87a', keywords: ['균형', '절제', '인내'], uprightMeaning: '균형과 조화의 에너지. 서두르지 말고 천천히, 차분하게 접근하면 최상의 결과를 얻습니다.', reversedMeaning: '불균형, 과잉, 자기 치유 부족. 극단적인 행동이 문제를 일으키고 있습니다.' },
  { id: 15, name: 'The Devil', arcana: 'major', number: 15, symbol: '♾', gradientFrom: '#4a1a1a', gradientTo: '#8a2a2a', keywords: ['속박', '집착', '물질주의'], uprightMeaning: '자신을 묶고 있는 것이 무엇인지 인식하세요. 집착과 두려움에서 벗어나 자유를 찾을 수 있습니다.', reversedMeaning: '해방, 각성, 통제 회복. 부정적인 패턴에서 벗어나고 있습니다.' },
  { id: 16, name: 'The Tower', arcana: 'major', number: 16, symbol: '⚡', gradientFrom: '#8a4a1a', gradientTo: '#e05c20', keywords: ['격변', '계시', '변화'], uprightMeaning: '갑작스러운 변화나 충격적인 계시. 기존의 구조가 무너지지만 그 안에서 진실이 드러납니다.', reversedMeaning: '재앙 회피, 두려움, 저항. 변화를 피하려 하지만 내부적 갈등이 커지고 있습니다.' },
  { id: 17, name: 'The Star', arcana: 'major', number: 17, symbol: '★', gradientFrom: '#1a3a7a', gradientTo: '#a0c8f0', keywords: ['희망', '치유', '영감'], uprightMeaning: '어둠 이후 찾아오는 희망의 빛. 치유와 영감, 밝은 미래가 기다리고 있습니다.', reversedMeaning: '절망, 불신, 방향 상실. 희망을 잃지 말고 내면의 빛을 찾으세요.' },
  { id: 18, name: 'The Moon', arcana: 'major', number: 18, symbol: '☽', gradientFrom: '#1a1a4a', gradientTo: '#6a6ab4', keywords: ['환상', '두려움', '무의식'], uprightMeaning: '불확실성과 환상의 시기. 무의식의 목소리에 귀 기울이되 두려움에 지배당하지 마세요.', reversedMeaning: '혼돈 극복, 명확성, 두려움 해소. 혼란이 점차 걷히고 있습니다.' },
  { id: 19, name: 'The Sun', arcana: 'major', number: 19, symbol: '☀', gradientFrom: '#f0c800', gradientTo: '#e05c20', keywords: ['성공', '기쁨', '활력'], uprightMeaning: '따뜻한 성공과 기쁨의 에너지. 자신감을 가지고 나아가세요. 모든 것이 밝게 빛납니다.', reversedMeaning: '일시적 우울, 과낙관, 지연. 성공이 오고 있지만 조금 더 인내가 필요합니다.' },
  { id: 20, name: 'Judgement', arcana: 'major', number: 20, symbol: '⊙', gradientFrom: '#3a3a8a', gradientTo: '#c9a227', keywords: ['각성', '재생', '평가'], uprightMeaning: '과거를 청산하고 새로운 자아로 거듭날 때. 내면의 목소리에 답하고 더 높은 소명을 받아들이세요.', reversedMeaning: '자기 의심, 내면의 비판, 자기 처벌. 과거의 실수에 너무 집착하고 있습니다.' },
  { id: 21, name: 'The World', arcana: 'major', number: 21, symbol: '◎', gradientFrom: '#1a6a2a', gradientTo: '#c9a227', keywords: ['완성', '통합', '성취'], uprightMeaning: '한 사이클의 완벽한 완성. 모든 노력이 결실을 맺고 진정한 성취감을 느낍니다.', reversedMeaning: '미완성, 지름길 추구, 집착. 마지막 단계를 완성하지 못하고 있습니다.' },

  // --- MINOR ARCANA: WANDS ---
  ...generateMinorArcana('wands', 22, '#c9a227', '#8b2020', '🔥', 'wands'),
  // --- MINOR ARCANA: CUPS ---
  ...generateMinorArcana('cups', 36, '#1a4a8a', '#6ab4e0', '💧', 'cups'),
  // --- MINOR ARCANA: SWORDS ---
  ...generateMinorArcana('swords', 50, '#4a4a7a', '#a0a0d4', '⚔', 'swords'),
  // --- MINOR ARCANA: PENTACLES ---
  ...generateMinorArcana('pentacles', 64, '#2a6a2a', '#c9a227', '⭘', 'pentacles'),
];

function generateMinorArcana(
  suit: 'wands' | 'cups' | 'swords' | 'pentacles',
  startId: number,
  gradientFrom: string,
  gradientTo: string,
  symbol: string,
  suitName: string
): TarotCard[] {
  const suitLabels: Record<string, { element: string; theme: string }> = {
    wands: { element: '불', theme: '열정과 행동' },
    cups: { element: '물', theme: '감정과 직관' },
    swords: { element: '공기', theme: '지성과 갈등' },
    pentacles: { element: '흙', theme: '물질과 현실' },
  };
  const info = suitLabels[suit];
  const numbers = ['에이스', '2', '3', '4', '5', '6', '7', '8', '9', '10', '페이지', '나이트', '퀸', '킹'];
  const cards: TarotCard[] = [];
  for (let i = 0; i < 14; i++) {
    cards.push({
      id: startId + i,
      name: `${numbers[i]} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
      arcana: 'minor',
      suit,
      number: i + 1,
      symbol,
      gradientFrom,
      gradientTo,
      keywords: [info.element, info.theme, numbers[i]],
      uprightMeaning: `${suit}의 ${numbers[i]}번 카드. ${info.theme}과 관련된 에너지가 작용하고 있습니다. 현재 상황에서 ${info.element}의 원소적 영향을 받고 있습니다.`,
      reversedMeaning: `${suit}의 ${numbers[i]}번 카드 역방향. ${info.theme}의 에너지가 막히거나 과잉 상태입니다. 균형을 되찾는 것이 중요합니다.`,
    });
  }
  return cards;
}

export const CARD_POSITIONS = ['과거 (Past)', '현재 (Present)', '미래 (Future)'];

export function getInterpretation(cards: TarotCard[], question: string): string {
  const themes = cards.map(c => c.keywords[0]).join(', ');
  return `당신의 질문 "${question}"에 대한 타로의 메시지입니다.\n\n` +
    `**과거 — ${cards[0].name}**\n${cards[0].uprightMeaning}\n\n` +
    `**현재 — ${cards[1].name}**\n${cards[1].uprightMeaning}\n\n` +
    `**미래 — ${cards[2].name}**\n${cards[2].uprightMeaning}\n\n` +
    `**종합 해석**\n세 카드(${themes})의 에너지가 하나로 연결됩니다. 과거의 경험이 현재의 상황을 만들었고, 지금 이 순간의 선택이 미래를 결정합니다. 우주는 당신이 올바른 방향으로 가고 있음을 암시하고 있습니다. 내면의 목소리를 신뢰하고 앞으로 나아가세요.`;
}
