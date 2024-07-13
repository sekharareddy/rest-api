const {
  create,
  update,
  getById,
  get,
  del,
  validate,
} = require("../../src/services/academicYears.service");
const {
  cacheData,
  invalidateCacheByPattern,
  invalidateCache,
  getCachedData,
} = require("../../src/utils/redis");
const { AcademicYears } = require("../../src/models-mssql/AcademicYears");
const {
  validData,
  savedData,
  updateData,
  query,
} = require("../testData/models-mssql/AcademicYears.json");

jest.mock("../../src/models-mssql/AcademicYears");
jest.mock("../../src/utils/redis");
jest.mock("../../src/utils/logger", () => jest.fn(() => ({
  info: jest.fn(),
  error: jest.fn(),
})));

describe("AcademicYears Service", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("create function", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      AcademicYears.build.mockReturnValue({
        ...savedData,
        save: jest.fn().mockResolvedValue(savedData),
      });
      cacheData.mockResolvedValue();
      invalidateCacheByPattern.mockResolvedValue();
    });

    it("should create a new academic year successfully", async () => {
      const result = await create(validData);

      expect(AcademicYears.build).toHaveBeenCalledWith(validData);
      expect(result.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(savedData));
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYears/${savedData.academicYearId}`,
        expect.objectContaining(savedData),
      );
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYears/all/*",
      );
    });

    it("should throw an error if database operation fails", async () => {
      AcademicYears.build.mockReturnValue({
        save: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await expect(create(validData)).rejects.toThrow("DB error");
    });

    it("should throw an error if cache operation fails", async () => {
      cacheData.mockRejectedValue(new Error("Cache error"));

      await expect(create(validData)).rejects.toThrow("Cache error");
    });
  });

  describe("getById function", () => {
    const id = "00000000-0000-0000-0000-000000000002";

    beforeEach(() => {
      jest.resetAllMocks();
      getCachedData.mockResolvedValue(null);
      AcademicYears.findByPk.mockResolvedValue(savedData);
    });

    it("should get an academic year by ID successfully", async () => {
      const result = await getById(id);

      expect(getCachedData).toHaveBeenCalledWith(`AcademicYears/${id}`);
      expect(AcademicYears.findByPk).toHaveBeenCalledWith(id);
      expect(result).toEqual(savedData);
    });

    it("should return cached data if available", async () => {
      const cachedData = { ...savedData, academicYearName: "Cached Year" };
      getCachedData.mockResolvedValue(cachedData);

      const result = await getById(id);

      expect(getCachedData).toHaveBeenCalledWith(`AcademicYears/${id}`);
      expect(AcademicYears.findByPk).not.toHaveBeenCalled();
      expect(result).toEqual(
        AcademicYears.build(cachedData, { isNewRecord: false }),
      );
    });

    it("should throw an error if academic year is not found", async () => {
      AcademicYears.findByPk.mockResolvedValue(null);

      await expect(getById(id)).rejects.toThrow("Academic year not found");
    });

    it("should throw an error if database operation fails", async () => {
      AcademicYears.findByPk.mockRejectedValue(new Error("DB error"));

      await expect(getById(id)).rejects.toThrow("DB error");
    });
  });

  describe("update function", () => {
    const id = "00000000-0000-0000-0000-000000000001";
    const savedDataMock = {
      ...savedData,
      save: jest.fn().mockResolvedValue(updateData),
    };

    beforeEach(() => {
      jest.resetAllMocks();
      AcademicYears.findByPk.mockResolvedValue(savedDataMock);
      cacheData.mockResolvedValue();
      invalidateCacheByPattern.mockResolvedValue();
      invalidateCache.mockResolvedValue();
    });

    it("should update an academic year successfully", async () => {
      const result = await update(updateData);

      expect(savedDataMock.save).toHaveBeenCalled();
      expect(result).toEqual(savedDataMock);
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYears/${id}`,
        savedDataMock,
      );
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYears/all/*",
      );
      expect(invalidateCache).toHaveBeenCalledWith(`AcademicYears/${id}`);
    });

    it("should throw an error if academic year is not found", async () => {
      AcademicYears.findByPk.mockResolvedValue(null);

      await expect(
        update({ academicYearId: id, ...updateData }),
      ).rejects.toThrow("Academic year not found");
    });

    it("should throw an error if database operation fails", async () => {
      savedDataMock.save.mockRejectedValue(new Error("DB error"));

      await expect(
        update({ academicYearId: id, ...updateData }),
      ).rejects.toThrow("DB error");
    });

    it("should throw an error if cache operation fails", async () => {
      cacheData.mockRejectedValue(new Error("Cache error"));

      await expect(
        update({ academicYearId: id, ...updateData }),
      ).rejects.toThrow("Cache error");
    });

    it("should retain original academicYearName if not provided in dataIn", async () => {
      const result = await update({ academicYearId: id });

      expect(result).toEqual(savedDataMock);
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYears/${id}`,
        savedDataMock,
      );
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYears/all/*",
      );
      expect(invalidateCache).toHaveBeenCalledWith(`AcademicYears/${id}`);
    });
  });

  describe("get function", () => {
    const mockData = {
      totalRecords: 2,
      currentPage: 1,
      data: [
        { id: 1, academicYearName: "2024-2025" },
        { id: 2, academicYearName: "2025-2026" },
      ],
    };

    const mockUser = {
      userRoles: [
        { roleName: "Staff", roleId: "staffRoleId" },
        { roleName: "Support Staff", roleId: "supportStaffRoleId" },
      ],
    };

    const cacheKey = `AcademicYears/all/${query.tenantId}/${query.appId}/${
      query.orgId
    }/${query.page}/${query.limit}/${query.search}/${JSON.stringify(
      query.filters,
    )}/${query.sortBy}/${query.sortOrder}`;

    beforeEach(() => {
      getCachedData.mockResolvedValue(null);
      AcademicYears.findAndCountAll.mockResolvedValue({
        count: mockData.totalRecords,
        rows: mockData.data,
      });
    });

    it("should get all academic years successfully from cache", async () => {
      getCachedData.mockResolvedValue(mockData);

      const result = await get(query, mockUser);

      expect(getCachedData).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(mockData);
    });

    it("should get all academic years successfully from database and cache the result", async () => {
      const result = await get(query, mockUser);

      expect(getCachedData).toHaveBeenCalledWith(cacheKey);
      expect(cacheData).toHaveBeenCalledWith(cacheKey, mockData);
      expect(result).toEqual(mockData);
    });

    it("should throw an error if database operation fails", async () => {
      AcademicYears.findAndCountAll.mockRejectedValue(new Error("DB error"));

      await expect(get(query, mockUser)).rejects.toThrow("DB error");
    });

    it("should handle case when user doesn't have required role", async () => {
      const userWithoutRequiredRole = {
        userRoles: [{ roleName: "Other", roleId: "otherRoleId" }],
      };

      const result = await get(query, userWithoutRequiredRole);

      expect(result).toEqual(mockData);
    });
  });

  describe("del function", () => {
    const id = "00000000-0000-0000-0000-000000000001";
    const savedDataMock = {
      ...savedData,
      destroy: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
      jest.resetAllMocks();
      AcademicYears.findByPk.mockResolvedValue(savedDataMock);
      invalidateCache.mockResolvedValue();
      invalidateCacheByPattern.mockResolvedValue();
    });

    it("should delete an academic year successfully", async () => {
      const result = await del(id);

      expect(savedDataMock.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(invalidateCache).toHaveBeenCalledWith(`AcademicYears/${id}`);
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYears/all/*",
      );
    });

    it("should throw an error if academic year is not found", async () => {
      AcademicYears.findByPk.mockResolvedValue(null);

      await expect(del(id)).rejects.toThrow("Academic year not found");
    });

    it("should throw an error if database operation fails", async () => {
      savedDataMock.destroy.mockRejectedValue(new Error("DB error"));

      await expect(del(id)).rejects.toThrow("DB error");
    });

    it("should throw an error if cache operation fails", async () => {
      invalidateCache.mockRejectedValue(new Error("Cache error"));

      await expect(del(id)).rejects.toThrow("Cache error");
    });
  });

  describe("validate function", () => {
    const formatDates = (data) => ({
      ...data,
      academicYearStartDate: new Date(data.academicYearStartDate).toISOString(),
      academicYearEndDate: new Date(data.academicYearEndDate).toISOString(),
    });

    it("should validate academic year data successfully", async () => {
      const result = await validate(validData);
      expect(formatDates(result)).toEqual(formatDates(validData));
    });

    it("should set academicYearId when id is provided", async () => {
      const id = "00000000-0000-0000-0000-000000000001";
      const result = await validate(validData, id);
      expect(result.academicYearId).toBe(id);
    });

    it.each([
      ["academicYearName", ""],
      ["academicYearStartDate", undefined],
      ["academicYearEndDate", undefined],
      ["orgId", ""],
      ["tenantId", undefined],
      ["appId", undefined],
    ])("should return an error if %s is invalid", async (field, value) => {
      const invalidData = { ...validData, [field]: value };
      const result = await validate(invalidData);
      expect(result).toContain(`Validation error: "${field}"`);
    });
  });
});
