import { colors } from '../colors';

describe('colors (Design System Tokens)', () => {
  it('deve possuir a paleta laranja do perfil coletor', () => {
    expect(colors.profile).toBe('coletor');
    expect(colors.profileName).toBe('Coletor');
    expect(colors.primary).toBe('#E65100');
    expect(colors.primaryDark).toBe('#BF360C');
    expect(colors.secondary).toBe('#FFB74D');
    expect(colors.primarySoft).toBe('#FFF3E0');
    expect(colors.primaryMuted).toBe('#FFE0B2');
    expect(colors.background).toBe('#FFF8F1');
    expect(colors.card).toBe('#FFFFFF');
    expect(colors.white).toBe('#FFFFFF');
    expect(colors.text).toBe('#263238');
    expect(colors.muted).toBe('#78909C');
    expect(colors.danger).toBe('#D32F2F');
    expect(colors.warning).toBe('#E65100');
    expect(colors.success).toBe('#388E3C');
  });
});
