// app/booking/layout.tsx
import React, { ReactNode } from "react";

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* Bisa tambahkan layout khusus booking di sini */}
      {children}
    </div>
  );
}
