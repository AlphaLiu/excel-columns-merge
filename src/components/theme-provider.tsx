import type { Theme } from '@/stores/theme';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useAtom } from 'jotai';
import * as React from 'react';
import { loadSavedTheme, setThemeAtom, themeAtom } from '@/stores/theme';

type ResolvedTheme = 'dark' | 'light';

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function disableTransitionsTemporarily() {
  const style = document.createElement('style');
  style.appendChild(
    document.createTextNode(
      '*,*::before,*::after{-webkit-transition:none!important;transition:none!important}',
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    });
  };
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement))
    return false;
  if (target.isContentEditable)
    return true;
  return !!target.closest('input, textarea, select, [contenteditable="true"]');
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const restoreTransitions = disableTransitionsTemporarily();

  root.classList.remove('light', 'dark');
  root.classList.add(resolved);

  if (restoreTransitions)
    restoreTransitions();
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useAtom(themeAtom);
  const [, dispatchSetTheme] = useAtom(setThemeAtom);

  // —— Mount: load saved theme from Rust config ——
  React.useEffect(() => {
    loadSavedTheme().then((saved) => {
      setTheme(saved);
    });
  }, [setTheme]);

  // —— Apply theme class to <html> + sync native macOS window chrome ——
  React.useEffect(() => {
    applyTheme(theme);

    // Tell the native macOS window to match (affects titlebar, traffic lights, etc.)
    try {
      const nativeTheme = theme === 'system' ? null : theme;
      getCurrentWindow().setTheme(nativeTheme);
    }
    catch {
      // Running outside Tauri (e.g., vite dev)
    }
  }, [theme]);

  // —— Listen for system preference changes (when theme === 'system') ——
  React.useEffect(() => {
    if (theme !== 'system')
      return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // —— D key toggles dark/light ——
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat)
        return;
      if (event.metaKey || event.ctrlKey || event.altKey)
        return;
      if (isEditableTarget(event.target))
        return;
      if (event.key.toLowerCase() !== 'd')
        return;

      const resolved = theme === 'system' ? getSystemTheme() : theme;
      const next: Theme = resolved === 'dark' ? 'light' : 'dark';
      dispatchSetTheme(next);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, dispatchSetTheme]);

  const ctxValue = React.useMemo(
    () => ({
      theme,
      setTheme: dispatchSetTheme,
    }),
    [theme, dispatchSetTheme],
  );

  return (
    <ThemeProviderContext.Provider value={ctxValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
