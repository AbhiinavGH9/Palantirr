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
                        <Info className="w-4 h-4" /> Conflict Overview: <span className="text-foreground font-bold tracking-wide">{conflict.name}</span>
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

                    {/* ALLIANCES & BELLIGERENTS */}
                    <div className="tactical-border p-4 bg-background">
                      <h4 className="text-sm font-display text-primary uppercase mb-4 flex items-center gap-2 font-bold tracking-wide border-b border-primary/20 pb-2">
                        <ShieldCheck className="w-5 h-5" /> Known Alliances & Coalitions
                      </h4>
                      {conflict.alliances && conflict.alliances.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {conflict.alliances.map((allianceGroup: string[], idx: number) => (
                            <div key={idx} className="bg-background border border-primary/30 p-4 rounded-md shadow-inner">
                              <p className="text-xs uppercase font-mono text-primary/80 mb-3 pb-2 border-b border-primary/20 font-bold tracking-widest">
                                Coalition {idx + 1}
                              </p>
                              <div className="flex flex-wrap gap-2.5">
                                {allianceGroup.map(nation => (
                                  <Badge key={nation} variant="outline" className="font-mono text-[11px] bg-primary/10 border-primary/50 text-foreground font-semibold tracking-wide px-2.5 py-1">
                                    {nation}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                          Independent Actors / No confirmed coalitions
                        </p>
                      )}
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

                    {/* DOMINATION BAR */}
                    <div className="tactical-border p-4 bg-background">
                      <h4 className="text-xs font-mono text-primary uppercase mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Tactical Domination
                      </h4>
                      {conflict.dominatingCountry ? (
                        <div className="mt-4">
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-mono text-green-400 font-bold uppercase">{conflict.dominatingCountry} Leading</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">Opposition</span>
                          </div>
                          <div className="w-full h-3 bg-red-950/30 rounded-sm overflow-hidden flex">
                            <div className="h-full bg-green-500/80 w-3/4 animate-pulse"></div>
                            <div className="h-full bg-red-500/50 w-1/4"></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/80 leading-relaxed italic">Stalemate / Unclear advantage</p>
                      )}
                    </div>

                    {/* PROMINENT FIGURES DEATHS */}
                    <div className="tactical-border p-4 bg-background">
                      <h4 className="text-xs font-mono text-primary uppercase mb-2 flex items-center gap-2">
                        <Skull className="w-4 h-4" /> Major Figure Casualties
                      </h4>
                      {conflict.prominentFiguresDeaths && conflict.prominentFiguresDeaths.length > 0 ? (
                        <ul className="space-y-2 mt-2">
                          {conflict.prominentFiguresDeaths.map((figure: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2 text-sm font-mono text-red-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              {figure}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-red-900/50 pl-2">No major commander casualties reported.</p>
                      )}
                    </div>

                  </div>
                </TabsContent>

                {/* CASUALTIES TAB */}
                <TabsContent value="casualties" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-green-500/20 border-l border-b border-green-500/30 text-[8px] font-mono text-green-400 uppercase tracking-wider rounded-bl-sm">
                        Consensus Verified
                      </div>
                      <p className="text-[10px] text-red-400/80 font-mono uppercase flex items-center gap-2 mb-1 pt-2">
                        <Skull className="w-3 h-3" /> Total Estimated Deaths
                      </p>
                      <p className="text-3xl font-mono text-red-500 font-bold">
                        {conflict.estimatedDeaths !== null && conflict.estimatedDeaths !== undefined
                          ? new Intl.NumberFormat().format(conflict.estimatedDeaths)
                          : "DATA PENDING"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background border border-border p-4 rounded-sm">
                        <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Military Casualties</p>
                        <p className="text-xl font-mono text-foreground font-semibold">
                          {conflict.militaryDeaths !== null && conflict.militaryDeaths !== undefined
                            ? new Intl.NumberFormat().format(conflict.militaryDeaths)
                            : "DATA PENDING"}
                        </p>
                      </div>
                      <div className="bg-background border border-border p-4 rounded-sm">
                        <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Civilian Casualties</p>
                        <p className="text-xl font-mono text-foreground font-semibold">
                          {conflict.civilianDeaths !== null && conflict.civilianDeaths !== undefined
                            ? new Intl.NumberFormat().format(conflict.civilianDeaths)
                            : "DATA PENDING"}
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
                  <div className="bg-primary/10 border border-primary/40 p-5 rounded-sm mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 blur-xl rounded-full mix-blend-screen"></div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono text-primary uppercase mb-1 flex items-center gap-2 font-bold tracking-wider">
                          <ShieldCheck className="w-5 h-5 text-green-400" /> Multi-Source Consensus Verified
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed max-w-[90%] font-mono">
                          All figures (casualties, dominant forces, prominent deaths) are automatically cross-referenced and verified across <strong className="text-green-400">Wikipedia, Reddit Intel, X/Twitter reports, and Gov Press Releases</strong>. Extreme outliers and propaganda figures are mitigated via median-averaging algorithms.
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-background/50 border border-primary/20 rounded-sm">
                        <span className="text-2xl font-bold font-mono text-green-400">{conflict.confidenceScore}%</span>
                        <span className="text-[9px] uppercase font-mono text-muted-foreground">Confidence</span>
                      </div>
                    </div>
                    {conflict.methodologySummary && (
                      <p className="text-[10px] font-mono text-muted-foreground mt-4 border-t border-primary/20 pt-3">
                        <strong className="text-primary/70">Scraper Methodology:</strong> {conflict.methodologySummary}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-muted-foreground uppercase mb-2">Primary Sources for <span className="text-primary font-bold">{conflict.name}</span></h4>
                    {conflict.sources && conflict.sources.length > 0 ? (
                      conflict.sources.map((source) => (
                        <div key={source.id} className="flex flex-col bg-background border border-border p-3 rounded-sm hover:border-primary/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-display font-semibold">{source.name}</span>
                            <Badge variant="outline" className={`text-[9px] font-mono rounded-none ${source.tier === 'A' ? 'border-green-500/50 text-green-400' :
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
