import { GetOriginalUrlByShortCodeUseCase } from "../get-original-url-by-short-code.use-case";
import { ShortUrlRepositoryInterface } from "../../../../domain/repositories/short-url.repository.interface";

function makeRepositoryMock(): jest.Mocked<ShortUrlRepositoryInterface> {
  return {
    create: jest.fn(),
    getOriginalUrlByShortCode: jest.fn(),
    incrementClicks: jest.fn().mockResolvedValue(undefined),
  };
}

describe("GetOriginalUrlByShortCodeUseCase", () => {
  let repository: jest.Mocked<ShortUrlRepositoryInterface>;
  let useCase: GetOriginalUrlByShortCodeUseCase;

  beforeEach(() => {
    repository = makeRepositoryMock();
    useCase = new GetOriginalUrlByShortCodeUseCase(repository);
  });

  it("should return originalUrl and call incrementClicks", async () => {
    const shortCode = "abc123";
    const originalUrl = "https://example.com/long-page";
    repository.getOriginalUrlByShortCode.mockResolvedValue(originalUrl);

    const result = await useCase.execute(shortCode);

    expect(repository.getOriginalUrlByShortCode).toHaveBeenCalledWith(shortCode);
    expect(repository.incrementClicks).toHaveBeenCalledWith(shortCode);
    expect(result).toBe(originalUrl);
  });

  it("should rethrow error when getOriginalUrlByShortCode throws", async () => {
    const error = new Error("Original URL not found");
    repository.getOriginalUrlByShortCode.mockRejectedValue(error);

    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Original URL not found",
    );
    expect(repository.incrementClicks).not.toHaveBeenCalled();
  });

  it("should rethrow error when incrementClicks throws", async () => {
    repository.getOriginalUrlByShortCode.mockResolvedValue("https://ok.com");
    repository.incrementClicks.mockRejectedValue(new Error("Update failed"));

    await expect(useCase.execute("code")).rejects.toThrow("Update failed");
  });
});
