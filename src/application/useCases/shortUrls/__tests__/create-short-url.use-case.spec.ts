import { CreateShortUrlUseCase } from "../create-short-url.use-case";
import { ShortUrlRepositoryInterface } from "../../../../domain/repositories/short-url.repository.interface";
import { ShortCodeGeneratorInterface } from "../../../../domain/generators/short-code-generator.interface";

function makeRepositoryMock(): jest.Mocked<ShortUrlRepositoryInterface> {
  return {
    create: jest.fn().mockResolvedValue(undefined),
    getOriginalUrlByShortCode: jest.fn(),
    incrementClicks: jest.fn(),
  };
}

function makeShortCodeGeneratorMock(): jest.Mocked<ShortCodeGeneratorInterface> {
  return {
    generate: jest.fn().mockReturnValue("generated-code"),
  };
}

describe("CreateShortUrlUseCase", () => {
  let repository: jest.Mocked<ShortUrlRepositoryInterface>;
  let shortCodeGenerator: jest.Mocked<ShortCodeGeneratorInterface>;
  let useCase: CreateShortUrlUseCase;

  beforeEach(() => {
    repository = makeRepositoryMock();
    shortCodeGenerator = makeShortCodeGeneratorMock();
    useCase = new CreateShortUrlUseCase(repository, shortCodeGenerator);
  });

  it("should generate shortCode and call repository.create with entity", async () => {
    const originalUrl = "https://example.com/page";

    const result = await useCase.execute(originalUrl);

    expect(shortCodeGenerator.generate).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result).toBe("generated-code");

    const createdEntity = repository.create.mock.calls[0]![0];
    expect(createdEntity.originalUrl).toBe(originalUrl);
    expect(createdEntity.shortCode).toBe("generated-code");
    expect(createdEntity.clicks).toBe(0);
    expect(createdEntity.createdAt).toBeInstanceOf(Date);
  });

  it("should return the generated shortCode", async () => {
    shortCodeGenerator.generate.mockReturnValue("abc123xy");

    const result = await useCase.execute("https://foo.com");

    expect(result).toBe("abc123xy");
  });

  it("should rethrow error when repository.create throws", async () => {
    const error = new Error("Database error");
    repository.create.mockRejectedValue(error);

    await expect(useCase.execute("https://example.com")).rejects.toThrow(
      "Database error",
    );
  });
});
