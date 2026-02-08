import { Entity } from "../entity";
import { ulid } from "ulid";

jest.mock("ulid", () => ({
  ulid: jest.fn(() => "01ARZ3NDEKTSV4RRFFQ69G5FAV"),
}));

class ConcreteEntity extends Entity<{ name: string }> {
  constructor(props: { name: string }, id?: string) {
    super(props, id);
  }
}

describe("Entity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create entity with ulid-generated id when id is not provided", () => {
      const props = { name: "Test" };
      const entity = new ConcreteEntity(props);

      expect(ulid).toHaveBeenCalledTimes(1);
      expect(entity.id).toBe("01ARZ3NDEKTSV4RRFFQ69G5FAV");
      expect(entity.props).toEqual(props);
    });

    it("should create entity with given id when id is provided", () => {
      const props = { name: "Test" };
      const customId = "custom-id-123";
      const entity = new ConcreteEntity(props, customId);

      expect(ulid).not.toHaveBeenCalled();
      expect(entity.id).toBe(customId);
      expect(entity.props).toEqual(props);
    });

    it("should preserve props passed to constructor", () => {
      const props = { name: "My Entity" };
      const entity = new ConcreteEntity(props);

      expect(entity.props).toBe(props);
      expect(entity.props.name).toBe("My Entity");
    });
  });

  describe("id", () => {
    it("should return the entity id via getter", () => {
      const entity = new ConcreteEntity({ name: "Test" }, "id-fixo");

      expect(entity.id).toBe("id-fixo");
    });

    it("should return the same id on multiple reads", () => {
      const entity = new ConcreteEntity({ name: "Test" });

      expect(entity.id).toBe(entity.id);
    });
  });

  describe("toJSON", () => {
    it("should return object with id", () => {
      const entity = new ConcreteEntity({ name: "Test" }, "json-id");

      const json = entity.toJSON();

      expect(json).toHaveProperty("id", "json-id");
      expect(json.id).toBe("json-id");
    });

    it("should return object in expected format with id", () => {
      const entity = new ConcreteEntity({ name: "Test" }, "my-id");

      const json = entity.toJSON();

      expect(json).toEqual({ id: "my-id" });
    });
  });

  describe("props", () => {
    it("should expose entity props", () => {
      const props = { name: "Original" };
      const entity = new ConcreteEntity(props);

      expect(entity.props).toEqual({ name: "Original" });
      expect(entity.props).toBe(props);
    });
  });
});
