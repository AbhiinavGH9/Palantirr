import { useState, useMemo } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from "react-simple-maps";
import { useConflicts } from "@/hooks/use-conflicts";
import { Skeleton } from "@/components/ui/skeleton";

// Using a reliable unpkg URL for 110m resolution countries
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  onSelectConflict: (conflictId: number) => void;
}

export function WorldMap({ onSelectConflict }: WorldMapProps) {
  const { data: conflicts, isLoading } = useConflicts();
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Map countries to their highest intensity conflict
  const countryConflictMap = useMemo(() => {
    const map = new Map<string, { intensity: number, id: number, name: string }>();
    if (!conflicts) return map;

    conflicts.forEach(conflict => {
      conflict.countries.forEach(country => {
        const existing = map.get(country);
        if (!existing || existing.intensity < conflict.intensityScore) {
          map.set(country, {
            intensity: conflict.intensityScore,
            id: conflict.id,
            name: conflict.name
          });
        }
      });
    });
    return map;
  }, [conflicts]);

  const getFillColor = (countryName: string, isHovered: boolean) => {
    const conflictData = countryConflictMap.get(countryName);
    
    // Base tactical map colors
    if (!conflictData) {
      return isHovered ? "#1e293b" : "#0f172a"; // Lighter slate on hover, dark slate base
    }

    const { intensity } = conflictData;
    
    // Tactical threat colors
    if (intensity >= 80) return isHovered ? "#b91c1c" : "#991b1b"; // Dark Red
    if (intensity >= 50) return isHovered ? "#f87171" : "#ef4444"; // Red
    if (intensity >= 20) return isHovered ? "#fb923c" : "#f97316"; // Orange
    return isHovered ? "#facc15" : "#eab308"; // Yellow
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-primary uppercase tracking-widest text-sm animate-pulse">Initializing Map Geometry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-background overflow-hidden cursor-crosshair">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <ComposableMap 
        projectionConfig={{ scale: 160 }}
        className="w-full h-full"
      >
        <ZoomableGroup 
          center={[0, 20]} 
          zoom={1}
          maxZoom={10}
          minZoom={1}
          filterZoomEvent={(evt: any) => {
            // Standard scroll zoom filter
            return evt.type === "wheel" ? true : false;
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const conflictData = countryConflictMap.get(countryName);
                const isHovered = hoveredCountry === countryName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setHoveredCountry(countryName);
                      if (conflictData) {
                        setTooltipContent(`${countryName} - ${conflictData.name} (INT: ${conflictData.intensity})`);
                      } else {
                        setTooltipContent(countryName);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setTooltipContent("");
                    }}
                    onClick={() => {
                      if (conflictData) {
                        onSelectConflict(conflictData.id);
                      }
                    }}
                    style={{
                      default: {
                        fill: getFillColor(countryName, false),
                        stroke: "#1e293b",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 250ms"
                      },
                      hover: {
                        fill: getFillColor(countryName, true),
                        stroke: conflictData ? "#00f0ff" : "#475569",
                        strokeWidth: conflictData ? 1 : 0.5,
                        outline: "none",
                        cursor: conflictData ? "pointer" : "crosshair",
                        filter: conflictData ? "drop-shadow(0px 0px 5px rgba(0, 240, 255, 0.5))" : "none"
                      },
                      pressed: {
                        fill: getFillColor(countryName, true),
                        stroke: "#00f0ff",
                        strokeWidth: 1.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tactical Tooltip HUD */}
      {tooltipContent && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur border border-primary/50 text-primary font-mono text-xs py-2 px-4 shadow-[0_0_20px_rgba(0,240,255,0.2)] pointer-events-none z-50 rounded-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block"></span>
            {tooltipContent}
          </div>
        </div>
      )}
    </div>
  );
}
