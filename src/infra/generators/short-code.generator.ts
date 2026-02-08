import { randomBytes } from "node:crypto";
import { ShortCodeGeneratorInterface } from "../../domain/generators/short-code-generator.interface";

export class ShortCodeGenerator implements ShortCodeGeneratorInterface {
  private readonly ALPHABET =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  constructor(private readonly length: number = 8) {}

  generate(): string {
    const bytes = randomBytes(this.length);
    let result = "";
    for (let i = 0; i < this.length; i++) {
      result += this.ALPHABET[bytes[i]! % this.ALPHABET.length];
    }
    return result;
  }
}
