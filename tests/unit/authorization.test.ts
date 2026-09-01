import { describe, it, expect } from 'vitest';

describe('Authorization Logic', () => {
  describe('Admin ID checking', () => {
    const adminIds = [123456789n, 987654321n];

    it('should correctly identify admin users', () => {
      const adminId = 123456789n;
      expect(adminIds.includes(adminId)).toBe(true);
    });

    it('should correctly reject non-admin users', () => {
      const nonAdminId = 999999999n;
      expect(adminIds.includes(nonAdminId)).toBe(false);
    });

    it('should handle BigInt comparison correctly', () => {
      const adminId = BigInt('123456789');
      expect(adminIds.includes(adminId)).toBe(true);
    });

    it('should not allow string comparison', () => {
      const adminId = '123456789';
      expect(adminIds.includes(adminId as any)).toBe(false);
    });
  });

  describe('Telegram ID parsing', () => {
    it('should parse valid numeric strings to BigInt', () => {
      const validStrings = ['123456789', '987654321', '1'];
      validStrings.forEach((str) => {
        const parsed = BigInt(str);
        expect(typeof parsed).toBe('bigint');
      });
    });

    it('should throw on invalid numeric strings', () => {
      const invalidStrings = ['abc', '123abc', ''];
      invalidStrings.forEach((str) => {
        expect(() => BigInt(str)).toThrow();
      });
    });

    it('should handle large numbers correctly', () => {
      const largeNumber = '999999999999999999';
      const parsed = BigInt(largeNumber);
      expect(parsed).toBe(BigInt(largeNumber));
    });
  });
});
