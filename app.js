
/// /// REQUIRE DECLARATION SECTION //////
require("dotenv").config({ path: "./App_Data/global.env" });
const express = require("express"); // Web server
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const specs = require("./src/utils/swagger");
const sequelize = require("./src/utils/sequelize");

const logger = require("./src/utils/logger")(module);

const HTTP = require("./src/utils/http_codes.json");
const { returnStateHandler } = require("./src/utils/returnStateHandler");

// Application imports
const { ErrorResponse } = require("./src/utils/ErrorResponse");

const routes = require("./src/routes");

// Authentication Middleware
const { auth } = require("./src/middleware/auth");

/// /// END REQUIRE DECLARATION SECTION //////

const app = express();
app.set("port", process.env.port || 54321); //

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS Middleware

/// /// END WEB SERVER INSTANTIATION AND CONFIGURATION SECTION //////

try {
  // CORS
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"], // For legacy browser support
  };
  app.use(cors(corsOptions));

  // helmet
  app.use(helmet());
  app.use((req, res, next) => {
    res.header("Strict-Transport-Security", "max-age=63072000; includeSubdomains; preload");
    res.header("X-XSS-Protection", "1; mode=block");
    res.header("Cache-control", "no-store");
    res.header("Pragma", "no-cache");
    next();
  });

  /// /// DATABASE CONNECTION //////
  const connect = async () => {
    try {
      await sequelize.authenticate();
      logger.info("Connection has been established successfully.");
    } catch (error) {
      logger.error("Unable to connect to the database:", error);
    }
  };

  connect();

  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms"),
  );
  app.use("/api-docs", swaggerUI.serve);
  app.get("/api-docs", swaggerUI.setup(specs, { explorer: true }));

  // Public Routes
  app.get("/", (req, res) => res.sendStatus(200));
  app.get("/api", (req, res) => {
    logger.info(req.headers.baseUrl, req.headers.originalUrl, req.headers["CLIENT-IP"]);
    return res.sendStatus(200);
  });
  app.get("/health", (req, res) => res.sendStatus(200));
  app.use("/", express.static(path.join(__dirname, "./public"))); // added static html files in public folder to verify google registration
  app.use("/AppData", routes.AppDataRoute);
  app.use("/PageData", routes.PageDataRoute);
  app.use("/", express.static(path.join(__dirname, "./public")));

  app.use("/localUser", routes.LocalUserRoute);

  // Secure Routes
  app.use("/role", auth, routes.RoleRoute);
  app.use("/appuser", auth, routes.UserRoute);
  app.use("/userrole", auth, routes.UserRoleRoute);
  app.use("/usersession", auth, routes.UserSessionRoute);
  app.use("/userlogin", auth, routes.UserLoginRoute);

  app.use("/userMessage", auth, routes.UserMessageRoute);

  app.use("/Tenant", auth, routes.TenantRoute);

  app.use("/ElementType", auth, routes.ElementTypeRoute);
  app.use("/ElementTypeProperty", auth, routes.ElementTypePropertyRoute);

  app.use("/App", auth, routes.AppRoute);
  app.use("/AppElement", auth, routes.AppElementRoute);
  app.use("/AppElementProperty", auth, routes.AppElementPropertyRoute);

  app.use("/Page", auth, routes.PageRoute);
  app.use("/PageElement", auth, routes.PageElementRoute);
  app.use("/PageRole", auth, routes.PageRoleRoute);
  app.use("/PageElementProperty", auth, routes.PageElementPropertyRoute);
  app.use("/image", auth, routes.UploadImageRoute);

  app.use("/userFamily", auth, routes.UserFamilyRoute);
  app.use("/userChildren", auth, routes.UserChildrenRoute);

  app.use("/org", auth, routes.OrganizationRoute);
  app.use("/orgLicense", auth, routes.OrganizationLicenseRoute);

  app.use("/appl", auth, routes.ApplicationRoute);
  app.use("/applParent", auth, routes.ApplicationParentRoute);
  app.use("/applEmergencyContact", auth, routes.ApplicationEmergencyContactRoute);
  app.use("/applPickupPermission", auth, routes.ApplicationPickupPermissionRoute);
  app.use("/applAgreementDay", auth, routes.ApplicationAgreementDayRoute);
  app.use("/applDocument", auth, routes.ApplicationDocumentRoute);

  app.use("/admittedChildren", auth, routes.AdmittedChildrenRoute);
  app.use("/pickupPermission", auth, routes.PickupPermissionRoute);
  app.use("/attendance", auth, routes.AttendanceRoute);
  app.use("/activity", auth, routes.ActivityRoute);
  app.use("/activityDetail", auth, routes.ActivityDetailRoute);

  app.use("/staffAttendance", auth, routes.StaffAttendanceRoute);
  app.use("/ApplicationDocType", auth, routes.ApplicationDocTypeRoute);

  app.use("/FeeReceipt", auth, routes.FeeReceiptRoute);

  app.use("/Syllabus", auth, routes.SyllabusRoute);
  app.use("/TeachingMedium", auth, routes.TeachingMediumRoute);
  app.use("/Subjects", auth, routes.SubjectsRoute);
  app.use("/Classes", auth, routes.ClassesRoute);
  app.use("/ClassSections", auth, routes.ClassSectionsRoute);
  app.use("/SyllabusCombination", auth, routes.SyllabusCombinationRoute);
  app.use("/SyllabusCombinationSubjects", auth, routes.SyllabusCombinationSubjectRoute);
  app.use("/SyllabusClassCombination", auth, routes.SyllabusClassCombinationRoute);
  app.use("/ClassSectionSyllabusClassCombinations", auth, routes.ClassSectionSyllabusClassCombinationsRoute);
  app.use("/AcademicYears", auth, routes.AcademicYearsRoute);
  app.use("/ApplicationAYClassSections", auth, routes.ApplicationAYClassSectionsRoute);

  app.use("/AcademicYearHolidays", auth, routes.AcademicYearHolidayRoute);
  app.use("/StaffLeaveRequests", auth, routes.StaffLeaveRequestRoute);

  app.use("/ExamGroups", auth, routes.ExamGroupRoute);
  app.use("/Exams", auth, routes.ExamRoute);
  app.use("/SyllabusCombinationSubjectExamSchedules", auth, routes.SyllabusCombinationSubjectExamScheduleRoute);
  app.use("/SyllabusCombinationSubjectExams", auth, routes.SyllabusCombinationSubjectExamRoute);

  app.use("/ApplicationAYClassSectionsSubjectExamMarks", auth, routes.ApplicationAYClassSectionsSubjectExamMarksRoute);
  app.use("/ApplicationAYClassSectionsSubjectExamMarksReport", auth, routes.ApplicationAYClassSectionsSubjectExamMarksReportRoute);

  app.use("/ExpenseAccounts", auth, routes.ExpenseAccountRoute);
  app.use("/Expenses", auth, routes.ExpensesRoute);

  app.use("/ApplicationScholarships", auth, routes.ApplicationScholarshipRoute);

  // INTERNAL SERVER ERROR
  // UNHANDLED EXCEPTIONS
  app.use((err, req, res, next) => {
    logger.error("handling generic unhandled exceptions");
    logger.error(err);
    if (err) {
      const errResp = new ErrorResponse("500", "Unhandled Error", false, err.message);
      // getAndUpdateErrorLogsByRequestId(req.requestId,errResp);
      next(errResp);
    }
  }, returnStateHandler);

  // NOT FOUND
  app.use((req, res, next) => {
    // const err = new Error("Page NOT FOUND");
    next({ error: "Page NOT FOUND", success: false, status: HTTP.NOT_FOUND });
  }, returnStateHandler);

  // TODO UnHANDLED Exception -> Verify Key
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error.message);
    logger.error(error);
  });

  /// /// START WEB SERVER AND LISTEN //////
  const server = app.listen(app.get("port"), () => {
    logger.info(
      `API server listening on port ${server.address().port}`,
    );
  });
} catch (error) {
  logger.info("Error in app.js (try1 catch): ", error);
  // return process.exit(1);
}

/// /// END DATABASE CONNECTION //////
// module.exports = app

/// /// END //////
