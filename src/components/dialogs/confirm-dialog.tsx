"use client";
import { useEffect } from "react";
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // ปิดด้วยคีย์บอร์ดได้ (ตาม AI.md: dialog ต้องใช้งานด้วยคีย์บอร์ดได้) — ฟังเฉพาะตอนเปิดอยู่
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div
      className="confirm-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        // เทียบ target กับ currentTarget โดยตรง ไม่ใช่แค่ "คลิกนอกกล่อง" เพื่อไม่ให้การลาก mousedown
        // จากในกล่องมาปล่อยที่ฉากหลังทำให้ dialog ปิดโดยไม่ตั้งใจ
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div className="confirm-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          {/* autoFocus เพื่อให้กด Enter ยืนยันได้ทันทีที่ dialog เปิด */}
          <button autoFocus className={`btn ${danger ? "danger" : "primary"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
