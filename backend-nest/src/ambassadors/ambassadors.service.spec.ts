import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { AmbassadorsService } from './ambassadors.service';

describe('AmbassadorsService registration email', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  const mail = { sendRegistrationReceivedEmail: jest.fn() } as unknown as MailService;
  let service: AmbassadorsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AmbassadorsService(prisma, mail);
  });

  it('sends a registration confirmation when it creates a new ambassador account', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({});
    (mail.sendRegistrationReceivedEmail as jest.Mock).mockResolvedValue(true);

    await expect(service.register({
      email: 'new-ambassador@example.com',
      fullName: 'New Ambassador',
      stateBaseCode: 'KNC',
      stateBaseName: 'Kano Base',
    })).resolves.toMatchObject({ success: true, emailSent: true });

    expect(mail.sendRegistrationReceivedEmail).toHaveBeenCalledWith({
      to: 'new-ambassador@example.com',
      fullName: 'New Ambassador',
      memberType: 'ambassador',
    });
  });
});
