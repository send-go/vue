import { ref } from 'vue';
import type { Ref } from 'vue';
import type { BrandMessageParams, SendgoResponse } from '@sendgo/node';
import { SendgoError } from '@sendgo/node';

export interface UseBrandMessageReturn {
  send: (params: BrandMessageParams) => Promise<SendgoResponse | null>;
  loading: Ref<boolean>;
  error: Ref<SendgoError | Error | null>;
  data: Ref<SendgoResponse | null>;
  reset: () => void;
}

/**
 * 브랜드메시지 전송 컴포저블 (클라이언트 컴포넌트용).
 * Nuxt Server Routes 또는 API 엔드포인트를 통해 호출합니다.
 *
 * 브랜드메시지는 친구톡의 후속 채널입니다. 친구톡은 2025-12-31 종료되었고,
 * 2026-01-01 부터 친구톡 발송 요청은 카카오 측에서 브랜드메시지(자유형)로
 * 자동 대체 발송됩니다. v2 전용입니다.
 *
 * @param apiFn 실제 전송 함수 (Nuxt $fetch 또는 API 호출)
 *
 * @example
 * // server/api/brand-message.post.ts (Nuxt)
 * import { useSendgo } from '@sendgo/vue/server';
 * export default defineEventHandler(async (event) => {
 *   const body = await readBody(event);
 *   return useSendgo().brandMessage.send(body);
 * });
 *
 * // components/PromoButton.vue
 * <script setup>
 * import { useBrandMessage } from '@sendgo/vue';
 * const { send, loading } = useBrandMessage((p) => $fetch('/api/brand-message', { method: 'POST', body: p }));
 * </script>
 */
export function useBrandMessage(
  apiFn: (params: BrandMessageParams) => Promise<SendgoResponse>,
): UseBrandMessageReturn {
  const loading = ref(false);
  const error   = ref<SendgoError | Error | null>(null);
  const data    = ref<SendgoResponse | null>(null);

  const send = async (params: BrandMessageParams): Promise<SendgoResponse | null> => {
    loading.value = true;
    error.value   = null;
    try {
      const result  = await apiFn(params);
      data.value    = result;
      return result;
    } catch (e) {
      error.value   = e instanceof Error ? e : new Error(String(e));
      return null;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => { error.value = null; data.value = null; };
  return { send, loading, error, data, reset };
}
