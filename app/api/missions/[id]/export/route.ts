import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getMissionResults } from "@/lib/db/queries/missions";
import ExcelJS from "exceljs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin", "system_admin"]);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "xlsx";

    const data = await getMissionResults(actor, id);
    if (!data) {
      return NextResponse.json({ error: { message: "Mission not found" } }, { status: 404 });
    }

    const { mission, stats, commonGaps, students } = data;

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Mission Results");

      const navyHeader = "0B2545";
      const whiteText = "FFFFFF";

      // Title & Summary Block
      sheet.mergeCells("A1:G1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `RAFIQ MISSION REPORT: ${mission.title.toUpperCase()}`;
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: navyHeader },
      };
      titleCell.font = { bold: true, color: { argb: whiteText }, size: 13 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      sheet.getRow(1).height = 30;

      sheet.addRow([
        `Subject: ${mission.subject.toUpperCase()}`,
        `Grade: ${mission.grade} (${mission.curriculum})`,
        `Assigned: ${stats.assigned}`,
        `Completed: ${stats.completed}`,
        `Average Score: ${stats.averageScore ?? "—"}`,
        `Due: ${new Date(mission.dueAt).toLocaleDateString("en-GB")}`,
      ]);
      sheet.getRow(2).font = { bold: true, size: 10 };
      sheet.addRow([]); // empty

      // Table Header
      sheet.getRow(4).values = [
        "Student Name",
        "Status",
        "Mastery Level",
        "Score",
        "Hints Used",
        "Safety Concern",
        "Teacher Pedagogical Summary",
      ];
      sheet.getRow(4).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: navyHeader },
      };
      sheet.getRow(4).font = { bold: true, color: { argb: whiteText } };
      sheet.getRow(4).height = 24;

      sheet.columns = [
        { key: "name", width: 28 },
        { key: "status", width: 14 },
        { key: "level", width: 18 },
        { key: "score", width: 10 },
        { key: "hints", width: 12 },
        { key: "safety", width: 14 },
        { key: "summary", width: 50 },
      ];

      // Formula injection sanitization
      const sanitize = (val: string | null) => {
        if (!val) return "";
        if (["=", "+", "-", "@"].includes(val.charAt(0))) {
          return `'${val}`;
        }
        return val;
      };

      students.forEach((s) => {
        sheet.addRow({
          name: sanitize(s.studentName),
          status: s.status,
          level: s.level ? s.level.replace("_", " ") : "—",
          score: s.score ?? "—",
          hints: s.hintsUsed,
          safety: s.safetyFlag ? "FLAGGED" : "No",
          summary: sanitize(s.teacherSummary),
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="mission-report-${mission.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.xlsx"`,
        },
      });
    }

    // PDF / HTML Printable view
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mission Report — ${escapeHtml(mission.title)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #161D2A; margin: 0; padding: 0; }
    .header { border-bottom: 2px solid #0B2545; padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 800; color: #0B2545; }
    .meta { font-size: 12px; color: #4F5A69; margin-top: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .stat-box { background: #F4F6F8; border: 1px solid #D8DEE5; border-radius: 6px; padding: 8px 12px; text-align: center; }
    .stat-label { font-size: 10px; font-weight: 700; color: #4F5A69; text-transform: uppercase; }
    .stat-val { font-size: 20px; font-weight: 800; color: #0B2545; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
    th { background: #0B2545; color: #fff; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; }
    td { padding: 7px 8px; border-bottom: 1px solid #E9EDF1; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    .badge-mastered { background: #E6F4EC; color: #1E7B4B; }
    .badge-proficient { background: #E6F0FB; color: #1F63B5; }
    .badge-developing { background: #FDF1DC; color: #A86412; }
    .badge-needs_support { background: #FBEBE2; color: #B5532A; }
    .flag { color: #B3392F; font-weight: bold; }
    .footer { margin-top: 24px; font-size: 10px; color: #94A0AE; text-align: center; border-top: 1px solid #E9EDF1; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${escapeHtml(mission.title)}</div>
    <div class="meta">Subject: ${escapeHtml(mission.subject)} • Grade ${mission.grade} (${escapeHtml(mission.curriculum)}) • Due Date: ${new Date(mission.dueAt).toLocaleDateString("en-GB")}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-box"><div class="stat-label">Assigned</div><div class="stat-val">${stats.assigned}</div></div>
    <div class="stat-box"><div class="stat-label">Started</div><div class="stat-val">${stats.started}</div></div>
    <div class="stat-box"><div class="stat-label">Completed</div><div class="stat-val">${stats.completed}</div></div>
    <div class="stat-box"><div class="stat-label">Average Score</div><div class="stat-val">${stats.averageScore ?? "—"}</div></div>
  </div>

  <h3>Student Performance</h3>
  <table>
    <thead>
      <tr>
        <th>Student Name</th>
        <th>Status</th>
        <th>Mastery Level</th>
        <th>Score</th>
        <th>Hints</th>
        <th>Flags</th>
      </tr>
    </thead>
    <tbody>
      ${students
        .map(
          (s) => `
        <tr>
          <td><strong>${escapeHtml(s.studentName)}</strong></td>
          <td>${escapeHtml(s.status)}</td>
          <td>${s.level ? `<span class="badge badge-${s.level}">${s.level.replace("_", " ")}</span>` : "—"}</td>
          <td>${s.score ?? "—"}</td>
          <td>${s.hintsUsed}</td>
          <td>${s.safetyFlag ? '<span class="flag">⚠ Alert</span>' : "—"}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    Generated by Rafiq Educational Platform — Confidential School Report
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
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
