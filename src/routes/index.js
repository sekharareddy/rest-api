
const AppDataRoute = require("./AppData");
const PageDataRoute = require("./PageData");

const UserRoute = require("./appUser");
const RoleRoute = require("./role");
const UserRoleRoute = require("./userRole");
const UserSessionRoute = require("./userSession");
const UserLoginRoute = require("./appUserLogin");
const LocalUserRoute = require("./localUser");

const TenantRoute = require("./tenant");

const ElementTypeRoute = require("./elementType");
const ElementTypePropertyRoute = require("./elementTypeProperty");

const AppRoute = require("./app");
const AppElementRoute = require("./appElement");
const AppElementPropertyRoute = require("./appElementProperty");

const PageRoute = require("./page");
const PageElementRoute = require("./pageElement");
const PageElementPropertyRoute = require("./pageElementProperty");
const UploadImageRoute = require("./uploadImage");
const PageRoleRoute = require("./pageRole");

const UserMessageRoute = require("./userMessage");

const UserFamilyRoute = require("./userFamily");
const UserChildrenRoute = require("./userChildren");

const OrganizationRoute = require("./organization");
const OrganizationLicenseRoute = require("./organizationLicense");

const ApplicationRoute = require("./application");
const ApplicationParentRoute = require("./applicationParent");
const ApplicationDocumentRoute = require("./applicationDocument");
const ApplicationEmergencyContactRoute = require("./applicationEmergencyContact");
const ApplicationPickupPermissionRoute = require("./applicationPickupPermission");
const ApplicationAgreementDayRoute = require("./applicationAgreementDay");

const AdmittedChildrenRoute = require("./admittedChildren");
const PickupPermissionRoute = require("./pickupPermission");
const AttendanceRoute = require("./attendance");

const ActivityRoute = require("./activity");
const ActivityDetailRoute = require("./activityDetail");

const StaffAttendanceRoute = require("./staffAttendance");
const ApplicationDocTypeRoute = require("./applicationDocType");

const FeeReceiptRoute = require("./feeReceipt");

const SyllabusRoute = require("./syllabus");
const TeachingMediumRoute = require("./teachingMedium");
const ClassesRoute = require("./classes");
const ClassSectionsRoute = require("./classSections");
const SyllabusCombinationRoute = require("./syllabusCombination");
const SyllabusClassCombinationRoute = require("./syllabusClassCombination");
const SyllabusCombinationSubjectRoute = require("./syllabusCombinationSubject");
const ClassSectionSyllabusClassCombinationsRoute = require("./classSectionSyllabusClassCombinations");
const SubjectsRoute = require("./subjects");
const AcademicYearsRoute = require("./academicYears");
const ApplicationAYClassSectionsRoute = require("./applicationAYClassSection");
const AcademicYearHolidayRoute = require("./academicYearHoliday");
const StaffLeaveRequestRoute = require("./staffLeaveRequest");
const ExamGroupRoute = require("./examGroup");
const ExamRoute = require("./exam");
const SyllabusCombinationSubjectExamScheduleRoute = require("./syllabusCombinationSubjectExamSchedule");
const SyllabusCombinationSubjectExamRoute = require("./syllabusCombinationSubjectExam");

const ApplicationAYClassSectionsSubjectExamMarksRoute = require("./applicationAYClassSectionsSubjectExamMarks");
const ApplicationAYClassSectionsSubjectExamMarksReportRoute = require("./applicationAYClassSectionsSubjectExamMarksReport");

const ExpenseAccountRoute = require("./expenseAccount");
const ExpensesRoute = require("./expenses");

const ApplicationScholarshipRoute = require("./applicationScholarship");

module.exports = {
  UserRoute,
  RoleRoute,
  UserRoleRoute,
  UserSessionRoute,
  UserLoginRoute,
  LocalUserRoute,

  TenantRoute,

  AppDataRoute,
  PageDataRoute,

  ElementTypeRoute,
  ElementTypePropertyRoute,

  AppRoute,
  AppElementRoute,
  AppElementPropertyRoute,

  PageRoute,
  PageElementRoute,
  PageElementPropertyRoute,
  PageRoleRoute,

  UploadImageRoute,

  UserMessageRoute,

  UserFamilyRoute,
  UserChildrenRoute,

  OrganizationRoute,
  OrganizationLicenseRoute,

  ApplicationRoute,
  ApplicationParentRoute,
  ApplicationEmergencyContactRoute,
  ApplicationPickupPermissionRoute,
  ApplicationAgreementDayRoute,
  ApplicationDocumentRoute,

  AdmittedChildrenRoute,
  PickupPermissionRoute,

  AttendanceRoute,
  ActivityRoute,
  ActivityDetailRoute,

  StaffAttendanceRoute,

  ApplicationDocTypeRoute,

  FeeReceiptRoute,

  SyllabusRoute,
  TeachingMediumRoute,
  SubjectsRoute,
  ClassesRoute,
  ClassSectionsRoute,
  SyllabusCombinationRoute,
  SyllabusCombinationSubjectRoute,
  SyllabusClassCombinationRoute,
  ClassSectionSyllabusClassCombinationsRoute,
  AcademicYearsRoute,
  ApplicationAYClassSectionsRoute,

  AcademicYearHolidayRoute,
  StaffLeaveRequestRoute,
  ExamGroupRoute,
  ExamRoute,
  SyllabusCombinationSubjectExamScheduleRoute,
  SyllabusCombinationSubjectExamRoute,

  ApplicationAYClassSectionsSubjectExamMarksRoute,
  ApplicationAYClassSectionsSubjectExamMarksReportRoute,

  ExpenseAccountRoute,
  ExpensesRoute,

  ApplicationScholarshipRoute,
};
