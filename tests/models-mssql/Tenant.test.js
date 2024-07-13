const {
  create,
  update,
  get,
  getById,
  del,
  validate,
  Tenant,
} = require("../../src/models-mssql/Tenant");
const testData = require("../testData/models-mssql/Tenant.json");

describe("create function", () => {
  const { validData } = testData;
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mocking functions
    Tenant.build = jest.fn().mockReturnValue({
      save: jest.fn().mockResolvedValue(savedData),
    });
  });

  it("should create a tenant successfully", async () => {
    const result = await create(validData);

    expect(Tenant.build).toHaveBeenCalledWith(validData);
    expect(result).toEqual(savedData);
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Tenant.build.mockReturnValue({
      save: jest.fn().mockRejectedValue(dbError),
    });

    await expect(create(validData)).rejects.toThrow("DB error");
  });
});

describe("update function", () => {
  const { validData } = testData;
  const updatedData = { ...validData, tenantName: "Updated Tenant Name" };
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Tenant.findByPk = jest.fn().mockResolvedValue({
      ...savedData,
      save: jest.fn().mockResolvedValue(updatedData),
    });
  });

  it("should update a tenant successfully", async () => {
    const result = await update(updatedData);

    expect(Tenant.findByPk).toHaveBeenCalledWith(updatedData.tenantId);
    expect(result.tenantName).toEqual("Updated Tenant Name");
  });

  // Should throw an error stating "Tenant doesn't exist.".
  // it("should throw an error if tenant does not exist", async () => {
  //   Tenant.findByPk.mockResolvedValue(null);

  //   await expect(update(updatedData)).rejects.toThrow("Tenant doesn't exist.");
  // });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Tenant.findByPk.mockResolvedValue({
      ...savedData,
      save: jest.fn().mockRejectedValue(dbError),
    });

    await expect(update(updatedData)).rejects.toThrow("DB error");
  });
});

describe("getById function", () => {
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Tenant.findByPk = jest.fn().mockResolvedValue(savedData);
  });

  it("should get a tenant by ID successfully", async () => {
    const result = await getById(savedData.tenantId);

    expect(Tenant.findByPk).toHaveBeenCalledWith(savedData.tenantId);
    expect(result).toEqual(savedData);
  });

  it("should return null if tenant does not exist", async () => {
    Tenant.findByPk.mockResolvedValue(null);

    const result = await getById(savedData.tenantId);
    expect(result).toBeNull();
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Tenant.findByPk.mockRejectedValue(dbError);

    await expect(getById(savedData.tenantId)).rejects.toThrow("DB error");
  });
});
describe("del function", () => {
  const { validData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Tenant.destroy = jest.fn().mockResolvedValue(1);
  });

  it("should delete a tenant successfully", async () => {
    const result = await del(validData.tenantId);

    expect(Tenant.destroy).toHaveBeenCalledWith({
      where: { tenantId: validData.tenantId },
    });
    expect(result).toBe(1);
  });

  it("should return 0 if tenant does not exist", async () => {
    Tenant.destroy.mockResolvedValue(0);

    const result = await del(validData.tenantId);
    expect(result).toBe(0);
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Tenant.destroy.mockRejectedValue(dbError);

    await expect(del(validData.tenantId)).rejects.toThrow("DB error");
  });
});

describe("get function", () => {
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Tenant.findAll = jest.fn().mockResolvedValue([savedData]);
  });

  it("should get tenants successfully", async () => {
    const result = await get(savedData.tenantId);

    expect(Tenant.findAll).toHaveBeenCalledWith({
      where: { tenantId: savedData.tenantId },
    });
    expect(result).toEqual([savedData]);
  });

  it("should return an empty array if no tenants exist", async () => {
    Tenant.findAll.mockResolvedValue([]);

    const result = await get(savedData.tenantId);
    expect(result).toEqual([]);
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Tenant.findAll.mockRejectedValue(dbError);

    await expect(get(savedData.tenantId)).rejects.toThrow("DB error");
  });
});

describe("validate function", () => {
  const validationData = {
    tenantName: "Test Tenant",
    lastUpdateDateTime: "2024-05-30T00:00:00.000Z",
  };

  it("should validate data successfully", async () => {
    const result = await validate(validationData);

    expect(result).toEqual({
      ...validationData,
      lastUpdateDateTime: new Date(validationData.lastUpdateDateTime),
    });
  });

  it("should validate data with id successfully", async () => {
    const result = await validate(validationData, "tenantId123");

    expect(result).toEqual({
      ...validationData,
      lastUpdateDateTime: new Date(validationData.lastUpdateDateTime),
    });
  });

  it("should throw a validation error for invalid data", async () => {
    const invalidData = { tenantName: "" }; // invalid data

    await expect(validate(invalidData)).rejects.toThrow(
      "Validation error: \"tenantName\" is not allowed to be empty",
    );
  });
});
