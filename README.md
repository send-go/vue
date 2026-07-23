# @sendgo/vue

> **Sendgo** Vue.js SDK — 카카오 알림톡/친구톡, SMS/LMS/MMS
> Nuxt 3 Server Routes / Vue 3 서버사이드 전용

[![npm](https://img.shields.io/npm/v/@sendgo/vue)](https://www.npmjs.com/package/@sendgo/vue)
[![Vue](https://img.shields.io/badge/Vue-3.4+-green)](https://vuejs.org)
[![Nuxt](https://img.shields.io/badge/Nuxt-3+-00DC82)](https://nuxt.com)

---

## 빠른 시작 (3단계)

### 1단계 — 설치

```bash
npm install @sendgo/vue @sendgo/node
```

### 2단계 — 환경변수 설정 (Nuxt)

```env
# .env (서버 전용)
SENDGO_ACCESS_KEY=your_access_key
SENDGO_SECRET_KEY=your_secret_key
SENDGO_KAKAO_SENDER_KEY=your_kakao_key
SENDGO_SMS_SENDER_KEY=your_sms_key
SENDGO_API_VERSION=v2
```

### 3단계 — Nuxt Server Route에서 알림톡 전송

```typescript
// server/api/notify.post.ts
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  apiVersion:     'v2',
});

export default defineEventHandler(async (event) => {
  const { phone, orderNumber } = await readBody(event);

  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNumber }],
  });

  return { success: true };
});
```

---

## Vue 3 컴포저블 사용

```vue
<!-- components/OrderButton.vue -->
<script setup>
import { useAlimtalk } from '@sendgo/vue';

const { send, loading, error } = useAlimtalk(
  (params) => $fetch('/api/notify', { method: 'POST', body: params })
);

const handleNotify = () =>
  send({ templateCode: 'ORDER_001', contacts: [{ contact: '01012345678', var1: 'ORD-001' }] });
</script>

<template>
  <button @click="handleNotify" :disabled="loading">
    {{ loading ? '발송 중...' : '주문 확인 알림 전송' }}
  </button>
  <p v-if="error" class="error">발송 실패: {{ error.message }}</p>
</template>
```

---

## Nuxt 플러그인으로 전역 등록

```typescript
// plugins/sendgo.server.ts
import { SendgoPlugin } from '@sendgo/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(SendgoPlugin, {
    accessKey: process.env.SENDGO_ACCESS_KEY!,
    secretKey: process.env.SENDGO_SECRET_KEY!,
    kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
    apiVersion: 'v2',
  });
});
```

---

## SMS 전송 (Server Route)

```typescript
// server/api/sms.post.ts
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({ accessKey: '...', secretKey: '...' });

export default defineEventHandler(async (event) => {
  const { phone, content } = await readBody(event);
  return sendgo.sms.sendSms({ content, contacts: [{ contact: phone }] });
});
```

---

## 라이선스

MIT License © [Sendgo](https://sendgo.io)
