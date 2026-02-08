import { ulid } from "ulid";

export abstract class Entity<Props = any> {
  private readonly _id: string;
  public readonly props: Props;

  constructor(props: Props, id?: string) {
    this.props = props;
    this._id = id || ulid();
  }

  get id() {
    return this._id;
  }

  toJSON(): Required<Props & { id: string }> {
    return {
      id: this._id,
    } as Required<Props & { id: string }>;
  }
}
