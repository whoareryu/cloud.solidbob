# VitaLink Frontend (의료데이터 통합 지갑 데모)

DID 기반 개인 의료데이터 통합 지갑의 데모 SPA. 한 앱에서 **환자 / 의료진 / 응급실** 3개 행위자의
3개 시나리오를 처음부터 끝까지 시연합니다. 백엔드 없이 `src/mocks/` 의 시드 + mock API 로 동작합니다.

## 실행

```bash
cd frontend
npm install
npm run dev        # http://127.0.0.1:3000
```

> dev 서버 포트는 백엔드(FastAPI) CORS 허용 도메인(`localhost:3000`)에 맞춰 3000 으로 고정되어 있습니다.

## 폴더 구조

```
src/
  App.jsx              라우터 + 모바일 프레임 + 데모 역할 스위처
  routes/              페이지 (Login, Home, Connect, RecordDetail, ShareNew,
                       ShareQrPage, ShareHistory, Logs, EmergencyInfo, Clinic, Er)
  components/
    common/            Button, Card, Badge, Modal, Sheet, Timer, EmptyState,
                       AppBar, TabBar, RoleSwitcher
    records/           RecordCard, RecordTimeline, IntegrityBadge, AnchorDetail
    share/             ShareItemPicker, ShareQR, ConsentCard, AccessLogItem
    emergency/         EmergencySummaryCard, VitalChip, MedicationList, InteractionAlert
  stores/              zustand: useAuthStore, useRecordsStore, useShareStore,
                       useEmergencyStore, usePrescriptionStore, useLogStore
  mocks/
    seed.js            시드 데이터 (백엔드 DB 스키마와 1:1 매핑)
    api.js             mock API (인위적 지연 300~800ms) — 백엔드 교체 지점
  lib/
    hash.js  did.js  chain.js  token.js  ai.js  interactions.js  format.js
```

## 데모 동선

상단 **역할 스위처**(환자/의료진/응급실)와 **리셋** 버튼은 항상 노출됩니다. 상태(공유 토큰, 응급 권한,
로그)는 역할 간 공유되어 한 흐름으로 연결됩니다.

- **시나리오 1 — 진료기록 통합 & 블록체인 무결성** (환자)
  1. `/login` 모바일 신분증으로 시작 (약 2초 DID 인증)
  2. 홈 → 우상단 `+` → `/connect` 에서 **국민건강보험공단** 연동 → FHIR 기록 수집 + 자동 앵커링
  3. 타임라인의 기록 탭 → `/records/:id` → "블록체인 검증됨" 탭 → tx_hash·블록번호·익스플로러 링크
     + SHA-256 재계산 해시가 저장 해시와 일치하는 무결성 애니메이션

- **시나리오 2 — 선택적·일회성 공유** (환자 → 의료진)
  1. 하단 중앙 QR 버튼 또는 `/share/new` → 수신자·항목·공개방식(SD-JWT) 선택 → "1회용 QR 만들기"
  2. `/share/:id/qr` 5분 카운트다운 QR
  3. 역할을 **의료진**으로 전환 → `/clinic` → "QR 스캔(시뮬레이트)" → 허용 항목 열람 → 토큰 소멸
  4. 재스캔 시 "이미 사용된 토큰" → `/share/history`, `/logs` 에 반영

- **시나리오 3 — AI 응급 어시스턴트 & 약물충돌** (환자 → 응급실)
  1. (환자) `/emergency-info` 에서 혈액형·알러지·만성질환·비상연락처 확인/수정
  2. 역할을 **응급실**로 전환 → `/er` → "환자 DID/QR로 응급 접근" → AI 한 줄 요약 + 복용약 파생
  3. "신규 처방 입력" → **아스피린** 선택 → 현재 복용 중인 **와파린**과 충돌 → high 경고 모달
  4. (환자) 홈 상단에 "응급 열람 발생" 배지 + `/logs` 에 응급 열람 기록

## 반응형 (모바일 / 데스크톱 웹)

같은 코드베이스가 화면 폭에 따라 두 가지 레이아웃으로 동작합니다(기준 `lg`, 1024px).

- **모바일 (`< lg`)**: 폰 프레임 + 상단 데모바(역할 스위처) + 하단 탭바. 환자가 이동 중 사용.
- **데스크톱 (`>= lg`)**: 좌측 **사이드바**(브랜드·역할 스위처·역할별 네비게이션) + 전체폭 콘텐츠.
  의료진/원무과/응급실은 PC 브라우저로, 환자도 데이터 정리·열람 시 PC로 사용합니다. 탭바·폰 프레임은
  숨겨지고 본문은 가독성을 위해 가운데 정렬됩니다.

별도 빌드 없이 브라우저 창 크기만으로 전환됩니다(`components/common/Sidebar.jsx`, `App.jsx`).

## 인증 (본인인증 / 기관 인증서)

