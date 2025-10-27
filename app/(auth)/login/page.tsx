// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Şifre değiştir modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Giriş başarısız");
        setLoading(false);
        return;
      }

      // Başarılı - ana sayfaya yönlendir (tam sayfa yenileme ile cookie'nin okunmasını garanti et)
      window.location.replace("/");
    } catch (err) {
      setError("Sunucu hatası");
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    setChangeSuccess("");

    if (newPassword.length < 6) {
      setChangeError("Yeni şifre en az 6 karakter olmalı");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChangeError(data.error || "Şifre değiştirilemedi");
        return;
      }

      setChangeSuccess(data.message || "Şifre değiştirildi");
      setOldPassword("");
      setNewPassword("");
      
      // 2 saniye sonra modalı kapat ve login'e dön
      setTimeout(() => {
        setShowChangePassword(false);
        setChangeSuccess("");
      }, 2000);
    } catch (err) {
      setChangeError("Sunucu hatası");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="EMAA Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-3xl">LABORATUVAR</CardTitle>
          <CardDescription>Aylık Takip Sistemi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınız"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreniz"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowChangePassword(true)}
            >
              Şifre Değiştir
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Şifre Değiştir Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Değiştir</DialogTitle>
            <DialogDescription>
              Eski ve yeni şifrenizi girin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Eski Şifre</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Yeni Şifre</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {changeError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {changeError}
              </div>
            )}
            {changeSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {changeSuccess}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Değiştir
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePassword(false);
                  setChangeError("");
                  setChangeSuccess("");
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
