import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorSchemeOverride = 'light' | 'dark' | null;

type ColorSchemeContextValue = {
  override: ColorSchemeOverride;
  setOverride: (value: ColorSchemeOverride) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue>({
  override: null,
  setOverride: () => {},
});

/** Lets the Appearance setting in Profile override the system light/dark scheme app-wide. */
export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<ColorSchemeOverride>(null);
  const value = useMemo(() => ({ override, setOverride }), [override]);

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}

export function useColorSchemeOverride() {
  return useContext(ColorSchemeContext);
}

/** System color scheme, overridden by the user's in-app Appearance choice when one is set. */
export function useAppColorScheme() {
  const system = useRNColorScheme();
  const { override } = useColorSchemeOverride();
  return override ?? system;
}
