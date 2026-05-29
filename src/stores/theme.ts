import { atom } from 'jotai';
import { commands } from '@/bindings';

export type Theme = 'light' | 'dark' | 'system';

/** The current theme value */
export const themeAtom = atom<Theme>('system');

/**
 * Write-only derivative — persists to Rust config on every set.
 * Use this atom for all theme mutations so changes survive app restarts.
 */
export const setThemeAtom = atom(null, async (_get, set, next: Theme) => {
  set(themeAtom, next);
  try {
    await commands.setConfig('theme', next);
  }
  catch {
    console.warn('Failed to persist theme to config');
  }
});

/** Load the saved theme from Rust config (call once on startup) */
export async function loadSavedTheme(): Promise<Theme> {
  try {
    const saved = await commands.getConfig('theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  }
  catch {
    // config not available yet, use default
  }
  return 'system';
}
