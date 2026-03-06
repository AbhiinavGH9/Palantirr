import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { useConflicts, useGlobalSummary } from "@/hooks/use-conflicts";
import { format } from "date-fns";
import { AlertCircle, Activity, Skull, ShieldAlert, Globe, Crosshair } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  onSelectConflict: (id: number) => void;
}

export function AppSidebar({ onSelectConflict }: AppSidebarProps) {
  const { data: summary, isLoading: isLoadingSummary } = useGlobalSummary();
  const { data: conflicts, isLoading: isLoadingConflicts } = useConflicts();

  // Sort conflicts by intensity for the sidebar list
  const sortedConflicts = conflicts?.slice().sort((a, b) => b.intensityScore - a.intensityScore) || [];

  return (
    <Sidebar className="border-r border-border bg-card/95 backdrop-blur">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
            <img src="/favicon.png" alt="Palantir" className="w-full h-full object-contain relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-primary text-shadow-neon tracking-widest leading-none">
              Palantir
            </h1>
            <p className="text-[10px] text-primary/70 font-mono tracking-widest uppercase">Global Threat Matrix</p>
          </div>
        </div>
      </SidebarHeader>

      <div className="px-4 py-2 border-b border-border">
        <a href="/admin" className="flex items-center justify-center gap-2 w-full text-xs font-mono font-bold tracking-widest uppercase bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 hover:text-red-400 p-2 rounded-sm transition-all shadow-[0_0_10px_rgba(255,0,0,0.1)]">
          <ShieldAlert className="w-3 h-3" /> Admin Overseer
        </a>
      </div>

      <SidebarContent className="p-4 gap-6">

        {/* SUMMARY STATS */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            <Activity className="h-3 w-3" /> System Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="tactical-border bg-background p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Active Zones</span>
                {isLoadingSummary ? (
                  <Skeleton className="h-8 w-12 bg-primary/20" />
                ) : (
                  <span className="text-3xl font-display font-bold text-red-500 text-shadow-red leading-none">
                    {summary?.activeConflictsCount || 0}
                  </span>
                )}
              </div>
              <div className="tactical-border bg-background p-3 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Total KIA/WIA</span>
                {isLoadingSummary ? (
                  <Skeleton className="h-8 w-16 bg-primary/20" />
                ) : (
                  <span className="text-xl font-mono font-bold text-orange-400 leading-none">
                    {summary?.totalEstimatedCasualties ?
                      new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(summary.totalEstimatedCasualties)
                      : 0}
                  </span>
                )}
              </div>
            </div>

            {summary?.mostIntenseConflict && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />
                  <span className="text-[10px] font-mono text-destructive font-bold uppercase tracking-widest">Critical Threat Level</span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground truncate">
                  {summary.mostIntenseConflict.name}
                </h3>
                <div className="flex justify-between items-end mt-2">
                  <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive font-mono rounded-none">
                    INT: {summary.mostIntenseConflict.intensityScore}/100
                  </Badge>
                  <button
                    onClick={() => onSelectConflict(summary.mostIntenseConflict!.id)}
                    className="text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-widest underline decoration-primary/30 underline-offset-4"
                  >
                    View Intel
                  </button>
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CONFLICT LIST */}
        <SidebarGroup className="p-0 flex-1 overflow-hidden flex flex-col">
          <SidebarGroupLabel className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            <Crosshair className="h-3 w-3" /> Monitored Zones
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-auto pr-2">
            <SidebarMenu>
              {isLoadingConflicts ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <Skeleton className="h-12 w-full bg-secondary mb-2 rounded-sm" />
                  </SidebarMenuItem>
                ))
              ) : (
                sortedConflicts.map((conflict) => {
                  // Determine color based on intensity
                  let colorClass = "text-yellow-500";
                  let borderClass = "border-yellow-500/20 hover:border-yellow-500/50";
                  let bgClass = "bg-yellow-500/5 hover:bg-yellow-500/10";

                  if (conflict.intensityScore >= 80) {
                    colorClass = "text-red-600";
                    borderClass = "border-red-600/20 hover:border-red-600/50";
                    bgClass = "bg-red-600/5 hover:bg-red-600/10";
                  } else if (conflict.intensityScore >= 50) {
                    colorClass = "text-red-400";
                    borderClass = "border-red-400/20 hover:border-red-400/50";
                    bgClass = "bg-red-400/5 hover:bg-red-400/10";
                  } else if (conflict.intensityScore >= 20) {
                    colorClass = "text-orange-400";
                    borderClass = "border-orange-400/20 hover:border-orange-400/50";
                    bgClass = "bg-orange-400/5 hover:bg-orange-400/10";
                  }

                  return (
                    <SidebarMenuItem key={conflict.id} className="mb-2">
                      <SidebarMenuButton
                        asChild
                        onClick={() => onSelectConflict(conflict.id)}
                        className={`w-full flex flex-col items-start p-3 h-auto border rounded-sm transition-all duration-200 cursor-pointer ${bgClass} ${borderClass}`}
                      >
                        <div>
                          <div className="flex justify-between w-full items-center mb-1">
                            <span className="font-display font-semibold truncate text-foreground text-base max-w-[160px]">
                              {conflict.name}
                            </span>
                            <span className={`font-mono text-xs font-bold ${colorClass}`}>
                              {conflict.intensityScore}
                            </span>
                          </div>
                          <div className="flex justify-between w-full items-center text-[10px] text-muted-foreground font-mono uppercase">
                            <span className="truncate max-w-[120px]">
                              {conflict.countries.join(", ")}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              {conflict.confidenceScore}%
                            </span>
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <div className="p-4 border-t border-border bg-black/50 text-center">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
          Made by Abhinav Shukla
          <br />
          under Shukla Technologies In India
        </p>
      </div>
    </Sidebar>
  );
}
