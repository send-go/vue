export { SendgoPlugin, SENDGO_KEY, Sendgo } from './plugin';
export { useAlimtalk } from './composables/useAlimtalk';
export { useBrandMessage } from './composables/useBrandMessage';
export type { UseAlimtalkReturn } from './composables/useAlimtalk';
export type { UseBrandMessageReturn } from './composables/useBrandMessage';

export type {
  ShortUrlParams,
  ShortUrlListParams,
  ShortUrlStatsParams,
  AlimtalkParams,
  BrandMessageParams,
  BrandMessageListParams,
  BrandMessageTargeting,
  FriendtalkParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
  Contact,
  // 관리 API (v2 전용) — 등록 · 심사.
  // 플러그인이 제공하는 클라이언트(`inject(SENDGO_KEY)`)에 그대로 붙어 있다:
  // `kakaoSenders` · `noticeTemplates` · `brandTemplates` ·
  // `senderRegistration` · `messageTemplates`.
  MultipartFile,
  KakaoSenderCreateParams,
  BrandMessageTargetType,
  NoticeTemplateParams,
  NoticeTemplateListParams,
  NoticeTemplateInspectionStatus,
  BrandTemplateParams,
  BrandTemplateListParams,
  SenderNumberType,
  ApiRegistrableSenderNumberType,
  SenderRegistrationParams,
  SenderRegistrationFiles,
  MessageTemplateParams,
  MessageTemplateListParams,
  WebhookEvent,
  WebhookSubscriptionParams,
  KakaoImageSingleType,
  KakaoImageMultiType,
  RejectedNumberListParams,
} from '@sendgo/node';
export { SendgoError, WebhookService, WEBHOOK_EVENTS } from '@sendgo/node';

// 계정 API는 서버 코드에서만 사용합니다.
export { AccountClient } from '@sendgo/node';
export type { AccountConfig, AccountResponse, ApiKeyCreateParams, AllowedIpParams } from '@sendgo/node';

export { TemplateFolderService } from '@sendgo/node';
export type { TemplateFolderType, TemplateFolderListParams, TemplateFolderCreateParams, TemplateFolderAssignParams } from '@sendgo/node';

// 이메일 인증정보는 서버에서만 사용합니다.
export { EmailService } from '@sendgo/node';
export type { EmailSendParams, EmailResponse, EmailQuery } from '@sendgo/node';
