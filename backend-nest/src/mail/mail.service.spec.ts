import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MailService } from './mail.service';

describe('MailService', () => {
  const configValues: Record<string, string> = {
    RESEND_API_KEY: 'test-resend-key',
    RESEND_FROM_EMAIL: 'NPAE <noreply@example.com>',
    APP_URL: 'https://example.com',
  };
  let service: MailService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = {
      get: (name: string) => configValues[name],
    } as unknown as ConfigService;
    service = new MailService(config);
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('sends registration confirmation through Resend with escaped member data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'email-123' }),
    });

    await expect(service.sendRegistrationReceivedEmail({
      to: 'member@example.com',
      fullName: '<Member & One>',
      memberType: 'alumni',
    })).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-resend-key',
        'Content-Type': 'application/json',
      },
      signal: expect.any(AbortSignal),
      body: expect.stringContaining('&lt;Member &amp; One&gt;'),
    }));
    expect(fetchMock.mock.calls[0][1].body).toContain('We received your NPAE registration');
  });

  it('reports Resend rejection instead of silently claiming delivery', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Sender domain is not verified' }),
    });
    const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await expect(service.sendRegistrationReceivedEmail({
      to: 'member@example.com',
      fullName: 'Member',
      memberType: 'ambassador',
    })).resolves.toBe(false);
    expect(loggerError).toHaveBeenCalledWith(expect.stringContaining('HTTP 403'));
    loggerError.mockRestore();
  });

  it('does not make a provider request when the sender is not configured', async () => {
    const config = {
      get: (name: string) => name === 'RESEND_API_KEY' ? 'test-resend-key' : undefined,
    } as unknown as ConfigService;
    const noSenderService = new MailService(config);
    const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await expect(noSenderService.sendRegistrationReceivedEmail({
      to: 'member@example.com',
      fullName: 'Member',
      memberType: 'alumni',
    })).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    loggerError.mockRestore();
  });
});
