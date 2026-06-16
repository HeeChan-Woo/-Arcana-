# ARCANA 타로 리딩 웹 앱

사용자가 질문을 입력하고 3장의 타로 카드를 선택하면, 카드의 과거/현재/미래 흐름을 바탕으로 개인화된 해석을 보여주는 React 기반 타로 웹 앱입니다.

원본 디자인 출처: https://www.figma.com/design/QGJuOliYthMTRC1scjYv6i/Tarot-Reading-Web-App

## 주요 기능

- 질문 입력 후 타로 카드 선택
- 3장 카드 스프레드: 과거, 현재, 미래
- 카드별 의미와 키워드 확인
- OpenAI API를 활용한 맞춤형 타로 해석
- 리딩 기록 저장을 고려한 컨텍스트 구조
- 추후 Supabase Edge Functions 또는 API Routes로 전환하기 쉬운 API 호출 분리

## 실행 방법

의존성을 설치합니다.

```bash
npm i
```

개발 서버를 실행합니다.

```bash
npm run dev
```

프로덕션 빌드를 확인합니다.

```bash
npm run build
```

## OpenAI API 설정

현재 AI 호출은 Supabase Edge Function `tarot-reading`을 통해 실행됩니다. 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 추가하세요.

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Next.js로 옮길 경우 같은 값으로 사용할 수 있습니다.
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

OpenAI API Key는 프론트엔드 `.env`에 두지 말고 Supabase Edge Function 환경 변수로 설정하세요.

환경변수를 새로 추가하거나 수정한 뒤에는 개발 서버를 재시작해야 반영됩니다.

## 프로젝트 구조

```text
src/
  app/
    components/      화면과 UI 컴포넌트
    context/         타로 질문, 카드, 리딩 기록 상태
    data/            타로 카드 데이터와 기본 해석
    services/        외부 API 호출 경계
  styles/            전역 스타일과 테마
```

## 개발 메모

- 카드 셔플과 선택 로직은 `CardSelectionPage`에 유지되어 있습니다.
- 리딩 생성과 로딩 상태는 `TarotContext`에서 관리합니다.
- Supabase Auth로 로그인/회원가입 상태를 관리합니다.
- 로그인 사용자의 리딩 기록은 `readings` 테이블에 저장하고, 게스트는 로컬스토리지를 사용합니다.
- AI 해석 호출은 `fetchTarotFromAI`로 분리되어 있고, 현재는 Supabase Edge Function `tarot-reading`을 호출합니다.
- OpenAI 응답이 실패하거나 API 키가 없으면 기존 카드 데이터 기반의 기본 해석을 표시합니다.
