import { colors } from '../colors';

describe('colors (Design System Tokens)', () => {
  it('deve possuir a paleta ecológica base do EcoSmart', () => {
    expect(colors.profile).toBe('cidadao');
    expect(colors.profileName).toBe('Cidadão');
    expect(colors.primary).toBe('#2E7D32');
    expect(colors.primaryDark).toBe('#1B5E20');
    expect(colors.secondary).toBe('#66BB6A');
    expect(colors.primarySoft).toBe('#E8F5E9');
    expect(colors.primaryMuted).toBe('#A5D6A7');
    expect(colors.background).toBe('#F4F8F5');
    expect(colors.card).toBe('#FFFFFF');
    expect(colors.white).toBe('#FFFFFF');
    expect(colors.text).toBe('#263238');
    expect(colors.muted).toBe('#78909C');
    expect(colors.danger).toBe('#D32F2F');
    expect(colors.warning).toBe('#E65100');
    expect(colors.success).toBe('#388E3C');
    expect(colors.info).toBe('#0288D1');
  });
});
