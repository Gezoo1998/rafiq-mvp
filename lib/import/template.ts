import ExcelJS from "exceljs";

export async function generateImportTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rafiq Platform";
  workbook.created = new Date();

  // Colors from design system
  const navyHeader = "0B2545";
  const whiteText = "FFFFFF";
  const lightGray = "F4F6F8";

  // 1. README Sheet
  const readmeSheet = workbook.addWorksheet("README");
  readmeSheet.columns = [
    { header: "Section", key: "section", width: 25 },
    { header: "Instructions / تعليمات", key: "details", width: 80 },
  ];

  readmeSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: navyHeader },
  };
  readmeSheet.getRow(1).font = { bold: true, color: { argb: whiteText }, size: 12 };

  readmeSheet.addRows([
    {
      section: "Overview / نظرة عامة",
      details:
        "Welcome to Rafiq! Use this spreadsheet to bulk import your school's students and teachers in one step.\nمرحباً بكم في رفيق! استخدم هذا الملف لإضافة الطلاب والمعلمين دفعة واحدة.",
    },
    {
      section: "Students Sheet",
      details:
        "Fill the 'Students' sheet with each student's name, grade (6, 7, or 8), curriculum ('american' or 'cambridge'), and class name (e.g. 6A). Classes will be created automatically if they do not exist.",
    },
    {
      section: "Teachers Sheet",
      details:
        "Fill the 'Teachers' sheet with each teacher's name, subjects taught (e.g. 'math, science'), and assigned classes (e.g. '6A, 6B').",
    },
    {
      section: "Login Codes / رموز الدخول",
      details:
        "After upload and confirmation, unique login codes will be generated for every person. Plaintext codes are displayed and exported only once for security.",
    },
  ]);

  readmeSheet.views = [{ showGridLines: true }];

  // 2. Students Sheet
  const studentsSheet = workbook.addWorksheet("Students");
  studentsSheet.columns = [
    { header: "full_name *", key: "full_name", width: 28 },
    { header: "grade *", key: "grade", width: 12 },
    { header: "curriculum *", key: "curriculum", width: 16 },
    { header: "class_name *", key: "class_name", width: 16 },
    { header: "external_id", key: "external_id", width: 16 },
    { header: "preferred_language", key: "preferred_language", width: 20 },
  ];

  studentsSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: navyHeader },
  };
  studentsSheet.getRow(1).font = { bold: true, color: { argb: whiteText } };

  // Sample student rows
  studentsSheet.addRows([
    {
      full_name: "Sara Al-Otaibi",
      grade: 6,
      curriculum: "american",
      class_name: "6A",
      external_id: "STU-1001",
      preferred_language: "mixed",
    },
    {
      full_name: "Omar Khalid Al-Harbi",
      grade: 6,
      curriculum: "american",
      class_name: "6A",
      external_id: "STU-1002",
      preferred_language: "mixed",
    },
    {
      full_name: "Zaid Tariq",
      grade: 7,
      curriculum: "cambridge",
      class_name: "7B",
      external_id: "STU-2001",
      preferred_language: "en",
    },
  ]);

  // 3. Teachers Sheet
  const teachersSheet = workbook.addWorksheet("Teachers");
  teachersSheet.columns = [
    { header: "full_name *", key: "full_name", width: 28 },
    { header: "subjects *", key: "subjects", width: 26 },
    { header: "classes *", key: "classes", width: 22 },
    { header: "external_id", key: "external_id", width: 16 },
  ];

  teachersSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: navyHeader },
  };
  teachersSheet.getRow(1).font = { bold: true, color: { argb: whiteText } };

  // Sample teacher rows
  teachersSheet.addRows([
    {
      full_name: "Huda Al-Ghamdi",
      subjects: "math, science",
      classes: "6A, 6B",
      external_id: "TCH-01",
    },
    {
      full_name: "Nasser Al-Shehri",
      subjects: "english",
      classes: "6A, 7B",
      external_id: "TCH-02",
    },
  ]);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

