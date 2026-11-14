import ExcelJS from "exceljs";

export interface ImportError {
  sheet: string;
  row: number;
  column: string;
  message: string;
}

export interface NormalizedStudent {
  fullName: string;
  grade: number;
  curriculum: "american" | "cambridge";
  className: string;
  externalId: string | null;
  preferredLanguage: "en" | "ar" | "mixed" | null;
  rowNumber: number;
}

export interface NormalizedTeacher {
  fullName: string;
  subjects: ("math" | "science" | "english")[];
  classes: string[];
  externalId: string | null;
  rowNumber: number;
}

export interface ImportPreviewResult {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    errorCount: number;
    classNames: string[];
  };
  students: NormalizedStudent[];
  teachers: NormalizedTeacher[];
  errors: ImportError[];
}

export async function parseAndValidateWorkbook(
  buffer: Buffer
): Promise<ImportPreviewResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const errors: ImportError[] = [];
  const students: NormalizedStudent[] = [];
  const teachers: NormalizedTeacher[] = [];
  const classNamesSet = new Set<string>();

  // 1. Process Students Sheet
  const studentsSheet = workbook.getWorksheet("Students");
  if (!studentsSheet) {
    errors.push({
      sheet: "Workbook",
      row: 0,
      column: "Sheets",
      message: "Missing required worksheet: 'Students'",
    });
  } else {
    const studentExternalIds = new Set<string>();
    const studentKeys = new Set<string>();

    studentsSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const fullNameRaw = row.getCell(1).text?.trim();
      const gradeRaw = row.getCell(2).text?.trim();
      const curriculumRaw = row.getCell(3).text?.trim().toLowerCase();
      const classNameRaw = row.getCell(4).text?.trim().toUpperCase();
      const externalIdRaw = row.getCell(5).text?.trim() || null;
      const langRaw = row.getCell(6).text?.trim().toLowerCase() || null;

      // Skip completely blank rows
      if (!fullNameRaw && !gradeRaw && !curriculumRaw && !classNameRaw) return;

      // Validate full_name
      if (!fullNameRaw || fullNameRaw.length < 2 || fullNameRaw.length > 100) {
        errors.push({
          sheet: "Students",
          row: rowNumber,
          column: "full_name",
          message: "Full name must be between 2 and 100 characters",
        });
      }

      // Validate grade
      const grade = parseInt(gradeRaw, 10);
      if (![6, 7, 8].includes(grade)) {
        errors.push({
          sheet: "Students",
          row: rowNumber,
          column: "grade",
          message: "Grade must be 6, 7, or 8",
        });
      }

      // Validate curriculum
      let curriculum: "american" | "cambridge" = "american";
      if (!["american", "cambridge"].includes(curriculumRaw)) {
        errors.push({
          sheet: "Students",
          row: rowNumber,
          column: "curriculum",
          message: "Curriculum must be 'american' or 'cambridge'",
        });
      } else {
        curriculum = curriculumRaw as "american" | "cambridge";
      }

      // Validate class_name
      if (!classNameRaw) {
        errors.push({
          sheet: "Students",
          row: rowNumber,
          column: "class_name",
          message: "Class name is required",
        });
      } else {
        classNamesSet.add(classNameRaw);
      }

      // Check duplicate external_id
      if (externalIdRaw) {
        if (studentExternalIds.has(externalIdRaw)) {
          errors.push({
            sheet: "Students",
            row: rowNumber,
            column: "external_id",
            message: `Duplicate student external_id '${externalIdRaw}' in file`,
          });
        } else {
          studentExternalIds.add(externalIdRaw);
        }
      }

      // Check duplicate name + grade + class
      const studentKey = `${fullNameRaw?.toLowerCase()}_${grade}_${classNameRaw}`;
      if (studentKeys.has(studentKey)) {
        errors.push({
          sheet: "Students",
          row: rowNumber,
          column: "full_name",
          message: `Duplicate student '${fullNameRaw}' in class ${classNameRaw}`,
        });
      } else {
        studentKeys.add(studentKey);
      }

      // Preferred language
      let preferredLanguage: "en" | "ar" | "mixed" | null = null;
      if (langRaw) {
        if (["en", "ar", "mixed"].includes(langRaw)) {
          preferredLanguage = langRaw as "en" | "ar" | "mixed";
        } else {
          errors.push({
            sheet: "Students",
            row: rowNumber,
            column: "preferred_language",
            message: "Preferred language must be 'en', 'ar', or 'mixed'",
          });
        }
      }

      if (fullNameRaw && [6, 7, 8].includes(grade) && classNameRaw) {
        students.push({
          fullName: fullNameRaw.replace(/\s+/g, " "),
          grade,
          curriculum,
          className: classNameRaw,
          externalId: externalIdRaw,
          preferredLanguage,
          rowNumber,
        });
      }
    });
  }

  // 2. Process Teachers Sheet
  const teachersSheet = workbook.getWorksheet("Teachers");
  if (!teachersSheet) {
    errors.push({
      sheet: "Workbook",
      row: 0,
      column: "Sheets",
      message: "Missing required worksheet: 'Teachers'",
    });
  } else {
    const teacherExternalIds = new Set<string>();

    teachersSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const fullNameRaw = row.getCell(1).text?.trim();
      const subjectsRaw = row.getCell(2).text?.trim();
      const classesRaw = row.getCell(3).text?.trim();
      const externalIdRaw = row.getCell(4).text?.trim() || null;

      // Skip completely blank rows
      if (!fullNameRaw && !subjectsRaw && !classesRaw) return;

      if (!fullNameRaw || fullNameRaw.length < 2 || fullNameRaw.length > 100) {
        errors.push({
          sheet: "Teachers",
          row: rowNumber,
          column: "full_name",
          message: "Full name must be between 2 and 100 characters",
        });
      }

      // Parse subjects
      const validSubjects = ["math", "science", "english"];
      const subjectsParsed: ("math" | "science" | "english")[] = [];
      if (!subjectsRaw) {
        errors.push({
          sheet: "Teachers",
          row: rowNumber,
          column: "subjects",
          message: "At least one subject is required (math, science, english)",
        });
      } else {
        const parts = subjectsRaw.split(",").map((s) => s.trim().toLowerCase());
        for (const p of parts) {
          if (validSubjects.includes(p)) {
            subjectsParsed.push(p as any);
          } else {
            errors.push({
              sheet: "Teachers",
              row: rowNumber,
              column: "subjects",
              message: `Invalid subject '${p}'. Allowed: math, science, english`,
            });
          }
        }
      }

      // Parse classes
      const classesParsed: string[] = [];
      if (!classesRaw) {
        errors.push({
          sheet: "Teachers",
          row: rowNumber,
          column: "classes",
          message: "At least one class is required",
        });
      } else {
        const parts = classesRaw.split(",").map((c) => c.trim().toUpperCase());
        for (const c of parts) {
          if (c) {
            classesParsed.push(c);
            classNamesSet.add(c);
          }
        }
      }

      if (externalIdRaw) {
        if (teacherExternalIds.has(externalIdRaw)) {
          errors.push({
            sheet: "Teachers",
            row: rowNumber,
            column: "external_id",
            message: `Duplicate teacher external_id '${externalIdRaw}' in file`,
          });
        } else {
          teacherExternalIds.add(externalIdRaw);
        }
      }

      if (fullNameRaw && subjectsParsed.length > 0 && classesParsed.length > 0) {
        teachers.push({
          fullName: fullNameRaw.replace(/\s+/g, " "),
          subjects: Array.from(new Set(subjectsParsed)),
          classes: Array.from(new Set(classesParsed)),
          externalId: externalIdRaw,
          rowNumber,
        });
      }
    });
  }

  return {
    summary: {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classNamesSet.size,
      errorCount: errors.length,
      classNames: Array.from(classNamesSet),
    },
    students,
    teachers,
    errors,
  };
}
