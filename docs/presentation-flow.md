# SMS Login Flow

Use this Mermaid diagram in slides, GitHub, Notion, or any Mermaid renderer.
For a drag-and-drop slide asset, use [`sms-login-flow.svg`](./sms-login-flow.svg).

```mermaid
flowchart LR
  start([User opens app]) --> login[Enter ID and password]
  login --> postLogin[POST /auth/login]

  subgraph Frontend[React frontend]
    login
    postLogin
    verifyScreen[Show SMS verification screen]
    enterCode[User enters 4 digit code]
    postVerify[POST /auth/verify-sms]
    success[Show login success screen]
    retry[Show error and allow retry]
    resend[Resend code]
  end

  subgraph Backend[NestJS backend]
    validateCreds{Valid demo credentials?}
    createCode[Create one-time SMS code]
    sendSms[Send SMS message]
    writeLog[Save SMS delivery log]
    findLatestCode[Find latest unused code]
    codeValid{Code exists, unused, and not expired?}
    matchCode{Code matches?}
    markUsed[Mark code as used]
  end

  subgraph Database[Prisma database]
    user[(User)]
    smsCode[(SmsCode)]
    smsLog[(SmsLog)]
  end

  subgraph Provider[SMS provider]
    smsApi[External SMS API or mock sender]
    phone[User phone receives OTP]
  end

  postLogin --> validateCreds
  validateCreds -- No --> loginError[Return invalid ID/password]
  loginError --> retry

  validateCreds -- Yes --> user
  user --> createCode
  createCode --> smsCode
  createCode --> sendSms
  sendSms --> smsApi
  smsApi --> phone
  sendSms --> writeLog
  writeLog --> smsLog
  writeLog --> verifyScreen

  verifyScreen --> enterCode
  enterCode --> postVerify
  postVerify --> findLatestCode
  findLatestCode --> smsCode
  findLatestCode --> codeValid
  codeValid -- No --> verifyError[Return not found or expired]
  verifyError --> retry
  codeValid -- Yes --> matchCode
  matchCode -- No --> invalidCode[Return invalid SMS code]
  invalidCode --> retry
  matchCode -- Yes --> markUsed
  markUsed --> smsCode
  markUsed --> success

  verifyScreen --> resend
  resend --> postLogin
```

## Short Presentation Script

1. The user enters their ID and password in the React frontend.
2. The frontend calls `POST /auth/login` on the NestJS backend.
3. The backend checks the demo credentials, creates a short-lived one-time code, stores it in `SmsCode`, and sends the code by SMS.
4. The SMS send result is saved in `SmsLog` for delivery tracking and debugging.
5. The frontend moves to the verification screen, where the user enters the 4 digit code.
6. The frontend calls `POST /auth/verify-sms`.
7. The backend finds the latest unused code, checks that it has not expired, compares the code, then marks it as used.
8. If verification succeeds, the user reaches the success screen. If anything fails, the UI shows an error and lets the user retry or resend.

## Slide Title Ideas

- Secure Login With SMS Verification
- Two-Step Authentication Flow
- From Password Check to One-Time Code Verification
