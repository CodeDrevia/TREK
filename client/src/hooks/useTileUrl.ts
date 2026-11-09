import { useMemo } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { darkTileTwin, resolveTileUrl } from '../utils/tileUrl'
import { useIsDark } from './useIsDark'

/**
 * Every logged-in map reads its tile template through here so the CARTO key
 * reaches all of them, including the ones that ignore map_tile_url and pin a
 * basemap of their own (atlas, collections).
 */
export function useTileUrl(fallback: string, ignoreUserTemplate = false): string {
  const template = useSettingsStore((s) => s.settings.map_tile_url)
  const cartoKey = useSettingsStore((s) => s.settings.carto_api_key)
  return useMemo(
    () => resolveTileUrl(ignoreUserTemplate ? '' : template, fallback, cartoKey),
    [template, fallback, cartoKey, ignoreUserTemplate]
  )
}

export function useCartoApiKey(): string {
  return useSettingsStore((s) => s.settings.carto_api_key) ?? ''
}

/**
 * A resolved tile URL that follows the theme: in dark mode a light preset (the
 * OpenFreeMap Positron default, CARTO light) becomes its dark twin. A custom
 * template has no twin and stays as chosen. Used by the planner maps, which
 * otherwise drew a bright basemap beside dark panels (Drevia fork).
 */
export function useThemedTileUrl(resolved: string): string {
  const dark = useIsDark()
  return useMemo(() => (dark ? darkTileTwin(resolved) : resolved), [dark, resolved])
}
