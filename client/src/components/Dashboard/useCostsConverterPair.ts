import { useMemo } from 'react';

import { useSettingsStore } from '../../store/settingsStore';

/**
 * The pair the Costs tab's converter opens on: from the trip's currency into the
 * first of the dashboard pair (or EUR, USD) that differs from it (Drevia fork).
 * Read once per trip currency; the converter keeps its own pair after that.
 */
export function costsConverterPair(
  tripCurrency: string,
  savedFrom?: string,
  savedTo?: string
): { from: string; to: string } {
  const from = tripCurrency || 'EUR';
  const to = [savedFrom, savedTo, 'EUR', 'USD'].find((c): c is string => !!c && c !== from) ?? 'USD';
  return { from, to };
}

export function useCostsConverterPair(tripCurrency: string): { from: string; to: string } {
  const savedFrom = useSettingsStore((s) => s.settings.dashboard_fx_from);
  const savedTo = useSettingsStore((s) => s.settings.dashboard_fx_to);
  return useMemo(() => costsConverterPair(tripCurrency, savedFrom, savedTo), [tripCurrency, savedFrom, savedTo]);
}
