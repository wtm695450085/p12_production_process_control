"use client";

import { useDemoStore } from "@/store/useDemoStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { ModuleHeader } from "./ModuleHeader";
import { InboxBanner } from "./WorkflowUI";
import { RouteConfirmation } from "./WorkflowUI";
import { SystemMap } from "./SystemMap";
import { AccessManagement } from "./AccessManagement";
import { AccessGate } from "./AccessGate";
import { DocumentArchive } from "./DocumentArchive";
import { Module1Screen, Module2Screen, Module3Screen, Module4Screen, Module5Screen, Module6Screen, Module7Screen, Module8Screen, Module9Screen } from "./screens/ModuleScreens";
import type { ModuleId } from "@/lib/types";

const screens: Record<ModuleId, React.ComponentType> = { 1: Module1Screen, 2: Module2Screen, 3: Module3Screen, 4: Module4Screen, 5: Module5Screen, 6: Module6Screen, 7: Module7Screen, 8: Module8Screen, 9: Module9Screen };

export function AppShell() {
  const moduleId = useDemoStore((s) => s.currentModule);
  const moduleTabs = useDemoStore((s) => s.moduleTabs);
  const Screen = moduleId === 0 || moduleId === 10 ? null : screens[moduleId];
  return <div className="flex h-screen min-w-[1280px] overflow-hidden bg-(--color-bg)">
    <KeyboardShortcuts /><Sidebar />
    <div className="flex min-w-0 flex-1 flex-col"><TopBar /><main className="min-w-0 flex-1 overflow-auto">
      {moduleId === 0 ? <SystemMap /> : moduleId === 10 ? <AccessManagement /> : <AccessGate moduleId={moduleId}><ModuleHeader moduleId={moduleId} /><InboxBanner moduleId={moduleId} />{moduleTabs[moduleId]==="archiwum"?<DocumentArchive moduleId={moduleId}/>:Screen&&<Screen />}</AccessGate>}
    </main></div><RouteConfirmation />
  </div>;
}
