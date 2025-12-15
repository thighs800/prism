import { MaieuticSidebar } from "@/components/chat/MaieuticSidebar";
import { HybridEditor } from "@/components/editor/HybridEditor";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <MaieuticSidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <HybridEditor />
      </div>
    </main>
  );
}
