import { Entity } from "./entity";

export interface ShortUrlProps {
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
}

export class ShortUrlEntity extends Entity<ShortUrlProps> {
  constructor(props: ShortUrlProps, id?: string) {
    super(props, id);
  }

  get originalUrl() {
    return this.props.originalUrl;
  }

  get shortCode() {
    return this.props.shortCode;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get clicks() {
    return this.props.clicks;
  }

  toJSON() {
    return {
      id: this.id,
      originalUrl: this.originalUrl,
      shortCode: this.shortCode,
      createdAt: this.createdAt,
      clicks: this.clicks,
    };
  }
}
