import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SendSmsParams = {
  to: string;
  text: string;
};

export type SendSmsResult = {
  status?: string;
  errorCode?: string;
  message?: string;
  userReference: string;
  mocked: boolean;
  raw: unknown;
};

@Injectable()
export class SmsService {
  constructor(private readonly config: ConfigService) {}

  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    const baseUrl = this.config.get<string>('SMS_API_BASE_URL');
    const token = this.config.get<string>('SMS_API_TOKEN');
    const userReference = this.config.get<string>('SMS_USER_REFERENCE') ?? 'teamip3-demo';

    if (!baseUrl || !token || token === 'replace_me') {
      const raw = {
        to: params.to,
        text: params.text,
        user_reference: userReference,
        status: 'delivered',
      };
      console.log('[sms:mock]', raw);
      return {
        status: 'delivered',
        userReference,
        mocked: true,
        raw,
      };
    }

    const response = await fetch(`${baseUrl}/api/v1/short_messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to,
        text: params.text,
        user_reference: userReference,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new InternalServerErrorException(`SMS API failed: ${response.status} ${body}`);
    }

    const raw = await response.json();
    return this.normalizeResponse(raw, userReference);
  }

  private normalizeResponse(raw: unknown, userReference: string): SendSmsResult {
    if (!this.isRecord(raw)) {
      return {
        userReference,
        mocked: false,
        raw,
      };
    }

    return {
      status: this.getString(raw, 'status'),
      errorCode: this.getString(raw, 'code') ?? this.getString(raw, 'errorCode'),
      message: this.getString(raw, 'message'),
      userReference,
      mocked: false,
      raw,
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getString(record: Record<string, unknown>, key: string) {
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
  }
}
