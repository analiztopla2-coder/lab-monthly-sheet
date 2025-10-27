// lib/activity-logger.ts - Kullanıcı aktivite logger
// NOT: Bu dosya sadece type definitions ve constants içerir
// Gerçek loglama server-side'da yapılır

export type ActivityAction =
  | "login"
  | "logout"
  | "login_failed"
  | "password_change"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "sheet_created"
  | "sheet_updated"
  | "sheet_viewed";

interface LogActivityParams {
  userId?: string;
  username: string;
  action: ActivityAction;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Kullanıcı aktivitesini logla (sadece server-side'da çalışır)
 */
export async function logActivity({
  userId,
  username,
  action,
  details,
  ipAddress,
  userAgent,
}: LogActivityParams): Promise<void> {
  // Bu fonksiyon sadece server-side'da import edilmeli
  // Import supabaseServer'ı dinamik yapıyoruz
  try {
    const { supabaseServer } = await import("./supabase-server");
    await supabaseServer.from("user_activity_logs").insert([
      {
        user_id: userId || null,
        username,
        action,
        details: details || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      },
    ]);
  } catch (error) {
    console.error("Activity log error:", error);
    // Log hatası uygulamayı durdurmamalı
  }
}

/**
 * Aktivite açıklamaları (Türkçe)
 */
export const ACTION_LABELS: Record<ActivityAction, string> = {
  login: "Giriş Yaptı",
  logout: "Çıkış Yaptı",
  login_failed: "Başarısız Giriş Denemesi",
  password_change: "Şifre Değiştirdi",
  user_created: "Kullanıcı Oluşturdu",
  user_updated: "Kullanıcı Güncelledi",
  user_deleted: "Kullanıcı Sildi",
  sheet_created: "Yeni Ay Oluşturdu",
  sheet_updated: "Veri Güncelledi",
  sheet_viewed: "Veri Görüntüledi",
};

/**
 * Aktivite renkleri (Tailwind CSS)
 */
export const ACTION_COLORS: Record<
  ActivityAction,
  { bg: string; text: string }
> = {
  login: { bg: "bg-green-100", text: "text-green-800" },
  logout: { bg: "bg-gray-100", text: "text-gray-800" },
  login_failed: { bg: "bg-red-100", text: "text-red-800" },
  password_change: { bg: "bg-blue-100", text: "text-blue-800" },
  user_created: { bg: "bg-purple-100", text: "text-purple-800" },
  user_updated: { bg: "bg-cyan-100", text: "text-cyan-800" },
  user_deleted: { bg: "bg-orange-100", text: "text-orange-800" },
  sheet_created: { bg: "bg-indigo-100", text: "text-indigo-800" },
  sheet_updated: { bg: "bg-yellow-100", text: "text-yellow-800" },
  sheet_viewed: { bg: "bg-slate-100", text: "text-slate-800" },
};
