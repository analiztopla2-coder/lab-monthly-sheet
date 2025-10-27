// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MonthTable from "./components/MonthTable";
import { Button } from "./components/ui/button";
import { Select } from "./components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { ROW_LABELS, RowsJson, getDaysInMonth } from "@/lib/rows";
import * as XLSX from "xlsx";

interface Sheet {
  id: string;
  year: number;
  month: number;
  rows: RowsJson;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [rows, setRows] = useState<RowsJson>({});
  const [days, setDays] = useState(31);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Geçmiş modal
  const [showHistory, setShowHistory] = useState(false);
  const [historySheets, setHistorySheets] = useState<Sheet[]>([]);

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  // Sheet yükle
  const loadSheet = async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sheet?year=${year}&month=${month}`);
      const data = await res.json();

      if (res.ok && data.sheet) {
        setSheet(data.sheet);
        setRows(data.sheet.rows);
        setDays(getDaysInMonth(year, month));
      }
    } catch (error) {
      console.error("Sheet yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
    loadSheet(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Kullanıcı rolünü kontrol et
  const checkUserRole = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.user.role === "admin");
      }
    } catch (error) {
      console.error("Role check error:", error);
    }
  };

  // Hücre değiştir
  const handleCellChange = (rowLabel: string, dayIndex: number, value: string) => {
    setRows((prev) => {
      const newRows = { ...prev };
      if (!newRows[rowLabel]) {
        newRows[rowLabel] = Array(days).fill("");
      }
      newRows[rowLabel][dayIndex] = value;
      return newRows;
    });
  };

  // Kaydet
  const handleSave = async () => {
    if (!sheet) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/sheet/${sheet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      if (res.ok) {
        alert("Kaydedildi!");
      } else {
        alert("Kaydetme hatası");
      }
    } catch (error) {
      alert("Sunucu hatası");
    } finally {
      setSaving(false);
    }
  };

  // Yeni ay oluştur
  const handleCreateNewMonth = async () => {
    const confirmText = `${currentYear} / ${monthNames[currentMonth]} için yeni bir sayfa oluşturulsun mu?`;
    if (!confirm(confirmText)) return;

    try {
      const res = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: currentYear, month: currentMonth }),
      });

      if (res.ok) {
        alert("Yeni sayfa oluşturuldu!");
        loadSheet(currentYear, currentMonth);
      } else {
        const data = await res.json();
        alert(data.error || "Oluşturulamadı");
      }
    } catch (error) {
      alert("Sunucu hatası");
    }
  };

  // Geçmiş yükle
  const handleLoadHistory = async () => {
    try {
      const res = await fetch("/api/sheets");
      const data = await res.json();

      if (res.ok) {
        setHistorySheets(data.sheets || []);
        setShowHistory(true);
      }
    } catch (error) {
      alert("Geçmiş yüklenemedi");
    }
  };

  // Geçmişten seç
  const handleSelectHistorySheet = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setShowHistory(false);
  };

  // XLSX İndir (Excel)
  const handleDownloadXLSX = () => {
    if (!sheet) return;

    // 2D array oluştur
    const data: any[][] = [];
    
    // Başlık satırı
    const headerRow = ["Parametre"];
    for (let i = 1; i <= days; i++) {
      headerRow.push(i.toString());
    }
    data.push(headerRow);

    // Her satır için veri
    ROW_LABELS.forEach((label) => {
      const row = [label];
      const values = rows[label] || [];
      for (let i = 0; i < days; i++) {
        row.push(values[i] || "");
      }
      data.push(row);
    });

    // Workbook oluştur
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Sütun genişlikleri
    const wscols = [{ wch: 30 }]; // İlk sütun (parametre adı)
    for (let i = 0; i < days; i++) {
      wscols.push({ wch: 10 });
    }
    ws["!cols"] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Laboratuvar");
    
    // Dosya adı
    const filename = `laboratuvar_${currentYear}_${monthNames[currentMonth]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // Yazdır/PDF
  const handlePrint = () => {
    window.print();
  };

  // Çıkış
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 print:border-b-2 print:border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/logo.png" 
              alt="EMAA Logo" 
              className="h-16 w-auto object-contain print:h-20"
            />
            <h1 className="text-3xl font-bold text-slate-800 print:text-4xl">
              LABORATUVAR
            </h1>
          </div>
          
          {/* Kontroller - Print'te gizle */}
          <div className="flex flex-wrap gap-3 items-center justify-center print:hidden">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Yıl:</label>
              <Select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="w-28"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Ay:</label>
              <Select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="w-32"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            
            <Button onClick={handleCreateNewMonth} variant="secondary" size="sm">
              Yeni Ay Oluştur
            </Button>

            <Button onClick={handleLoadHistory} variant="outline" size="sm">
              Geçmiş
            </Button>

            <Button onClick={handleDownloadXLSX} variant="outline" size="sm">
              XLSX İndir
            </Button>

            <Button onClick={handlePrint} variant="outline" size="sm">
              Yazdır/PDF
            </Button>

            <Button 
              onClick={() => window.open('/kullanici-kilavuzu.html', '_blank')} 
              variant="outline" 
              size="sm"
            >
              📘 Kılavuz
            </Button>

            {isAdmin && (
              <Button 
                onClick={() => router.push('/admin/users')} 
                variant="outline" 
                size="sm"
              >
                👤 Kullanıcılar
              </Button>
            )}

            <Button onClick={handleLogout} variant="destructive" size="sm">
              Çıkış
            </Button>
          </div>

          {/* Ay/Yıl Başlığı - Print için */}
          <div className="text-center mt-4 text-lg font-semibold text-slate-700">
            {monthNames[currentMonth]} {currentYear}
          </div>
        </div>
      </header>

      {/* Tablo */}
      <main className="container mx-auto px-4 py-6 print:px-0 print:py-2">
        <MonthTable rows={rows} days={days} onChange={handleCellChange} />
      </main>

      {/* Geçmiş Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geçmiş Aylar</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {historySheets.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Henüz kayıtlı ay yok
              </p>
            ) : (
              <ul className="space-y-2">
                {historySheets.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => handleSelectHistorySheet(s.year, s.month)}
                      className="w-full text-left p-3 rounded-md hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <div className="font-semibold">
                        {monthNames[s.month]} {s.year}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Son güncelleme: {new Date(s.updated_at).toLocaleString("tr-TR")}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
