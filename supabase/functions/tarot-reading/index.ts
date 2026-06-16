import { corsHeaders } from '../_shared/cors.ts';

type TarotCardPayload = {
  id?: number | string;
  name: string;
  arcana?: string;
  suit?: string;
  keywords?: string[];
  uprightMeaning?: string;
};

type TarotReadingRequest = {
  question?: string;
  cards?: TarotCardPayload[];
  responseInstructions?: string[];
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!OPENAI_API_KEY) {
    return jsonResponse({ error: 'OPENAI_API_KEY is not configured.' }, 500);
  }

  try {
    const { question, cards, responseInstructions }: TarotReadingRequest = await req.json();

    if (!question?.trim()) {
      return jsonResponse({ error: 'question is required.' }, 400);
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return jsonResponse({ error: 'cards are required.' }, 400);
    }

    const interpretation = await createTarotReading({
      question: question.trim(),
      cards,
      responseInstructions: responseInstructions ?? [],
    });

    return jsonResponse({ interpretation });
  } catch (error) {
    console.error('tarot-reading failed', error);
    return jsonResponse({ error: 'Failed to create tarot reading.' }, 500);
  }
});

async function createTarotReading({
  question,
  cards,
  responseInstructions,
}: {
  question: string;
  cards: TarotCardPayload[];
  responseInstructions: string[];
}) {
  const cardSummary = cards
    .map((card, index) => {
      const position = ['과거', '현재', '미래'][index] ?? `${index + 1}번째 카드`;
      return [
        `${position}: ${card.name}`,
        card.keywords?.length ? `키워드: ${card.keywords.join(', ')}` : '',
        card.uprightMeaning ? `정방향 의미: ${card.uprightMeaning}` : '',
      ].filter(Boolean).join('\n');
    })
    .join('\n\n');

  const formatInstructions = responseInstructions.length > 0
    ? responseInstructions.join('\n')
    : [
      '사용자의 질문에 직접 답하는 한국어 타로 해석을 작성하세요.',
      '무조건 다음 세 섹션 제목을 그대로 사용하세요: **질문에 대한 답**, **카드 흐름**, **다음 행동**.',
      '커리어, 사랑, 금전 같은 카테고리를 임의로 나누지 말고, 사용자가 입력한 질문의 의도에 맞춰 답하세요.',
      '각 섹션은 2-4문장으로 자연스럽고 이해하기 쉽게 작성하세요.',
    ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: [
            '당신은 한국어로 상담하는 타로 리더입니다.',
            '카드를 절대적인 예언처럼 말하지 말고, 사용자가 이해하고 행동할 수 있는 해석으로 답하세요.',
            '불안감을 과장하지 말고 현실적인 조언을 제공합니다.',
            formatInstructions,
          ].join('\n'),
        },
        {
          role: 'user',
          content: [
            `사용자 질문: ${question}`,
            '',
            '선택된 카드:',
            cardSummary,
          ].join('\n'),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI request failed', response.status, errorText);
    throw new Error('OpenAI request failed.');
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenAI response did not include content.');
  }

  return content.trim();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
