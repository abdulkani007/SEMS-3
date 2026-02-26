"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { DataProvider } from "./contexts/DataContext";
import { NotificationProvider } from "./contexts/NotificationContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DataProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </DataProvider>
    </SessionProvider>
  );
}






