const request = require("supertest");
const express = require("express");
const router = require("../../src/routes/tenant");
const httpCode = require("../../src/utils/http_codes.json");
const testData = require("../testData/routes/tenant.json");
const {
  generateErrorResponse,
  generateSuccessResponse,
} = require("./responseGenerator");

// Mock model
jest.mock("../../src/models-mssql/Tenant", () => ({
  get: jest.fn(),
  create: jest.fn(),
  validate: jest.fn(),
  update: jest.fn(),
  del: jest.fn(),
}));

// Mock QueryResult
jest.mock("../../src/utils/QueryResult", () => {
  return {
    QueryResult: jest.fn().mockImplementation((data) => {
      return {
        success: true,
        formData: data,
      };
    }),
  };
});

// Mock returnStateHandler
jest.mock("../../src/utils/returnStateHandler", () => {
  const httpCodes = require("../../src/utils/http_codes.json");
  return {
    returnStateHandler: jest.fn((returnState, req, res, next) => {
      if (returnState.success) {
        return res.status(httpCodes.OK).send(returnState);
      } else {
        if (returnState.error && returnState.error.message) {
          returnState.error.message2 = returnState.error.message;
        }
        return res
          .status(returnState.status || httpCodes.BAD_REQUEST)
          .send(returnState);
      }
    }),
  };
});

const {
  get,
  create,
  validate,
  update,
  del,
} = require("../../src/models-mssql/Tenant");

const { QueryResult } = require("../../src/utils/QueryResult");
const { returnStateHandler } = require("../../src/utils/returnStateHandler");

const app = express();
app.use(express.json());
app.use("/tenant", router);

describe("GET /tenant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and list all the tenant data", async () => {
    const mockData = testData.existingData;
    const successResponse = generateSuccessResponse([mockData]);

    get.mockResolvedValue([mockData]);

    const response = await request(app).get("/tenant");

    expect(response.status).toBe(httpCode.OK);
    expect(response.body).toEqual(successResponse);
  });

  it("should return 400 for a database error", async () => {
    const mockError = new Error("Database error");
    const errorResponse = generateErrorResponse("Database error");

    get.mockRejectedValue(mockError);

    const response = await request(app).get("/tenant");

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
  });
});

describe("POST /tenant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and data for a valid tenant", async () => {
    const validTenant = testData.existingData;
    const successResponse = generateSuccessResponse(validTenant);
    validate.mockResolvedValue(validTenant);
    create.mockResolvedValue(validTenant);

    const response = await request(app).post("/tenant").send(validTenant);

    expect(response.status).toBe(httpCode.OK);
    expect(response.body).toEqual(successResponse);
    expect(validate).toHaveBeenCalledWith(validTenant);
    expect(create).toHaveBeenCalledWith(validTenant);
  });

  it("should return 400 for validation errors", async () => {
    const invalidTenant = {
      ...testData.existingData,
      tenantName: "", // invalid data
    };
    const validationError = new Error("Validation error");
    const errorResponse = generateErrorResponse("Validation error");
    validate.mockRejectedValue(validationError);

    const response = await request(app).post("/tenant").send(invalidTenant);

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
    expect(validate).toHaveBeenCalledWith(invalidTenant);
    expect(create).not.toHaveBeenCalled();
  });

  it("should return 400 for a database error", async () => {
    const validTenant = testData.existingData;
    const errorResponse = generateErrorResponse("Database error");
    validate.mockResolvedValue(validTenant);
    const databaseError = new Error("Database error");
    create.mockRejectedValue(databaseError);

    const response = await request(app).post("/tenant").send(validTenant);

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
    expect(validate).toHaveBeenCalledWith(validTenant);
    expect(create).toHaveBeenCalledWith(validTenant);
  });
});

describe("PUT /tenant/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and data for a valid update", async () => {
    const validTenant = testData.updatedData;
    const updateResponse = generateSuccessResponse(validTenant);
    const tenantId = "tenantId123";
    validate.mockResolvedValue(validTenant);
    update.mockResolvedValue(validTenant);

    const response = await request(app)
      .put(`/tenant/${tenantId}`)
      .send(validTenant);

    expect(response.status).toBe(httpCode.OK);
    expect(response.body).toEqual(updateResponse);
    expect(validate).toHaveBeenCalledWith(validTenant, tenantId);
    expect(update).toHaveBeenCalledWith(validTenant);
  });

  it("should return 400 for validation errors", async () => {
    const invalidTenant = {
      ...testData.updatedData,
      tenantName: "", // invalid data
    };
    const tenantId = "tenantId123";
    const validationError = new Error("Validation error");
    const errorResponse = generateErrorResponse("Validation error");
    validate.mockRejectedValue(validationError);

    const response = await request(app)
      .put(`/tenant/${tenantId}`)
      .send(invalidTenant);

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
    expect(validate).toHaveBeenCalledWith(invalidTenant, tenantId);
    expect(update).not.toHaveBeenCalled();
  });

  it("should return 400 for a non-existing tenantId", async () => {
    const validTenant = testData.updatedData;
    const tenantId = "nonExistingId123";
    const databaseError = new Error("Tenant doesn't exist.");
    const errorResponse = generateErrorResponse("Tenant doesn't exist.");
    validate.mockResolvedValue(validTenant);
    update.mockRejectedValue(databaseError);

    const response = await request(app)
      .put(`/tenant/${tenantId}`)
      .send(validTenant);

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
    expect(validate).toHaveBeenCalledWith(validTenant, tenantId);
    expect(update).toHaveBeenCalledWith(validTenant);
  });

  it("should return 400 for a database error", async () => {
    const validTenant = testData.existingData;
    const tenantId = "tenantId123";
    const errorResponse = generateErrorResponse("Database error");
    const databaseError = new Error("Database error");
    validate.mockResolvedValue(validTenant);
    update.mockRejectedValue(databaseError);

    const response = await request(app)
      .put(`/tenant/${tenantId}`)
      .send(validTenant);

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
    expect(validate).toHaveBeenCalledWith(validTenant, tenantId);
    expect(update).toHaveBeenCalledWith(validTenant);
  });
});

describe("DELETE /tenant/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 for a successful deletion", async () => {
    const tenantId = "tenantId123";
    const delResponse = generateSuccessResponse({});
    del.mockResolvedValue({});

    const response = await request(app).delete(`/tenant/${tenantId}`);

    expect(response.status).toBe(httpCode.OK);
    expect(response.body).toEqual(delResponse);
    expect(del).toHaveBeenCalledWith(tenantId);
  });

  it("should return 400 for a non-existing tenant ID", async () => {
    const nonExistingId = "nonExistingId123";
    const error = new Error("Tenant doesn't exist.");
    const errorResponse = generateErrorResponse("Tenant doesn't exist.");

    del.mockRejectedValue(error);

    const response = await request(app).delete(`/tenant/${nonExistingId}`);

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
    expect(del).toHaveBeenCalledWith(nonExistingId);
  });

  it("should return 400 for a database error", async () => {
    const tenantId = "tenantId123";
    const databaseError = new Error("Database error");
    const errorResponse = generateErrorResponse("Database error");
    del.mockRejectedValue(databaseError);

    const response = await request(app).delete(`/tenant/${tenantId}`);

    expect(response.status).toBe(httpCode.BAD_REQUEST);
    expect(response.body).toEqual(errorResponse);
    expect(del).toHaveBeenCalledWith(tenantId);
  });
});
