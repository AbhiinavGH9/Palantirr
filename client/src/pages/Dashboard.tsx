import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { WorldMap } from "@/components/map/WorldMap";
import { ConflictDetailSheet } from "@/components/dashboard/ConflictDetailSheet";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLastUpdated } from "@/hooks/use-conflicts";
import { format } from "date-fns";
import { Menu, ShieldAlert, AlertTriangle } from "lucide-react";

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

            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="pointer-events-auto tactical-border bg-card/80 backdrop-blur px-3 py-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 rounded-sm shadow-xl">
                    <ShieldAlert className="w-4 h-4" /> Disclaimer
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-card border border-border shadow-2xl p-6 rounded-sm">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl text-primary font-bold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" /> LEGAL AND OPERATIONAL DISCLAIMER
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="text-sm font-mono text-foreground/80 leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
                    <div className="bg-background border border-border p-4 rounded-sm">
                      <h4 className="text-primary font-bold mb-2 uppercase">Legal Disclaimer</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>This application aggregates publicly available information from various sources for informational purposes only.</li>
                        <li>Data accuracy, completeness, and real-time availability cannot be fully guaranteed.</li>
                        <li>The platform does not claim ownership of any third-party data displayed.</li>
                        <li>All trademarks, brand names, and logos belong to their respective owners.</li>
                        <li>The service is provided “as is” without warranties of any kind.</li>
                        <li>The developers are not liable for decisions or actions taken based on the information shown in this application.</li>
                        <li>Users are encouraged to consult official government statements, verified news organizations, and authoritative sources for critical decisions or interpretations.</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-950/20 border border-yellow-900/50 p-4 rounded-sm">
                      <h4 className="text-yellow-500 font-bold mb-2 uppercase">*Note on Map of India*</h4>
                      <ul className="list-disc list-inside space-y-1 text-yellow-500/80">
                        <li>We sincerely apologize if the map displayed in the app does not perfectly match the official map of India.</li>
                        <li>Due to limitations in available TSX map assets during development, an alternative map graphic was used.</li>
                        <li>We respect the sovereignty and territorial integrity of India and will update the map with the correct official version as soon as a suitable asset becomes available.</li>
                      </ul>
                    </div>
                  </DialogDescription>
                  <DialogFooter className="mt-4 border-t border-border pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" className="font-mono text-xs uppercase tactical-border hover:bg-primary/20 hover:text-primary">Acknowledge</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
