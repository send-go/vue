import { ref } from 'vue';
import type { Ref } from 'vue';
import type { AlimtalkParams, SendgoResponse } from '@sendgo/node';
import { SendgoError } from '@sendgo/node';

export interface UseAlimtalkReturn {
  send: (params: AlimtalkParams) => Promise<SendgoResponse | null>;
  loading: Ref<boolean>;
  error: Ref<SendgoError | Error | null>;
  data: Ref<SendgoResponse | null>;
  reset: () => void;
}

/**
 * 알림톡 전송 컴포저블 (클라이언트 컴포넌트용).
 * Nuxt Server Routes 또는 API 엔드포인트를 통해 호출합니다.
 *
 * @param apiFn 실제 전송 함수 (Nuxt $fetch 또는 API 호출)
 *
 * @example
 * // server/api/alimtalk.post.ts (Nuxt)
 * import { useSendgo } from '@sendgo/vue/server';
 * export default defineEventHandler(async (event) => {
 *   const body = await readBody(event);
 *   return useSendgo().alimtalk.send(body);
 * });
 *
 * // components/OrderButton.vue
 * <script setup>
 * import { useAlimtalk } from '@sendgo/vue';
 * const { send, loading } = useAlimtalk((p) => $fetch('/api/alimtalk', { method: 'POST', body: p }));
 * </script>
 */
export function useAlimtalk(
  apiFn: (params: AlimtalkParams) => Promise<SendgoResponse>,
): UseAlimtalkReturn {
  const loading = ref(false);
  const error   = ref<SendgoError | Error | null>(null);
  const data    = ref<SendgoResponse | null>(null);

  const send = async (params: AlimtalkParams): Promise<SendgoResponse | null> => {
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
