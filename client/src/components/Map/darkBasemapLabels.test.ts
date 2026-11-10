import { describe, expect, it, vi } from 'vitest';
import { OFM_DARK, OFM_POSITRON } from '../../constants/mapDefaults';
import {
  DARK_PLACE_LABEL,
  DARK_STREET_LABEL,
  applyDarkLabels,
  brightenDarkLabels,
  scaleTextSize,
  type LabelStyleMap,
} from './darkBasemapLabels';

function fakeMap(loaded = true) {
  const layers = [
    { id: 'background', type: 'background' },
    { id: 'place_city', type: 'symbol' },
    { id: 'place_country_major', type: 'symbol' },
    { id: 'highway_name_other', type: 'symbol' },
    { id: 'water_name', type: 'symbol' },
    { id: 'place_fill', type: 'fill' },
  ];
  const sizes: Record<string, unknown> = {
    place_city: 10,
    place_country_major: ['interpolate', ['exponential', 1.4], ['zoom'], 0, 10, 3, 12],
  };
  const listeners: Array<() => void> = [];
  const map = {
    getStyle: () => ({ layers }),
    getLayoutProperty: (id: string) => sizes[id],
    setPaintProperty: vi.fn(),
    setLayoutProperty: vi.fn(),
    on: vi.fn((_: string, fn: () => void) => listeners.push(fn)),
    isStyleLoaded: () => loaded,
  };
  return { map: map as LabelStyleMap & typeof map, fire: () => listeners.forEach((fn) => fn()) };
}

function paint(map: { setPaintProperty: ReturnType<typeof vi.fn> }, id: string, name: string) {
  return map.setPaintProperty.mock.calls.find((c) => c[0] === id && c[1] === name)?.[2];
}

describe('scaleTextSize', () => {
  it('scales numbers, the default, and the output stops of a zoom curve only', () => {
    expect(scaleTextSize(10, 1.5)).toBe(15);
    expect(scaleTextSize(undefined, 2)).toBe(32);
    expect(scaleTextSize(['interpolate', ['linear'], ['zoom'], 0, 10, 6, 12], 2)).toEqual([
      'interpolate',
      ['linear'],
      ['zoom'],
      0,
      20,
      6,
      24,
    ]);
    const other = ['get', 'size'];
    expect(scaleTextSize(other, 2)).toBe(other);
  });
});

describe('applyDarkLabels', () => {
  it('lifts place names (bold, larger) and street names, and leaves other layers alone', () => {
    const { map } = fakeMap();
    applyDarkLabels(map);
    expect(paint(map, 'place_city', 'text-color')).toBe(DARK_PLACE_LABEL);
    expect(paint(map, 'place_country_major', 'text-color')).toBe(DARK_PLACE_LABEL);
    expect(paint(map, 'highway_name_other', 'text-color')).toBe(DARK_STREET_LABEL);
    expect(map.setLayoutProperty).toHaveBeenCalledWith('place_city', 'text-font', ['Noto Sans Bold']);
    expect(map.setLayoutProperty).toHaveBeenCalledWith('place_city', 'text-size', 11.5);
    const touched = new Set(map.setPaintProperty.mock.calls.map((c) => c[0]));
    expect([...touched].sort()).toEqual(['highway_name_other', 'place_city', 'place_country_major']);
  });
});

describe('brightenDarkLabels', () => {
  it('applies on the OFM dark style, now and after every style load', () => {
    const { map, fire } = fakeMap(true);
    brightenDarkLabels(map, () => OFM_DARK);
    expect(paint(map, 'place_city', 'text-color')).toBe(DARK_PLACE_LABEL);
    map.setPaintProperty.mockClear();
    fire();
    expect(paint(map, 'place_city', 'text-color')).toBe(DARK_PLACE_LABEL);
  });

  it('never touches another style, so light mode stays as it is', () => {
    let style = OFM_POSITRON;
    const { map, fire } = fakeMap(true);
    brightenDarkLabels(map, () => style);
    fire();
    expect(map.setPaintProperty).not.toHaveBeenCalled();
    style = OFM_DARK;
    fire();
    expect(paint(map, 'place_city', 'text-color')).toBe(DARK_PLACE_LABEL);
  });

  it('waits for the style when it has not loaded yet', () => {
    const { map, fire } = fakeMap(false);
    brightenDarkLabels(map, () => OFM_DARK);
    expect(map.setPaintProperty).not.toHaveBeenCalled();
    fire();
    expect(paint(map, 'place_city', 'text-color')).toBe(DARK_PLACE_LABEL);
  });
});
