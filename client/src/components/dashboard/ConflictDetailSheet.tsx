import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConflict } from "@/hooks/use-conflicts";
import { format } from "date-fns";
import { AlertTriangle, Clock, ShieldCheck, Info, MapPin, Skull, Users, Link as LinkIcon, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ConflictDetailSheetProps {
  conflictId: number | null;
  onClose: () => void;
}

export function ConflictDetailSheet({ conflictId, onClose }: ConflictDetailSheetProps) {
  const { data: conflict, isLoading } = useConflict(conflictId);

  if (!conflictId) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-400 bg-green-400/10 border-green-400/30";
    if (score >= 50) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    return "text-red-400 bg-red-400/10 border-red-400/30";
  };

  const getIntensityColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-600/10 border-red-600/30";
    if (score >= 50) return "text-red-400 bg-red-400/10 border-red-400/30";
    if (score >= 20) return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  };

  return (
    <Sheet open={conflictId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg bg-card/95 backdrop-blur-xl border-l border-primary/20 p-0 overflow-y-auto">
        {isLoading || !conflict ? (
          <div className="p-6 space-y-6">
            <Skeleton className="h-10 w-3/4 bg-primary/20" />
            <Skeleton className="h-24 w-full bg-secondary" />
            <Skeleton className="h-64 w-full bg-secondary" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Tactical Header */}
            <div className="p-6 border-b border-border bg-background/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`font-mono rounded-sm text-[10px] ${getIntensityColor(conflict.intensityScore)}`}>
                    INTENSITY: {conflict.intensityScore}/100
                  </Badge>
                  <Badge variant="outline" className={`font-mono rounded-sm text-[10px] ${getConfidenceColor(conflict.confidenceScore)} flex items-center gap-1`}>
                    {conflict.confidenceScore < 50 ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    CONFIDENCE: {conflict.confidenceScore}%
                  </Badge>
                </div>
                <SheetTitle className="text-3xl font-display text-foreground tracking-wide">
                  {conflict.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-4 font-mono text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    {conflict.countries.join(", ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    Updated: {conflict.lastUpdated ? format(new Date(conflict.lastUpdated), "yyyy-MM-dd HH:mm") : 'N/A'}
                  </span>
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Content Tabs */}
            <div className="p-6 flex-1">
              <Tabs defaultValue="intel" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 bg-background border border-border rounded-sm h-10 mb-6">
                  <TabsTrigger value="intel" className="font-mono text-xs uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">Intel</TabsTrigger>
                  <TabsTrigger value="casualties" className="font-mono text-xs uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">Casualties</TabsTrigger>
                  <TabsTrigger value="sources" className="font-mono text-xs uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">Sources</TabsTrigger>
                </TabsList>

                {/* INTEL TAB */}
                <TabsContent value="intel" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="tactical-border p-4 bg-background">
                      <h4 className="text-xs font-mono text-primary uppercase mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Conflict Overview
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Start Date</p>
                          <p className="text-sm font-mono text-foreground">
                            {conflict.startDate ? format(new Date(conflict.startDate), "MMM yyyy") : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Status</p>
                          <p className="text-sm font-mono text-red-400 font-bold uppercase">Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="tactical-border p-4 bg-background">
                      <h4 className="text-xs font-mono text-primary uppercase mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Troop Strength / Balance
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {conflict.troopStrengthComparison || "Detailed troop strength comparison data currently unavailable or unverified."}
                      </p>
                    </div>

                    {conflict.equipmentLoss && (
                      <div className="tactical-border p-4 bg-background">
                        <h4 className="text-xs font-mono text-primary uppercase mb-2 flex items-center gap-2">
                          <Database className="w-4 h-4" /> Equipment Loss Estimates
                        </h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {conflict.equipmentLoss}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* CASUALTIES TAB */}
                <TabsContent value="casualties" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-sm">
                      <p className="text-[10px] text-red-400/80 font-mono uppercase flex items-center gap-2 mb-1">
                        <Skull className="w-3 h-3" /> Total Estimated Deaths
                      </p>
                      <p className="text-3xl font-mono text-red-500 font-bold">
                        {conflict.estimatedDeaths ? new Intl.NumberFormat().format(conflict.estimatedDeaths) : "N/A"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background border border-border p-4 rounded-sm">
                        <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Military Casualties</p>
                        <p className="text-xl font-mono text-foreground">
                          {conflict.militaryDeaths ? new Intl.NumberFormat().format(conflict.militaryDeaths) : "N/A"}
                        </p>
                      </div>
                      <div className="bg-background border border-border p-4 rounded-sm">
                        <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Civilian Casualties</p>
                        <p className="text-xl font-mono text-foreground">
                          {conflict.civilianDeaths ? new Intl.NumberFormat().format(conflict.civilianDeaths) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-sm border border-border mt-4">
                    <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                      <strong>DISCLAIMER:</strong> Casualty figures are aggregated estimates from available sources. In active conflicts, verification is extremely difficult and figures may be subject to bias or manipulation. See the Sources tab for verification tiers.
                    </p>
                  </div>
                </TabsContent>

                {/* SOURCES TAB */}
                <TabsContent value="sources" className="space-y-6 mt-0">
                  
                  {/* Transparency Panel */}
                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-sm mb-6">
                    <h4 className="text-xs font-mono text-primary uppercase mb-2 flex items-center gap-2 font-bold">
                      <ShieldCheck className="w-4 h-4" /> Verification Framework
                    </h4>
                    <p className="text-xs text-foreground/80 mb-2">
                      Data aggregated automatically. Confidence score ({conflict.confidenceScore}%) is calculated based on source tier density and verification frequency.
                    </p>
                    {conflict.methodologySummary && (
                      <p className="text-[10px] font-mono text-muted-foreground mt-2 border-t border-primary/20 pt-2">
                        Methodology: {conflict.methodologySummary}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-muted-foreground uppercase mb-2">Primary Sources</h4>
                    {conflict.sources && conflict.sources.length > 0 ? (
                      conflict.sources.map((source) => (
                        <div key={source.id} className="flex flex-col bg-background border border-border p-3 rounded-sm hover:border-primary/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-display font-semibold">{source.name}</span>
                            <Badge variant="outline" className={`text-[9px] font-mono rounded-none ${
                              source.tier === 'A' ? 'border-green-500/50 text-green-400' :
                              source.tier === 'B' ? 'border-yellow-500/50 text-yellow-400' :
                              'border-red-500/50 text-red-400'
                            }`}>
                              TIER {source.tier}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground mt-1">
                            <span>Checked: {format(new Date(source.lastChecked), "MMM dd, HH:mm")}</span>
                            <a href={source.url} target="_blank" rel="noreferrer" className="text-primary/70 hover:text-primary flex items-center gap-1 transition-colors">
                              <LinkIcon className="w-3 h-3" /> Link
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground font-mono italic">No source data available.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
