import * as repoService from "../src/services/repoService";

jest.mock("@dfinity/agent", () => ({
  Actor: { createActor: jest.fn(() => mockActor) },
  HttpAgent: jest.fn()
}));

const mockActor = {
  createRepo: jest.fn(async (name, owner) => ({ id: 1, name, owner })),
  getRepo: jest.fn(async (id) => ({ id, name: "TestRepo", owner: "alice" })),
  updateRepo: jest.fn(async (id, name) => true),
  deleteRepo: jest.fn(async (id) => true)
};

describe("repoService", () => {
  it("should create a repo", async () => {
    const repo = await repoService.createRepo("TestRepo", "alice");
    expect(repo).toEqual({ id: 1, name: "TestRepo", owner: "alice" });
  });

  it("should get a repo", async () => {
    const repo = await repoService.getRepo(1);
    expect(repo).toEqual({ id: 1, name: "TestRepo", owner: "alice" });
  });

  it("should update a repo", async () => {
    const result = await repoService.updateRepo(1, "NewName");
    expect(result).toBe(true);
  });

  it("should delete a repo", async () => {
    const result = await repoService.deleteRepo(1);
    expect(result).toBe(true);
  });
});
