// app/admin/users/page.tsx - Admin Kullanıcı Yönetimi Sayfası
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Select } from "@/app/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { ACTION_LABELS, ACTION_COLORS, ActivityAction } from "@/lib/activity-logger";

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string | null;
  username: string;
  action: ActivityAction;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Aktivite logları
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLimit, setLogsLimit] = useState(20);
  const [logsOffset, setLogsOffset] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string>("");

  // Yeni kullanıcı ekleme modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // Silme onay modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Düzenleme modal
  const [showEditUser, setShowEditUser] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Mevcut kullanıcıyı kontrol et
  useEffect(() => {
    checkAuth();
    loadUsers();
    loadLogs();
  }, []);

  // Logları yeniden yükle (filtre/sayfa değişince)
  useEffect(() => {
    loadLogs();
  }, [logsOffset, selectedAction]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.user.role !== "admin") {
        alert("Bu sayfaya erişim yetkiniz yok!");
        router.push("/");
        return;
      }
      setCurrentUser(data.user);
    } catch (error) {
      router.push("/login");
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        alert(data.error || "Kullanıcılar yüklenemedi");
      }
    } catch (error) {
      alert("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      let url = `/api/admin/logs?limit=${logsLimit}&offset=${logsOffset}`;
      if (selectedAction) {
        url += `&action=${selectedAction}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.logs || []);
        setLogsTotal(data.total || 0);
      } else {
        console.error("Loglar yüklenemedi:", data.error);
      }
    } catch (error) {
      console.error("Log fetch error:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (!newUsername || !newPassword) {
      setAddError("Kullanıcı adı ve şifre gerekli");
      return;
    }

    if (newPassword.length < 6) {
      setAddError("Şifre en az 6 karakter olmalı");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error || "Kullanıcı eklenemedi");
        return;
      }

      setAddSuccess("Kullanıcı başarıyla eklendi!");
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      loadUsers();
      loadLogs(); // Logları da yenile

      setTimeout(() => {
        setShowAddUser(false);
        setAddSuccess("");
      }, 2000);
    } catch (error) {
      setAddError("Sunucu hatası");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Kullanıcı silinemedi");
        return;
      }

      alert("Kullanıcı silindi!");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadUsers();
      loadLogs(); // Logları da yenile
    } catch (error) {
      alert("Sunucu hatası");
    }
  };

  const confirmDelete = (user: User) => {
    if (currentUser && user.id === currentUser.id) {
      alert("Kendi hesabınızı silemezsiniz!");
      return;
    }
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setEditRole(user.role);
    setEditPassword("");
    setEditError("");
    setEditSuccess("");
    setShowEditUser(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    if (!userToEdit) return;

    // Hiçbir değişiklik yapılmadıysa
    if (!editPassword && editRole === userToEdit.role) {
      setEditError("Hiçbir değişiklik yapılmadı");
      return;
    }

    // Şifre varsa validasyon
    if (editPassword && editPassword.length < 6) {
      setEditError("Şifre en az 6 karakter olmalı");
      return;
    }

    try {
      const updateData: any = {};
      if (editPassword) {
        updateData.password = editPassword;
      }
      if (editRole !== userToEdit.role) {
        updateData.role = editRole;
      }

      const res = await fetch(`/api/admin/users/${userToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Kullanıcı güncellenemedi");
        return;
      }

      setEditSuccess("Kullanıcı başarıyla güncellendi!");
      loadUsers();
      loadLogs(); // Logları da yenile

      setTimeout(() => {
        setShowEditUser(false);
        setEditSuccess("");
        setUserToEdit(null);
      }, 2000);
    } catch (error) {
      setEditError("Sunucu hatası");
    }
  };

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="EMAA Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Kullanıcı Yönetimi
                </h1>
                <p className="text-sm text-slate-600">Admin Panel</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/")} variant="outline" size="sm">
                ← Ana Sayfa
              </Button>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kullanıcılar</CardTitle>
                <CardDescription>
                  Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddUser(true)}>
                + Yeni Kullanıcı Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Henüz kullanıcı yok
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-100">
                    <tr className="border-2 border-slate-300">
                      <th className="text-left py-4 px-4 font-bold border-r-2 border-slate-300 bg-slate-200">
                        Kullanıcı Adı
                      </th>
                      <th className="text-left py-4 px-4 font-bold border-r-2 border-slate-300 bg-slate-200">
                        Rol
                      </th>
                      <th className="text-left py-4 px-4 font-bold border-r-2 border-slate-300 bg-slate-200">
                        Oluşturulma Tarihi
                      </th>
                      <th className="text-right py-4 px-4 font-bold bg-slate-200">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr 
                        key={user.id} 
                        className={`
                          border-2 border-slate-200
                          transition-colors duration-150
                          ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                          hover:bg-blue-50 hover:shadow-md hover:border-blue-300
                        `}
                      >
                        <td className="py-4 px-4 border-r-2 border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base">{user.username}</span>
                            {currentUser && user.id === currentUser.id && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                                Siz
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r-2 border-slate-200">
                          <span
                            className={`inline-block px-3 py-1.5 rounded text-sm font-bold ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 border-2 border-purple-300"
                                : "bg-slate-100 text-slate-800 border-2 border-slate-300"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Kullanıcı"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-base text-slate-700 border-r-2 border-slate-200 font-medium">
                          {new Date(user.created_at).toLocaleString("tr-TR")}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => openEditModal(user)}
                              variant="outline"
                              size="sm"
                              className="font-semibold"
                            >
                              ✏️ Düzenle
                            </Button>
                            <Button
                              onClick={() => confirmDelete(user)}
                              variant="destructive"
                              size="sm"
                              disabled={currentUser && user.id === currentUser.id}
                              className="font-semibold"
                            >
                              🗑️ Sil
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kullanıcı İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Toplam Kullanıcı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Sayısı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {users.filter((u) => u.role === "admin").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kullanıcı Sayısı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {users.filter((u) => u.role === "user").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aktivite Logları */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Aktivite Logları</CardTitle>
                <CardDescription>
                  Kullanıcı aktivitelerini görüntüleyin
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value);
                    setLogsOffset(0);
                  }}
                >
                  <option value="">Tüm Aktiviteler</option>
                  <option value="login">Giriş</option>
                  <option value="logout">Çıkış</option>
                  <option value="login_failed">Başarısız Giriş</option>
                  <option value="password_change">Şifre Değişikliği</option>
                  <option value="user_created">Kullanıcı Oluşturma</option>
                  <option value="user_updated">Kullanıcı Güncelleme</option>
                  <option value="user_deleted">Kullanıcı Silme</option>
                  <option value="sheet_created">Yeni Ay</option>
                  <option value="sheet_updated">Veri Güncelleme</option>
                  <option value="sheet_viewed">Veri Görüntüleme</option>
                </Select>
                <Button
                  onClick={loadLogs}
                  size="sm"
                  variant="outline"
                  disabled={logsLoading}
                >
                  🔄 Yenile
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8 text-slate-600">Yükleniyor...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz log kaydı yok
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {logs.map((log, index) => {
                    const colors = ACTION_COLORS[log.action] || {
                      bg: "bg-gray-100",
                      text: "text-gray-800",
                    };
                    const label = ACTION_LABELS[log.action] || log.action;

                    return (
                      <div
                        key={log.id}
                        className={`
                          border-2 rounded-lg p-4 
                          transition-all duration-150
                          ${index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-300'}
                          hover:shadow-lg hover:border-blue-400 hover:bg-blue-50
                        `}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`inline-block px-3 py-1.5 rounded-md text-sm font-bold border-2 ${colors.bg} ${colors.text}`}
                              >
                                {label}
                              </span>
                              <span className="font-bold text-base text-slate-800">
                                {log.username}
                              </span>
                            </div>
                            {log.details && (
                              <div className="text-base text-slate-700 mb-2 ml-1 font-medium">
                                {log.details}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-slate-600 ml-1 font-medium">
                              <span>
                                🕐 {new Date(log.created_at).toLocaleString("tr-TR")}
                              </span>
                              {log.ip_address && (
                                <span>🌐 {log.ip_address}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-slate-300">
                  <div className="text-base text-slate-700 font-semibold">
                    Toplam {logsTotal} kayıt • Gösterilen: {logsOffset + 1} -{" "}
                    {Math.min(logsOffset + logsLimit, logsTotal)}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setLogsOffset(Math.max(0, logsOffset - logsLimit))}
                      disabled={logsOffset === 0}
                      size="sm"
                      variant="outline"
                      className="font-bold px-4"
                    >
                      ← Önceki
                    </Button>
                    <Button
                      onClick={() => setLogsOffset(logsOffset + logsLimit)}
                      disabled={logsOffset + logsLimit >= logsTotal}
                      size="sm"
                      variant="outline"
                      className="font-bold px-4"
                    >
                      Sonraki →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Yeni Kullanıcı Ekle Modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
            <DialogDescription>
              Sisteme yeni bir kullanıcı ekleyin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
              <Input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Kullanıcı adı"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rol</label>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            {addError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {addSuccess}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Ekle
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddUser(false);
                  setAddError("");
                  setAddSuccess("");
                  setNewUsername("");
                  setNewPassword("");
                  setNewRole("user");
                }}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz!
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <p className="text-sm text-slate-600 mb-4">
                <strong>{userToDelete.username}</strong> kullanıcısını silmek istediğinize emin misiniz?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteUser}
                  variant="destructive"
                  className="flex-1"
                >
                  Evet, Sil
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Düzenleme Modal */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>
              {userToEdit?.username} kullanıcısının bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Yeni Şifre (boş bırakılırsa değişmez)
              </label>
              <Input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="En az 6 karakter (opsiyonel)"
              />
              <p className="text-xs text-slate-500 mt-1">
                Şifreyi değiştirmek istemiyorsanız boş bırakın
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rol</label>
              <Select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            {editError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {editError}
              </div>
            )}
            {editSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {editSuccess}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Güncelle
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditUser(false);
                  setEditError("");
                  setEditSuccess("");
                  setEditPassword("");
                  setUserToEdit(null);
                }}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
