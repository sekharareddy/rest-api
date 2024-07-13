const {
  create,
  update,
  get,
  getById,
  del,
  // validate,
  Organization,
} = require("../../src/models-mssql/Organization");
const {
  OrganizationLicense,
} = require("../../src/models-mssql/OrganizationLicense");
// const appGetById = require("../../src/models-mssql/App").getById; for validate function.
const testData = require("../testData/models-mssql/Organization.json");

describe("create function", () => {
  const { validData } = testData;
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Organization.build = jest.fn().mockReturnValue({
      save: jest.fn().mockResolvedValue(savedData),
    });
    Organization.findOne = jest.fn().mockResolvedValue(savedData);
  });

  it("should create an organization successfully", async () => {
    const result = await create(validData);

    expect(Organization.build).toHaveBeenCalledWith(validData);
    expect(result).toEqual(savedData);
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Organization.build.mockReturnValue({
      save: jest.fn().mockRejectedValue(dbError),
    });

    await expect(create(validData)).rejects.toThrow("DB error");
  });
});

describe("update function", () => {
  const { validData } = testData;
  const updateData = {
    ...validData,
    orgName: "Updated Organization Name",
    orgId: "org123",
  };
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Organization.findOne = jest.fn().mockResolvedValue({
      ...savedData,
      save: jest.fn().mockResolvedValue({ ...savedData, ...updateData }),
    });
  });

  it("should update an organization successfully", async () => {
    const result = await update(updateData);

    expect(Organization.findOne).toHaveBeenCalledWith({
      where: {
        tenantId: savedData.tenantId,
        appId: savedData.appId,
        orgId: savedData.orgId,
      },
    });
    expect(result.orgName).toEqual("Updated Organization Name");
  });

  it("should throw an error if organization does not exist", async () => {
    Organization.findOne.mockResolvedValue(null);

    await expect(update(updateData)).rejects.toThrow(
      "Cannot set properties of null (setting 'orgName')",
    );
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Organization.findOne.mockResolvedValue({
      ...savedData,
      save: jest.fn().mockRejectedValue(dbError),
    });

    await expect(update(updateData)).rejects.toThrow("DB error");
  });
});

describe("getById function", () => {
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Organization.findOne = jest.fn().mockResolvedValue(savedData);
  });

  it("should get an organization by ID successfully", async () => {
    const result = await getById(
      savedData.tenantId,
      savedData.appId,
      savedData.orgId,
    );

    expect(Organization.findOne).toHaveBeenCalledWith({
      where: {
        tenantId: savedData.tenantId,
        appId: savedData.appId,
        orgId: savedData.orgId,
      },
    });
    expect(result).toEqual(savedData);
  });

  it("should return null if organization does not exist", async () => {
    Organization.findOne.mockResolvedValue(null);

    const result = await getById(savedData.orgId);
    expect(result).toBeNull();
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Organization.findOne.mockRejectedValue(dbError);

    await expect(getById(savedData.orgId)).rejects.toThrow("DB error");
  });
});

describe("del function", () => {
  const { savedData } = testData;

  beforeEach(() => {
    jest.clearAllMocks();
    Organization.findByPk = jest.fn();
  });

  it("should delete an organization successfully", async () => {
    const mockOrg = {
      destroy: jest.fn().mockResolvedValue(1),
    };
    Organization.findByPk.mockResolvedValue(mockOrg);

    await del(savedData.orgId);

    expect(Organization.findByPk).toHaveBeenCalledWith(savedData.orgId);
    expect(mockOrg.destroy).toHaveBeenCalled();
  });

  it("should throw an error if organization does not exist", async () => {
    Organization.findByPk.mockResolvedValue(null);

    await expect(del(savedData.orgId)).rejects.toThrow(
      "Cannot read properties of null (reading 'destroy')",
    );
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Organization.findByPk.mockRejectedValue(dbError);

    await expect(del(savedData.orgId)).rejects.toThrow("DB error");
  });
});

describe("get function", () => {
  const { savedData } = testData;

  jest.mock("../../src/models-mssql/App", () => ({
    getById: jest.fn(),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    Organization.findAll = jest.fn().mockResolvedValue(savedData.rowFormData);
  });

  it("should get organizations successfully", async () => {
    const result = await get(savedData.tenantId, savedData.appId);

    expect(Organization.findAll).toHaveBeenCalledWith({
      where: { tenantId: savedData.tenantId, appId: savedData.appId },
      include: [
        {
          model: OrganizationLicense,
          as: "rowFormData",
        },
      ],
    });
    expect(result).toEqual(savedData.rowFormData);
  });

  it("should return an empty array if no organizations exist", async () => {
    Organization.findAll.mockResolvedValue([]);

    const result = await get(savedData.tenantId, savedData.appId);
    expect(result).toEqual([]);
  });

  it("should throw an error if database operation fails", async () => {
    const dbError = new Error("DB error");
    Organization.findAll.mockRejectedValue(dbError);

    await expect(get(savedData.tenantId, savedData.appId)).rejects.toThrow(
      "DB error",
    );
  });
});

// need to fix valiate function test cases. A bit complicated due to App.js
// describe("validate function", () => {
//   const validationData = {
//     orgName: "Test Organization",
//     appId: "app123",
//     tenantId: "tenant123",
//     lastUpdatedDateTime: "2024-05-30T00:00:00.000Z",
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//     // Mock successful app lookup response structure
//     appGetById = jest.fn().mockResolvedValue([
//       {
//         tenantId: "tenant123",
//         appId: "app123",
//         rowFormData: [
//           {
//             /* mock AppElement data */
//           },
//         ],
//         Tenant: {
//           /* mock Tenant data */
//         },
//       },
//     ]);
//   });

//   it("should validate data successfully", async () => {
//     const result = await validate(validationData);

//     expect(result).toEqual({
//       ...validationData,
//       lastUpdatedDateTime: new Date(validationData.lastUpdatedDateTime),
//     });
//   });

//   it("should validate data with id successfully", async () => {
//     const result = await validate(validationData, "orgId123");

//     expect(result).toEqual({
//       ...validationData,
//       orgId: "orgId123",
//       lastUpdatedDateTime: new Date(validationData.lastUpdatedDateTime),
//     });
//   });

//   it("should throw a validation error for invalid data", async () => {
//     const invalidData = { orgName: "" }; // invalid data

//     await expect(validate(invalidData)).rejects.toThrow(
//       'Validation error: "orgName" is not allowed to be empty,
// "appId" is required, "tenantId" is required'
//     );
//   });

//   it("should throw an error if appGetById fails", async () => {
//     appGetById.mockResolvedValue([]); // Mock app not found

//     await expect(validate(validationData)).rejects.toThrow(
//       "Invalid tenant / app !"
//     );
//   });
// });
