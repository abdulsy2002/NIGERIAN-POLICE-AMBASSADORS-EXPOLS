import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export const STATE_BASES: Record<string, string> = {
  Abia: 'ABA',
  Adamawa: 'ADM',
  'Akwa Ibom': 'AKI',
  Anambra: 'ANB',
  Bauchi: 'BCH',
  Bayelsa: 'BYL',
  Benue: 'BNU',
  Borno: 'BRN',
  'Cross River': 'CRS',
  Delta: 'DLT',
  Ebonyi: 'EBN',
  Edo: 'EDO',
  Ekiti: 'EKT',
  Enugu: 'ENG',
  'FCT - Abuja': 'ABJ',
  Gombe: 'GMB',
  Imo: 'IMO',
  Jigawa: 'JGW',
  Kaduna: 'KDN',
  Kano: 'KNC',
  Katsina: 'KTS',
  Kebbi: 'KBB',
  Kogi: 'KGI',
  Kwara: 'KWR',
  Lagos: 'LOS',
  Nasarawa: 'NSR',
  Niger: 'NGR',
  Ogun: 'OGN',
  Ondo: 'OND',
  Osun: 'OSN',
  Oyo: 'OYO',
  Plateau: 'PLT',
  Rivers: 'RVR',
  Sokoto: 'SKT',
  Taraba: 'TRB',
  Yobe: 'YOB',
  Zamfara: 'ZMF',
  Diaspora: 'DIA',
};

export function isStateBaseCode(code?: string | null): boolean {
  return Boolean(code && Object.values(STATE_BASES).includes(code));
}

export function getChapterScope(
  actor: { role: string; stateBaseCode?: string | null },
  requestedCode?: string,
): string {
  if (actor.role === 'STATE_ADMIN') {
    const assignedCode = actor.stateBaseCode;
    if (!assignedCode || !isStateBaseCode(assignedCode) || assignedCode === 'NAT') {
      throw new ForbiddenException('State administrator account has no valid state base');
    }
    if (requestedCode && requestedCode.trim().toUpperCase() !== assignedCode) {
      throw new ForbiddenException('You can only manage your assigned state base');
    }
    return assignedCode;
  }
  if (!requestedCode) return 'NAT';
  const code = requestedCode.trim().toUpperCase();
  if (code !== 'NAT' && !isStateBaseCode(code)) throw new BadRequestException('Select a valid state base');
  return code;
}

export function getChapterReadScope(
  actor: { role: string; stateBaseCode?: string | null },
  requestedCode?: string,
): string | undefined {
  if (actor.role === 'STATE_ADMIN') return getChapterScope(actor, requestedCode);
  if (!requestedCode || requestedCode.trim().toUpperCase() === 'ALL') return undefined;
  return getChapterScope(actor, requestedCode);
}

export async function resolvePublicChapter(
  prisma: PrismaService,
  userId: string | undefined,
  requestedCode?: string,
): Promise<string> {
  const requested = requestedCode?.trim().toUpperCase();
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { stateBaseCode: true } });
    if (user?.stateBaseCode) {
      return getChapterScope({ role: 'NATIONAL_ADMIN' }, user.stateBaseCode);
    }
  }
  return getChapterScope({ role: 'NATIONAL_ADMIN' }, requested || 'NAT');
}

export function resolveStateBase(input?: { stateBase?: string; stateBaseCode?: string; stateBaseName?: string }) {
  const entries = Object.entries(STATE_BASES);
  const stateName = input?.stateBaseName?.replace(/\s+Base$/i, '').trim() || input?.stateBase?.trim();
  const stateCode = input?.stateBaseCode?.trim().toUpperCase();
  const byName = stateName
    ? entries.find(([name]) => name.toLowerCase() === stateName.toLowerCase())
    : undefined;
  const byCode = stateCode
    ? entries.find(([, code]) => code === stateCode)
    : undefined;

  if ((stateName && !byName) || (stateCode && !byCode)) {
    throw new BadRequestException('Select a valid state base');
  }
  if (byName && byCode && byName[1] !== byCode[1]) {
    throw new BadRequestException('State base name and code do not match');
  }

  const resolved = byName || byCode;
  return resolved
    ? { stateBaseCode: resolved[1], stateBaseName: `${resolved[0]} Base` }
    : { stateBaseCode: 'NAT', stateBaseName: 'National Base' };
}
