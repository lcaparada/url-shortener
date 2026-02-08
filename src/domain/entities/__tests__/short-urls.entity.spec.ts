import { ulid } from "ulid";
import { ShortUrlEntity } from "../short-urls.entity";

jest.mock("ulid", () => ({
  ulid: jest.fn(() => "01ARZ3NDEKTSV4RRFFQ69G5FAV"),
}));

function makeProps(
  overrides?: Partial<{
    originalUrl: string;
    shortCode: string;
    createdAt: Date;
    clicks: number;
  }>,
) {
  return {
    originalUrl: "https://example.com/long-url",
    shortCode: "abc123",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    clicks: 0,
    ...overrides,
  };
}

describe("ShortUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create ShortUrl with ulid-generated id when id is not provided", () => {
      const props = makeProps();
      const shortUrl = new ShortUrlEntity(props);

      expect(ulid).toHaveBeenCalledTimes(1);
      expect(shortUrl.id).toBe("01ARZ3NDEKTSV4RRFFQ69G5FAV");
      expect(shortUrl.props).toEqual(props);
    });

    it("should create ShortUrl with given id when id is provided", () => {
      const props = makeProps();
      const customId = "short-url-id-123";
      const shortUrl = new ShortUrlEntity(props, customId);

      expect(ulid).not.toHaveBeenCalled();
      expect(shortUrl.id).toBe(customId);
      expect(shortUrl.props).toEqual(props);
    });

    it("should preserve all props passed to constructor", () => {
      const props = makeProps({
        originalUrl: "https://foo.com",
        shortCode: "xyz",
        clicks: 10,
      });
      const shortUrl = new ShortUrlEntity(props);

      expect(shortUrl.originalUrl).toBe("https://foo.com");
      expect(shortUrl.shortCode).toBe("xyz");
      expect(shortUrl.createdAt).toEqual(props.createdAt);
      expect(shortUrl.clicks).toBe(10);
    });
  });

  describe("originalUrl", () => {
    it("should return originalUrl from props", () => {
      const url = "https://example.com/page";
      const shortUrl = new ShortUrlEntity(makeProps({ originalUrl: url }));

      expect(shortUrl.originalUrl).toBe(url);
    });
  });

  describe("shortCode", () => {
    it("should return shortCode from props", () => {
      const code = "a1b2c3";
      const shortUrl = new ShortUrlEntity(makeProps({ shortCode: code }));

      expect(shortUrl.shortCode).toBe(code);
    });
  });

  describe("createdAt", () => {
    it("should return createdAt from props", () => {
      const date = new Date("2025-06-15T12:00:00.000Z");
      const shortUrl = new ShortUrlEntity(makeProps({ createdAt: date }));

      expect(shortUrl.createdAt).toEqual(date);
    });
  });

  describe("clicks", () => {
    it("should return clicks from props", () => {
      const shortUrl = new ShortUrlEntity(makeProps({ clicks: 42 }));

      expect(shortUrl.clicks).toBe(42);
    });
  });

  describe("toJSON", () => {
    it("should return object with id, originalUrl, shortCode, createdAt and clicks", () => {
      const props = makeProps({ originalUrl: "https://foo.com", shortCode: "xyz" });
      const shortUrl = new ShortUrlEntity(props, "json-id");

      const json = shortUrl.toJSON();

      expect(json).toEqual({
        id: "json-id",
        originalUrl: "https://foo.com",
        shortCode: "xyz",
        createdAt: props.createdAt,
        clicks: props.clicks,
      });
    });
  });
});
