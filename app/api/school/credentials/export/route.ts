import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { exportCredentialsToExcel, generatePrintableCardsHtml } from "@/lib/export/credentials";
import { db } from "@/lib/db/client";
import { schools } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const exportSchema = z.object({
  format: z.enum(["xlsx", "pdf"]),
  credentials: z.array(
    z.object({
      name: z.string(),
      role: z.enum(["Student", "Teacher"]),
      class: z.string(),
      grade: z.string(),
      code: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const body = await req.json();
    const parsed = exportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid payload" } }, { status: 400 });
    }

    const schoolRes = await db
      .select({ name: schools.name })
      .from(schools)
      .where(eq(schools.id, actor.schoolId!))
      .limit(1);

    const schoolName = schoolRes[0]?.name || "Rafiq School";

    if (parsed.data.format === "xlsx") {
      const buffer = await exportCredentialsToExcel({
        schoolName,
        credentials: parsed.data.credentials,
      });

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="rafiq-login-credentials.xlsx"',
        },
      });
    }

    // PDF format / Printable HTML:
    // Returns HTML formatted specifically for print (8 cards per A4 page with print-media styles)
    const html = generatePrintableCardsHtml({
      schoolName,
      credentials: parsed.data.credentials,
      appUrl: process.env.APP_BASE_URL || "https://rafiq.learn",
    });

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
