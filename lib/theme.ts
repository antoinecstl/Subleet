// Design tokens for Subleet. Import from here instead of re-declaring
// ACCENT/colors inline in every component.

export const COLORS = {
  accent: '#f59e0b',
  accentSoft: 'rgba(245,158,11,0.12)',
  ink: '#3d3028',
  inkSoft: 'rgba(61,48,40,0.6)',
  inkMuted: 'rgba(61,48,40,0.45)',
  inkFaint: 'rgba(61,48,40,0.08)',
  cream: '#f0ebe4',
  creamDark: '#e8e0d6',
  coffee: '#2c2218',
} as const

export const ACCENT = COLORS.accent

export const FONT_POPPINS = 'var(--font-poppins), sans-serif'
export const FONT_DM_SANS = 'var(--font-dm-sans), sans-serif'
