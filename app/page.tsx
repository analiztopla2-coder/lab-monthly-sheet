// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MonthTable from "./components/MonthTable";
import ParameterReorderModal from "./components/ParameterReorderModal";
import { Button } from "./components/ui/button";
import { Select } from "./components/ui/select";
import { Input } from "./components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { RowsJson, getDaysInMonth } from "@/lib/rows";
import type { LabParameter } from "@/lib/parameter-types";
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
  const [parameters, setParameters] = useState<LabParameter[]>([]);
  const [days, setDays] = useState(31);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Geçmiş modal
  const [showHistory, setShowHistory] = useState(false);
  const [historySheets, setHistorySheets] = useState<Sheet[]>([]);

  // Parametre ekle / sil (admin)
  const [showAddParameter, setShowAddParameter] = useState(false);
  const [newParameterName, setNewParameterName] = useState("");
  const [parameterActionLoading, setParameterActionLoading] = useState(false);
  const [parameterActionError, setParameterActionError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LabParameter | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showReorderParameters, setShowReorderParameters] = useState(false);

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  // Sheet yükle
  const loadSheet = async (year: number, month: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/sheet?year=${year}&month=${month}`);
      const data = await res.json();

      if (!res.ok) {
        setLoadError(data.error || "Sayfa yüklenemedi");
        return;
      }

      if (!data.sheet) {
        setLoadError("Sheet verisi alınamadı");
        return;
      }

      const params = (data.parameters || []) as LabParameter[];
      if (params.length === 0) {
        setLoadError(
          "Parametre listesi boş. Kayıtlı veriler gösterilemiyor; kaydetmeyin."
        );
      }

      setSheet(data.sheet);
      setRows(data.sheet.rows);
      setParameters(params);
      setDays(getDaysInMonth(year, month));
    } catch (error) {
      console.error("Sheet yükleme hatası:", error);
      setLoadError("Bağlantı hatası — sayfa yeniden yüklenebilir.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
    loadSheet(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Kullanıcı rolünü kontrol et ve kullanıcı adını al
  const checkUserRole = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.user.role === "admin");
        setUsername(data.user.username);
      }
    } catch (error) {
      console.error("Role check error:", error);
    }
  };

  // Hücre değiştir
  const handleCellChange = (parameterId: string, dayIndex: number, value: string) => {
    setRows((prev) => {
      const newRows = { ...prev };
      if (!newRows[parameterId]) {
        newRows[parameterId] = Array(days).fill("");
      }
      const updatedRow = [...(newRows[parameterId] || [])];
      updatedRow[dayIndex] = value;
      newRows[parameterId] = updatedRow;
      return newRows;
    });
  };

  const handleAddParameter = async () => {
    const name = newParameterName.trim();
    if (!name) {
      setParameterActionError("Parametre adı gerekli");
      return;
    }

    setParameterActionLoading(true);
    setParameterActionError("");

    try {
      const res = await fetch("/api/admin/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          year: currentYear,
          month: currentMonth,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setParameterActionError(data.error || "Parametre eklenemedi");
        return;
      }

      const param = data.parameter as LabParameter;
      setParameters((prev) =>
        [...prev, param].sort((a, b) => a.sortOrder - b.sortOrder)
      );
      setRows((prev) => ({
        ...prev,
        [param.id]: Array(days).fill(""),
      }));
      setNewParameterName("");
      setShowAddParameter(false);
    } catch {
      setParameterActionError("Sunucu hatası");
    } finally {
      setParameterActionLoading(false);
    }
  };

  const handleConfirmDeleteParameter = async () => {
    if (!deleteTarget) return;

    setParameterActionLoading(true);
    setParameterActionError("");

    try {
      const res = await fetch(
        `/api/admin/parameters/${deleteTarget.id}?year=${currentYear}&month=${currentMonth}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        setParameterActionError(data.error || "Parametre kaldırılamadı");
        return;
      }

      setParameters((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setParameterActionError("Sunucu hatası");
    } finally {
      setParameterActionLoading(false);
    }
  };

  // Kaydet
  const handleSave = async () => {
    if (!sheet) return;
    if (parameters.length === 0) {
      alert(
        "Parametre listesi yüklenemedi. Veri güvenliği nedeniyle kayıt engellendi."
      );
      return;
    }
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
    if (parameters.length === 0) {
      alert(
        "Parametre listesi yüklenemedi. Veri güvenliği nedeniyle işlem durduruldu."
      );
      return;
    }
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

  // Şifre değiştir
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Yeni şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      alert("Şifre en az 6 karakter olmalı");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Şifre başarıyla değiştirildi");
        setShowChangePasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error || "Şifre değiştirilemedi");
      }
    } catch (error) {
      alert("Sunucu hatası");
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
    parameters.forEach((param) => {
      const row = [param.name];
      const values = rows[param.id] || [];
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
              <>
                <Button
                  onClick={() => setShowReorderParameters(true)}
                  variant="outline"
                  size="sm"
                >
                  Satırları Sırala
                </Button>
                <Button
                  onClick={() => {
                    setParameterActionError("");
                    setShowAddParameter(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  + Satır Ekle
                </Button>
                <Button
                  onClick={() => router.push("/admin/users")}
                  variant="outline"
                  size="sm"
                >
                  👤 Kullanıcılar
                </Button>
              </>
            )}

            {username && (
              <span className="text-sm font-medium text-slate-700">
                Kullanıcı: {username}
              </span>
            )}

            <Button 
              onClick={() => setShowChangePasswordModal(true)} 
              variant="outline" 
              size="sm"
            >
              Şifre Değiştir
            </Button>

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
        {loadError && (
          <div
            className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm print:hidden"
            role="alert"
          >
            {loadError}
          </div>
        )}
        <MonthTable
          parameters={parameters}
          rows={rows}
          days={days}
          isAdmin={isAdmin}
          onChange={handleCellChange}
          onDeleteParameter={isAdmin ? (p) => setDeleteTarget(p) : undefined}
        />
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

      <ParameterReorderModal
        open={showReorderParameters}
        onOpenChange={setShowReorderParameters}
        parameters={parameters}
        year={currentYear}
        month={currentMonth}
        onSaved={(next) => setParameters(next)}
      />

      {/* Parametre Ekle Modal */}
      <Dialog open={showAddParameter} onOpenChange={setShowAddParameter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Parametre Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Parametre Adı</label>
              <Input
                value={newParameterName}
                onChange={(e) => setNewParameterName(e.target.value)}
                placeholder="Örn: OPTİK BEYAZLIK"
                disabled={parameterActionLoading}
              />
            </div>
            {parameterActionError && (
              <p className="text-sm text-red-600">{parameterActionError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                disabled={parameterActionLoading}
                onClick={() => {
                  setShowAddParameter(false);
                  setNewParameterName("");
                  setParameterActionError("");
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleAddParameter}
                disabled={parameterActionLoading}
              >
                {parameterActionLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Parametre Sil Onay */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setParameterActionError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Parametreyi Kaldır</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            <strong>{deleteTarget?.name}</strong> parametresini kaldırmak istediğinize emin misiniz?
            <br />
            <br />
            Bu işlem geçmiş kayıtları silmez. Parametre bu dönemden itibaren tabloda gösterilmeyecektir.
          </p>
          {parameterActionError && (
            <p className="text-sm text-red-600">{parameterActionError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              disabled={parameterActionLoading}
              onClick={() => setDeleteTarget(null)}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              disabled={parameterActionLoading}
              onClick={handleConfirmDeleteParameter}
            >
              {parameterActionLoading ? "Kaldırılıyor..." : "Kaldır"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Şifre Değiştir Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Eski Şifre</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Eski şifrenizi girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yeni Şifre</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifrenizi girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yeni Şifre (Tekrar)</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }} 
                variant="outline"
              >
                İptal
              </Button>
              <Button onClick={handleChangePassword}>
                Değiştir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
