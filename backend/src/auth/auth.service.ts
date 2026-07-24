import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { PrismaService } from '../prisma/prisma.service'
import { SmsService } from '../sms/sms.service'
import { LoginDto } from './dto/login.dto'
import { VerifySmsDto } from './dto/verify-sms.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.findOrCreateDemoUser()

    if (
      loginDto.id !== user.loginId ||
      loginDto.password !== user.passwordHash
    ) {
      throw new UnauthorizedException('Invalid id or password')
    }

    const code = this.generateSmsCode()
    const codeHash = this.hashSmsCode(user.id, code)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await this.prisma.smsCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    })

    const smsResult = await this.smsService.sendSms({
      to: user.phoneNumber,
      text: `ワンタイムパスワードは ${code} です。`,
    })

    await this.prisma.smsLog.create({
      data: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        status: smsResult.status,
        errorCode: smsResult.errorCode,
        message: smsResult.message,
        userReference: smsResult.userReference,
      },
    })

    return {
      message: 'SMS code sent',
      expiresAt,
    }
  }

  async verifySms(verifySmsDto: VerifySmsDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        loginId: verifySmsDto.id,
      },
    })

    if (!user) {
      throw new BadRequestException('SMS code not found')
    }

    const record = await this.prisma.smsCode.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!record) {
      throw new BadRequestException('SMS code not found')
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('SMS code expired')
    }

    if (!this.isSmsCodeValid(user.id, verifySmsDto.code, record.codeHash)) {
      throw new UnauthorizedException('Invalid SMS code')
    }

    await this.prisma.smsCode.update({
      where: {
        id: record.id,
      },
      data: {
        usedAt: new Date(),
      },
    })

    return {
      message: 'Login verified',
      userId: user.loginId,
    }
  }

  private generateSmsCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0')
  }

  private hashSmsCode(userId: number, code: string): string {
    const secret = this.config.get<string>('OTP_HMAC_SECRET')

    if (!secret) {
      throw new Error('OTP_HMAC_SECRET must be configured')
    }

    return createHmac('sha256', secret)
      .update(`${userId}:${code}`)
      .digest('hex')
  }

  private isSmsCodeValid(
    userId: number,
    code: string,
    storedHash: string,
  ): boolean {
    const candidateHash = this.hashSmsCode(userId, code)
    const candidate = Buffer.from(candidateHash, 'hex')
    const stored = Buffer.from(storedHash, 'hex')

    return (
      candidate.length === stored.length && timingSafeEqual(candidate, stored)
    )
  }

  private async findOrCreateDemoUser() {
    const loginId = this.config.get<string>('DEMO_USER_ID') ?? 'demo'
    const password = this.config.get<string>('DEMO_USER_PASSWORD') ?? 'password'
    const phoneNumber =
      this.config.get<string>('DEMO_PHONE_NUMBER') ?? '09001111101'

    return this.prisma.user.upsert({
      where: {
        loginId,
      },
      update: {
        passwordHash: password,
        phoneNumber,
      },
      create: {
        loginId,
        passwordHash: password,
        phoneNumber,
      },
    })
  }
}
