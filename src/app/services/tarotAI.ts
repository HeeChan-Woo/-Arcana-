import { TarotCard, getInterpretation } from '../data/tarotCards';
import { supabase } from './supabase';

export interface TarotAISections {
  directAnswer: string;
  cardFlow: string;
  actionAdvice: string;
}

interface FetchTarotFromAIParams {
  question: string;
  cards: TarotCard[];
  signal?: AbortSignal;
}

export function formatTarotAISections(sections: TarotAISections): string {
  return [
    `**질문에 대한 답**\n${sections.directAnswer}`,
    `**카드 흐름**\n${sections.cardFlow}`,
    `**다음 행동**\n${sections.actionAdvice}`,
  ].join('\n\n');
}

export function parseTarotAISections(interpretation: string): TarotAISections {
  const normalized = interpretation.trim();
  const sectionMatch = (label: string, nextLabels: string[]) => {
    const nextPattern = nextLabels.map(escapeRegExp).join('|');
    const regex = new RegExp(
      `(?:\\*\\*)?${escapeRegExp(label)}(?:\\*\\*)?\\s*\\n([\\s\\S]*?)(?=\\n\\n(?:\\*\\*)?(?:${nextPattern})(?:\\*\\*)?\\s*\\n|$)`,
      'i',
    );
    return normalized.match(regex)?.[1]?.trim();
  };

  const directAnswer = sectionMatch('질문에 대한 답', ['카드 흐름', '다음 행동'])
    || sectionMatch('핵심 메시지', [])
    || sectionMatch('전체 흐름', ['현실 조언', '커리어 & 사랑', '핵심 메시지']);
  const cardFlow = sectionMatch('카드 흐름', ['다음 행동'])
    || sectionMatch('전체 흐름', ['현실 조언', '커리어 & 사랑', '핵심 메시지']);
  const actionAdvice = sectionMatch('다음 행동', [])
    || sectionMatch('현실 조언', ['핵심 메시지'])
    || sectionMatch('커리어 & 사랑', ['핵심 메시지']);

  return {
    directAnswer: directAnswer || normalized,
    cardFlow: cardFlow || '선택된 세 장의 카드는 질문의 배경, 현재의 핵심 감정, 앞으로 열릴 가능성을 차례로 보여줍니다.',
    actionAdvice: actionAdvice || `질문 "${questionFromInterpretation(normalized)}"에 대해 지금 할 수 있는 가장 좋은 행동은 결론을 서두르기보다 작은 선택 하나를 분명히 실행하는 것입니다.`,
  };
}

export function createFallbackTarotInterpretation(cards: TarotCard[], question: string): string {
  const base = getInterpretation(cards, question);
  const [pastCard, presentCard, futureCard] = cards;

  return formatTarotAISections({
    directAnswer: `"${question}"에 대한 기본 해석은 지금 바로 단정하기보다, 현재 상황을 움직이는 핵심 감정과 선택지를 먼저 분명히 보라는 쪽에 가깝습니다. ${base}`,
    cardFlow: `${pastCard.name}은 질문의 배경에 ${pastCard.keywords.slice(0, 2).join(', ')}의 영향이 있었음을 보여주고, ${presentCard.name}은 지금 ${presentCard.keywords.slice(0, 2).join(', ')}이 가장 크게 작용하고 있음을 말합니다. ${futureCard.name}은 다음 흐름에서 ${futureCard.keywords.slice(0, 2).join(', ')}을 의식해야 한다는 신호입니다.`,
    actionAdvice: `지금은 "${question}"을 한 문장으로 다시 정리한 뒤, ${cards.map(card => card.keywords[0]).join(', ')} 중 가장 와닿는 키워드 하나를 오늘의 행동 기준으로 삼아보세요.`,
  });
}

export async function fetchTarotFromAI({
  question,
  cards,
  signal,
}: FetchTarotFromAIParams): Promise<string> {
  try {
    if (signal?.aborted) {
      throw new DOMException('The request was aborted.', 'AbortError');
    }

    const { data, error } = await supabase.functions.invoke<{ interpretation?: string }>(
      'tarot-reading',
      {
        body: {
          question,
          responseInstructions: [
            '사용자의 질문에 직접 답하는 한국어 타로 해석을 작성하세요.',
            '무조건 다음 세 섹션 제목을 그대로 사용하세요: **질문에 대한 답**, **카드 흐름**, **다음 행동**.',
            '커리어, 사랑, 금전 같은 카테고리를 임의로 나누지 말고, 사용자가 입력한 질문의 의도에 맞춰 답하세요.',
            '각 섹션은 2-4문장으로 자연스럽고 이해하기 쉽게 작성하세요.',
          ],
          cards: cards.map(card => ({
            id: card.id,
            name: card.name,
            arcana: card.arcana,
            suit: card.suit,
            keywords: card.keywords,
            uprightMeaning: card.uprightMeaning,
          })),
        },
      },
    );

    if (error) {
      throw error;
    }

    if (!data?.interpretation) {
      throw new Error('Tarot Edge Function response did not include interpretation.');
    }

    return data.interpretation;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    console.warn('Falling back to local tarot interpretation.', error);
    return createFallbackTarotInterpretation(cards, question);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function questionFromInterpretation(value: string): string {
  return value.match(/"([^"]+)"/)?.[1] || '현재 질문';
}
