# @sendgo/vue

> **Vue.js / Nuxt 3에서 카카오 알림톡, 브랜드메시지, SMS를 발송하는 공식 Vue SDK**

[![npm](https://img.shields.io/npm/v/@sendgo/vue)](https://www.npmjs.com/package/@sendgo/vue)
[![Vue](https://img.shields.io/badge/Vue-3.4+-green)](https://vuejs.org)
[![Nuxt](https://img.shields.io/badge/Nuxt-3+-00DC82)](https://nuxt.com)

> **중요**: 이 패키지는 **서버사이드 전용**입니다.
> Nuxt 3 Server Routes, API Routes에서만 사용하세요.
> 클라이언트 컴포넌트에서 직접 사용하면 API 키가 브라우저에 노출됩니다.

---

## 설치

```bash
npm install @sendgo/vue @sendgo/node
# 또는
pnpm add @sendgo/vue @sendgo/node
```

---

## 빠른 시작

### Nuxt 3 Server Route에서 알림톡 전송

```typescript
// server/api/notify/order.post.ts
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  smsSenderKey:   process.env.SENDGO_SMS_SENDER_KEY,
  apiVersion:     'v2',
});

export default defineEventHandler(async (event) => {
  const { phone, orderNo, amount } = await readBody(event);

  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNo, var2: amount }],
  });

  return { success: true };
});
```

### Vue 3 컴포저블로 호출

```vue
<!-- components/OrderButton.vue -->
<script setup lang="ts">
import { useAlimtalk } from '@sendgo/vue';

const { send, loading, error } = useAlimtalk(
  (params) => $fetch('/api/notify/order', { method: 'POST', body: params })
);

const handleNotify = () => send({
  templateCode: 'ORDER_001',
  contacts: [{ contact: '01012345678', var1: 'ORD-001' }],
});
</script>

<template>
  <button @click="handleNotify" :disabled="loading" class="btn-primary">
    {{ loading ? '발송 중...' : '주문 확인 알림 전송' }}
  </button>
  <p v-if="error" class="text-red-500">발송 실패: {{ error.message }}</p>
</template>
```

---

## 알림톡 상세 사용법

```typescript
// server/api/alimtalk.post.ts
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  smsSenderKey:   process.env.SENDGO_SMS_SENDER_KEY,
  apiVersion:     'v2',
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  switch (body.action) {
    case 'bulk':
      // 다건 발송
      await sendgo.alimtalk.send({
        templateCode: 'ORDER_CONFIRM_001',
        contacts: [
          { contact: '01011111111', name: '홍길동', var1: 'ORD-001', var2: '29,000원' },
          { contact: '01022222222', name: '김철수', var1: 'ORD-002', var2: '15,000원' },
          { contact: '01033333333', name: '이영희', var1: 'ORD-003', var2: '52,000원' },
        ],
      });
      break;

    case 'scheduled':
      // 예약 발송
      await sendgo.alimtalk.send({
        templateCode:  'PROMO_SUMMER_2026',
        scheduleType:  'SCHEDULED',
        at:            '2026-07-28 09:00:00',
        contacts: [{ contact: body.phone, var1: '여름 한정 50% 할인' }],
      });
      break;

    case 'with-fallback':
      // SMS 자동 대체 발송
      await sendgo.alimtalk.send({
        templateCode:  'DELIVERY_START_001',
        replaceSms:    'Y',
        smsSubject:    '[배송 시작 안내]',
        smsContent:    `주문하신 상품이 출고되었습니다.\n송장번호: ${body.trackingNo}`,
        contacts: [{ contact: body.phone, var1: 'ORD-001', var2: body.trackingNo }],
      });
      break;
  }

  return { success: true };
});
```

---

## SMS / LMS / MMS 사용법

```typescript
// server/api/sms.post.ts
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({ accessKey: '...', secretKey: '...' });

export default defineEventHandler(async (event) => {
  const { type, phone, content, subject } = await readBody(event);

  switch (type) {
    case 'sms':
      return sendgo.sms.sendSms({ content, contacts: [{ contact: phone }] });
    case 'lms':
      return sendgo.sms.sendLms({ subject, content, contacts: [{ contact: phone }] });
    case 'mms':
      return sendgo.sms.sendMms({ subject, content, contacts: [{ contact: phone }] });
  }
});
```

---

## Nuxt 플러그인으로 전역 등록

```typescript
// plugins/sendgo.server.ts
import { SendgoPlugin } from '@sendgo/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(SendgoPlugin, {
    accessKey:      process.env.SENDGO_ACCESS_KEY!,
    secretKey:      process.env.SENDGO_SECRET_KEY!,
    kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
    apiVersion:     'v2',
  });
});
```

---

## useBrandMessage 훅

브랜드메시지는 친구톡의 후속 채널입니다. 친구톡은 카카오 정책에 따라 **2025-12-31 종료**되었고,
2026-01-01 부터 친구톡 발송 요청은 카카오 측에서 브랜드메시지(자유형)로 자동 대체 발송됩니다.
**v2 전용**입니다.

```vue
<script setup lang="ts">
import { useBrandMessage } from '@sendgo/vue';

const { send, loading, error } = useBrandMessage(
  (params) => $fetch('/api/brand-message', { method: 'POST', body: params })
);

const sendPromo = () => send({
  targeting:          'M',
  messageType:        'FT',
  friendTemplateUuid: '9cd5460b-6458-4edc-9b11-c26d3013c340',
  content:            '🎉 7월 한정 특가! 지금 바로 확인하세요.',
  contacts:           [{ contact: '01012345678' }],
});
</script>

<template>
  <button @click="sendPromo" :disabled="loading">
    {{ loading ? '발송 중...' : '프로모션 전송' }}
  </button>
</template>
```

---

## 관련 패키지

| 언어/프레임워크 | 패키지 | GitHub |
|----------------|--------|--------|
| Node.js (코어) | `@sendgo/node` | [node](https://github.com/send-go/node) |
| React / Next.js | `@sendgo/react` | [react](https://github.com/send-go/react) |
| Spring Boot | `io.sendgo:sendgo-spring` | [spring](https://github.com/send-go/spring) |
| Python | `sendgo-python` | [python](https://github.com/send-go/python) |
| 전체 목록 | — | [send-go GitHub 조직](https://github.com/send-go) |

---

## 브랜드메시지 · 짧은 URL

이 패키지는 코어(`@sendgo/node`)의 클라이언트를 그대로 노출하므로, 코어에 있는 채널이
모두 그대로 쓸 수 있습니다. 두 기능 모두 **v2 전용**입니다.

| 기능 | 접근 |
|------|------|
| 카카오 브랜드메시지 (친구톡의 후속 채널) | `sendgo.brandMessage` |
| 짧은 URL (단축 + 클릭 반응 분석) | `sendgo.shortUrl` |

브랜드메시지는 채널 친구가 아닌 수신자에게도 보낼 수 있고(`targeting` = `N`),
수신 동의한 전체 채널 친구에게 동보 발송할 수도 있습니다(`targeting` = `F`).

짧은 URL 은 메시지 본문의 링크를 줄이고 클릭 반응(일별 추이·디바이스·유입경로·국가)을
집계합니다.

사용 예시와 파라미터는 [코어 README](https://github.com/send-go) 와
[SDK 가이드](https://sendgo.io/ko/sdk) 를 참고하세요.

## 변경 사항

### 1.2.0 (2026-08-14)

- **친구톡 Deprecated 표기** — 친구톡은 카카오 정책에 따라 2025-12-31 종료되었고,
  2026-01-01 부터 발송 요청이 브랜드메시지(자유형)로 자동 대체 발송됩니다.
  관련 API 에 각 언어의 표준 deprecation 표기를 달았습니다.
- 자유 본문 타입(`FT`/`FI`/`FW`)의 개별 발송 경로는 아직 친구톡 API 뿐이라는 점을
  문서에 명시했습니다 — 브랜드메시지 API 는 그 조합에 `NOT_A_BRAND_MESSAGE` 를 반환합니다.
- 브랜드메시지 전환 안내와 메시지 타입 1:1 대응표를 README 에 추가했습니다.

### 1.1.0 (2026-08-11)

- 짧은 URL 타입 재수출 (`ShortUrlParams` 등)

## 라이선스

MIT License © 2026 [Sendgo](https://sendgo.io)

---

*키워드: 카카오 알림톡 Vue, 카카오 친구톡 Nuxt, SMS 발송 Vue.js, 알림톡 Nuxt3 Server Route, Vue 카카오 API, Sendgo Vue SDK, Nuxt 알림 발송*
