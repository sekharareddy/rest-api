const Sequelize = require("sequelize");
const {
  create,
  getById,
  update,
  del,
  get,
  validate,
} = require("../../src/services/academicYearHoliday.service");
const {
  AcademicYearHoliday,
} = require("../../src/models-mssql/AcademicYearHoliday");
const {
  cacheData,
  getCachedData,
  invalidateCache,
  invalidateCacheByPattern,
} = require("../../src/utils/redis");

const testData = require("../testData/models-mssql/AcademicYearHoliday.json");

jest.mock("../../src/models-mssql/AcademicYearHoliday");
jest.mock("../../src/utils/redis");
jest.mock("sequelize");
jest.mock("../../src/utils/logger", () => jest.fn(() => ({
  info: jest.fn(),
  error: jest.fn(),
})));

const { validData, savedData, validDataWithDateRange, updateData, query } = testData;

describe("AcademicYearHoliday Service", () => {
  describe("create function", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      AcademicYearHoliday.build.mockReturnValue({
        ...savedData,
        save: jest.fn().mockResolvedValue(savedData),
      });
    });

    it("should create a new Academic Year Holiday with exec dbo.addAcademicYearHolidays", async () => {
      const dataIn = {
        ...validDataWithDateRange,
        academicYearHolidayFromDate: "2024-12-20",
        academicYearHolidayToDate: "2025-01-05",
      };
      const execResult = { success: true };
      Sequelize.query = jest.fn().mockResolvedValue(execResult);
      invalidateCacheByPattern.mockResolvedValue();

      const result = await create(dataIn);

      expect(Sequelize.query).toHaveBeenCalledWith(expect.any(String), {
        replacements: expect.objectContaining({
          tenantId: dataIn.tenantId,
          appId: dataIn.appId,
          orgId: dataIn.orgId,
          academicYearId: dataIn.academicYearId,
          academicYearHolidayName: dataIn.academicYearHolidayName,
          academicYearHolidayType: dataIn.academicYearHolidayType,
          academicYearHolidayFromDate: dataIn.academicYearHolidayFromDate,
          academicYearHolidayToDate: dataIn.academicYearHolidayToDate,
        }),
      });
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYearHoliday/all/*",
      );
      expect(result).toEqual(execResult);
    });

    it("should create a new Academic Year Holiday with weekDay", async () => {
      const dataIn = {
        ...validDataWithDateRange,
        academicYearHolidayFromDate: "2024-12-20",
        academicYearHolidayToDate: "2025-01-05",
        weekDay: "Monday",
      };
      const execResult = { success: true };
      Sequelize.query = jest.fn().mockResolvedValue(execResult);
      invalidateCacheByPattern.mockResolvedValue();

      const result = await create(dataIn);

      expect(Sequelize.query).toHaveBeenCalledWith(expect.any(String), {
        replacements: expect.objectContaining({
          tenantId: dataIn.tenantId,
          appId: dataIn.appId,
          orgId: dataIn.orgId,
          academicYearId: dataIn.academicYearId,
          academicYearHolidayName: dataIn.academicYearHolidayName,
          academicYearHolidayType: dataIn.academicYearHolidayType,
          academicYearHolidayFromDate: dataIn.academicYearHolidayFromDate,
          academicYearHolidayToDate: dataIn.academicYearHolidayToDate,
          weekDay: dataIn.weekDay,
        }),
      });
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYearHoliday/all/*",
      );
      expect(result).toEqual(execResult);
    });

    it("should create a new Academic Year Holiday without exec dbo.addAcademicYearHolidays", async () => {
      const dataIn = {
        ...validData,
        academicYearHolidayFromDate: null,
        academicYearHolidayToDate: null,
      };
      cacheData.mockResolvedValue();
      invalidateCacheByPattern.mockResolvedValue();

      const result = await create(dataIn);

      expect(AcademicYearHoliday.build).toHaveBeenCalledWith(dataIn);
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYearHoliday/${savedData.academicYearHolidayId}`,
        expect.objectContaining(savedData),
      );
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYearHoliday/all/*",
      );
      expect(result).toEqual(expect.objectContaining(savedData));
    });

    it("should handle errors when creating a new Academic Year Holiday", async () => {
      const dataIn = validData;
      const error = new Error("Error creating academic year holiday");

      Sequelize.query = jest.fn().mockRejectedValue(error);
      AcademicYearHoliday.build.mockImplementation(() => {
        throw error;
      });

      await expect(create(dataIn)).rejects.toThrow(
        "Error creating academic year holiday",
      );
    });
  });

  describe("getById function", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should return cached data if available", async () => {
      const key = `AcademicYearHoliday/${savedData.academicYearHolidayId}`;
      getCachedData.mockResolvedValue(savedData);
      AcademicYearHoliday.build.mockResolvedValue(savedData);

      const result = await getById(savedData.academicYearHolidayId);

      expect(getCachedData).toHaveBeenCalledWith(key);
      expect(result).toEqual(savedData);
    });

    it("should fetch and cache data if not in cache", async () => {
      getCachedData.mockResolvedValue(null);
      AcademicYearHoliday.findByPk.mockResolvedValue(savedData);

      const result = await getById(savedData.academicYearHolidayId);

      expect(AcademicYearHoliday.findByPk).toHaveBeenCalledWith(
        savedData.academicYearHolidayId,
      );
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYearHoliday/${savedData.academicYearHolidayId}`,
        savedData,
      );
      expect(result).toEqual(savedData);
    });

    it("should throw an error if academic year holiday not found", async () => {
      getCachedData.mockResolvedValue(null);
      AcademicYearHoliday.findByPk.mockResolvedValue(null);

      await expect(getById("nonexistent-id")).rejects.toThrow(
        "Academic year holiday not found",
      );
    });
  });

  describe("update function", () => {
    const id = "00000000-0000-0000-0000-000000000001";

    beforeEach(() => {
      jest.resetAllMocks();
      cacheData.mockResolvedValue();
      invalidateCacheByPattern.mockResolvedValue();
      invalidateCache.mockResolvedValue();
    });

    it("should update an academic year holiday successfully", async () => {
      const updatedMock = { ...savedData, ...updateData, save: jest.fn() };
      AcademicYearHoliday.findByPk.mockResolvedValue(updatedMock);

      const result = await update(updateData);

      expect(updatedMock.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(updateData));
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYearHoliday/${id}`,
        expect.objectContaining(updateData),
      );
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYearHoliday/all/*",
      );
      expect(invalidateCache).toHaveBeenCalledWith(`AcademicYearHoliday/${id}`);
    });

    it("should throw an error if academic year holiday is not found", async () => {
      AcademicYearHoliday.findByPk.mockResolvedValue(null);

      await expect(update({ academicYearHolidayId: id })).rejects.toThrow(
        "Academic year holiday not found",
      );
    });

    it("should throw an error if database operation fails", async () => {
      const mockInstance = {
        ...savedData,
        save: jest.fn().mockRejectedValue(new Error("DB error")),
      };
      AcademicYearHoliday.findByPk.mockResolvedValue(mockInstance);

      await expect(update({ academicYearHolidayId: id })).rejects.toThrow(
        "DB error",
      );
    });

    it("should throw an error if cache operation fails", async () => {
      const mockInstance = {
        ...savedData,
        save: jest.fn().mockResolvedValue(savedData),
      };
      AcademicYearHoliday.findByPk.mockResolvedValue(mockInstance);
      cacheData.mockRejectedValue(new Error("Cache error"));

      await expect(update({ academicYearHolidayId: id })).rejects.toThrow(
        "Cache error",
      );
    });

    it("should retain original academicYearHolidayName if not provided in dataIn", async () => {
      const partialUpdateData = {
        academicYearHolidayId: id,
        academicYearHolidayType: 3,
      };
      const updatedMock = {
        ...savedData,
        ...partialUpdateData,
        save: jest.fn().mockResolvedValue({ ...savedData, ...partialUpdateData }),
      };
      AcademicYearHoliday.findByPk.mockResolvedValue(updatedMock);

      const result = await update(partialUpdateData);

      expect(result.academicYearHolidayName).toBe(
        savedData.academicYearHolidayName,
      );
      expect(result.academicYearHolidayType).toBe(
        partialUpdateData.academicYearHolidayType,
      );
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYearHoliday/${id}`,
        expect.objectContaining({
          ...savedData,
          academicYearHolidayType: 3,
        }),
      );
    });

    it("should update only provided fields and retain others", async () => {
      const partialUpdateData = {
        academicYearHolidayId: id,
        academicYearHolidayName: "Partial Update",
      };
      const updatedMock = {
        ...savedData,
        ...partialUpdateData,
        save: jest.fn().mockResolvedValue({ ...savedData, ...partialUpdateData }),
      };
      AcademicYearHoliday.findByPk.mockResolvedValue(updatedMock);

      const result = await update(partialUpdateData);

      expect(result).toEqual(
        expect.objectContaining({
          ...savedData,
          academicYearHolidayName: "Partial Update",
        }),
      );
      expect(cacheData).toHaveBeenCalledWith(
        `AcademicYearHoliday/${id}`,
        expect.objectContaining({
          ...savedData,
          academicYearHolidayName: "Partial Update",
        }),
      );
    });
  });

  describe("del function", () => {
    it("should delete an academic year holiday", async () => {
      AcademicYearHoliday.destroy.mockResolvedValue(1);

      const result = await del(savedData.academicYearHolidayId);

      expect(AcademicYearHoliday.destroy).toHaveBeenCalledWith({
        where: { academicYearHolidayId: savedData.academicYearHolidayId },
      });
      expect(invalidateCache).toHaveBeenCalledWith(
        `AcademicYearHoliday/${savedData.academicYearHolidayId}`,
      );
      expect(invalidateCacheByPattern).toHaveBeenCalledWith(
        "AcademicYearHoliday/all/*",
      );
      expect(result).toBe(1);
    });

    it("should handle errors during deletion", async () => {
      AcademicYearHoliday.destroy.mockRejectedValue(
        new Error("Deletion error"),
      );

      await expect(del(savedData.academicYearHolidayId)).rejects.toThrow(
        "Deletion error",
      );
    });
  });

  describe("get function", () => {
    const mockUserAdmin = {
      userRoles: [{ roleName: "AppAdmin", roleId: "role1" }],
    };
    const mockUserSupportStaff = {
      userRoles: [{ roleName: "Support Staff", roleId: "role2" }],
    };

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should return cached data if available", async () => {
      const cachedResult = {
        totalRecords: 1,
        currentPage: 1,
        data: [savedData],
      };
      getCachedData.mockResolvedValue(cachedResult);

      const result = await get(query, mockUserAdmin);

      expect(getCachedData).toHaveBeenCalled();
      expect(result).toEqual(cachedResult);
    });

    it("should fetch and cache data if not in cache", async () => {
      getCachedData.mockResolvedValue(null);
      AcademicYearHoliday.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [savedData],
      });

      const result = await get(query, mockUserAdmin);

      expect(AcademicYearHoliday.findAndCountAll).toHaveBeenCalled();
      expect(cacheData).toHaveBeenCalled();
      expect(result).toEqual({
        totalRecords: 1,
        currentPage: 1,
        data: [savedData],
      });
    });

    it("should handle search and filters", async () => {
      getCachedData.mockResolvedValue(null);
      AcademicYearHoliday.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [savedData],
      });

      await get(
        {
          ...query,
          search: "Holiday",
          filters: { academicYearId: "year1" },
        },
        mockUserAdmin,
      );

      expect(AcademicYearHoliday.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Sequelize.Op.or]: expect.any(Array),
            academicYearId: "year1",
          }),
        }),
      );
    });

    it("should handle errors", async () => {
      getCachedData.mockResolvedValue(null);
      AcademicYearHoliday.findAndCountAll.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(get(query, mockUserAdmin)).rejects.toThrow(
        "Database error",
      );
    });

    it("should set userHasStaffRole to true for Support Staff", async () => {
      getCachedData.mockResolvedValue(null);
      AcademicYearHoliday.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [savedData],
      });

      const result = await get(
        { ...query, roleId: "role2" },
        mockUserSupportStaff,
      );

      expect(AcademicYearHoliday.findAndCountAll).toHaveBeenCalled();
      expect(result).toEqual({
        totalRecords: 1,
        currentPage: 1,
        data: [savedData],
      });
    });

    it("should set userHasStaffRole to true for AppAdmin", async () => {
      getCachedData.mockResolvedValue(null);
      AcademicYearHoliday.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [savedData],
      });

      const result = await get(query, mockUserAdmin);

      expect(AcademicYearHoliday.findAndCountAll).toHaveBeenCalled();
      expect(result).toEqual({
        totalRecords: 1,
        currentPage: 1,
        data: [savedData],
      });
    });
  });

  describe("validate function", () => {
    const formatDates = (data) => ({
      ...data,
      academicYearHolidayDate: new Date(
        data.academicYearHolidayDate,
      ).toISOString(),
    });

    it("should validate correct data", async () => {
      const result = await validate(validData);
      expect(formatDates(result)).toEqual(formatDates(validData));
    });

    it("should set academicYearHolidayId when provided", async () => {
      const result = await validate(validData, "custom-id");
      expect(result.academicYearHolidayId).toBe("custom-id");
    });

    it("should handle null and empty weekDay", async () => {
      const result1 = await validate({ ...validData, weekDay: null });
      expect(result1.weekDay).toBe("null");

      const result2 = await validate({ ...validData, weekDay: "" });
      expect(result2.weekDay).toBe("null");
    });

    it("should throw validation error for invalid data", async () => {
      const invalidData = { ...validData, tenantId: undefined };
      await expect(validate(invalidData)).rejects.toThrow("Validation error");
    });
  });
});
