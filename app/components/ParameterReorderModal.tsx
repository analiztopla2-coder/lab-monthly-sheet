"use client";

import { useCallback, useEffect, useState } from "react";
import type { LabParameter } from "@/lib/parameter-types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ParameterReorderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parameters: LabParameter[];
  year: number;
  month: number;
  onSaved: (parameters: LabParameter[]) => void;
}

export default function ParameterReorderModal({
  open,
  onOpenChange,
  parameters,
  year,
  month,
  onSaved,
}: ParameterReorderModalProps) {
  const [draft, setDraft] = useState<LabParameter[]>([]);
  const [expectedOrderIds, setExpectedOrderIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      const copy = [...parameters];
      setDraft(copy);
      setExpectedOrderIds(copy.map((p) => p.id));
      setError("");
      setSuccess("");
    }
  }, [open, parameters]);

  const moveItem = useCallback((from: number, to: number) => {
    setDraft((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/parameters/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          expectedOrderIds,
          orderedIds: draft.map((p) => p.id),
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setError(
          data.error ||
            "Satır sırası başka bir yönetici tarafından değiştirilmiş. Güncel sıra yeniden yüklendi."
        );
        if (data.parameters) {
          const refreshed = data.parameters as LabParameter[];
          setDraft(refreshed);
          setExpectedOrderIds(refreshed.map((p) => p.id));
          onSaved(refreshed);
        }
        return;
      }

      if (!res.ok) {
        if (res.status === 403) {
          setError("Bu işlem için yönetici yetkisi gerekli.");
        } else {
          setError(data.error || "Satır sırası kaydedilemedi.");
        }
        return;
      }

      setSuccess(data.message || "Satır sırası kaydedildi.");
      const refreshed = (data.parameters || draft) as LabParameter[];
      onSaved(refreshed);
      setTimeout(() => {
        onOpenChange(false);
      }, 400);
    } catch {
      setError("Satır sırası kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    moveItem(dragIndex, index);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Satır Sırasını Düzenle</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 mb-3">
          Satırları sürükleyerek sıralayın. Kaydedilen sıralama tüm kullanıcılar
          için geçerli olacaktır.
        </p>

        <ul className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-2 bg-slate-50">
          {draft.map((param, index) => (
            <li
              key={param.id}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded px-2 py-2"
              onDragOver={(e) => handleDragOver(e, index)}
            >
              <span
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing text-slate-400 select-none px-1"
                title="Sürükle"
                aria-label="Sürükle"
              >
                ≡
              </span>
              <span className="flex-1 text-sm font-medium text-slate-800">
                {param.name}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="text-xs px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-40"
                  disabled={index === 0 || saving}
                  onClick={() => moveItem(index, index - 1)}
                  aria-label="Yukarı"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="text-xs px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-40"
                  disabled={index === draft.length - 1 || saving}
                  onClick={() => moveItem(index, index + 1)}
                  aria-label="Aşağı"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {success && <p className="text-sm text-green-700 mt-2">{success}</p>}

        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button disabled={saving || draft.length === 0} onClick={handleSave}>
            {saving ? "Kaydediliyor..." : "Sıralamayı Kaydet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