- **환자 — 휴대폰 본인인증**: 로그인 화면 → "휴대폰 본인인증으로 시작" → 약관 동의 → 정보 입력
  (이름·주민번호·통신사·번호) → SMS 인증번호(데모는 화면에 노출) → DID 발급. 입력한 이름·생년월일을
  **등록 회원과 대조**하여 불일치 시 인증 실패 처리합니다(시드 회원: 김지원 / 710814). 반복 시연용
  "데모 빠른 로그인"으로 건너뛸 수도 있습니다. (`lib/did.js`, `mocks/api.js#verifyIdentity`)
- **의료진/응급실 — 기관 인증서(공동인증서)**: `/clinic`·`/er` 진입 시 인증서 로그인 게이트가 먼저
  뜹니다. 인증서 선택 + 인증서 비밀번호(데모: `1234`) → 검증 후 콘솔 진입. 모든 환자 데이터 접근은 이
  인증서 신원으로 로그에 남습니다. 콘솔 우상단 로그아웃으로 인증 해제(재시연) 가능.
  (`components/auth/StaffCertAuth.jsx`, `stores/useStaffStore.js`)

## 공유 인증 방식 (QR + 코드)

데이터 공유 토큰 발급 시 세 가지 검증 수단이 함께 생성됩니다.

- **QR** (`token`): 모바일 단말이 카메라로 스캔.
- **공유 ID** (`share_ref`, 예 `VL-3A9F`) + **인증번호** (`share_code`, 6자리): QR 스캔이 어려운
  **PC 단말용 대안**. 환자 QR 화면 하단에 표시되고, 의료진 콘솔(`/clinic`)의 "공유 ID + 인증번호" 탭에서
  입력해 1회 열람합니다. 인증번호 불일치 시 차단 로그가 남습니다.

두 방식 모두 동일한 일회성 소비 로직을 거쳐 열람 즉시 토큰이 소멸합니다.

## 백엔드 교체 지점

이 프론트엔드는 백엔드 FastAPI(`../main.py`)의 도메인/스키마와 필드명을 1:1로 맞췄습니다.
실제 백엔드 연결 시 **`src/mocks/api.js`** 의 각 함수를 아래 엔드포인트 호출로 교체하면 됩니다.

| mock api 함수 | 백엔드 엔드포인트 | 도메인 |
| --- | --- | --- |
| `login` / `getCredentials` | `POST/GET /api/v1/identity/credentials` | identity |
| `listRecords` / `getRecord` | `GET /api/v1/medical-records` | medical_record |
| `connectInstitution` → `create_record` | `POST /api/v1/medical-records` | medical_record |
| `getAnchor` (검증) | `GET /api/v1/medical-records/{id}/verify` | medical_record |
| `issueShareToken` | `POST /api/v1/share-tokens` | share_token |
| `redeemShareToken` (QR) | `POST /api/v1/share-tokens/redeem` | share_token |
| `redeemShareByCode` (ID+인증번호) | `POST /api/v1/share-tokens/redeem` (서버에서 ref+code→token 매핑) | share_token |
| `revokeConsent` | `POST /api/v1/share-tokens/{id}/revoke` | share_token |

도메인 로직 목업도 격리되어 있습니다:
- `lib/chain.js` — 앵커링(tx_hash, explorer URL) → 실제 체인/Hardhat 으로 교체
- `lib/did.js` — DID/VC 발급·검증 → OpenID4VC / SD-JWT 라이브러리로 교체
- `lib/token.js` — 일회성 토큰 → Redis token store 로 교체
- `lib/ai.js` — 규칙 기반 응급 요약 → 실제 LLM(Claude API 등)으로 교체
- `lib/interactions.js` — 약물충돌 판정 → `drug_interactions` 테이블 조회로 교체

## 설계 결정 (명세상 모호했던 부분)

- **단일 환자(김지원)** 를 데모 주인공으로 고정(`mocks/seed.js`의 `CURRENT_USER_ID`). 백엔드 시드의
  구조(UUID, did:web)는 유지하되 명세 7번에 맞춰 이름/만성질환/알러지를 현실화했습니다.
- 체인 네트워크는 명세대로 `ethereum_sepolia` 를 기본값으로 사용하며 explorer 는 Etherscan Sepolia
  링크를 사용합니다(실제 네트워크 호출은 없음, 링크만 새 탭으로 열림).
- 인메모리 DB(`mocks/api.js`)를 단일 상태원으로 두어 역할 간 상태 공유(환자→의료진→응급실)를 보장합니다.
- 무결성 시연: 시드 해시는 동기 의사(pseudo) 해시로 생성하고, 상세 화면에서는 실제 SHA-256 재계산을
  수행해 "저장 해시 == 재계산 해시"를 애니메이션으로 보여줍니다(데모 일관성을 위해 일치하도록 표시).

## 기술 스택

React 18 · Vite · Tailwind CSS · Zustand · React Router v6 · lucide-react · qrcode.react
