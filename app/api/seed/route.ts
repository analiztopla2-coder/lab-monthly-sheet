// app/api/seed/route.ts - Seed endpoint (dev only)
import { NextResponse } from "next/server";
import { createUser, findUserByUsername } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { emptyMonth } from "@/lib/rows";

export async function POST() {
  try {
    console.log("🌱 Seed başlatılıyor...");
    
    // Dev modunda değilse seed yapma
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Seed sadece development'ta çalışır" },
        { status: 403 }
      );
    }

    const defaultAdmin = process.env.APP_DEFAULT_ADMIN || "admin";
    const defaultPassword = process.env.APP_DEFAULT_PASSWORD || "admin123";
    
    console.log("Admin bilgileri:", { username: defaultAdmin, password: defaultPassword.substring(0, 3) + "***" });

    // Admin kullanıcı yoksa oluştur
    const existingAdmin = await findUserByUsername(defaultAdmin);
    if (!existingAdmin) {
      const newUser = await createUser(defaultAdmin, defaultPassword, "admin");
      console.log(`✅ Admin kullanıcı oluşturuldu:`, newUser);
    } else {
      console.log(`ℹ️  Admin kullanıcı zaten mevcut:`, existingAdmin.username);
    }

    // Mevcut ay için boş sheet yoksa oluştur
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11

    const { data: existingSheet } = await getSupabaseAdmin()
      .from("monthly_sheets")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single();

    if (!existingSheet) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const rows = emptyMonth(daysInMonth);

      const admin = await findUserByUsername(defaultAdmin);
      
      await getSupabaseAdmin().from("monthly_sheets").insert({
        year,
        month,
        rows,
        created_by: admin?.id,
      });

      console.log(`✅ ${year}/${month + 1} için boş sheet oluşturuldu`);
    } else {
      console.log(`ℹ️  ${year}/${month + 1} için sheet zaten mevcut`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Seed tamamlandı",
        admin: defaultAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed hatası", details: String(error) },
      { status: 500 }
    );
  }
}
