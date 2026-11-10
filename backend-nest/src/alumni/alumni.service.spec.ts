import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { AlumniService } from './alumni.service';

describe('AlumniService registration email', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  const mail = { sendRegistrationReceivedEmail: jest.fn() } as unknown as MailService;
  let service: AlumniService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AlumniService(prisma, mail);
  });

  it('sends a registration confirmation when it creates a new alumni account', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({});
    (mail.sendRegistrationReceivedEmail as jest.Mock).mockResolvedValue(true);

    await expect(service.register({
      email: 'new-member@example.com',
      fullName: 'New Member',
      stateBaseCode: 'KNC',
      stateBaseName: 'Kano Base',
    })).resolves.toMatchObject({ success: true, emailSent: true });

    expect(mail.sendRegistrationReceivedEmail).toHaveBeenCalledWith({
      to: 'new-member@example.com',
      fullName: 'New Member',
      memberType: 'alumni',
    });
  });
});
