import { colors } from '../colors';

describe('colors (Design System Tokens)', () => {
  it('deve possuir a paleta azul do perfil administrador', () => {
    expect(colors.profile).toBe('admin');
    expect(colors.profileName).toBe('Admin');
    expect(colors.primary).toBe('#1565C0');
    expect(colors.primaryDark).toBe('#0D47A1');
    expect(colors.secondary).toBe('#64B5F6');
    expect(colors.primarySoft).toBe('#E3F2FD');
    expect(colors.primaryMuted).toBe('#BBDEFB');
    expect(colors.background).toBe('#F3F7FC');
    expect(colors.card).toBe('#FFFFFF');
    expect(colors.white).toBe('#FFFFFF');
    expect(colors.text).toBe('#263238');
    expect(colors.muted).toBe('#78909C');
    expect(colors.danger).toBe('#D32F2F');
    expect(colors.warning).toBe('#E65100');
    expect(colors.success).toBe('#388E3C');
  });
});
