import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { generateImportTemplate } from "@/lib/import/template";

export async function GET() {
  try {
    await requireRole(["school_admin", "system_admin"]);
    const buffer = await generateImportTemplate();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="rafiq-import-template.xlsx"',
      },
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
