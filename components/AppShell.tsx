"use client";

import { useDemoStore } from "@/store/useDemoStore";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ProduktyScreen } from "@/components/screens/ProduktyScreen";
import { KalkulacjaScreen } from "@/components/screens/KalkulacjaScreen";
import { RaportZmianowyScreen } from "@/components/screens/RaportZmianowyScreen";
import { RozliczenieScreen } from "@/components/screens/RozliczenieScreen";
import { RentownoscScreen } from "@/components/screens/RentownoscScreen";

export function AppShell() {
  const currentScreen = useDemoStore((s) => s.currentScreen);

  return (
    <div className="flex h-screen min-w-[1280px] overflow-hidden bg-(--color-bg)">
      <KeyboardShortcuts />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 overflow-auto">
          {currentScreen === 1 && <ProduktyScreen />}
          {currentScreen === 2 && <KalkulacjaScreen />}
          {currentScreen === 3 && <RaportZmianowyScreen />}
          {currentScreen === 4 && <RozliczenieScreen />}
          {currentScreen === 5 && <RentownoscScreen />}
        </main>
      </div>
    </div>
  );
}
