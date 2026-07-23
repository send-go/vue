# @sendgo/vue

> **Vue.js / Nuxt 3에서 카카오 알림톡, 친구톡, SMS를 발송하는 공식 Vue SDK**

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

## useFriendtalk 훅

```vue
<script setup lang="ts">
import { useFriendtalk } from '@sendgo/vue';

const { send, loading, error } = useFriendtalk(
  (params) => $fetch('/api/friendtalk', { method: 'POST', body: params })
);

const sendPromo = () => send({
  content:  '🎉 7월 한정 특가! 지금 바로 확인하세요.',
  contacts: [{ contact: '01012345678' }],
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

## 라이선스

MIT License © 2026 [Sendgo](https://sendgo.io)

---

*키워드: 카카오 알림톡 Vue, 카카오 친구톡 Nuxt, SMS 발송 Vue.js, 알림톡 Nuxt3 Server Route, Vue 카카오 API, Sendgo Vue SDK, Nuxt 알림 발송*
