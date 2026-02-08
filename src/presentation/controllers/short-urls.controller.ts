import { FastifyReply, FastifyRequest } from "fastify";
import { CreateShortUrlUseCase } from "../../application/useCases/shortUrls/create-short-url.use-case";
import { GetOriginalUrlByShortCodeUseCase } from "../../application/useCases/shortUrls/get-original-url-by-short-code.use-case";

export class ShortUrlsController {
  constructor(
    private readonly createShortUrlUseCase: CreateShortUrlUseCase,
    private readonly getOriginalUrlByShortCodeUseCase: GetOriginalUrlByShortCodeUseCase,
  ) {}

  async create(
    req: FastifyRequest<{ Body: { originalUrl: string } }>,
    res: FastifyReply,
  ) {
    const { originalUrl } = req.body;
    const shortCode = await this.createShortUrlUseCase.execute(originalUrl);
    res.status(201).send({ shortCode });
  }

  async getOriginalUrlByShortCode(
    req: FastifyRequest<{ Params: { shortCode: string } }>,
    res: FastifyReply,
  ) {
    const { shortCode } = req.params;
    const originalUrl =
      await this.getOriginalUrlByShortCodeUseCase.execute(shortCode);
    res.status(302).redirect(originalUrl);
  }
}
