import type { App } from 'vue';
import Sendgo from '@sendgo/node';
import type { SendgoConfig } from '@sendgo/node';

export const SENDGO_KEY = Symbol('sendgo');

/**
 * Sendgo Vue 플러그인.
 * 서버사이드(Nuxt SSR / Node.js)에서 사용합니다.
 *
 * @example
 * // nuxt.config.ts는 serverOnly 플러그인으로 등록하세요.
 * // plugins/sendgo.server.ts
 * import { SendgoPlugin } from '@sendgo/vue';
 * export default defineNuxtPlugin((app) => {
 *   app.vueApp.use(SendgoPlugin, {
 *     accessKey: process.env.SENDGO_ACCESS_KEY!,
 *     secretKey: process.env.SENDGO_SECRET_KEY!,
 *     kakaoSenderKey: process.env.SENDGO_KAKAO_KEY,
 *     apiVersion: 'v2',
 *   });
 * });
 */
export const SendgoPlugin = {
  install(app: App, config: SendgoConfig) {
    const client = new Sendgo(config);
    app.provide(SENDGO_KEY, client);
  },
};

export { Sendgo };
export type { SendgoConfig };
