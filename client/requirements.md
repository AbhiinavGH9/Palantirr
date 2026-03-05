## Packages
react-simple-maps | High-quality SVG world map rendering
date-fns | Date formatting and manipulation
lucide-react | Standard icon set for UI

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  mono: ["var(--font-mono)"],
  sans: ["var(--font-sans)"],
}

The application uses an external TopoJSON file for the world map: https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
All API hooks assume standard REST implementation based on shared/routes manifest.
Theme is exclusively dark mode (Tactical UI).
