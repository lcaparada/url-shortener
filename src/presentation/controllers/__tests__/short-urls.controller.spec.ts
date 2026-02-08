import { ShortUrlsController } from "../short-urls.controller";
import { CreateShortUrlUseCase } from "../../../application/useCases/shortUrls/create-short-url.use-case";
import { GetOriginalUrlByShortCodeUseCase } from "../../../application/useCases/shortUrls/get-original-url-by-short-code.use-case";

function createMockReply() {
  const send = jest.fn();
  const redirect = jest.fn();
  const status = jest.fn().mockReturnValue({
    send,
    redirect,
  });
  return { status, send, redirect };
}

describe("ShortUrlsController", () => {
  describe("create", () => {
    it("should return 201 and shortCode when use case succeeds", async () => {
      const createUseCase = {
        execute: jest.fn().mockResolvedValue("abc123xy"),
      } as unknown as CreateShortUrlUseCase;
      const getUseCase = {} as GetOriginalUrlByShortCodeUseCase;
      const controller = new ShortUrlsController(createUseCase, getUseCase);
      const req = { body: { originalUrl: "https://example.com" } } as any;
      const reply = createMockReply();

      await controller.create(req, reply as any);

      expect(createUseCase.execute).toHaveBeenCalledWith("https://example.com");
      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith({ shortCode: "abc123xy" });
    });
  });

  describe("getOriginalUrlByShortCode", () => {
    it("should redirect 302 when URL is https", async () => {
      const getUseCase = {
        execute: jest.fn().mockResolvedValue("https://example.com/page"),
      } as unknown as GetOriginalUrlByShortCodeUseCase;
      const controller = new ShortUrlsController(
        {} as CreateShortUrlUseCase,
        getUseCase,
      );
      const req = { params: { shortCode: "abc123" } } as any;
      const reply = createMockReply();

      await controller.getOriginalUrlByShortCode(req, reply as any);

      expect(getUseCase.execute).toHaveBeenCalledWith("abc123");
      expect(reply.status).toHaveBeenCalledWith(302);
      expect(reply.redirect).toHaveBeenCalledWith("https://example.com/page");
    });

    it("should return 400 when URL is not http/https", async () => {
      const getUseCase = {
        execute: jest.fn().mockResolvedValue("javascript:alert(1)"),
      } as unknown as GetOriginalUrlByShortCodeUseCase;
      const controller = new ShortUrlsController(
        {} as CreateShortUrlUseCase,
        getUseCase,
      );
      const req = { params: { shortCode: "x" } } as any;
      const reply = createMockReply();

      await controller.getOriginalUrlByShortCode(req, reply as any);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid redirect URL",
      });
      expect(reply.redirect).not.toHaveBeenCalled();
    });
  });
});
