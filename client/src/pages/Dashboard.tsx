import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { WorldMap } from "@/components/map/WorldMap";
import { ConflictDetailSheet } from "@/components/dashboard/ConflictDetailSheet";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLastUpdated } from "@/hooks/use-conflicts";
import { format } from "date-fns";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const [selectedConflictId, setSelectedConflictId] = useState<number | null>(null);
  const { data: timestampData } = useLastUpdated();

  // Tactical styling for Sidebar Provider
  const sidebarStyle = {
    "--sidebar-width": "22rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-primary/30">
        
        <AppSidebar onSelectConflict={setSelectedConflictId} />
        
        <main className="flex-1 relative flex flex-col min-w-0 h-full overflow-hidden">
          
          {/* Top HUD / Header */}
          <header className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
            <SidebarTrigger className="pointer-events-auto bg-card border border-border shadow-lg hover:border-primary/50 transition-colors rounded-sm w-10 h-10 flex items-center justify-center text-foreground hover:text-primary">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>

            <div className="pointer-events-auto tactical-border bg-card/80 backdrop-blur px-4 py-2 font-mono text-xs flex items-center gap-4 rounded-sm shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-muted-foreground uppercase">System:</span>
                <span className="text-green-400 font-bold">ONLINE</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="text-primary uppercase flex gap-2">
                <span className="text-muted-foreground">Last Sync:</span>
                {timestampData?.lastUpdated ? format(new Date(timestampData.lastUpdated), "HH:mm 'IST'") : "PENDING"}
              </div>
            </div>
          </header>

          {/* Map Area */}
          <div className="flex-1 relative border-l border-border h-full w-full">
             <WorldMap onSelectConflict={setSelectedConflictId} />
             
             {/* Map overlays / legend */}
             <div className="absolute bottom-6 right-6 pointer-events-none">
               <div className="tactical-border bg-card/90 backdrop-blur p-3 rounded-sm">
                 <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Threat Level Scale</p>
                 <div className="flex flex-col gap-2 font-mono text-[10px] text-foreground">
                   <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-800 border border-red-500 inline-block"></span> 80+ Critical</div>
                   <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 border border-red-300 inline-block"></span> 50-79 Severe</div>
                   <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 border border-orange-300 inline-block"></span> 20-49 Elevated</div>
                   <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 border border-yellow-300 inline-block"></span> 0-19 Monitored</div>
                 </div>
               </div>
             </div>
          </div>
          
        </main>

        <ConflictDetailSheet 
          conflictId={selectedConflictId} 
          onClose={() => setSelectedConflictId(null)} 
        />
        
      </div>
    </SidebarProvider>
  );
}
