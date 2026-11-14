import ExcelJS from "exceljs";
import { GeneratedCredential } from "../import/commit";

/**
 * Generates branded Excel workbook of credentials with formula injection protection
 */
export async function exportCredentialsToExcel(params: {
  schoolName: string;
  credentials: GeneratedCredential[];
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Credentials");

  const navyHeader = "0B2545";
  const whiteText = "FFFFFF";

  // Banner Row
  sheet.mergeCells("A1:E1");
  const banner = sheet.getCell("A1");
  banner.value = `CONFIDENTIAL: LOGIN CODES FOR ${params.schoolName.toUpperCase()} — Generated on ${new Date().toLocaleDateString("en-GB")}`;
  banner.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "B3392F" }, // danger accent for confidentiality
  };
  banner.font = { bold: true, color: { argb: whiteText }, size: 11 };
  banner.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 28;

  // Header Row
  sheet.getRow(2).values = ["Full Name", "Role", "Class", "Grade", "Access Code"];
  sheet.getRow(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: navyHeader },
  };
  sheet.getRow(2).font = { bold: true, color: { argb: whiteText } };
  sheet.getRow(2).height = 24;

  sheet.columns = [
    { key: "name", width: 28 },
    { key: "role", width: 14 },
    { key: "class", width: 16 },
    { key: "grade", width: 14 },
    { key: "code", width: 22 },
  ];

  // Sanitize formula injection
  const sanitize = (val: string) => {
    if (!val) return "";
    if (["=", "+", "-", "@"].includes(val.charAt(0))) {
      return `'${val}`;
    }
    return val;
  };

  params.credentials.forEach((cred) => {
    sheet.addRow({
      name: sanitize(cred.name),
      role: cred.role,
      class: sanitize(cred.class),
      grade: cred.grade,
      code: cred.code,
    });
  });

  // Style code column with monospace font
  sheet.getColumn("code").eachCell((cell, rowNumber) => {
    if (rowNumber > 2) {
      cell.font = { name: "Courier New", bold: true, size: 11 };
      cell.alignment = { horizontal: "center" };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generates standalone printable HTML for cards (8 per A4 page)
 */
export function generatePrintableCardsHtml(params: {
  schoolName: string;
  credentials: GeneratedCredential[];
  appUrl?: string;
}): string {
  const appUrl = params.appUrl || "https://rafiq.learn";

  const cardsHtml = params.credentials
    .map(
      (c) => `
    <div class="card">
      <div class="card-header">
        <div class="brand">
          <span class="logo-text">Rafiq</span>
          <span class="logo-ar" dir="rtl">رفيق</span>
        </div>
        <span class="school-name">${escapeHtml(params.schoolName)}</span>
      </div>

      <div class="user-info">
        <div class="user-name">${escapeHtml(c.name)}</div>
        <div class="user-meta">${escapeHtml(c.role)} • Class: ${escapeHtml(c.class)}</div>
      </div>

      <div class="code-box">
        <div class="code-label">PERSONAL ACCESS CODE / رمز الدخول</div>
        <div class="code-val">${escapeHtml(c.code)}</div>
      </div>

      <div class="card-footer">
        <div>1. Go to <span class="url">${appUrl}</span></div>
        <div dir="rtl">٢. اكتب الرمز وابدأ جلستك التعليمية مباشرة</div>
      </div>
    </div>
  `
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Rafiq Access Cards — ${escapeHtml(params.schoolName)}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #fff;
      color: #161D2A;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 68mm;
      gap: 5mm;
      page-break-inside: auto;
    }
    .card {
      border: 1.5px dashed #0F7178;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      background: #FAFCFC;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #D8DEE5;
      padding-bottom: 6px;
    }
    .brand {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .logo-text {
      font-weight: 800;
      font-size: 16px;
      color: #0B2545;
    }
    .logo-ar {
      font-weight: 700;
      font-size: 13px;
      color: #0F7178;
    }
    .school-name {
      font-size: 11px;
      color: #4F5A69;
      font-weight: 500;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-info {
      margin: 6px 0;
    }
    .user-name {
      font-size: 14px;
      font-weight: 700;
      color: #0B2545;
    }
    .user-meta {
      font-size: 11px;
      color: #4F5A69;
      margin-top: 2px;
    }
    .code-box {
      background: #EAF7F7;
      border: 1px solid #C9ECEC;
      border-radius: 6px;
      padding: 6px 10px;
      text-align: center;
      margin: 4px 0;
    }
    .code-label {
      font-size: 9px;
      font-weight: 700;
      color: #0F7178;
      letter-spacing: 0.5px;
    }
    .code-val {
      font-family: "Courier New", Courier, monospace;
      font-size: 17px;
      font-weight: 800;
      color: #0B2545;
      letter-spacing: 2px;
      margin-top: 2px;
    }
    .card-footer {
      font-size: 10px;
      color: #4F5A69;
      border-top: 1px solid #E9EDF1;
      padding-top: 5px;
      line-height: 1.3;
    }
    .url {
      font-weight: 700;
      color: #0F7178;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
