import { colors } from '../colors';

describe('colors (Design System Tokens)', () => {
  it('deve possuir a paleta ecológica oficial do EcoSmart', () => {
    expect(colors.primary).toBe('#2E7D32');
    expect(colors.secondary).toBe('#66BB6A');
    expect(colors.background).toBe('#F5F5F5');
    expect(colors.card).toBe('#FFFFFF');
    expect(colors.white).toBe('#FFFFFF');
    expect(colors.text).toBe('#263238');
    expect(colors.muted).toBe('#78909C');
    expect(colors.danger).toBe('#D32F2F');
    expect(colors.warning).toBe('#FFA000');
    expect(colors.success).toBe('#388E3C');
  });
});
