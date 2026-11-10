import { OFM_DARK } from '../../constants/mapDefaults';

/**
 * Brighter labels on OpenFreeMap's dark basemap (Drevia fork).
 *
 * The style draws place names in rgb(101,101,101) and street names in
 * rgb(80,78,78) on land of rgb(12,12,12): 3.4:1 and 2.4:1, too faint to read the
 * map by. Place names become light grey, bold and a little larger (13.2:1); street
 * names a mid grey (7.6:1), each with a dark halo. The upstream style is fetched
 * untouched and patched on every `style.load`, so a theme switch through setStyle
 * is covered and every other style, Positron included, is left alone.
 */

export const DARK_PLACE_LABEL = '#d4d4d8';
export const DARK_STREET_LABEL = '#a1a1aa';
const HALO = 'rgba(0,0,0,0.85)';
const PLACE_SCALE = 1.15;

/** The slice of a MapLibre map this needs; the Leaflet bridge's map and MapViewGL's both fit. */
export interface LabelStyleMap {
  getStyle(): { layers?: Array<{ id: string; type: string }> } | undefined;
  getLayoutProperty(layer: string, name: string): unknown;
  setPaintProperty(layer: string, name: string, value: unknown): unknown;
  setLayoutProperty(layer: string, name: string, value: unknown): unknown;
  on(type: 'style.load', listener: () => void): unknown;
  isStyleLoaded(): boolean | void;
}

/** A text-size scaled by k. A zoom curve has to stay the top-level expression, so its output stops are scaled instead. */
export function scaleTextSize(size: unknown, k: number): unknown {
  if (typeof size === 'number') return size * k;
  if (size == null) return 16 * k;
  if (Array.isArray(size) && size[0] === 'interpolate') {
    return size.map((v, i) => (i >= 3 && i % 2 === 0 && typeof v === 'number' ? v * k : v));
  }
  return size;
}

/** Restyle the label layers of an already loaded OFM dark style. */
export function applyDarkLabels(map: LabelStyleMap): void {
  for (const l of map.getStyle()?.layers ?? []) {
    if (l.type !== 'symbol') continue;
    if (l.id.startsWith('place_')) {
      map.setPaintProperty(l.id, 'text-color', DARK_PLACE_LABEL);
      map.setPaintProperty(l.id, 'text-halo-color', HALO);
      map.setPaintProperty(l.id, 'text-halo-width', 1.4);
      map.setPaintProperty(l.id, 'text-halo-blur', 0.5);
      map.setLayoutProperty(l.id, 'text-font', ['Noto Sans Bold']);
      map.setLayoutProperty(l.id, 'text-size', scaleTextSize(map.getLayoutProperty(l.id, 'text-size'), PLACE_SCALE));
    } else if (l.id.startsWith('highway_name_')) {
      map.setPaintProperty(l.id, 'text-color', DARK_STREET_LABEL);
      map.setPaintProperty(l.id, 'text-halo-color', HALO);
      map.setPaintProperty(l.id, 'text-halo-width', 1);
    }
  }
}

/**
 * Keep the dark style's labels readable for as long as the map lives. `currentStyle`
 * is read at each load, because the same map is restyled in place on a theme switch.
 */
export function brightenDarkLabels(map: LabelStyleMap, currentStyle: () => string | undefined): void {
  const apply = () => {
    if (currentStyle() === OFM_DARK) applyDarkLabels(map);
  };
  map.on('style.load', apply);
  if (map.isStyleLoaded()) apply();
}
