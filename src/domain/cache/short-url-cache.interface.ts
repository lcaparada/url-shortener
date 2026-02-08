export interface ShortUrlCacheInterface {
  get(shortCode: string): Promise<string | null>;
  set(shortCode: string, originalUrl: string): Promise<void>;
}
