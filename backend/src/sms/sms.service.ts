import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SendSmsParams = {
  to: string;
  text: string;
};

@Injectable()
export class SmsService {
  constructor(private readonly config: ConfigService) {}

  async sendSms(params: SendSmsParams) {
    const baseUrl = this.config.get<string>('SMS_API_BASE_URL');
    const token = this.config.get<string>('SMS_API_TOKEN');
    const userReference = this.config.get<string>('SMS_USER_REFERENCE') ?? 'teamip3-demo';

    if (!baseUrl || !token || token === 'replace_me') {
      console.log('[sms:mock]', {
        to: params.to,
        text: params.text,
        user_reference: userReference,
      });
      return { mocked: true };
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

    return response.json();
  }
}
