import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../sms/sms.service';
import { LoginDto } from './dto/login.dto';
import { VerifySmsDto } from './dto/verify-sms.dto';

type SmsCodeRecord = {
  code: string;
  expiresAt: Date;
  usedAt?: Date;
};

@Injectable()
export class AuthService {
  private readonly smsCodes = new Map<string, SmsCodeRecord>();

  constructor(
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = this.getDemoUser();

    if (loginDto.id !== user.id || loginDto.password !== user.password) {
      throw new UnauthorizedException('Invalid id or password');
    }

    const code = this.generateSmsCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.smsCodes.set(user.id, { code, expiresAt });

    await this.smsService.sendSms({
      to: user.phoneNumber,
      text: `ワンタイムパスワードは ${code} です。`,
    });

    return {
      message: 'SMS code sent',
      expiresAt,
    };
  }

  verifySms(verifySmsDto: VerifySmsDto) {
    const record = this.smsCodes.get(verifySmsDto.id);

    if (!record || record.usedAt) {
      throw new BadRequestException('SMS code not found');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('SMS code expired');
    }

    if (record.code !== verifySmsDto.code) {
      throw new UnauthorizedException('Invalid SMS code');
    }

    record.usedAt = new Date();

    return {
      message: 'Login verified',
      userId: verifySmsDto.id,
    };
  }

  private generateSmsCode() {
    return this.config.get<string>('DEMO_SMS_CODE') ?? '1234';
  }

  private getDemoUser() {
    return {
      id: this.config.get<string>('DEMO_USER_ID') ?? 'demo',
      password: this.config.get<string>('DEMO_USER_PASSWORD') ?? 'password',
      phoneNumber: this.config.get<string>('DEMO_PHONE_NUMBER') ?? '09001111101',
    };
  }
}
