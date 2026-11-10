import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { getChapterReadScope, getChapterScope, resolveStateBase } from './state-bases';

describe('resolveStateBase', () => {
  it('resolves a state name to its canonical base code and name', () => {
    expect(resolveStateBase({ stateBase: 'Kano' })).toEqual({
      stateBaseCode: 'KNC',
      stateBaseName: 'Kano Base',
    });

  });

  it('accepts a matching code and name without trusting arbitrary client codes', () => {
    expect(resolveStateBase({ stateBaseName: 'Lagos Base', stateBaseCode: 'LOS' })).toEqual({
      stateBaseCode: 'LOS',
      stateBaseName: 'Lagos Base',
    });
    expect(() => resolveStateBase({ stateBase: 'Kano', stateBaseCode: 'LOS' }))
      .toThrow(BadRequestException);
  });

  it('supports FCT and diaspora bases', () => {
    expect(resolveStateBase({ stateBase: 'FCT - Abuja' }).stateBaseCode).toBe('ABJ');
    expect(resolveStateBase({ stateBase: 'Diaspora' }).stateBaseCode).toBe('DIA');
  });
});

describe('chapter access scope', () => {
  it('forces state administrators to their assigned chapter', () => {
    const actor = { role: 'STATE_ADMIN', stateBaseCode: 'KNC' };
    expect(getChapterScope(actor)).toBe('KNC');
    expect(() => getChapterScope(actor, 'LOS')).toThrow(ForbiddenException);
  });

  it('allows national administrators to select one chapter or all chapters', () => {
    const actor = { role: 'NATIONAL_ADMIN' };
    expect(getChapterScope(actor, 'LOS')).toBe('LOS');
    expect(getChapterReadScope(actor, 'ALL')).toBeUndefined();
    expect(() => getChapterScope({ role: 'STATE_ADMIN', stateBaseCode: 'NAT' })).toThrow(ForbiddenException);
  });
});
