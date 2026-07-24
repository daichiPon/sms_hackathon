/* ------------------------------------------------------------------ *
 *  API エラーレスポンスの解釈
 *  CPaaS NOW SMS送信API の仕様に合わせた { code, message, details } 形式。
 * ------------------------------------------------------------------ */

/** SMS配信登録のエラーコード（HTTP ステータス別） */
export type ApiErrorCode =
  | 'InvalidParameter' // 400
  | 'AuthenticationFailure' // 401
  | 'InactiveChannel' // 403
  | 'RateLimitExceeded' // 429
  | 'SystemFailure' // 500
  | 'ServiceUnavailable' // 503
  // 配信結果のエラーコード
  | 'DeviceUnreachable'
  | 'NotReceivableSMSNumber';

export interface ApiErrorDetail {
  parameter: string;
  message: string;
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: ApiErrorDetail[];
}

/** 202 Accepted のレスポンス */
export interface DeliveryAcceptedBody {
  delivery_order_id: number;
  accepted_at: string;
}

/** 仕様書に記載されたエラーメッセージ */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  InvalidParameter: 'パラメータに誤りがあります',
  AuthenticationFailure: '認証に失敗しました',
  InactiveChannel: '有効でないチャネルです',
  RateLimitExceeded: 'リクエスト制限を超過しました',
  SystemFailure: 'システムエラーが発生しました',
  ServiceUnavailable: '現在メンテナンス中のため、しばらくの間ご利用いただけません',
  DeviceUnreachable: '端末が圏外か電源offの可能性があるため配信に失敗しました',
  NotReceivableSMSNumber: 'SMSが受信できない番号の可能性があるため配信に失敗しました',
};

/** code が未設定・未知の場合に HTTP ステータスから引くコード */
const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  400: 'InvalidParameter',
  401: 'AuthenticationFailure',
  403: 'InactiveChannel',
  429: 'RateLimitExceeded',
  500: 'SystemFailure',
  503: 'ServiceUnavailable',
};

const isApiErrorCode = (value: unknown): value is ApiErrorCode =>
  typeof value === 'string' && value in API_ERROR_MESSAGES;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: ApiErrorCode;
  /** サーバーが返した生の code（未知の値も保持する） */
  readonly rawCode?: string;
  readonly details: ApiErrorDetail[];

  constructor(params: {
    status: number;
    message: string;
    code?: ApiErrorCode;
    rawCode?: string;
    details?: ApiErrorDetail[];
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.rawCode = params.rawCode;
    this.details = params.details ?? [];
  }

  /** details を含めた表示用メッセージ */
  get displayMessage(): string {
    if (this.details.length === 0) return this.message;
    const detail = this.details
      .map(d => (d.parameter ? `${d.parameter}: ${d.message}` : d.message))
      .join(' / ');
    return `${this.message}（${detail}）`;
  }
}

const toDetails = (value: unknown): ApiErrorDetail[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((d): d is Record<string, unknown> => typeof d === 'object' && d !== null)
    .map(d => ({
      parameter: typeof d.parameter === 'string' ? d.parameter : '',
      message: typeof d.message === 'string' ? d.message : '',
    }))
    .filter(d => d.parameter || d.message);
};

/**
 * エラーレスポンスを ApiError に変換する。
 * code が既知なら仕様書のメッセージを優先し、未知ならサーバーの message を使う。
 */
export async function toApiError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // JSON でないレスポンスはステータスのみで判定する
  }

  const code = isApiErrorCode(body.code) ? body.code : STATUS_TO_CODE[res.status];
  const message =
    (code && API_ERROR_MESSAGES[code]) ||
    body.message ||
    `エラーが発生しました（HTTP ${res.status}）`;

  return new ApiError({
    status: res.status,
    message,
    code,
    rawCode: typeof body.code === 'string' ? body.code : undefined,
    details: toDetails(body.details),
  });
}

/** 通信自体に失敗した場合のエラー */
export const networkError = () =>
  new ApiError({ status: 0, message: 'ネットワークエラーが発生しました' });
