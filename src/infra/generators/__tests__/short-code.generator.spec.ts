import { randomBytes } from "node:crypto";
import { ShortCodeGenerator } from "../short-code.generator";

jest.mock("node:crypto", () => ({
  randomBytes: jest.fn(),
}));

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const mockRandomBytes = randomBytes as jest.Mock<Buffer, [size: number]>;

describe("ShortCodeGenerator", () => {
  beforeEach(() => {
    mockRandomBytes.mockClear();
  });

  describe("generate", () => {
    it("should return string with default length 8", () => {
      mockRandomBytes.mockReturnValue(Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]));
      const generator = new ShortCodeGenerator();

      const result = generator.generate();

      expect(result).toHaveLength(8);
      expect(mockRandomBytes).toHaveBeenCalledWith(8);
    });

    it("should return string with custom length from constructor", () => {
      mockRandomBytes.mockReturnValue(Buffer.from([0, 0, 0, 0, 0, 0]));
      const generator = new ShortCodeGenerator(6);

      const result = generator.generate();

      expect(result).toHaveLength(6);
      expect(randomBytes).toHaveBeenCalledWith(6);
    });

    it("should use only characters from alphabet", () => {
      mockRandomBytes.mockReturnValue(
        Buffer.from([0, 1, 10, 26, 35, 61, 0, 0]),
      );
      const generator = new ShortCodeGenerator(8);

      const result = generator.generate();

      expect(result).toHaveLength(8);
      for (const char of result) {
        expect(ALPHABET).toContain(char);
      }
    });

    it("should map bytes to alphabet indices correctly", () => {
      mockRandomBytes.mockReturnValue(
        Buffer.from([0, 62, 61, 1, 0, 0, 0, 0]),
      );
      const generator = new ShortCodeGenerator(8);

      const result = generator.generate();

      expect(result[0]).toBe("a");
      expect(result[1]).toBe("a");
      expect(result[2]).toBe("9");
      expect(result[3]).toBe("b");
    });

    it("should return different values when randomBytes returns different values", () => {
      mockRandomBytes
        .mockReturnValueOnce(Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]))
        .mockReturnValueOnce(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));
      const generator = new ShortCodeGenerator(8);

      const first = generator.generate();
      const second = generator.generate();

      expect(first).not.toBe(second);
    });
  });
});
